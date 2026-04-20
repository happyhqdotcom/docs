import clsx from 'clsx'

import { CopyButton } from '@/components/CopyButton'
import { CopyMarkdownButton } from '@/components/CopyMarkdownButton'
import { highlight } from '@/lib/highlight'

export async function Fence({
  children,
  language,
  title,
  lineNumbers = false,
  twoslash = false,
}: {
  children: string
  language: string
  title?: string
  lineNumbers?: boolean
  twoslash?: boolean
}) {
  let code = children.trimEnd()
  let html = await highlight(code, language, { twoslash })

  return (
    <div className="not-prose scheme-dark group/code-block rounded-xl bg-zinc-950">
      <div className="inset-ring inset-ring-white/10 rounded-xl bg-white/5 p-1 text-sm">
        <div className="flex h-8 items-center justify-between gap-x-2 pl-3 pr-1">
          <span className="min-w-0 truncate text-xs text-white/50">
            {title ?? '\u00A0'}
          </span>
          <div className="flex shrink-0 items-center">
            <CopyMarkdownButton code={code} language={language} />
            <CopyButton code={code} />
          </div>
        </div>
        <div
          className={clsx('fence-inner', lineNumbers && 'line-numbers')}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
