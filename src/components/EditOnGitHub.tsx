'use client'

import { usePathname } from 'next/navigation'

import { ghostPill } from '@/lib/button-styles'

// Set NEXT_PUBLIC_DOCS_REPO_EDIT_BASE to a github blob URL
// (e.g. https://github.com/happyhq/docs/edit/main/src/content) to enable.
// If unset, the component renders nothing.
const EDIT_BASE = process.env.NEXT_PUBLIC_DOCS_REPO_EDIT_BASE

function PencilIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
    </svg>
  )
}

function filePathForPathname(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null
  if (parts.length === 1) return `/${parts[0]}/index.md`
  return `${pathname}.md`
}

export function EditOnGitHub() {
  let pathname = usePathname()
  if (!EDIT_BASE) return null
  let filePath = filePathForPathname(pathname)
  if (!filePath) return null

  let href = `${EDIT_BASE.replace(/\/$/, '')}${filePath}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={ghostPill}
    >
      <PencilIcon className="h-3.5 w-3.5" />
      Edit this page on GitHub
    </a>
  )
}
