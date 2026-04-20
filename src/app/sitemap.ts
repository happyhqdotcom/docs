import type { MetadataRoute } from 'next'

import { getPages, getSurfaces } from '@/lib/source'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
  ]

  for (const surface of getSurfaces()) {
    for (const page of getPages(surface)) {
      entries.push({
        url: `${BASE_URL}${page.url}`,
        lastModified: page.frontmatter.lastupdated,
        changeFrequency: surface === 'changelog' ? 'never' : 'weekly',
      })
    }
  }

  return entries
}
