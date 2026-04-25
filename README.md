# HappyHQ Docs

The source for **[happyhq.com/docs](https://happyhq.com/docs)** — the documentation site for [HappyHQ](https://happyhq.com), the AI workspace for everyday work.

Built with Next.js, Markdoc, and Tailwind CSS.

## Our principles

1. If it's not documented, it doesn't exist.
2. If you build it, you document it.
3. If it changes, the docs change.
4. If a feature can't be explained clearly, it's probably not ready.

Docs aren't a side thing at HappyHQ. They're the thing.

## Run it locally

Install **Node.js 20+** and **pnpm 10.2.1+**, then:

```sh
git clone https://github.com/happyhqdotcom/docs.git
cd docs
pnpm install
pnpm dev
```

Open [http://localhost:3000/docs](http://localhost:3000/docs).

## How it's organized

Content lives in `src/content/`, one folder per surface:

- `docs/` — canonical product reference, organized into:
  - **Start here** — the onboarding path
  - **Core concepts** — noun-led explainers (Q, Streams, Tasks, Playbooks, Specs, Chat, Uploads, Local-first)
  - **Using HappyHQ** — feature manuals
  - **Running HappyHQ** — install, config, self-host
  - **Contributing** — for code contributors
  - **Resources** — FAQ, troubleshooting, support
- `changelog/` — release notes (stub for now)
- Other surfaces (`guides`, `blog`, `api`) are planned.

Each folder has a `_meta.json` that controls sidebar order and grouping.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Community guidelines in [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

MIT, with a carveout for HappyHQ trademarks and brand assets. See [LICENSE](./LICENSE).
