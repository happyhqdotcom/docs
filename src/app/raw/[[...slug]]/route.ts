import { getPage, getPages, getSurfaces, renderLLMPage } from '@/lib/source'
import { type Surface } from '@/lib/frontmatter-schemas'

export const dynamic = 'force-static'

function parseSurfaceSlug(slug: string[]): {
  surface: Surface
  contentSlug: string[]
} | null {
  if (slug.length === 0) return null
  const [first, ...rest] = slug
  if (!getSurfaces().includes(first as Surface)) return null
  return { surface: first as Surface, contentSlug: rest }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await params
  const parsed = parseSurfaceSlug(slug)
  if (!parsed) return new Response('Not Found', { status: 404 })
  const page = await getPage(parsed.surface, parsed.contentSlug)
  if (!page) return new Response('Not Found', { status: 404 })
  return new Response(renderLLMPage(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, must-revalidate',
    },
  })
}

export async function generateStaticParams() {
  const pages = await getPages()
  return pages.map((page) => {
    const parts = page.url.split('/').filter(Boolean)
    return { slug: parts }
  })
}
