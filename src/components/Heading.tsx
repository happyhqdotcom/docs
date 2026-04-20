'use client'

import clsx from 'clsx'
import { useRef, useState } from 'react'

import { ghostIconButton } from '@/lib/button-styles'

function CheckMark() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="h-3 w-3">
      <path
        fillRule="evenodd"
        d="M16.704 5.29a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.97 2.97 6.97-6.97a.75.75 0 011.06 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="h-3 w-3">
      <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
      <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
    </svg>
  )
}

// Three-state dance so the green ✓ stays pinned while the anchor fades out,
// instead of swapping back to the link icon mid-fade. Order: idle → copied →
// fading → idle. During `fading`, opacity transitions 100→0 with the ✓ still
// shown; icon swaps back to the link only after the fade completes, by which
// time the anchor is fully invisible.
type CopyState = 'idle' | 'copied' | 'fading'

const HOLD_MS = 1200
const FADE_MS = 220

export function Heading({
  level,
  id,
  children,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6
  id?: string
  children: React.ReactNode
}) {
  let Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  let [state, setState] = useState<CopyState>('idle')
  let timers = useRef<Array<ReturnType<typeof setTimeout>>>([])

  let clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  let onCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!id) return
    clearTimers()
    let url = `${window.location.origin}${window.location.pathname}#${id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {}
    history.replaceState(null, '', `#${id}`)
    setState('copied')
    timers.current.push(setTimeout(() => setState('fading'), HOLD_MS))
    timers.current.push(setTimeout(() => setState('idle'), HOLD_MS + FADE_MS))
  }

  let showingCheck = state !== 'idle'
  let pinnedVisible = state === 'copied'

  return (
    <Tag id={id} className="group/heading flex scroll-mt-28 items-center">
      <span>{children}</span>
      {id && (
        <a
          href={`#${id}`}
          onClick={onCopy}
          aria-label={state === 'copied' ? 'Link copied' : 'Copy link to section'}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          className={clsx(
            ghostIconButton,
            'ml-2 h-6 w-6 transition-opacity',
            // Kill prose's link underline/shadow/amber color on this anchor
            'no-underline! shadow-none!',
            pinnedVisible
              ? 'opacity-100'
              : 'opacity-0 focus-visible:opacity-100 group-hover/heading:opacity-100',
            showingCheck &&
              'text-emerald-600! dark:text-emerald-400!',
          )}
        >
          {showingCheck ? <CheckMark /> : <LinkIcon />}
        </a>
      )}
    </Tag>
  )
}
