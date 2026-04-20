import clsx from 'clsx'
import Link from 'next/link'

export function Button({
  className,
  arrow,
  children,
  ...props
}: { arrow?: boolean } & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | ({ href?: undefined } & React.ComponentPropsWithoutRef<'button'>)
)) {
  const isDisabled = 'disabled' in props && props.disabled

  className = clsx(
    className,
    'group relative isolate flex-none rounded-md bg-zinc-950/90 py-1.5 text-[0.8125rem]/6 font-semibold text-white dark:bg-zinc-100/10 dark:text-zinc-300',
    arrow ? 'pr-[calc(9/16*1rem)] pl-2.5' : 'px-2.5',
    isDisabled
      ? 'cursor-not-allowed bg-black opacity-50 hover:bg-black dark:bg-transparent dark:hover:bg-zinc-100/5'
      : 'hover:cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-100/5',
  )

  return typeof props.href === 'undefined' ? (
    <button className={className} {...props}>
      {children}
    </button>
  ) : (
    <Link className={className} {...props}>
      {children}
    </Link>
  )
}
