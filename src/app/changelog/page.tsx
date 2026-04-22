import type { Metadata } from 'next'
import Link from 'next/link'

import { getPages } from '@/lib/source'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Recent changes and releases across HappyHQ.',
  openGraph: {
    title: 'Changelog',
    description: 'Recent changes and releases across HappyHQ.',
    type: 'website',
    images: [{ url: '/og/changelog', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog',
    description: 'Recent changes and releases across HappyHQ.',
    images: ['/og/changelog'],
  },
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ChangelogIndex() {
  const entries = getPages('changelog').sort((a, b) =>
    b.frontmatter.date.localeCompare(a.frontmatter.date),
  )

  return (
    <div className="mx-auto max-w-3xl min-w-0 flex-auto px-5 py-11 max-[405px]:max-w-screen max-[405px]:px-4 lg:pl-8 xl:px-16">
      <header className="mb-10 space-y-2">
        <p className="font-mono text-sm/6 font-medium tracking-widest text-zinc-800 uppercase sm:text-xs/6 dark:text-zinc-400">
          Changelog
        </p>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          What&rsquo;s new in HappyHQ
        </h1>
      </header>

      {entries.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          No entries yet.
        </p>
      ) : (
        <ol className="divide-y divide-zinc-400/20 dark:divide-zinc-800">
          {entries.map((entry) => (
            <li key={entry.url} className="py-8 first:pt-0 last:pb-0">
              <p className="font-mono text-xs tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                {formatDate(entry.frontmatter.date)}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                <Link
                  href={entry.url}
                  className="hover:text-[#EF436D] dark:hover:text-[#F95F7C]"
                >
                  {entry.frontmatter.title}
                </Link>
              </h2>
              {entry.frontmatter.description && (
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {entry.frontmatter.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
