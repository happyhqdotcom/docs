'use client'

import { type Section } from '@/lib/sections'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

type FlatHeading = { id: string; title: string; level: 2 | 3 }

function flattenSections(sections: Section[]): FlatHeading[] {
  let flat: FlatHeading[] = []
  for (let s of sections) {
    flat.push({ id: s.id, title: s.title, level: 2 })
    for (let c of s.children) {
      flat.push({ id: c.id, title: c.title, level: 3 })
    }
  }
  return flat
}

// Range-based active tracker. Headings whose position falls inside the reading
// band are all "active", so the indicator can span several at once.
function useActiveHeadings(headings: FlatHeading[]) {
  let [active, setActive] = useState<Set<string>>(() => new Set())

  let compute = useCallback(() => {
    if (headings.length === 0) {
      setActive(new Set())
      return
    }
    let scrollY = window.scrollY
    let yTop = scrollY + 80
    let yBottom = scrollY + window.innerHeight * 0.85

    type Pos = { id: string; top: number }
    let positions: Pos[] = []
    for (let h of headings) {
      let el = document.getElementById(h.id)
      if (!el) continue
      positions.push({
        id: h.id,
        top: el.getBoundingClientRect().top + window.scrollY,
      })
    }

    let inBand = positions.filter((p) => p.top >= yTop && p.top <= yBottom)
    let nextIds: string[]
    if (inBand.length > 0) {
      nextIds = inBand.map((p) => p.id)
    } else {
      let fallback: string | undefined
      for (let i = positions.length - 1; i >= 0; i--) {
        if (positions[i].top <= yTop) {
          fallback = positions[i].id
          break
        }
      }
      nextIds = fallback ? [fallback] : positions[0] ? [positions[0].id] : []
    }

    setActive((prev) => {
      if (
        prev.size === nextIds.length &&
        nextIds.every((id) => prev.has(id))
      ) {
        return prev
      }
      return new Set(nextIds)
    })
  }, [headings])

  useEffect(() => {
    if (headings.length === 0) return

    let hash = window.location.hash.slice(1)
    if (hash && headings.some((h) => h.id === hash)) {
      setActive(new Set([hash]))
    } else {
      compute()
    }

    let frame = 0
    let onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        compute()
      })
    }
    let onResize = () => compute()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    if (document.fonts?.ready) {
      document.fonts.ready.then(compute).catch(() => {})
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [headings, compute])

  return active
}

