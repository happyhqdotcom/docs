# CLAUDE.md

Working notes for this repo. Kept brief.

## Deploy

- Use `pnpm run deploy`, **not** `pnpm deploy`. pnpm's built-in workspace `deploy` command shadows the `package.json` script.
- `wrangler.jsonc` has `routes`, which disables the `*.workers.dev` subdomain unless `workers_dev: true` is also set explicitly. Keep both in sync.

## Composition with the welcome worker

This worker is composed under `happyhq.com` via Cloudflare Workers Routes. It serves `/docs/*`, `/changelog/*`, `/_next/*`, `/og/docs*`, `/og/changelog/*`. The welcome 11ty worker (separate repo at `../welcome/11ty`) serves the apex `/` catch-all and owns apex-level files: `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, `/apple-touch-icon.png`, `/llms.txt`.

Do not add root-level emitters here (no `src/app/robots.ts`, no `src/app/sitemap.ts`). This repo's sitemap lives at `/docs/sitemap.xml` (`src/app/docs/sitemap.ts`) so welcome's apex sitemap-index can reference it.

Route patterns currently cover `preview.happyhq.com` only. Production `happyhq.com` routes are added at cutover — a separate change.

## Environment

- `NEXT_PUBLIC_SITE_URL` — defaults to `https://happyhq.com`. Used by `metadataBase` in `src/app/layout.tsx` and by the sitemap in `src/app/docs/sitemap.ts`. Override via `.env.local` for local dev.
- `src/middleware.ts` — sets `X-Robots-Tag: noindex, nofollow` on every hostname except `happyhq.com`, so preview + `*.workers.dev` stay uncrawled.
