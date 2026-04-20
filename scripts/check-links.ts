#!/usr/bin/env node
/* eslint-disable no-console */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')

function slugFromFile(surface: string, absPath: string): string {
  const rel = path.relative(path.join(CONTENT_DIR, surface), absPath)
  const noExt = rel.replace(/\.md$/, '')
  const parts = noExt.split(path.sep)
  if (parts[parts.length - 1] === 'index') parts.pop()
  if (parts.length === 0) return `/${surface}`
  return `/${surface}/${parts.join('/')}`
}

function collectValidUrls(): { urls: Set<string>; surfaces: string[] } {
  const surfaces = fg.sync('*', {
    cwd: CONTENT_DIR,
    onlyDirectories: true,
  })
  const urls = new Set<string>()
  for (const surface of surfaces) {
    const files = fg.sync('**/*.md', {
      cwd: path.join(CONTENT_DIR, surface),
      absolute: true,
    })
    for (const f of files) urls.add(slugFromFile(surface, f))
  }
  return { urls, surfaces }
}

type Link = { url: string; file: string; line: number }

function extractLinks(file: string, content: string): Link[] {
  const out: Link[] = []
  // Markdown links: [text](url). Skip image links which are `![...`.
  const mdLink = /(!?)\[[^\]]*\]\(([^)\s]+)\)/g
  // Markdoc tag attrs: href="..."
  const hrefAttr = /\bhref="([^"]+)"/g
  const lines = content.split('\n')
  lines.forEach((line, i) => {
    for (const m of line.matchAll(mdLink)) {
      if (m[1] === '!') continue
      out.push({ url: m[2], file, line: i + 1 })
    }
    for (const m of line.matchAll(hrefAttr)) {
      out.push({ url: m[1], file, line: i + 1 })
    }
  })
  return out
}

function normalize(url: string): string {
  const cleaned = url.split('#')[0].split('?')[0].replace(/\.md$/, '')
  const trimmed = cleaned.replace(/\/$/, '')
  return trimmed === '' ? '/' : trimmed
}

function main() {
  const { urls: valid, surfaces } = collectValidUrls()
  const surfacePrefixes = surfaces.map((s) => `/${s}`)

  const files = fg.sync('**/*.md', { cwd: CONTENT_DIR, absolute: true })
  const broken: Link[] = []
  let linkCount = 0

  for (const f of files) {
    const content = readFileSync(f, 'utf8')
    for (const link of extractLinks(f, content)) {
      // Only validate links that point into a content surface. Everything
      // else (external URLs, image paths, root landing, anchors) is ignored.
      const inSurface = surfacePrefixes.some(
        (p) => link.url === p || link.url.startsWith(`${p}/`),
      )
      if (!inSurface) continue
      linkCount++
      const target = normalize(link.url)
      if (!valid.has(target)) broken.push(link)
    }
  }

  if (broken.length === 0) {
    console.log(
      `OK — ${files.length} files, ${linkCount} internal links, 0 broken`,
    )
    process.exit(0)
  }

  console.error(`Broken internal links (${broken.length}):`)
  for (const b of broken) {
    const rel = path.relative(process.cwd(), b.file)
    console.error(`  ${rel}:${b.line}  ${b.url}`)
  }
  process.exit(1)
}

main()
