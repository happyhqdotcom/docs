import clsx from 'clsx'
import Link from 'next/link'

export function Cards({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">{children}</div>
  )
}

export function Card({
  title,
  description,
  href,
  icon,
  children,
}: {
  title: string
  description?: string
  href?: string
  icon?: string
  children?: React.ReactNode
}) {
  let hasExternalHref = href?.startsWith('http')
  let Tag: React.ElementType = href ? (hasExternalHref ? 'a' : Link) : 'div'
  let linkProps = href
    ? hasExternalHref
      ? { href, target: '_blank', rel: 'noopener noreferrer' }
      : { href }
    : {}

  return (
    <Tag
      {...linkProps}
      className={clsx(
        'group block rounded-xl border p-5 transition-colors',
        'border-zinc-200 bg-white/50',
        'dark:border-zinc-800 dark:bg-zinc-900/40',
        href &&
          'hover:border-[#EF436D]/50 hover:bg-white dark:hover:border-[#F95F7C]/40 dark:hover:bg-zinc-900',
      )}
    >
      <div className="mb-1 flex items-center gap-x-2">
        {icon && (
          <span
            aria-hidden
            className="text-sm text-zinc-500 dark:text-zinc-400"
          >
            {icon}
          </span>
        )}
        <span className="font-heading text-base font-semibold text-zinc-900 dark:text-white">
          {title}
        </span>
        {href && (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
            className="ml-auto h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#EF436D] dark:text-zinc-500 dark:group-hover:text-[#F95F7C]"
          >
            <path
              fillRule="evenodd"
              d="M7.22 5.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L10.94 10 7.22 6.28a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      {description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
      {children && (
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {children}
        </div>
      )}
    </Tag>
  )
}
