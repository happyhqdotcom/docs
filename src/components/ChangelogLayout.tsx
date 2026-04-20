import { Prose } from '@/components/Prose'
import { type ChangelogFrontmatter } from '@/lib/frontmatter-schemas'

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ChangelogLayout({
  children,
  frontmatter,
}: {
  children: React.ReactNode
  frontmatter: ChangelogFrontmatter
}) {
  return (
    <div className="mx-auto max-w-3xl min-w-0 flex-auto px-5 py-11 max-[405px]:max-w-screen max-[405px]:px-4 lg:pl-8 xl:px-16">
      <article>
        <header className="mb-7 space-y-2">
          <p className="font-mono text-sm/6 font-medium tracking-widest text-zinc-800 uppercase sm:text-xs/6 dark:text-zinc-400">
            {formatDate(frontmatter.date)}
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {frontmatter.title}
          </h1>
          {frontmatter.description && (
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              {frontmatter.description}
            </p>
          )}
        </header>
        <Prose>{children}</Prose>
      </article>
    </div>
  )
}
