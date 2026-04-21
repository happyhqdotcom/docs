#!/usr/bin/env node
/**
 * Content manifest generator.
 *
 * Walks `src/content/<surface>/**\/*.md` at build time and emits:
 *   src/content.generated/<surface>/<slug>.ts   — one module per page, exports `body`
 *   src/content.generated/index.ts              — PAGE_META (eager), PAGES (lazy), NAVIGATION
 *
 * This lets the runtime read page data without filesystem access, which is
 * the only way the docs work on Cloudflare Workers under OpenNext. Pages are
 * lazy-loaded via `import()` so the Worker bundle stays small regardless of
 * content volume — same pattern Fumadocs uses via `fumadocs-mdx`.
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fg from 'fast-glob'
import yaml from 'js-yaml'

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, 'src', 'content')
const OUT_DIR = path.join(ROOT, 'src', 'content.generated')

const SURFACES = ['docs', 'changelog']

// -----------------------------------------------------------------------------
// Frontmatter schemas (dynamically loaded from the TS source via tsx/esm loader
// isn't available here without extra deps, so we re-declare the minimal shape).
// These validators mirror src/lib/frontmatter-schemas.ts; keep them in sync.
// -----------------------------------------------------------------------------

function validateFrontmatter(surface, data, filePath) {
  if (typeof data?.title !== 'string' || !data.title) {
    throw new Error(`${filePath}: frontmatter missing required "title"`)
  }
  if (surface === 'changelog') {
    if (typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error(`${filePath}: changelog frontmatter "date" must be YYYY-MM-DD`)
    }
    if (data.tags !== undefined && !Array.isArray(data.tags)) {
      throw new Error(`${filePath}: changelog frontmatter "tags" must be an array`)
    }
  }
  return {
    title: data.title,
    description: data.description,
    hidden: Boolean(data.hidden),
    lastupdated: data.lastupdated,
    nextjs: data.nextjs,
    ...(surface === 'changelog' ? { date: data.date, tags: data.tags ?? [] } : {}),
  }
}

// -----------------------------------------------------------------------------
// Helpers lifted from src/lib/source.ts — single-source-of-truth URL derivation.
// -----------------------------------------------------------------------------

function stripFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { body: source, raw: '' }
  return { body: match[2].replace(/^\n+/, ''), raw: match[1] }
}

function slugFromRelPath(rel) {
  const noExt = rel.replace(/\.md$/, '')
  if (noExt === 'index') return []
  const parts = noExt.split(path.sep)
  if (parts[parts.length - 1] === 'index') parts.pop()
  return parts
}

function urlForSurface(surface, slug) {
  return slug.length === 0 ? `/${surface}` : `/${surface}/${slug.join('/')}`
}

function basePathFor(surface, slug, isIndex) {
  const url = urlForSurface(surface, slug)
  if (isIndex) return url
  if (slug.length === 0) return `/${surface}`
  return `/${surface}/${slug.slice(0, -1).join('/')}`.replace(/\/$/, '')
}

const gitCache = new Map()
function gitLastUpdated(filePath) {
  if (gitCache.has(filePath)) return gitCache.get(filePath)
  let out = null
  try {
    const iso = execSync(`git log -1 --format=%aI -- "${filePath}"`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (iso) {
      const d = new Date(iso)
      if (!isNaN(d.getTime())) {
        out = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(d)
      }
    }
  } catch {
    /* git unavailable or file not yet committed — leave null */
  }
  gitCache.set(filePath, out)
  return out
}

// -----------------------------------------------------------------------------
// Navigation builder — walks _meta.json files to produce the sidebar tree.
// -----------------------------------------------------------------------------

function loadMeta(folder) {
  const metaPath = path.join(folder, '_meta.json')
  if (!existsSync(metaPath)) return null
  try {
    const json = JSON.parse(readFileSync(metaPath, 'utf8'))
    return {
      title: json.title,
      pages: Array.isArray(json.pages) ? json.pages : [],
    }
  } catch (err) {
    throw new Error(`Invalid _meta.json at ${metaPath}: ${err.message}`)
  }
}

