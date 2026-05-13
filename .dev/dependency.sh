#!/bin/bash
set -o pipefail
# Usage: ./dependency.sh [options]
#   ./dependency.sh                          # triage + upgrade + batch loop, default --max-deps 3
#   ./dependency.sh --max-deps 5             # cap Phase 2 attempts at 5
#   ./dependency.sh --triage-only            # Phase 1 only
#   ./dependency.sh --upgrade-only           # skip Phase 1, run upgrade loop then batch
#   ./dependency.sh --batch-only             # skip Phase 1+2, only batch the current ready set
#   ./dependency.sh --no-batch               # skip Phase 3 (batching)
#   ./dependency.sh --pr 124                 # skip triage; one upgrade session against PR #124 (no batch)
#   ./dependency.sh --pr 124 --override      # bypass self-skip rules (size, verification) for that PR
#   ./dependency.sh --dry-run                # Phase 1 preview only, no writes
#   ./dependency.sh --pr 124 --dry-run       # preview a single upgrade session, no writes

DIM='\033[2m'
BOLD='\033[1m'
GREEN='\033[32m'
CYAN='\033[36m'
YELLOW='\033[33m'
RED='\033[31m'
RESET='\033[0m'

MAX_DEPS=3
TRIAGE_ONLY=0
UPGRADE_ONLY=0
BATCH_ONLY=0
NO_BATCH=0
SINGLE_PR=""
DRY_RUN=""
OVERRIDE=""

while [ $# -gt 0 ]; do
    case "$1" in
        --max-deps)
            MAX_DEPS="$2"
            shift 2
            ;;
        --triage-only)
            TRIAGE_ONLY=1
            shift
            ;;
        --upgrade-only)
            UPGRADE_ONLY=1
            shift
            ;;
        --batch-only)
            BATCH_ONLY=1
            shift
            ;;
        --no-batch)
            NO_BATCH=1
            shift
            ;;
        --pr)
            SINGLE_PR="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=1
            shift
            ;;
        --override)
            OVERRIDE=1
            shift
            ;;
        -h|--help)
            sed -n '3,11p' "$0" | sed 's/^# \?//'
            exit 0
            ;;
        *)
            echo "Unknown flag: $1" >&2
            exit 1
            ;;
    esac
done

if [ $TRIAGE_ONLY -eq 1 ] && [ $UPGRADE_ONLY -eq 1 ]; then
    echo "Error: --triage-only and --upgrade-only are mutually exclusive" >&2
    exit 1
fi
if [ $UPGRADE_ONLY -eq 1 ] && [ -n "$DRY_RUN" ]; then
    echo "Error: --upgrade-only --dry-run isn't supported (dry-run on upgrades wastes a real session). Use --pr <#> --dry-run to preview a single upgrade." >&2
    exit 1
fi
if [ -n "$OVERRIDE" ] && [ -z "$SINGLE_PR" ]; then
    echo "Error: --override is only valid with --pr <#>. The Phase 2 auto-loop must always respect skip gates." >&2
    exit 1
fi
if [ $BATCH_ONLY -eq 1 ] && { [ $TRIAGE_ONLY -eq 1 ] || [ $UPGRADE_ONLY -eq 1 ] || [ $NO_BATCH -eq 1 ]; }; then
    echo "Error: --batch-only is mutually exclusive with --triage-only / --upgrade-only / --no-batch." >&2
    exit 1
fi
if [ $BATCH_ONLY -eq 1 ] && [ -n "$SINGLE_PR" ]; then
    echo "Error: --batch-only and --pr <#> are mutually exclusive." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Base branch resolution ──
# Single-checkout setup (no isolated worktree). The hard-reset a few lines
# down operates on the maintainer's primary docs checkout — the
# uncommitted-changes guard below is the only thing standing between a stray
# edit and `git reset --hard origin/main`. Don't relax it.
REPO_ROOT="$(cd "$SCRIPT_DIR" && git rev-parse --show-toplevel)"

# Operate from REPO_ROOT, not SCRIPT_DIR (.dev/). Reason: when the agent
# does `gh pr checkout <stale-PR>` on a branch forked before `.dev/` was
# merged to main, `.dev/` gets unlinked from disk. If the wrapper's cwd
# is `.dev/`, the shell's $PWD becomes a dead inode and every subsequent
# command — including the queue's `gh pr list` — fails with "Unable to
# read current working directory." REPO_ROOT survives any branch switch.
cd "$REPO_ROOT" || exit 1
case "$REPO_ROOT" in
    */docs)
        BASE_BRANCH="main"
        ;;
    *)
        echo -e "  ${RED}Error: dependency.sh must run from the docs checkout (.../docs). Current: ${REPO_ROOT}${RESET}" >&2
        exit 1
        ;;
esac
export BASE_BRANCH

CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BASE_BRANCH" ]; then
    echo -e "  ${RED}Error: ${REPO_ROOT} should be on '${BASE_BRANCH}', not '${CURRENT_BRANCH}'.${RESET}" >&2
    echo -e "  ${DIM}Fix: git -C ${REPO_ROOT} checkout ${BASE_BRANCH}${RESET}" >&2
    exit 1
fi

# Guard against losing uncommitted work — the next step is `git reset --hard`.
if [ -n "$(git status --porcelain)" ]; then
    echo -e "  ${RED}Error: uncommitted changes in ${REPO_ROOT}. Commit, stash, or discard before running the loop — the next step hard-resets to origin/main.${RESET}" >&2
    git status --short >&2
    exit 1
fi

echo -e "  ${DIM}Snapping ${BASE_BRANCH} → origin/main (hard reset), then pnpm install…${RESET}"
git fetch origin --quiet || { echo -e "  ${RED}git fetch failed${RESET}" >&2; exit 1; }
git reset --hard origin/main >/dev/null || { echo -e "  ${RED}git reset failed${RESET}" >&2; exit 1; }
(cd "$REPO_ROOT" && (pnpm install --frozen-lockfile || pnpm install)) || { echo -e "  ${RED}pnpm install failed${RESET}" >&2; exit 1; }

