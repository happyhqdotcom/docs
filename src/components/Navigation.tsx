'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { type NavTree } from '@/lib/source'

export function Navigation({
  navigation,
  className,
  onLinkClick,
}: {
  navigation: NavTree
  className?: string
  onLinkClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  let pathname = usePathname()

  return (
    <nav className={clsx('text-base lg:text-sm', className)}>
      <ul role="list" className="space-y-9">
        {navigation.map((section) => (
          <li key={section.title}>
            <h2 className="font-mono text-sm/6 font-medium tracking-widest text-zinc-800 uppercase sm:text-xs/6 dark:text-zinc-400">
              {section.title}
            </h2>
            <ul
              role="list"
              className="mt-2 space-y-0.5 border-l border-zinc-400/20 lg:mt-3 lg:space-y-0.5 lg:border-zinc-400/20 dark:border-zinc-600"
            >
              {section.links.map((link) => (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    onClick={onLinkClick}
                    className={clsx(
                      'block w-full pl-3.5 before:pointer-events-none before:absolute before:top-1/2 before:-left-px before:h-full before:w-px before:-translate-y-1/2',
                      link.href === pathname
                        ? 'font-bold text-[#EF436D] before:bg-[#EF436D] dark:text-[#F95F7C] dark:before:bg-[#F95F7C]'
                        : 'font-semibold text-zinc-600 before:hidden before:bg-slate-300 hover:text-zinc-800 hover:before:block dark:text-zinc-300 dark:before:bg-slate-700 dark:hover:text-zinc-100 dark:hover:before:bg-[#F95F7C]',
                    )}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}
