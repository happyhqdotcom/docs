'use client'

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

// One row per shortcut; `keys` is split visually with "+" between chunks.
const SHORTCUTS: Array<{ group: string; items: Array<{ keys: string[]; label: string }> }> = [
  {
    group: 'General',
    items: [
      { keys: ['?'], label: 'Show this help' },
      { keys: ['Esc'], label: 'Close this dialog or popover' },
    ],
  },
  {
    group: 'Search',
    items: [
      { keys: ['⌘', 'K'], label: 'Open search (⌃ K on Windows/Linux)' },
    ],
  },
  {
    group: 'Navigation',
    items: [
      { keys: ['Enter'], label: 'Follow a focused link' },
      { keys: ['Tab'], label: 'Move to the next interactive element' },
      { keys: ['Shift', 'Tab'], label: 'Move to the previous element' },
    ],
  },
]

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  let tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

export function KeyboardShortcuts() {
  let [open, setOpen] = useState(false)

  useEffect(() => {
    let onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '?') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      e.preventDefault()
      setOpen((v) => !v)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className={clsx(
            'w-full max-w-md origin-center rounded-xl border shadow-xl transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0',
            'border-zinc-200 bg-white text-zinc-900',
            'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100',
          )}
        >
          <div className="border-b border-zinc-200 px-5 py-3 text-sm font-semibold dark:border-zinc-800">
            Keyboard shortcuts
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            {SHORTCUTS.map((group) => (
              <div key={group.group} className="mb-4 last:mb-0">
                <div className="mb-2 font-mono text-[0.6875rem] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                  {group.group}
                </div>
                <ul className="space-y-1.5">
                  {group.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-x-4 text-sm"
                    >
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {item.label}
                      </span>
                      <span className="flex shrink-0 items-center gap-x-1">
                        {item.keys.map((k, ki) => (
                          <span
                            key={ki}
                            className={clsx(
                              'inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border px-1.5 font-mono text-[0.7rem]',
                              'border-zinc-200 bg-zinc-50 text-zinc-700',
                              'dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
                            )}
                          >
                            {k}
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="rounded-b-xl border-t border-zinc-200 bg-zinc-50 px-5 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            Press <kbd className="font-mono">?</kbd> anytime to toggle this dialog.
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
