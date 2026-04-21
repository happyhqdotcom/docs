'use client'

import { Hero } from '@/components/Hero'
import { Navigation } from '@/components/Navigation'
import { type Surface } from '@/lib/frontmatter-schemas'
import { type NavTree } from '@/lib/source'
import { usePathname } from 'next/navigation'
import { Header } from './Header'

export interface SurfaceInfo {
  key: Surface
  label: string
  href: string
  hasSidebar: boolean
}

function resolveSurface(
  pathname: string,
  surfaces: SurfaceInfo[],
): SurfaceInfo {
  const first = pathname.split('/').filter(Boolean)[0]
  return surfaces.find((s) => s.key === first) ?? surfaces[0]
}

export function Layout({
  children,
  navigations,
  surfaces,
}: {
  children: React.ReactNode
  navigations: Record<Surface, NavTree>
  surfaces: SurfaceInfo[]
}) {
  let pathname = usePathname()
  let isHomePage = pathname === '/'
  const surface = resolveSurface(pathname, surfaces)
  const navigation = navigations[surface.key]

  return (
    <div className="flex w-full flex-col">
      <Header navigation={navigation} />

      {isHomePage && false && <Hero />}

      <div className="max-w-9xl relative mx-auto flex w-full flex-auto justify-center px-0 lg:px-6">
        {surface.hasSidebar && (
          <div className="hidden lg:relative lg:block lg:flex-none">
            <div className="absolute top-0 right-0 bottom-0 block w-px bg-zinc-400/20 dark:bg-zinc-800" />
            <div className="sticky top-19 -ml-0.5 h-[calc(100vh-4.75rem)] w-64 overflow-x-hidden overflow-y-auto py-6 pr-8 pl-0.5 xl:w-72 xl:pr-16">
              <Navigation navigation={navigation} />
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
