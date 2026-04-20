'use client'

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

export function Accordions({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {children}
    </div>
  )
}

export function Accordion({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <DisclosureButton
            className={clsx(
              'group flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm font-medium',
              'text-zinc-800 transition-colors hover:bg-zinc-50 focus:outline-none',
              'dark:text-zinc-200 dark:hover:bg-zinc-900/40',
            )}
          >
            <span>{title}</span>
            <ChevronRightIcon
              className={clsx(
                'h-4 w-4 text-zinc-500 transition-transform duration-150 dark:text-zinc-400',
                open && 'rotate-90',
              )}
            />
          </DisclosureButton>
          <DisclosurePanel
            transition
            className={clsx(
              'prose prose-zinc dark:prose-invert max-w-none px-4 pb-4 text-sm dark:text-zinc-400',
              'origin-top transition duration-150 ease-out data-closed:-translate-y-1 data-closed:opacity-0',
            )}
          >
            {children}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}
