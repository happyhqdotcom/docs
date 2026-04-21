'use client'

import { ActionButton } from '@/components/ActionButton'
import { Logo } from '@/components/Logo'
import { MobileNavigation } from '@/components/MobileNavigation'
import { Search } from '@/components/Search'
import { ThemeSelector } from '@/components/ThemeSelector'
import { type NavTree } from '@/lib/source'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function Header({
  insideDialog = false,
  navigation,
}: {
  insideDialog?: boolean
  navigation: NavTree
}) {
  let [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-400/20 bg-[oklch(0.93_0.01_80)] transition duration-500 dark:bg-[#0F0A14]">
      <div className="max-w-9xl mx-auto flex h-14 w-full items-center justify-between px-4 lg:justify-center">
        {/* Left Sidebar - Logo */}
        <div className="lg:flex lg:flex-none lg:items-center">
          <div className="w-48 lg:w-64 xl:w-72">
            <Link
              href="https://happyhq.com"
              aria-label="Back to HappyHQ homepage"
              className="flex items-center"
            >
              <Logo className="h-8 w-auto" />
            </Link>
          </div>
        </div>

        {/* Main Content - Search (Centered on lg+) */}
        <div className="hidden flex-auto items-center justify-center px-6 lg:flex">
          <Search navigation={navigation} />
        </div>

        {/* Right Rail - Links */}
        <div className="xl:flex xl:flex-none xl:items-center">
          <div className="flex w-40 items-center justify-end gap-4 px-2 lg:w-64 xl:w-72">
            {/* Mobile Search (Hidden on lg+) */}
            <div className="lg:hidden">
              <Search navigation={navigation} />
            </div>
            <ThemeSelector className="relative z-10" />
            <ActionButton />
            <MobileNavigation
              insideDialog={insideDialog}
              navigation={navigation}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
