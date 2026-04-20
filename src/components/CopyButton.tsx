'use client'

import clsx from 'clsx'
import { useState } from 'react'

function ClipboardIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 16 16"
      strokeWidth="1"
      fill="none"
      stroke="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M5.5 2.5V2.5C5.5 3.05228 5.94772 3.5 6.5 3.5H9.5C10.0523 3.5 10.5 3.05228 10.5 2.5V2.5M5.5 2.5V2.5C5.5 1.94772 5.94772 1.5 6.5 1.5H9.5C10.0523 1.5 10.5 1.94772 10.5 2.5V2.5M5.5 2.5H4.5C3.39543 2.5 2.5 3.39543 2.5 4.5V12.5C2.5 13.6046 3.39543 14.5 4.5 14.5H11.5C12.6046 14.5 13.5 13.6046 13.5 12.5V4.5C13.5 3.39543 12.6046 2.5 11.5 2.5H10.5" />
    </svg>
  )
}

function CheckIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 16 16"
      strokeWidth="1"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3.5 8.5L7.5 12.5L12.5 3.5" />
    </svg>
  )
}

// Stacked icons cross-fade via opacity so the swap is never a flash.
export function CopyButton({ code }: { code: string }) {
  let [copied, setCopied] = useState(false)

  let onClick = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'Copied' : 'Copy code'}
      title="Copy to clipboard"
      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/50 transition-colors duration-150 hover:bg-white/5 hover:text-white/80"
    >
      <div className="grid size-4">
        <CheckIcon
          className={clsx(
            'col-start-1 row-start-1 text-emerald-400 transition-opacity duration-300 ease-in-out',
            copied ? 'opacity-100' : 'opacity-0',
          )}
        />
        <ClipboardIcon
          className={clsx(
            'col-start-1 row-start-1 transition-opacity duration-300 ease-in-out',
            copied ? 'opacity-0' : 'opacity-100',
          )}
        />
      </div>
    </button>
  )
}
