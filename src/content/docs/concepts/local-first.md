---
title: What "local-first" means for your data
nextjs:
  metadata:
    title: Local-first AI — what it means for your data in HappyHQ
    description: Local-first means your work lives on your machine, in open formats, readable without HappyHQ. No cloud lock-in, no hidden memory, no renting your own files back.
---

Local-first means your work lives on your computer, in plain files that belong to you — not on our servers, and not in formats we control. Your files are there with or without HappyHQ running. If HappyHQ disappeared tomorrow, your work would still be sitting exactly where you left it.

---

## Why it matters

Most software today asks you to put your work in someone else's house. You hand over the keys, and most of the time it feels fine — until the pricing changes, the export breaks, or the feature you relied on gets deprecated. Then leaving means losing what you built.

Think of a Word document you uploaded to Google Docs five years ago. It isn't really a Word document anymore — it's a Google Docs file, living in Google's format, on Google's servers. You can download a copy. But every comment, link, and tweak that happened inside Google Docs came with strings attached. Leaving means rebuilding.

This is the walled garden. Pretty on the outside, walls you can't see until you try to walk out.

HappyHQ is built the other way. Your work lives in a folder on your own computer. No account stands between you and it. No export to run. No vendor lock-in, because there's nothing to lock in.

---

## Bring any file in. Get plain files back.

HappyHQ works with the files you already have. When you teach it how you do something, you give it the real work — Word documents, spreadsheets, slide decks, PDFs, emails, Google Docs, whatever you actually use. HappyHQ reads them and learns from them.

What HappyHQ stores on your machine — the things it learns, the Playbooks you write, the outputs it produces for you — is plain text. Specifically, Markdown and plain text files.

That's a choice, not a limitation. Plain text is the one format every app on your computer can open. It's readable in 2035 the same way it's readable today. You can paste it straight into a Word doc, drop it into Google Docs, open it in Notion, or put it in an email. It goes anywhere.

---

## What this means for you

- **Your files open in anything.** They're plain text — the kind your computer's built-in editor opens by double-clicking, and the kind you can paste straight into Word, Google Docs, Notion, or an email.
- **Your backup already covers it.** Whatever you use for the rest of your files — Time Machine, iCloud, Dropbox, OneDrive, an external drive — already backs up HappyHQ.
- **It works offline.** HappyHQ doesn't need the internet to open, read, or edit your work. The internet is only needed when your AI provider does the actual thinking.
- **Nothing is ever really lost.** HappyHQ keeps every version of every change. You can always go back.
- **It still works in 2035.** Plain text outlives every format that has ever tried to replace it.

---

## Where your files live

Everything HappyHQ makes or touches lives in one folder on your computer — the `HappyHQ` folder in your home directory. You can open it any time, in whatever file browser your computer uses. Inside, you'll find one folder per Stream, one file per Task output, and every Playbook you've written.

See [Where HappyHQ stores your files](/docs/running/file-storage) for the full layout.

---

## What does leave your machine

HappyHQ is local-first, not offline-only. When HappyHQ does work for you, it sends your prompt and the context you included to an AI provider — the one you chose and whose account you connected. That's how the AI part works.

But:

- **Nothing goes to HappyHQ's servers.** We don't have a copy of your files. We don't see your prompts.
- **You pick the provider.** Anthropic, a self-hosted model, whatever you want.
- **You control what's sent.** Only the files and context you include in a task get sent.

See [Privacy and security](/docs/running/privacy-and-security) for the full picture of what leaves your machine and when.

---

## What we believe

- Your data should be readable without the app that created it.
- Offline access is a right, not a premium feature.
- Open formats are long-term care for your work.
- If you can't find your files on your own computer, you don't really own them.
