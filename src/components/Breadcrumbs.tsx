'use client'

import { Fragment } from 'react'

import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { HomeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { type NavLink, type NavTree } from '@/lib/source'

export function Breadcrumbs({ navigation }: { navigation: NavTree }) {
  const pathname = usePathname()
  if (pathname === '/') return null

  const allLinks = navigation.flatMap((s) => s.links)
  const current = allLinks.find((l) => l.href === pathname)
  if (!current) return null

  // Skip the surface-root segment (e.g. `/docs`) — that's the surface's
  // index page, not a parent of every nested page underneath it.
  const ancestors: NavLink[] = []
  const segments = pathname.split('/').filter(Boolean)
  for (let i = 2; i < segments.length; i++) {
    const prefix = '/' + segments.slice(0, i).join('/')
    const match = allLinks.find((l) => l.href === prefix)
    if (match) ancestors.push(match)
  }
  if (ancestors.length === 0) return null

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <li className="flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-x-1 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <HomeIcon className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {ancestors.map((a) => (
          <Fragment key={a.href}>
            <li aria-hidden className="flex items-center">
              <ChevronRightIcon className="h-3.5 w-3.5 text-zinc-400/70 dark:text-zinc-600" />
            </li>
            <li className="flex items-center">
              <Link
                href={a.href}
                className="truncate hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                {a.title}
              </Link>
            </li>
          </Fragment>
        ))}
        <li aria-hidden className="flex items-center">
          <ChevronRightIcon className="h-3.5 w-3.5 text-zinc-400/70 dark:text-zinc-600" />
        </li>
        <li className="flex items-center truncate text-zinc-700 dark:text-zinc-300">
          {current.title}
        </li>
      </ol>
    </nav>
  )
}
