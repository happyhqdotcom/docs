'use client'

import {
  Tab as HeadlessTab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'

import { CopyButton } from '@/components/CopyButton'

type Tab = { label: string; code: string; html: string }

export function CodeTabsClient({ tabs }: { tabs: Tab[] }) {
  let [selected, setSelected] = useState(0)
  let active = tabs[selected]

  return (
    <div className="not-prose scheme-dark group/code-block rounded-xl bg-zinc-950">
      <div className="inset-ring inset-ring-white/10 rounded-xl bg-white/5 p-1 text-sm">
        <TabGroup selectedIndex={selected} onChange={setSelected}>
          <div className="flex h-8 items-center pl-1 pr-1">
            <TabList className="flex items-center gap-x-0.5">
              {tabs.map((tab, i) => (
                <HeadlessTab
                  key={i}
                  className={clsx(
                    'cursor-pointer rounded-md px-2 py-1 font-mono text-xs transition-colors focus:outline-none',
                    'text-white/45 hover:text-white/80',
                    'data-selected:bg-white/10 data-selected:text-white',
                  )}
                >
                  {tab.label}
                </HeadlessTab>
              ))}
            </TabList>
            <div className="ml-auto">
              <CopyButton code={active.code} />
            </div>
          </div>
          <TabPanels>
            {tabs.map((tab, i) => (
              <TabPanel key={i} className="focus:outline-none">
                <div
                  className="fence-inner"
                  dangerouslySetInnerHTML={{ __html: tab.html }}
                />
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}
