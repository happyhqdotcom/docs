import type { MetadataRoute } from 'next'

import { getPages, getSurfaces } from '@/lib/source'

export const dynamic = 'force-static'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://happyhq.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const surface of getSurfaces()) {
    for (const page of getPages(surface)) {
      entries.push({
        url: `${BASE_URL}${page.url}`,
        lastModified: page.frontmatter.lastupdated
          ? new Date(page.frontmatter.lastupdated)
          : undefined,
        changeFrequency: surface === 'changelog' ? 'never' : 'weekly',
      })
    }
  }

  return entries
}
