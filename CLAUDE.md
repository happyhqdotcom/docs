# CLAUDE.md

Working notes for this repo. Kept brief.

## Deploy

Two environments, each producing its own Cloudflare worker. Always run with `pnpm run` (not `pnpm`) since pnpm's built-in workspace `deploy` command shadows npm scripts.

- `pnpm run deploy:preview` — builds with `NEXT_PUBLIC_SITE_URL=https://preview.happyhq.com` and deploys the `docs-preview` worker. Bound to `preview.happyhq.com/*` route patterns and reachable at `docs-preview.happyhq.workers.dev`.
- `pnpm run deploy:production` — builds with `NEXT_PUBLIC_SITE_URL=https://happyhq.com` and deploys the `docs` worker. `workers_dev` is off (no `*.workers.dev` URL) and `routes` is empty by default — add `happyhq.com/*` patterns to `[env.production].routes` in `wrangler.jsonc` at cutover.

`wrangler.jsonc` uses `[env.preview]` and `[env.production]` blocks. Never deploy without `--env` — wrangler would fall back to the top-level config and might overwrite production state. `preview_urls = true` on both envs so you can visit versioned preview URLs for testing before bound routes exist.

## Composition with the welcome worker

This worker is composed under `happyhq.com` via Cloudflare Workers Routes. It serves `/docs/*`, `/changelog/*`, `/_next/*`, `/og/docs*`, `/og/changelog/*`. The welcome 11ty worker (separate repo at `../welcome/11ty`) serves the apex `/` catch-all and owns apex-level files: `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, `/apple-touch-icon.png`, `/llms.txt`.

Do not add root-level emitters here (no `src/app/robots.ts`, no `src/app/sitemap.ts`). This repo's sitemap lives at `/docs/sitemap.xml` (`src/app/docs/sitemap.ts`) so welcome's apex sitemap-index can reference it.

Route patterns currently cover `preview.happyhq.com` only. Production `happyhq.com` routes are added at cutover — a separate change.

## Environment

- `NEXT_PUBLIC_SITE_URL` — defaults to `https://happyhq.com`. Used by `metadataBase` in `src/app/layout.tsx` and by the sitemap in `src/app/docs/sitemap.ts`. Override via `.env.local` for local dev.
- `src/middleware.ts` — sets `X-Robots-Tag: noindex, nofollow` on every hostname except `happyhq.com`, so preview + `*.workers.dev` stay uncrawled.
