---
title: Run HappyHQ locally
description: Clone the repo, set an API key, and start the dev server. About five minutes.
nextjs:
  metadata:
    title: Run HappyHQ locally
---

HappyHQ runs on your own machine. Clone the repo, set an API key, and start the dev server. About five minutes start to finish.

## Requirements

- Node.js 20 or later
- pnpm 10.2.1 or later
- An [Anthropic API key](https://console.anthropic.com/) for the AI provider

## Get the code

Clone the repo and install dependencies:

```sh
git clone https://github.com/happyhqdotcom/happyhq.git
cd happyhq
pnpm install
```

## Configure

HappyHQ uses the Anthropic API. Copy the example environment file:

```sh
cp happyhq/.env.example happyhq/.env.local
```

Open `happyhq/.env.local` and set `ANTHROPIC_API_KEY`. Everything else in the file is optional.

## Run

Start the dev server:

```sh
pnpm dev
```

HappyHQ opens at [localhost:3000](http://localhost:3000).

## Where your files live

HappyHQ stores everything in `~/HappyHQ/` on your machine. You can open the folder in any file browser.

To use a different location, set `HAPPYHQ_ROOT` in your `.env.local` to the path you want.

## Something not working?

Open an issue at [github.com/happyhqdotcom/happyhq/issues](https://github.com/happyhqdotcom/happyhq/issues).