cleanup() {
    echo -e "\n${DIM}Cleaning up child processes...${RESET}"
    pkill -P $$ 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

if [ -n "$DRY_RUN" ]; then
    export DRY_RUN_NOTE="**DRY RUN MODE**: For every action that would write to GitHub or the repo (labels, comments, branches, commits, pushes, PRs, merges, closes), print one line prefixed with 'DRY-RUN:' describing what you WOULD do, then SKIP the actual call. Do not invoke any 'gh pr edit', 'gh pr comment', 'gh pr merge', 'gh pr close', 'gh pr create', 'git commit', 'git push', or filesystem write outside of pnpm install / verification scratch. Reads (gh pr view/list/diff/checks, code search, file reads, pnpm install, verification scripts, smoke tests) are fine."
else
    export DRY_RUN_NOTE=""
fi

if [ -n "$OVERRIDE" ]; then
    export OVERRIDE_NOTE="**OVERRIDE MODE**: The maintainer invoked --override on this single-PR session. Skip the soft self-skip checks: do NOT apply ralphie:skip-too-big or ralphie:skip-verification-failed, and do NOT exit early on those conditions — push and open the replacement PR (or merge) anyway. Hard constraints from rule [2] (no push to main, no push to Dependabot branches, no edits to .github/, CI workflows, dependabot.yml, or licensing files) remain non-negotiable. Note the override in the replacement PR body's AI-disclosure paragraph: 'Maintainer invoked --override; size/verification self-skip gates were bypassed.'"
else
    export OVERRIDE_NOTE=""
fi

run_session() {
    # Prompt file is named relative to SCRIPT_DIR; resolve to absolute so
    # this works regardless of the wrapper's cwd (REPO_ROOT).
    local prompt_file="$SCRIPT_DIR/$1"
    local label="$2"

    echo -e "\n  ${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "  ${BOLD}${label}${RESET}"
    echo -e "  ${DIM}Prompt:${RESET}  $prompt_file"
    [ -n "$DRY_RUN" ] && echo -e "  ${YELLOW}DRY RUN${RESET}"
    echo -e "  ${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

    if [ ! -f "$prompt_file" ]; then
        echo -e "  ${RED}Error: $prompt_file not found${RESET}"
        return 1
    fi

    envsubst < "$prompt_file" | claude -p \
        --dangerously-skip-permissions \
        --output-format=stream-json \
        --model opus \
        --verbose 2>&1 | node "$SCRIPT_DIR/format-stream.mjs"

    return ${PIPESTATUS[1]}
}

# ── Single-PR mode: skip triage, run one upgrade session, no batch ──
if [ -n "$SINGLE_PR" ]; then
    export PR_NUMBER="$SINGLE_PR"
    run_session "PROMPT_dependency_upgrade.md" "Upgrade #$SINGLE_PR"
    exit $?
fi

# ── Batch-only mode: skip Phase 1+2, run Phase 3 directly ──
if [ $BATCH_ONLY -eq 1 ]; then
    run_session "PROMPT_dependency_batch.md" "Phase 3 · Batch ready-to-merge PRs"
    exit $?
fi

# ── Phase 1: Triage (skipped with --upgrade-only) ──
if [ $UPGRADE_ONLY -eq 0 ]; then
    run_session "PROMPT_dependency_triage.md" "Phase 1 · Triage"
    TRIAGE_EXIT=$?
    if [ $TRIAGE_EXIT -ne 0 ]; then
        echo -e "  ${RED}Triage exited with status $TRIAGE_EXIT — stopping${RESET}"
        exit $TRIAGE_EXIT
    fi

    if [ $TRIAGE_ONLY -eq 1 ]; then
        echo -e "\n  ${GREEN}✓${RESET} Triage complete (--triage-only). Exiting."
        exit 0
    fi

    if [ -n "$DRY_RUN" ]; then
        echo -e "\n  ${GREEN}✓${RESET} Phase 1 preview complete. Skipping Phase 2 in --dry-run (labels weren't applied, so the upgrade queue would re-pick the same PRs). Use --pr <#> --dry-run to preview an upgrade session."
        exit 0
    fi
fi

# ── Phase 2: Upgrade loop (one session per eligible PR — oldest first) ──
DEPS_DONE=0
while [ $DEPS_DONE -lt $MAX_DEPS ]; do
    # Defensive: return the wrapper's working tree to BASE_BRANCH between
    # iterations. The agent's session usually ends on BASE_BRANCH per the
    # prompt, but if it didn't (early exit, crash, missed step) subsequent
    # iterations could checkout a PR on top of stale state.
    git -C "$REPO_ROOT" checkout --quiet "$BASE_BRANCH" 2>/dev/null || true

    # Queue: Dependabot PRs + Ralphie-opened security override PRs (chore/security-*),
    # excluding any with a terminal ralphie:* label.
    QUEUE_ERR=$(mktemp)
    NEXT=$(gh pr list \
        --state open \
        --limit 100 \
        --json number,labels,createdAt,headRefName,author \
        --jq '[.[] | select(.author.login == "app/dependabot" or (.headRefName | startswith("chore/security-"))) | select(.labels | map(.name) | any(startswith("ralphie:")) | not)] | sort_by(.createdAt) | .[0].number // empty' 2>"$QUEUE_ERR")
    QUEUE_EXIT=$?

    if [ $QUEUE_EXIT -ne 0 ]; then
        echo -e "  ${RED}gh pr list failed (exit $QUEUE_EXIT) — surfacing stderr instead of silently treating queue as empty:${RESET}" >&2
        cat "$QUEUE_ERR" >&2
        rm -f "$QUEUE_ERR"
        exit $QUEUE_EXIT
    fi
    rm -f "$QUEUE_ERR"

    if [ -z "$NEXT" ]; then
        echo -e "\n  ${GREEN}✓${RESET} Queue empty. $DEPS_DONE PR(s) attempted."
        break
    fi

    DEPS_DONE=$((DEPS_DONE + 1))
    export PR_NUMBER="$NEXT"
    run_session "PROMPT_dependency_upgrade.md" "Phase 2 · PR $DEPS_DONE of max $MAX_DEPS · #$NEXT"
    SESSION_EXIT=$?
    if [ $SESSION_EXIT -ne 0 ]; then
        echo -e "  ${RED}Upgrade session exited with status $SESSION_EXIT — stopping loop${RESET}"
        exit $SESSION_EXIT
    fi

    # Verify the PR moved to a terminal state — either closed (merged or replaced)
    # or labeled with a ralphie:skip-* / ralphie:replaced-by-* label. Otherwise the
    # next iteration would re-pick it forever.
    PR_INFO=$(gh pr view "$NEXT" --json state,labels 2>/dev/null)
    STATE=$(echo "$PR_INFO" | jq -r '.state')
    HAS_RALPHIE_LABEL=$(echo "$PR_INFO" | jq '[.labels[].name | select(startswith("ralphie:"))] | length')
    if [ "$STATE" = "OPEN" ] && [ "$HAS_RALPHIE_LABEL" = "0" ]; then
        echo -e "  ${RED}PR #$NEXT is still open with no ralphie:* label after the session — aborting loop to avoid re-picking it.${RESET}"
        exit 1
    fi

    sleep 1
done

if [ $DEPS_DONE -ge $MAX_DEPS ]; then
    echo -e "\n  ${YELLOW}Reached --max-deps=$MAX_DEPS.${RESET}"
fi

# ── Phase 3: Batch ready-to-merge PRs into a single PR (skipped with --no-batch) ──
if [ $NO_BATCH -eq 1 ]; then
    echo -e "\n  ${DIM}Skipping Phase 3 (--no-batch).${RESET}"
    exit 0
fi

# Defensive: return to BASE_BRANCH before Phase 3 (same reason as the per-iteration
# checkout above — the last Phase 2 session may have left the tree on a PR branch).
git -C "$REPO_ROOT" checkout --quiet "$BASE_BRANCH" 2>/dev/null || true

run_session "PROMPT_dependency_batch.md" "Phase 3 · Batch ready-to-merge PRs"
BATCH_EXIT=$?
if [ $BATCH_EXIT -ne 0 ]; then
    echo -e "  ${RED}Batch session exited with status $BATCH_EXIT${RESET}"
    exit $BATCH_EXIT
fi
