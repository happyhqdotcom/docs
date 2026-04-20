# Contributing

Thanks for helping improve the HappyHQ docs. Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). A few things to read before you open a PR.

## Before you open a PR

- **Open an issue first for anything non-trivial.** Typo fixes and small clarifications are fine to send directly. For new pages, major rewrites, or structural changes, open an issue or discussion first so we can agree on scope and placement before you spend time writing.
- **Disclose AI-assisted writing or code.** If an LLM drafted any part of your contribution, say so in the PR description. You are expected to have read, understood, and verified anything you submit. PRs that read like unreviewed AI output will be closed.
- **Keep PRs focused.** One page or one concern per PR. Bundling unrelated changes makes review harder and will usually be asked to split.

## What belongs here

This repo is the source for **docs.happyhq.com**. Right now that's the docs surface — canonical reference for how HappyHQ works. Other surfaces (guides, blog, changelog, API reference) are planned and will land over time.

Not sure where your contribution fits? Open an issue and we'll help.

## Writing style

The HappyHQ docs are written for non-technical users first. If you're contributing content, these are the rules we hold ourselves to:

- **Plain language over jargon.** "Your files open in anything" beats "interoperable format support." If a sentence has a simpler version, use the simpler version.
- **First 80 words = the definition.** On concept pages, the top of the page should be a clear answer to "what is this?" — readable by someone who has never used HappyHQ.
- **Every page has a keyword.** Before writing, note the search query this page should rank for. Write the title as that query, or close to it.
- **Every claim should be true.** If HappyHQ doesn't do something, don't write as if it does. When in doubt, ship smaller and more accurate.
- **Voice matches the [hello-world launch post](https://happyhq.com/blog/hello-world) and the [OLY manifesto](https://happyhq.com/blog/open-local-yours).** Short sentences. Warm. Direct. No hype.

## CLA

Contributions require agreeing to our [Contributor License Agreement](https://happyhq.com/legal/cla). Signing instructions will be wired up on PRs shortly; for now, please read the CLA and confirm in your PR description that you agree to its terms.

## Setup

1. Install **Node.js 20+** and **pnpm 10.2.1+**.
2. Clone and install:
   ```sh
   git clone https://github.com/happyhqdotcom/docs.git
   cd docs
   pnpm install
   ```
3. Start the dev server: `pnpm dev` (opens at `http://localhost:3000/docs`).

## Workflow

1. Branch from `main` using a prefix:
   - `content/` for content changes (new pages, rewrites, copy fixes)
   - `feat/` for site features (components, layouts, tooling)
   - `fix/` for bug fixes
   - `chore/` for maintenance
2. Keep commits focused and descriptive.
3. Before opening a PR:
   ```sh
   pnpm lint
   pnpm check:links
   pnpm build
   ```
4. Open a PR targeting `main`. In the description, cover:
   - What changed and why (link the issue if there is one)
   - How you verified it
   - Whether any of the code or copy was AI-assisted

## Style

- ESLint + Prettier for site code
- Content is [Markdoc](https://markdoc.dev/) (`.md` files under `src/content/`)
