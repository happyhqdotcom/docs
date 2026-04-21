import {
  getNavigation,
  getPage,
  getPages,
  getSurfaces,
  renderLLMPage,
  surfaceLabel,
} from '@/lib/source'

export const dynamic = 'force-static'

export async function GET() {
  const preamble =
    '# HappyHQ — Full Content\n\n' +
    '> This file concatenates every page across every surface for LLM ingestion.'

  const parts: string[] = [preamble]

  for (const surface of getSurfaces()) {
    parts.push(`\n\n===== ${surfaceLabel(surface)} =====`)

    if (surface === 'docs') {
      for (const section of getNavigation(surface)) {
        for (const link of section.links) {
          const slugParts = link.href
            .replace(/^\/[^/]+/, '')
            .split('/')
            .filter(Boolean)
          const page = await getPage(surface, slugParts)
          if (page) parts.push(renderLLMPage(page))
        }
      }
      continue
    }

    const metas = getPages(surface)
    for (const meta of metas) {
      const page = await getPage(surface, meta.slug)
      if (page) parts.push(renderLLMPage(page))
    }
  }

  return new Response(parts.join('\n\n---\n\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, must-revalidate',
    },
  })
}
