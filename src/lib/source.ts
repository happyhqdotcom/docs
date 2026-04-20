import 'server-only'

import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'
import yaml from 'js-yaml'

import {
  frontmatterSchemas,
  metaSchema,
  type Surface,
  type SurfaceFrontmatter,
  type Meta,
} from '@/lib/frontmatter-schemas'

const CONTENT_BASE = path.join(process.cwd(), 'src', 'content')

const SURFACES: Record<
  Surface,
  { root: string; label: string; hasSidebar: boolean }
> = {
  docs: {
    root: path.join(CONTENT_BASE, 'docs'),
    label: 'Docs',
    hasSidebar: true,
  },
  changelog: {
    root: path.join(CONTENT_BASE, 'changelog'),
    label: 'Changelog',
    hasSidebar: false,
  },
}

export type PageSlug = string[]

export interface Page<S extends Surface = Surface> {
  surface: S
  slug: PageSlug
  url: string
  // URL of the directory the source file lives in. Used as the anchor for
  // resolving `./foo` / `../bar` links in markdown. For a `index.md` page
  // this equals `url`; for leaf pages it's the url's parent.
  basePath: string
  frontmatter: SurfaceFrontmatter[S]
  rawSource: string
  body: string
  filePath: string
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

export function getSurfaces(): Surface[] {
  return Object.keys(SURFACES) as Surface[]
}

export function surfaceLabel(surface: Surface): string {
  return SURFACES[surface].label
}

export function surfacePrefix(surface: Surface): string {
  return `/${surface}`
}

export function surfaceHasSidebar(surface: Surface): boolean {
  return SURFACES[surface].hasSidebar
}

function rootFor(surface: Surface): string {
  return SURFACES[surface].root
}

function relFromRoot(root: string, abs: string): string {
  return path.relative(root, abs)
}

function slugFromRelPath(rel: string): PageSlug {
  const noExt = rel.replace(/\.md$/, '')
  if (noExt === 'index') return []
  const parts = noExt.split(path.sep)
  if (parts[parts.length - 1] === 'index') parts.pop()
  return parts
}

function urlForSurface(surface: Surface, slug: PageSlug): string {
  const prefix = surfacePrefix(surface)
  return slug.length === 0 ? prefix : `${prefix}/${slug.join('/')}`
}

// Git-based last-updated. Used as a fallback when a page has no
// `lastupdated` frontmatter field. Cached per file path for the lifetime
// of the process — safe because the repo state doesn't change while the
// server is running. Returns null if git is unavailable or the file isn't
// yet committed (e.g. brand-new page on a feature branch).
const gitLastUpdatedCache = new Map<string, string | null>()

function getGitLastUpdated(filePath: string): string | null {
  if (gitLastUpdatedCache.has(filePath)) {
    return gitLastUpdatedCache.get(filePath)!
  }
  let formatted: string | null = null
  try {
    const iso = execSync(`git log -1 --format=%aI -- "${filePath}"`, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (iso) {
      const d = new Date(iso)
      if (!isNaN(d.getTime())) {
        formatted = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(d)
      }
    }
  } catch {
    // git not available or not a repo — fall through to null
  }
  gitLastUpdatedCache.set(filePath, formatted)
  return formatted
}

function stripFrontmatter(source: string): { body: string; raw: string } {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { body: source, raw: '' }
  return { body: match[2].replace(/^\n+/, ''), raw: match[1] }
}

function loadMeta(folder: string): Meta | null {
  const metaPath = path.join(folder, '_meta.json')
  if (!existsSync(metaPath)) return null
  const json = JSON.parse(readFileSync(metaPath, 'utf8'))
  const parsed = metaSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error(
      `Invalid _meta.json at ${metaPath}: ${parsed.error.message}`,
    )
  }
  return parsed.data
}

function loadPageFromFile<S extends Surface>(
  surface: S,
  absPath: string,
): Page<S> {
  const source = readFileSync(absPath, 'utf8')
  const { body, raw } = stripFrontmatter(source)
  const fmRaw = raw
    ? (yaml.load(raw, { schema: yaml.JSON_SCHEMA }) as Record<
        string,
        unknown
      >)
    : {}
  const parsed = frontmatterSchemas[surface].safeParse(fmRaw)
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${absPath}: ${parsed.error.message}`,
    )
  }
  // Fill in `lastupdated` from git if the author didn't set it explicitly.
  // Authors can still override by putting `lastupdated: "..."` in frontmatter.
  if (!parsed.data.lastupdated) {
    const gitDate = getGitLastUpdated(absPath)
    if (gitDate) parsed.data.lastupdated = gitDate
  }
  const rel = relFromRoot(rootFor(surface), absPath)
  const slug = slugFromRelPath(rel)
  const url = urlForSurface(surface, slug)
  // index.md pages behave as the directory itself; leaf pages' basePath is
  // the URL with the leaf segment stripped.
  const isIndex = path.basename(absPath) === 'index.md'
  const basePath = isIndex
    ? url
    : slug.length === 0
      ? surfacePrefix(surface)
      : `${surfacePrefix(surface)}/${slug.slice(0, -1).join('/')}`.replace(
          /\/$/,
          '',
        )
  return {
    surface,
    slug,
    url,
    basePath,
    frontmatter: parsed.data as SurfaceFrontmatter[S],
    rawSource: body,
    body,
    filePath: absPath,
  }
}

type Cache = { [K in Surface]: Map<string, Page<K>> }

let cache: Cache | null = null
const CACHE_ENABLED = process.env.NODE_ENV === 'production'

// `hidden: true` in frontmatter hides a page from the published site but
// keeps it reachable in dev so authors can preview drafts / scaffolding.
const HIDE_HIDDEN = process.env.NODE_ENV === 'production'
function isVisible(page: Page): boolean {
  return !HIDE_HIDDEN || !page.frontmatter.hidden
}

function buildCache(): Cache {
  if (CACHE_ENABLED && cache) return cache
  const next: Cache = { docs: new Map(), changelog: new Map() }
  for (const surface of getSurfaces()) {
    const root = rootFor(surface)
    if (!existsSync(root)) continue
    const files = fg.sync('**/*.md', { cwd: root, absolute: true })
    for (const abs of files) {
      const page = loadPageFromFile(surface, abs)
      ;(next[surface] as Map<string, Page>).set(page.url, page)
    }
  }
  if (CACHE_ENABLED) cache = next
  return next
}

export function getPages(): Page[]
export function getPages<S extends Surface>(surface: S): Page<S>[]
export function getPages(surface?: Surface): Page[] {
  const c = buildCache()
  if (surface) {
    const entries = c[surface] as Map<string, Page>
    return Array.from(entries.values()).filter(isVisible)
  }
  return getSurfaces().flatMap((s) => {
    const entries = c[s] as Map<string, Page>
    return Array.from(entries.values()).filter(isVisible)
  })
}

export function getPage<S extends Surface>(
  surface: S,
  slug: PageSlug,
): Page<S> | null {
  const url = urlForSurface(surface, slug)
  const page = buildCache()[surface].get(url) as Page<S> | undefined
  if (!page || !isVisible(page)) return null
  return page
}

type MetaEntry =
  | { kind: 'page'; slug: PageSlug }
  | { kind: 'separator'; title: string }

function listMdFilesAlpha(folder: string, surfaceRoot: string): MetaEntry[] {
  const files = fg.sync('*.md', { cwd: folder, onlyFiles: true }).sort()
  return files.map((file) => {
    const abs = path.join(folder, file)
    const rel = relFromRoot(surfaceRoot, abs)
    return { kind: 'page' as const, slug: slugFromRelPath(rel) }
  })
}

function resolveMetaEntry(
  entry: string,
  currentDir: string,
  surfaceRoot: string,
  visited: Set<string>,
): MetaEntry[] {
  const sepMatch = entry.match(/^---(.+?)---$/)
  if (sepMatch) return [{ kind: 'separator', title: sepMatch[1].trim() }]

  if (entry === '...') {
    // Bare `...` in a folder's own meta: list files alphabetically without
    // recursing back into that same meta.
    return listMdFilesAlpha(currentDir, surfaceRoot)
  }
  if (entry.startsWith('...')) {
    const folderName = entry.slice(3)
    const folder = path.join(currentDir, folderName)
    return resolveFolder(folder, surfaceRoot, visited)
  }

  const abs = path.join(currentDir, `${entry}.md`)
  if (!existsSync(abs)) return []
  const rel = relFromRoot(surfaceRoot, abs)
  return [{ kind: 'page', slug: slugFromRelPath(rel) }]
}

function resolveFolder(
  folder: string,
  surfaceRoot: string,
  visited: Set<string>,
): MetaEntry[] {
  const key = path.resolve(folder)
  if (visited.has(key)) return []
  visited.add(key)

  const meta = loadMeta(folder)
  const out: MetaEntry[] = []

  if (meta?.pages && meta.pages.length > 0) {
    for (const entry of meta.pages) {
      out.push(...resolveMetaEntry(entry, folder, surfaceRoot, visited))
    }
    return out
  }

  const entries = fg.sync('*.md', { cwd: folder, onlyFiles: true }).sort()
  for (const file of entries) {
    const abs = path.join(folder, file)
    const rel = relFromRoot(surfaceRoot, abs)
    out.push({ kind: 'page', slug: slugFromRelPath(rel) })
  }
  return out
}

export function getNavigation(surface: Surface): NavTree {
  const root = rootFor(surface)
  if (!existsSync(root)) return []

  if (surface === 'changelog') {
    const entries = (getPages('changelog') as Page<'changelog'>[])
      .slice()
      .sort((a, b) =>
        b.frontmatter.date.localeCompare(a.frontmatter.date),
      )
    if (entries.length === 0) return []
    return [
      {
        title: surfaceLabel(surface),
        links: entries.map((p) => ({
          title: p.frontmatter.title,
          href: p.url,
        })),
      },
    ]
  }

  const rootMeta = loadMeta(root)
  const resolved: MetaEntry[] = []

  if (rootMeta?.pages && rootMeta.pages.length > 0) {
    const visited = new Set<string>()
    for (const entry of rootMeta.pages) {
      resolved.push(...resolveMetaEntry(entry, root, root, visited))
    }
  } else {
    resolved.push(...resolveFolder(root, root, new Set()))
  }

  const sections: NavSection[] = []
  let current: NavSection | null = null
  const surfaceCache = buildCache()[surface]

  for (const entry of resolved) {
    if (entry.kind === 'separator') {
      current = { title: entry.title, links: [] }
      sections.push(current)
      continue
    }
    const page = surfaceCache.get(urlForSurface(surface, entry.slug))
    if (!page || !isVisible(page)) continue
    if (!current) {
      current = { title: surfaceLabel(surface), links: [] }
      sections.push(current)
    }
    current.links.push({ title: page.frontmatter.title, href: page.url })
  }

  return sections.filter((s) => s.links.length > 0)
}

export function getFlatLinks(nav: NavTree): NavLink[] {
  return nav.flatMap((s) => s.links)
}

// Ancestors are nav links whose href is a strict prefix of `url` — i.e. real
// parent pages in the path hierarchy. The first segment is the surface root
// (e.g. `/docs`), which is the surface's index page, not a parent — skip it.
export function getAncestors(nav: NavTree, url: string): NavLink[] {
  const links = getFlatLinks(nav)
  const segments = url.split('/').filter(Boolean)
  const out: NavLink[] = []
  for (let i = 2; i < segments.length; i++) {
    const prefix = '/' + segments.slice(0, i).join('/')
    const match = links.find((l) => l.href === prefix)
    if (match) out.push(match)
  }
  return out
}

export function getPrevNext(
  pathname: string,
  nav: NavTree,
): { prev: NavLink | null; next: NavLink | null } {
  const flat = getFlatLinks(nav)
  const idx = flat.findIndex((l) => l.href === pathname)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  }
}

export function findSectionForPath(
  pathname: string,
  nav: NavTree,
): NavSection | undefined {
  return nav.find((s) => s.links.some((l) => l.href === pathname))
}

export function surfaceFromPathname(pathname: string): Surface | null {
  const first = pathname.split('/').filter(Boolean)[0]
  if (!first) return null
  return getSurfaces().includes(first as Surface) ? (first as Surface) : null
}

export function renderLLMPage(page: Page): string {
  return `# ${page.frontmatter.title} (${page.url})\n\n${page.body.trimEnd()}\n`
}
