0a. Read @dependency-rules.md — this is the spec. Apply the **Phase 3 — Batch** section literally.
0b. Read @CLAUDE.md and @CONTRIBUTING.md (repo root) for repo conventions referenced by the rules.

## Part 1 · Eligibility

1. **List the ready set.** Query open PRs labeled `ralphie:ready-to-merge`, excluding any on a `chore/batch-*` head ref (so the loop never recursively batches its own batches):

   ```
   gh pr list --state open --label "ralphie:ready-to-merge" \
     --json number,title,headRefName,files \
     --jq '[.[] | select(.headRefName | startswith("chore/batch-") | not)]'
   ```

2. **Threshold check.** If the result has fewer than 2 PRs, exit silently — there's nothing to batch. Print: `Batch skipped: <N> ready PR(s), need ≥2.`

3. **Overlap check.** For each pair in the ready set, compute the intersection of their `files[].path` lists. If **no** pair shares any file path, exit silently — these PRs cannot conflict on merge, so batching adds no value. Print: `Batch skipped: <N> ready PRs but file sets are disjoint — no merge conflict will occur.`

   In practice, dependency PRs always touch `package.json` + `pnpm-lock.yaml`, so this case is rare — but honor the gate. It catches `dependabot/github_actions/*` PRs (workflow file edits) that would otherwise get pointlessly batched with npm PRs.

4. **Compute the batchable set.** Start with all ready PRs that overlap with at least one other. (If the overlap is non-transitive — e.g., {A,B} share `package.json` and {C,D} share only `.github/workflows/ci.yml` — pick the larger connected component. In practice the whole ready set is one component because of the lockfile.)

## Part 2 · Construct the batch

5. **Branch off fresh `origin/main`.** Never trust local state:

   ```
   git fetch origin --quiet
   git checkout main && git reset --hard origin/main
   BATCH_BRANCH="chore/batch-deps-$(date +%Y%m%d)-$(git rev-parse --short HEAD)"
   git checkout -b "$BATCH_BRANCH"
   ```

6. **Replay each PR's `package.json` edits onto the batch branch.** For each PR in the batchable set:

   a. Fetch the PR's branch: `gh pr checkout <#> --detach` into a scratch worktree, OR read the PR head's `package.json` directly via `gh api repos/:owner/:repo/contents/package.json?ref=<headSha> --jq .content | base64 -d`.

   b. Compute that PR's `package.json` diff vs `origin/main`. The edits should land in one of these mechanical buckets:
   - **Added/changed `pnpm.overrides.<pkg>`** — copy the new value into the batch branch's `package.json`.
   - **Added/changed `dependencies.<pkg>` or `devDependencies.<pkg>` version** — copy the new version into the batch branch's `package.json`.
   - **Added a new top-level key in `pnpm.overrides`** — add it to the batch.

   c. **Same-package version conflicts.** If two PRs bump the same `<pkg>` to different versions, take the **higher** one (semver-wise, using `pnpm dlx semver-compare` or equivalent reasoning). Note the choice in the PR body's `Resolved version conflicts` section.

   d. **Non-mechanical edits.** If a PR's `package.json` diff touches something other than the buckets above (e.g., scripts changes, new top-level key, peer-dep manipulation), **bail this PR out of the batch** — do not include it, and note it in step 9's exclusion list. The maintainer can merge it serially.

7. **Regenerate the lockfile:** `pnpm install`. If install fails, that's a real conflict between the bumps (e.g., peer-dep mismatch). Skip ahead to step 9's **Batch broken** branch.

## Part 3 · Verify and ship

8. **Verify once.** From the repo root:
   - `pnpm lint`
   - `pnpm build`
   - `pnpm check:links`

   This is the only new verification — each constituent PR was already verified individually in Phase 2. This run catches **interaction effects**: two bumps that pass in isolation but fail when co-installed.

9. **Branch on the result:**

   **Path A — verification clean.** Open the batch PR:

   ```
   git add package.json pnpm-lock.yaml && git commit -m "chore(deps): batch <N> ready dependency updates" -m "<one-line summary of constituents>"
   git push -u origin "$BATCH_BRANCH"
   gh pr create --base main --title "chore(deps): batch <N> ready dependency updates" --body "<see body shape in @dependency-rules.md>"
   gh pr merge <new-PR-#> --auto --squash
   ```

   Then **close each constituent** with the rules-shape replacement comment:

   ```
   gh pr edit <#> --add-label "ralphie:replaced-by-newer-pr"
   gh pr comment <#> --body "<replacement comment shape from rules — points at batch PR>"
   gh pr close <#>
   ```

   Return to `${BASE_BRANCH}`. Exit.

   **Path B — verification failed or `pnpm install` failed.** Do NOT open the batch PR. Discard the branch locally:

   ```
   git checkout "${BASE_BRANCH}"
   git branch -D "$BATCH_BRANCH"
   ```

   For each PR in the attempted batch, **comment** (do not label, do not close) explaining batching failed and why. Cite the specific lint/build/install error. Leave the originals' `ralphie:ready-to-merge` labels intact — the maintainer can drain them serially:

   ```
   gh pr comment <#> --body "Ralphie attempted to batch this with #X, #Y, #Z, but the combined verification failed: <specific error, fenced>. Leaving this PR open for serial merge; the maintainer can rebase as each lands."
   ```

   Exit.

   **Path C — `< 2` batchable PRs after exclusions in step 6d.** If the non-mechanical-edit exclusions left only one PR, treat as no batch: print `Batch skipped: only 1 PR remained after non-mechanical exclusions.` Exit silently.

## Part 4 · Wrap-up

10. ${DRY_RUN_NOTE}

11. Print a one-line summary: `Batched N PR(s) into #<new-PR-#> [verification: clean | failed]` OR `Batch skipped: <reason>`.

**[1]** Phase 3 NEVER opens a batch unless verification on the combined diff is clean. The whole point is catching interaction effects; if there are any, the batch loses its value and constituents stay individually mergeable.
**[2]** Phase 3 NEVER overrides the human-as-gate principle. The batch PR is opened with `--auto --squash` so it merges when CI passes, but the maintainer can still cancel auto-merge or close the batch PR. Each constituent's closure is reversible (reopen the PR if needed).
**[3]** Hard constraints from @dependency-rules.md still apply: never push to `main`, never push to a Dependabot branch (we push to `chore/batch-*` which we own), never modify `.github/`, CI workflows, `dependabot.yml`, or licensing files.
**[4]** Branch off fresh `origin/main` — never local main. The cwd may be stale even after a successful pull; the wave that prompted this whole feature was caused by branching off out-of-date local state.
**[5]** If a constituent PR's HEAD has been force-updated since it got the `ralphie:ready-to-merge` label (compare `headRefOid` to what's in the label-applied comment if available), re-verify it individually instead of batching. The label promised verification of the PR's old SHA, not its new one.
**[6]** AI-assistance disclosure in the batch PR body is required by @CONTRIBUTING.md.
**[7]** End on `${BASE_BRANCH}` with a clean working tree.
