'use client'

import clsx from 'clsx'
import { useState } from 'react'

function MarkdownIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 16 16"
      strokeWidth="1"
      fill="none"
      stroke="currentColor"
      aria-hidden
      {...props}
    >
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
      <path
        d="M4 10V6l1.75 2.25L7.5 6v4M10.5 6v4m0 0L9 8.5M10.5 10L12 8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

export function CopyMarkdownButton({
  code,
  language,
}: {
  code: string
  language: string
}) {
  let [copied, setCopied] = useState(false)
  let lang = language || ''
  let markdown = `\`\`\`${lang}\n${code}\n\`\`\`\n`

  let onClick = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'Copied as markdown' : 'Copy as markdown'}
      title="Copy as markdown fence"
      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/50 transition-colors duration-150 hover:bg-white/5 hover:text-white/80"
    >
      <div className="grid size-4">
        <CheckIcon
          className={clsx(
            'col-start-1 row-start-1 text-emerald-400 transition-opacity duration-300 ease-in-out',
            copied ? 'opacity-100' : 'opacity-0',
          )}
        />
        <MarkdownIcon
          className={clsx(
            'col-start-1 row-start-1 transition-opacity duration-300 ease-in-out',
            copied ? 'opacity-0' : 'opacity-100',
          )}
        />
      </div>
    </button>
  )
}
