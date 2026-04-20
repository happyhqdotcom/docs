import Markdoc, { type Config as MarkdocConfig } from '@markdoc/markdoc'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as React from 'react'

import { ChangelogLayout } from '@/components/ChangelogLayout'
import { BasePathProvider } from '@/components/MarkdocLink'
import { StructuredData } from '@/components/StructuredData'
import { getPage, getPages } from '@/lib/source'
import { components } from '@/markdoc/components'
import nodes from '@/markdoc/nodes'
import tags from '@/markdoc/tags'

const markdocConfig = { nodes, tags } as unknown as MarkdocConfig

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPages('changelog').map((page) => ({
    slug: page.slug.join('/'),
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getPage('changelog', [slug])
  if (!page) return {}
  const override = page.frontmatter.nextjs?.metadata
  const title = override?.title ?? page.frontmatter.title
  const description = override?.description ?? page.frontmatter.description
  const ogPath = `/og/changelog/${slug}`
  return {
    title,
    description,
    alternates: {
      canonical: page.url,
      types: {
        'text/markdown': `${page.url}.md`,
      },
    },
    openGraph: {
      title,
      description,
      url: page.url,
      type: 'article',
      publishedTime: page.frontmatter.date,
      images: [{ url: ogPath, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogPath],
    },
  }
}

export default async function ChangelogEntry({ params }: PageProps) {
  const { slug } = await params
  const page = getPage('changelog', [slug])
  if (!page) notFound()

  const ast = Markdoc.parse(page.rawSource)
  const content = Markdoc.transform(ast, markdocConfig)
  const rendered = Markdoc.renderers.react(content, React, { components })

  return (
    <>
      <StructuredData
        surface="changelog"
        url={page.url}
        title={page.frontmatter.title}
        description={page.frontmatter.description}
        datePublished={page.frontmatter.date}
        dateModified={page.frontmatter.lastupdated ?? page.frontmatter.date}
      />
      <ChangelogLayout frontmatter={page.frontmatter}>
        <BasePathProvider basePath={page.basePath}>
          {rendered}
        </BasePathProvider>
      </ChangelogLayout>
    </>
  )
}
