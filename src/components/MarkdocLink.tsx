'use client'

import Link from 'next/link'
import { createContext, useContext } from 'react'

// Base path is the URL of the directory containing the current page's source
// file. Populated per-page by the server layout so relative links can resolve
// correctly regardless of whether the current URL is a leaf or an index page.
const BasePathContext = createContext<string>('/')

export function BasePathProvider({
  basePath,
  children,
}: {
  basePath: string
  children: React.ReactNode
}) {
  return (
    <BasePathContext.Provider value={basePath}>
      {children}
    </BasePathContext.Provider>
  )
}

function isExternal(href: string): boolean {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(href) || // http://, https://, mailto:, etc.
    href.startsWith('//')
  )
}

function isAnchor(href: string): boolean {
  return href.startsWith('#')
}

function resolveRelative(href: string, base: string): string {
  if (isExternal(href) || isAnchor(href)) return href
  if (href.startsWith('/')) return href

  const [pathPart, hash] = href.split('#')
  // Strip .md / .mdx so `[x](./foo.md)` works too.
  const target = pathPart.replace(/\.(md|mdx)$/, '')

  const baseParts = base.split('/').filter(Boolean)
  for (const part of target.split('/')) {
    if (part === '..') baseParts.pop()
    else if (part !== '.' && part !== '') baseParts.push(part)
  }
  const resolved = '/' + baseParts.join('/')
  return hash ? `${resolved}#${hash}` : resolved
}

export function MarkdocLink({
  href = '',
  children,
  ...props
}: React.ComponentProps<'a'> & { href?: string }) {
  const base = useContext(BasePathContext)
  const resolved = resolveRelative(href, base)

  if (isExternal(resolved)) {
    return (
      <a href={resolved} {...props}>
        {children}
      </a>
    )
  }
  return (
    <Link href={resolved} {...props}>
      {children}
    </Link>
  )
}
