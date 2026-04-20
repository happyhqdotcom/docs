import clsx from 'clsx'

function FolderIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M3.75 3A1.75 1.75 0 002 4.75v10.5C2 16.216 2.784 17 3.75 17h12.5A1.75 1.75 0 0018 15.25V7.75A1.75 1.75 0 0016.25 6H10.5L9 4.5a1.5 1.5 0 00-1.06-.44H3.75z" />
    </svg>
  )
}

function FileIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden
      {...props}
    >
      <path d="M5 3h7l3 3v11a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M12 3v3h3" />
    </svg>
  )
}

export function Files({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-xl border border-zinc-200 bg-white/50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}

export function Folder({
  name,
  children,
}: {
  name: string
  children?: React.ReactNode
}) {
  return (
    <li>
      <div
        className={clsx(
          'flex items-center gap-x-2 rounded-md px-2 py-1',
          'text-zinc-700 dark:text-zinc-300',
        )}
      >
        <FolderIcon className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
        <span className="font-medium">{name}</span>
      </div>
      {children && (
        <ul className="ml-[0.65rem] space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
          {children}
        </ul>
      )}
    </li>
  )
}

export function File({ name }: { name: string }) {
  return (
    <li
      className={clsx(
        'flex items-center gap-x-2 rounded-md px-2 py-1',
        'text-zinc-600 dark:text-zinc-400',
      )}
    >
      <FileIcon className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
      <span>{name}</span>
    </li>
  )
}
