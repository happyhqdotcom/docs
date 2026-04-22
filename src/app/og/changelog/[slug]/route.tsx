import { renderOgCard } from '@/app/og/_lib/card'
import { getPage, getPages } from '@/lib/source'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getPages('changelog').map((page) => ({ slug: page.slug.join('/') }))
}

type Params = { slug: string }

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params
  const page = await getPage('changelog', [slug])
  const title = page?.frontmatter.title ?? 'HappyHQ Changelog'
  const description = page?.frontmatter.description ?? ''
  const date = page?.frontmatter.date ?? ''

  return renderOgCard({
    surface: 'changelog',
    title,
    description,
    eyebrow: 'Changelog',
    date,
  })
}
