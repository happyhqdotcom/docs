// Per-page Schema.org JSON-LD. Rendered as a server component so the
// <script> ships in the SSR HTML (crawlers and LLMs look for it there).
// Site-level schema (Organization, WebSite) belongs in the welcome-app
// root layout, not here — this is strictly per-page metadata.

import { type Surface } from '@/lib/frontmatter-schemas'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://happyhq.com'

type CommonProps = {
  surface: Surface
  url: string
  title: string
  description?: string
  dateModified?: string
  datePublished?: string
  breadcrumbs?: Array<{ title: string; href: string }>
}

function articleSchema(props: CommonProps, type: 'TechArticle' | 'BlogPosting') {
  const canonical = `${SITE_URL}${props.url}`
  // OG image URL mirrors the route-handler at `/og/<surface>/<slug>`. Keep
  // in sync with src/app/og/<surface>/[[...slug]]/route.tsx.
  const ogPath =
    props.url === `/${props.surface}`
      ? `/og/${props.surface}`
      : `/og/${props.surface}${props.url.replace(new RegExp(`^/${props.surface}`), '')}`
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: props.title,
    description: props.description,
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    image: `${SITE_URL}${ogPath}`,
    datePublished: props.datePublished,
    dateModified: props.dateModified ?? props.datePublished,
    publisher: {
      '@type': 'Organization',
      name: 'HappyHQ',
      url: SITE_URL,
    },
  }
}

function breadcrumbSchema(props: CommonProps) {
  const trail = [
    { title: 'Home', href: '/' },
    ...(props.breadcrumbs ?? []),
    { title: props.title, href: props.url },
  ]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.title,
      item: `${SITE_URL}${item.href}`,
    })),
  }
}

export function StructuredData(props: CommonProps) {
  const type = props.surface === 'changelog' ? 'BlogPosting' : 'TechArticle'
  const article = articleSchema(props, type)
  const breadcrumb = breadcrumbSchema(props)

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD is safe to stringify inline; no user-authored HTML in the payload.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  )
}
