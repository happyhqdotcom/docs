import { DocsHeader } from '@/components/DocsHeader'
import { EditOnGitHub } from '@/components/EditOnGitHub'
import { PrevNextLinks } from '@/components/PrevNextLinks'
import { Prose } from '@/components/Prose'
import {
  DesktopTableOfContents,
  MobileTableOfContents,
} from '@/components/TableOfContents'
import { type DocsFrontmatter } from '@/lib/frontmatter-schemas'
import { collectSections } from '@/lib/sections'
import { type NavTree } from '@/lib/source'
import { type Node } from '@markdoc/markdoc'

export function DocsLayout({
  children,
  frontmatter,
  nodes,
  navigation,
}: {
  children: React.ReactNode
  frontmatter: DocsFrontmatter
  nodes: Array<Node>
  navigation: NavTree
}) {
  let tableOfContents = collectSections(nodes)

  return (
    <div className="relative flex w-full flex-col lg:flex-row">
      <MobileTableOfContents tableOfContents={tableOfContents} />

      <div className="mx-auto max-w-2xl min-w-0 flex-auto px-5 py-11 max-[405px]:max-w-screen max-[405px]:px-4 lg:max-w-none lg:pl-8 xl:px-16">
        <article>
          <DocsHeader
            title={frontmatter.title}
            lastUpdated={frontmatter.lastupdated}
            navigation={navigation}
          />
          <Prose>{children}</Prose>
        </article>
        <div className="mt-8 flex justify-end">
          <EditOnGitHub />
        </div>
        <PrevNextLinks navigation={navigation} />
      </div>

      <DesktopTableOfContents tableOfContents={tableOfContents} />
    </div>
  )
}
