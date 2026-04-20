import {
  getNavigation,
  getPages,
  getSurfaces,
  surfaceLabel,
} from '@/lib/source'

export const dynamic = 'force-static'

export function GET() {
  const lines: string[] = [
    '# HappyHQ',
    '',
    '> A modern knowledge base for high performance — the shared brain for teams.',
    '',
  ]

  for (const surface of getSurfaces()) {
    lines.push(`# ${surfaceLabel(surface)}`, '')
    const nav = getNavigation(surface)

    if (surface === 'docs' && nav.length > 0) {
      for (const section of nav) {
        lines.push(`## ${section.title}`, '')
        for (const link of section.links) {
          lines.push(`- [${link.title}](${link.href}.md)`)
        }
        lines.push('')
      }
      continue
    }

    const entries = getPages(surface)
    if (entries.length === 0) {
      lines.push('_No entries yet._', '')
      continue
    }
    for (const page of entries) {
      lines.push(`- [${page.frontmatter.title}](${page.url}.md)`)
    }
    lines.push('')
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, must-revalidate',
    },
  })
}
