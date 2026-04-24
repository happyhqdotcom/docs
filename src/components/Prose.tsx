import clsx from 'clsx'

export function Prose<T extends React.ElementType = 'div'>({
  as,
  className,
  ...props
}: React.ComponentPropsWithoutRef<T> & {
  as?: T
}) {
  let Component = as ?? 'div'

  return (
    <Component
      className={clsx(
        className,
        'prose prose-zinc dark:prose-invert max-w-none dark:text-zinc-400',
        // headings
        'prose-headings:scroll-mt-36 prose-headings:font-display prose-headings:font-bold prose-h1:font-heading prose-h1:font-extrabold lg:prose-headings:scroll-mt-34',
        // lead
        'prose-lead:text-zinc-500 dark:prose-lead:text-zinc-400',
        // links
        'prose-a:font-semibold prose-a:text-[#D452DB] dark:prose-a:text-[#EEB5F0]',
        // link underline
        'prose-a:no-underline prose-a:shadow-[inset_0_-2px_0_0_var(--tw-prose-background,#fff),inset_0_calc(-1*(var(--tw-prose-underline-size,4px)+2px))_0_0_var(--tw-prose-underline,#D452DB)] prose-a:hover:[--tw-prose-underline-size:6px] dark:prose-a:shadow-[inset_0_calc(-1*var(--tw-prose-underline-size,2px))_0_0_var(--tw-prose-underline,#EEB5F0)] dark:prose-a:hover:[--tw-prose-underline-size:6px] dark:[--tw-prose-background:var(--color-slate-900)]',
        // pre — background/shadow are controlled by shiki.css
        'prose-pre:rounded-xl prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none',
        // hr
        'dark:prose-hr:border-zinc-800',
      )}
      {...props}
    />
  )
}
