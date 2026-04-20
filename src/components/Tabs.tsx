'use client'

import {
  Tab as HeadlessTab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react'
import clsx from 'clsx'
import { Children, isValidElement, type ReactElement } from 'react'

type TabProps = { label: string; children?: React.ReactNode }

// Tab is a shape carrier — Tabs reads its `label` prop and renders its
// children inside a panel. Rendering `children` directly is a safeguard
// for the case where a <Tab> escapes outside a <Tabs>.
export function Tab({ children }: TabProps) {
  return <>{children}</>
}

export function Tabs({ children }: { children: React.ReactNode }) {
  let tabs = Children.toArray(children).filter(
    (c): c is ReactElement<TabProps> => isValidElement(c),
  )

  if (tabs.length === 0) return null

  return (
    <TabGroup>
      <TabList className="flex gap-x-1 border-b border-zinc-400/30 dark:border-zinc-700/60">
        {tabs.map((tab, i) => (
          <HeadlessTab
            key={i}
            className={clsx(
              'relative -mb-px cursor-pointer border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors focus:outline-none',
              'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
              'data-selected:border-[#EF436D] data-selected:text-[#EF436D] dark:data-selected:border-[#F95F7C] dark:data-selected:text-[#F95F7C]',
            )}
          >
            {tab.props.label}
          </HeadlessTab>
        ))}
      </TabList>
      <TabPanels className="mt-4">
        {tabs.map((tab, i) => (
          <TabPanel key={i} className="focus:outline-none">
            {tab.props.children}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  )
}
