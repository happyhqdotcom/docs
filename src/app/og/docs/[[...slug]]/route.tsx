import { renderOgCard } from '@/app/og/_lib/card'
import { getPage, getPages } from '@/lib/source'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const pages = await getPages('docs')
  return pages.map((page) => ({
    slug: page.slug.length === 0 ? undefined : page.slug,
  }))
}

type Params = { slug?: string[] }

function titleCase(segment: string) {
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug = [] } = await params
  const page = await getPage('docs', slug)
  const title = page?.frontmatter.title ?? 'HappyHQ Docs'
  const description =
    page?.frontmatter.description ?? 'The AI workspace for everyday work.'
  const eyebrow = slug.length > 0 ? titleCase(slug[0]) : 'Docs'

  return renderOgCard({
    surface: 'docs',
    title,
    description,
    eyebrow,
  })
}