function resolveMetaEntry(entry, currentDir, surfaceRoot, visited) {
  const sep = entry.match(/^---(.+?)---$/)
  if (sep) return [{ kind: 'separator', title: sep[1].trim() }]

  if (entry === '...') return listMdFilesAlpha(currentDir, surfaceRoot)
  if (entry.startsWith('...')) {
    const folder = path.join(currentDir, entry.slice(3))
    return resolveFolder(folder, surfaceRoot, visited)
  }

  const abs = path.join(currentDir, `${entry}.md`)
  if (!existsSync(abs)) return []
  const rel = path.relative(surfaceRoot, abs)
  return [{ kind: 'page', slug: slugFromRelPath(rel) }]
}

function listMdFilesAlpha(folder, surfaceRoot) {
  const files = fg.sync('*.md', { cwd: folder, onlyFiles: true }).sort()
  return files.map((f) => {
    const abs = path.join(folder, f)
    const rel = path.relative(surfaceRoot, abs)
    return { kind: 'page', slug: slugFromRelPath(rel) }
  })
}

function resolveFolder(folder, surfaceRoot, visited) {
  const key = path.resolve(folder)
  if (visited.has(key)) return []
  visited.add(key)

  const meta = loadMeta(folder)
  const out = []

  if (meta?.pages.length > 0) {
    for (const entry of meta.pages) {
      out.push(...resolveMetaEntry(entry, folder, surfaceRoot, visited))
    }
    return out
  }

  const entries = fg.sync('*.md', { cwd: folder, onlyFiles: true }).sort()
  for (const f of entries) {
    const abs = path.join(folder, f)
    const rel = path.relative(surfaceRoot, abs)
    out.push({ kind: 'page', slug: slugFromRelPath(rel) })
  }
  return out
}

