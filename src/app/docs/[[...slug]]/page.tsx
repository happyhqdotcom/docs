import Markdoc, { type Config as MarkdocConfig } from '@markdoc/markdoc'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as React from 'react'

import { DocsLayout } from '@/components/DocsLayout'
import { BasePathProvider } from '@/components/MarkdocLink'
import { StructuredData } from '@/components/StructuredData'
import { getAncestors, getNavigation, getPage, getPages } from '@/lib/source'
import { components } from '@/markdoc/components'
import nodes from '@/markdoc/nodes'
import tags from '@/markdoc/tags'

const markdocConfig = { nodes, tags } as unknown as MarkdocConfig

type PageProps = {
  params: Promise<{ slug?: string[] }>
}

export async function generateStaticParams() {
  return getPages('docs').map((page) => ({
    slug: page.slug.length === 0 ? undefined : page.slug,
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const page = await getPage('docs', slug)
  if (!page) return {}
  const override = page.frontmatter.nextjs?.metadata
  const title = override?.title ?? page.frontmatter.title
  const description = override?.description ?? page.frontmatter.description
  const ogPath =
    slug.length === 0 ? '/og/docs/_root.png' : `/og/docs/${slug.join('/')}.png`
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
      type: 'website',
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

export default async function DocsPage({ params }: PageProps) {
  const { slug = [] } = await params
  const page = await getPage('docs', slug)
  if (!page) notFound()

  const ast = Markdoc.parse(page.rawSource)
  const content = Markdoc.transform(ast, markdocConfig)
  const rendered = Markdoc.renderers.react(content, React, { components })
  const nav = getNavigation('docs')
  const breadcrumbs = getAncestors(nav, page.url).map((a) => ({
    title: a.title,
    href: a.href,
  }))

  return (
    <>
      <StructuredData
        surface="docs"
        url={page.url}
        title={page.frontmatter.title}
        description={page.frontmatter.description}
        dateModified={page.frontmatter.lastupdated}
        breadcrumbs={breadcrumbs}
      />
      <DocsLayout
        frontmatter={page.frontmatter}
        nodes={ast.children}
        navigation={nav}
      >
        <BasePathProvider basePath={page.basePath}>
          {rendered}
        </BasePathProvider>
      </DocsLayout>
    </>
  )
}
