import 'server-only'

import {
  PAGE_META,
  PAGES,
  NAVIGATION,
  type PageMeta,
  type NavTree,
  type NavLink,
  type NavSection,
} from '@/content.generated'
import { type Surface } from '@/lib/frontmatter-schemas'

export type PageSlug = string[]

export interface Page<S extends Surface = Surface> extends PageMeta<S> {
  rawSource: string
  body: string
}

export type { NavLink, NavSection, NavTree }

const SURFACES: Record<
  Surface,
  { label: string; hasSidebar: boolean }
> = {
  docs: { label: 'Docs', hasSidebar: true },
  changelog: { label: 'Changelog', hasSidebar: false },
}

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

function urlForSurface(surface: Surface, slug: PageSlug): string {
  const prefix = surfacePrefix(surface)
  return slug.length === 0 ? prefix : `${prefix}/${slug.join('/')}`
}

// `hidden: true` in frontmatter hides a page from the published site but
// keeps it reachable in dev so authors can preview drafts / scaffolding.
const HIDE_HIDDEN = process.env.NODE_ENV === 'production'
function isVisible(meta: PageMeta): boolean {
  return !HIDE_HIDDEN || !meta.frontmatter.hidden
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export function getPageMetas(): PageMeta[]
export function getPageMetas<S extends Surface>(surface: S): PageMeta<S>[]
export function getPageMetas(surface?: Surface): PageMeta[] {
  const all = Object.values(PAGE_META).filter(isVisible)
  return surface ? all.filter((p) => p.surface === surface) : all
}

// Back-compat alias — many callers still say `getPages`. Returns metadata only
// (no body). Callers that need the body must use `getPage(surface, slug)`.
export const getPages: typeof getPageMetas = getPageMetas as typeof getPageMetas

export async function getPage<S extends Surface>(
  surface: S,
  slug: PageSlug,
): Promise<Page<S> | null> {
  const url = urlForSurface(surface, slug)
  const meta = PAGE_META[url] as PageMeta<S> | undefined
  if (!meta || !isVisible(meta)) return null
  const loader = PAGES[url]
  if (!loader) return null
  const { body } = await loader()
  return { ...meta, rawSource: body, body }
}

export function getNavigation(surface: Surface): NavTree {
  return NAVIGATION[surface] ?? []
}

export function getFlatLinks(nav: NavTree): NavLink[] {
  return nav.flatMap((s) => s.links)
}

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