function buildNavigation(surface, pagesByUrl) {
  const root = path.join(CONTENT_DIR, surface)
  if (!existsSync(root)) return []

  if (surface === 'changelog') {
    const entries = Object.values(pagesByUrl)
      .filter((p) => p.surface === 'changelog' && !p.frontmatter.hidden)
      .sort((a, b) =>
        (b.frontmatter.date ?? '').localeCompare(a.frontmatter.date ?? ''),
      )
    if (entries.length === 0) return []
    return [
      {
        title: 'Changelog',
        links: entries.map((p) => ({
          title: p.frontmatter.title,
          href: p.url,
        })),
      },
    ]
  }

  const rootMeta = loadMeta(root)
  const resolved = []
  if (rootMeta?.pages.length > 0) {
    const visited = new Set()
    for (const entry of rootMeta.pages) {
      resolved.push(...resolveMetaEntry(entry, root, root, visited))
    }
  } else {
    resolved.push(...resolveFolder(root, root, new Set()))
  }

  const sections = []
  let current = null
  for (const entry of resolved) {
    if (entry.kind === 'separator') {
      current = { title: entry.title, links: [] }
      sections.push(current)
      continue
    }
    const url = urlForSurface(surface, entry.slug)
    const page = pagesByUrl[url]
    if (!page || page.frontmatter.hidden) continue
    if (!current) {
      current = { title: 'Docs', links: [] }
      sections.push(current)
    }
    current.links.push({ title: page.frontmatter.title, href: page.url })
  }
  return sections.filter((s) => s.links.length > 0)
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

function relativeImportPath(fromFile, toFile) {
  const rel = path.relative(path.dirname(fromFile), toFile)
  const withSlash = rel.startsWith('.') ? rel : `./${rel}`
  return withSlash.replace(/\\/g, '/').replace(/\.ts$/, '')
}

function emit() {
  // Clean output directory so stale entries don't linger after a page deletion.
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })

  const pagesByUrl = {}

  for (const surface of SURFACES) {
    const surfaceRoot = path.join(CONTENT_DIR, surface)
    if (!existsSync(surfaceRoot)) continue

    const files = fg.sync('**/*.md', { cwd: surfaceRoot, absolute: true })
    for (const abs of files) {
      const source = readFileSync(abs, 'utf8')
      const { body, raw } = stripFrontmatter(source)
      const rawData = raw
        ? yaml.load(raw, { schema: yaml.JSON_SCHEMA })
        : {}
      const frontmatter = validateFrontmatter(surface, rawData, abs)
      if (!frontmatter.lastupdated) {
        const git = gitLastUpdated(abs)
        if (git) frontmatter.lastupdated = git
      }

      const rel = path.relative(surfaceRoot, abs)
      const slug = slugFromRelPath(rel)
      const url = urlForSurface(surface, slug)
      const isIndex = path.basename(abs) === 'index.md'
      const basePath = basePathFor(surface, slug, isIndex)

      // Write the lazy-loadable body module. One file per page.
      const outRel = rel.replace(/\.md$/, '.ts')
      const outFile = path.join(OUT_DIR, surface, outRel)
      mkdirSync(path.dirname(outFile), { recursive: true })
      writeFileSync(
        outFile,
        `// AUTO-GENERATED — do not edit\nexport const body = ${JSON.stringify(body)}\n`,
        'utf8',
      )

      pagesByUrl[url] = {
        surface,
        slug,
        url,
        basePath,
        frontmatter,
        filePath: path.relative(ROOT, abs),
        _importTarget: outFile,
      }
    }
  }

  // Build nav per surface now that every page is known.
  const navigation = {}
  for (const surface of SURFACES) {
    navigation[surface] = buildNavigation(surface, pagesByUrl)
  }

  // Emit the index with PAGE_META (eager), PAGES (lazy), NAVIGATION.
  const indexFile = path.join(OUT_DIR, 'index.ts')
  const metaEntries = []
  const pageEntries = []
  for (const [url, page] of Object.entries(pagesByUrl)) {
    metaEntries.push(
      `  ${JSON.stringify(url)}: ${JSON.stringify(
        {
          surface: page.surface,
          slug: page.slug,
          url: page.url,
          basePath: page.basePath,
          frontmatter: page.frontmatter,
          filePath: page.filePath,
        },
        null,
        2,
      )
        .split('\n')
        .join('\n  ')}`,
    )
    const importPath = relativeImportPath(indexFile, page._importTarget)
    pageEntries.push(
      `  ${JSON.stringify(url)}: () => import(${JSON.stringify(importPath)})`,
    )
  }

  const indexSource = `// AUTO-GENERATED — do not edit
import type { Surface, SurfaceFrontmatter } from '@/lib/frontmatter-schemas'

export interface PageMeta<S extends Surface = Surface> {
  surface: S
  slug: string[]
  url: string
  basePath: string
  frontmatter: SurfaceFrontmatter[S]
  filePath: string
}

export interface PageBody {
  body: string
}

export interface NavLink {
  title: string
  href: string
}

export interface NavSection {
  title: string
  links: NavLink[]
}

export type NavTree = NavSection[]

export const PAGE_META: Record<string, PageMeta> = {
${metaEntries.join(',\n')}
}

export const PAGES: Record<string, () => Promise<PageBody>> = {
${pageEntries.join(',\n')}
}

export const NAVIGATION: Record<Surface, NavTree> = ${JSON.stringify(
    navigation,
    null,
    2,
  )}
`

  writeFileSync(indexFile, indexSource, 'utf8')

  console.log(
    `content-manifest: emitted ${Object.keys(pagesByUrl).length} page(s) to ${path.relative(ROOT, OUT_DIR)}/`,
  )
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  emit()
}

export { emit }
