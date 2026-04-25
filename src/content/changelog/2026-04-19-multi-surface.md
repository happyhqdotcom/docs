---
hidden: true
title: Multi-surface content architecture
date: 2026-04-19
description: Docs are no longer the only surface. Changelog entries, guides, and API references will each get their own top-level section.
---

HappyHQ docs now runs on a multi-surface architecture. Content is decoupled from routing via `src/lib/source.ts`, each surface (docs, changelog, and soon others) has its own content tree under `src/content/`, and routing composes via edge rewrites so `/docs/*` and `/changelog/*` both resolve from a single deployment.

This entry is the first changelog entry — a placeholder to prove the shape works end-to-end.
