import clsx from 'clsx'

type Variant = 'info' | 'warning' | 'success' | 'error'

function MegaphoneIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M16 2a1 1 0 011 1v3.27a2 2 0 010 3.46V13a1 1 0 01-1.53.848L10 10.56V15a2 2 0 11-4 0v-4h-.5A2.5 2.5 0 013 8.5v-1A2.5 2.5 0 015.5 5H10V4.44l5.47-2.288A1 1 0 0116 2z" />
    </svg>
  )
}

function ExclamationIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        d="M8.485 2.495a1.75 1.75 0 013.03 0l6.28 10.875A1.75 1.75 0 0116.28 16H3.72a1.75 1.75 0 01-1.515-2.63l6.28-10.875zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 11-1.5 0v-3.5A.75.75 0 0110 6zm0 7a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CheckCircleIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function XCircleIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.293-11.707a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const VARIANTS: Record<
  Variant,
  {
    container: string
    icon: React.ComponentType<React.ComponentPropsWithoutRef<'svg'>>
    iconColor: string
  }
> = {
  info: {
    container:
      'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-100',
    icon: MegaphoneIcon,
    iconColor: 'text-sky-500 dark:text-sky-400',
  },
  warning: {
    container:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100',
    icon: ExclamationIcon,
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  success: {
    container:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100',
    icon: CheckCircleIcon,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
  },
  error: {
    container:
      'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100',
    icon: XCircleIcon,
    iconColor: 'text-red-500 dark:text-red-400',
  },
}

export function Banner({
  variant = 'info',
  title,
  children,
}: {
  variant?: Variant
  title?: string
  children: React.ReactNode
}) {
  let style = VARIANTS[variant]
  let Icon = style.icon

  return (
    <div
      className={clsx(
        'not-prose my-6 flex gap-x-3 rounded-xl border px-4 py-3 text-sm',
        style.container,
      )}
      role={variant === 'error' || variant === 'warning' ? 'alert' : undefined}
    >
      <Icon className={clsx('mt-0.5 h-5 w-5 shrink-0', style.iconColor)} />
      <div className="min-w-0 flex-1">
        {title && (
          <div className="mb-0.5 font-semibold">{title}</div>
        )}
        <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  )
}