export function MobileTableOfContents({
  tableOfContents,
}: {
  tableOfContents: Section[]
}) {
  let headings = useMemo(() => flattenSections(tableOfContents), [
    tableOfContents,
  ])
  let active = useActiveHeadings(headings)
  let primary = headings.find((h) => active.has(h.id))?.id

  return (
    <div className="sticky top-[57px] z-10 flex h-14 w-full items-center space-x-3 border-b border-zinc-400/20 bg-[oklch(0.93_0.01_80)] px-5 py-2 max-[405px]:px-4 lg:hidden dark:bg-[#0F0A14]">
      <Menu>
        <MenuButton className="group flex cursor-pointer items-center space-x-2 rounded-md border border-zinc-600/40 bg-white/30 px-3 py-1.5 text-sm font-normal text-zinc-800 transition hover:bg-white/60 data-active:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 dark:data-active:bg-zinc-800">
          <span>On this page</span>
          <ChevronRightIcon className="h-4 w-4 transition-transform duration-200 group-data-active:rotate-90" />
        </MenuButton>

        <MenuItems
          modal={false}
          className="absolute top-[48px] left-0 mt-2 w-full origin-top-left divide-y divide-zinc-400/20 border-b border-zinc-300 bg-[oklch(0.93_0.01_80)] shadow-lg transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 dark:border-zinc-600 dark:bg-zinc-800 dark:shadow-none"
        >
          {headings.map((h) => (
            <MenuItem key={h.id} as="div">
              <Link
                href={`#${h.id}`}
                className={clsx(
                  'block py-2 text-sm transition',
                  h.level === 3 ? 'pr-4 pl-8' : 'px-4',
                  active.has(h.id)
                    ? 'text-[#EF436D] dark:text-[#F95F7C]'
                    : 'text-zinc-800 dark:text-zinc-400',
                  'hover:bg-black/5 data-focus:bg-zinc-100 dark:hover:bg-black/10 dark:data-focus:bg-zinc-700',
                )}
              >
                {h.title}
              </Link>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>

      <span className="max-w-[60%] truncate text-sm font-medium text-zinc-600 dark:text-zinc-200">
        {headings.find((h) => h.id === primary)?.title || 'Section'}
      </span>
    </div>
  )
}

export function DesktopTableOfContents({
  tableOfContents,
}: {
  tableOfContents: Section[]
}) {
  let headings = useMemo(() => flattenSections(tableOfContents), [
    tableOfContents,
  ])
  let active = useActiveHeadings(headings)

  let listRef = useRef<HTMLOListElement | null>(null)
  let linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  let [indicator, setIndicator] = useState<{
    top: number
    height: number
  } | null>(null)

  // Measure the active range within the rail and position a single straight
  // bar that spans from the first active link's top to the last active link's
  // bottom. As more headings enter/leave the reading band, the bar grows or
  // shrinks — one continuous thumb, no stepping.
  useLayoutEffect(() => {
    let list = listRef.current
    if (!list) {
      setIndicator(null)
      return
    }
    let activeLinks: HTMLAnchorElement[] = []
    for (let h of headings) {
      if (active.has(h.id)) {
        let el = linkRefs.current[h.id]
        if (el) activeLinks.push(el)
      }
    }
    if (activeLinks.length === 0) {
      setIndicator(null)
      return
    }

    let measure = () => {
      let listBox = list.getBoundingClientRect()
      let firstBox = activeLinks[0].getBoundingClientRect()
      let lastBox = activeLinks[activeLinks.length - 1].getBoundingClientRect()
      setIndicator({
        top: firstBox.top - listBox.top,
        height: lastBox.bottom - firstBox.top,
      })
    }

    measure()
    let ro = new ResizeObserver(measure)
    ro.observe(list)
    activeLinks.forEach((el) => ro.observe(el))
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [active, headings])

  if (tableOfContents.length === 0) return null

  return (
    <div className="hidden lg:relative lg:-mr-6 lg:block lg:h-full lg:flex-none">
      <div className="absolute top-0 bottom-0 w-full border-l border-zinc-400/20 dark:border-zinc-800" />
      <div className="lg:sticky lg:top-19 lg:h-[calc(100vh-4.75rem)] lg:overflow-y-auto lg:px-4 lg:py-6">
        <nav aria-labelledby="on-this-page-title" className="w-64 pl-4">
          <h2
            id="on-this-page-title"
            className="font-mono text-sm font-medium tracking-widest text-zinc-800 uppercase sm:text-xs dark:text-zinc-400"
          >
            On this page
          </h2>

          <div className="relative mt-4">
            {/* Neutral rail */}
            <div
              aria-hidden
              className="absolute top-0 bottom-0 left-0 w-px bg-zinc-400/20 dark:bg-zinc-700/60"
            />
            {/* Single straight accent that spans the active range */}
            {indicator && (
              <div
                aria-hidden
                className="absolute left-0 w-px bg-[#EF436D] transition-[transform,height] duration-300 ease-out motion-reduce:transition-none dark:bg-[#F95F7C]"
                style={{
                  transform: `translateY(${indicator.top}px)`,
                  height: `${indicator.height}px`,
                }}
              />
            )}

            <ol ref={listRef} className="space-y-3 pl-4 text-sm">
              {tableOfContents.map((section) => (
                <TocItem
                  key={section.id}
                  section={section}
                  active={active}
                  registerRef={(id, el) => {
                    linkRefs.current[id] = el
                  }}
                />
              ))}
            </ol>
          </div>
        </nav>
      </div>
    </div>
  )
}

function TocItem({
  section,
  active,
  registerRef,
}: {
  section: Section
  active: Set<string>
  registerRef: (id: string, el: HTMLAnchorElement | null) => void
}) {
  return (
    <li>
      <TocLink
        id={section.id}
        title={section.title}
        active={active.has(section.id)}
        registerRef={registerRef}
      />
      {section.children.length > 0 && (
        <ol className="mt-2 ml-4 space-y-2">
          {section.children.map((child) => (
            <li key={child.id}>
              <TocLink
                id={child.id}
                title={child.title}
                active={active.has(child.id)}
                registerRef={registerRef}
                nested
              />
            </li>
          ))}
        </ol>
      )}
    </li>
  )
}

function TocLink({
  id,
  title,
  active,
  registerRef,
  nested = false,
}: {
  id: string
  title: string
  active: boolean
  registerRef: (id: string, el: HTMLAnchorElement | null) => void
  nested?: boolean
}) {
  return (
    <Link
      ref={(el) => registerRef(id, el)}
      href={`#${id}`}
      className={clsx(
        'block leading-6 transition-colors',
        nested && 'text-[0.8125rem]',
        active
          ? 'text-[#EF436D] dark:text-[#F95F7C]'
          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300',
      )}
    >
      {title}
    </Link>
  )
}
