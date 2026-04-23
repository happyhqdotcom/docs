'use client'

import { usePathname } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MarkdownMenu } from '@/components/MarkdownMenu'
import { type NavTree } from '@/lib/source'

export function DocsHeader({
  title,
  lastUpdated,
  navigation,
}: {
  title?: string
  lastUpdated?: string
  navigation: NavTree
}) {
  let pathname = usePathname()
  let section = navigation.find((section) =>
    section.links.find((link) => link.href === pathname),
  )

  if (!title && !section) {
    return null
  }

  return (
    <header className="mb-7 space-y-1">
      <div className="mb-3 min-w-0 space-y-1.5">
        {section && (
          <p className="font-mono text-xs font-medium tracking-wider text-[#C5254F] uppercase dark:text-[#F95F7C]">
            {section.title}
          </p>
        )}
        <Breadcrumbs navigation={navigation} />
      </div>
      {title && (
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h1>
      )}
      <div className="flex items-center gap-x-3 pt-2">
        <MarkdownMenu />
        {lastUpdated && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>
    </header>
  )
}
