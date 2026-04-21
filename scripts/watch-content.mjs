#!/usr/bin/env node
/**
 * Dev-only watcher. Regenerates the content manifest whenever anything under
 * src/content/** changes so Next's HMR picks up the updated modules. Started
 * via the `dev` package script alongside `next dev`.
 */
import { watch } from 'node:fs'
import path from 'node:path'

import { emit } from './build-content-manifest.mjs'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')

let pending = null
function schedule() {
  if (pending) return
  pending = setTimeout(() => {
    pending = null
    try {
      emit()
    } catch (err) {
      console.error('[watch-content] regenerate failed:', err.message)
    }
  }, 100)
}

// Initial build so `next dev` sees the manifest immediately.
emit()

watch(CONTENT_DIR, { recursive: true }, (_event, filename) => {
  if (!filename) return
  if (!filename.endsWith('.md') && !filename.endsWith('_meta.json')) return
  schedule()
})

console.log(`[watch-content] watching ${path.relative(process.cwd(), CONTENT_DIR)}`)
