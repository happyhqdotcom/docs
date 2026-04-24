'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type CopyState = 'idle' | 'copying' | 'copied' | 'error'

function mdUrl(pathname: string) {
  return `${pathname}.md`
}

function aiPromptUrl(base: 'chatgpt' | 'claude', pathname: string) {
  let origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://happyhq.com'
  let absoluteMd = `${origin}${mdUrl(pathname)}`
  let prompt = `Read ${absoluteMd} so I can ask questions about it.`
  let q = encodeURIComponent(prompt)
  return base === 'chatgpt'
    ? `https://chatgpt.com/?hints=search&q=${q}`
    : `https://claude.ai/new?q=${q}`
}

function ClipboardIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1Zm2-.5a.5.5 0 0 0-.5.5v.5h3V3a.5.5 0 0 0-.5-.5H7Z"
      />
    </svg>
  )
}

function CheckIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.354 4.354a.5.5 0 0 0-.708-.708L6 10.293 3.354 7.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7Z"
      />
    </svg>
  )
}

function AlertIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 4.25a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5ZM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      />
    </svg>
  )
}

function ExternalIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V3.707l-5.146 5.147a.5.5 0 0 1-.708-.708L12.293 3H9.5a.5.5 0 0 1-.5-.5ZM3 5.5A1.5 1.5 0 0 1 4.5 4H7a.5.5 0 0 1 0 1H4.5a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V10a.5.5 0 0 1 1 0v2.5A1.5 1.5 0 0 1 11.5 14h-7A1.5 1.5 0 0 1 3 12.5v-7Z"
      />
    </svg>
  )
}

function ChevronDownIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.646 6.146a.5.5 0 0 1 .708 0L8 9.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708Z"
      />
    </svg>
  )
}

function ChatGPTIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.354-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.82-2.782a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z" />
    </svg>
  )
}

function ClaudeIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
    </svg>
  )
}

function MenuRowButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <MenuItem>
      {({ focus }) => (
        <button
          type="button"
          onClick={onClick}
          className={clsx(
            'flex w-full cursor-pointer items-center rounded-[0.625rem] p-1 text-left select-none',
            focus
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900/40 dark:text-white'
              : 'text-zinc-700 dark:text-zinc-400',
          )}
        >
          {children}
        </button>
      )}
    </MenuItem>
  )
}

function MenuRowLink({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  return (
    <MenuItem>
      {({ focus }) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={clsx(
            'flex w-full cursor-pointer items-center rounded-[0.625rem] p-1 select-none',
            focus
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900/40 dark:text-white'
              : 'text-zinc-700 dark:text-zinc-400',
          )}
        >
          {children}
        </a>
      )}
    </MenuItem>
  )
}

function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-white p-1 ring-1 ring-zinc-900/5 dark:bg-zinc-700 dark:ring-white/5 dark:ring-inset">
      {children}
    </div>
  )
}

export function MarkdownMenu() {
  let pathname = usePathname()
  let [copyState, setCopyState] = useState<CopyState>('idle')

  let onCopy = async () => {
    if (copyState === 'copying') return
    setCopyState('copying')
    // Hold the spinner long enough to register visually even when the fetch
    // resolves in a few milliseconds.
    let minDelay = new Promise((r) => setTimeout(r, 300))
    // Safari drops the user-gesture permission for clipboard writes across
    // an `await`, so fetch-then-writeText fails with NotAllowedError. Wrap
    // the fetch in a Promise<Blob> and hand it to `ClipboardItem` instead —
    // Safari accepts the write immediately and resolves the content later.
    try {
      let type = 'text/plain'
      let blob = fetch(mdUrl(pathname)).then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return new Blob([await res.text()], { type })
      })
      await navigator.clipboard.write([new ClipboardItem({ [type]: blob })])
      await minDelay
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      await minDelay
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 2200)
    }
  }

  let openAI = (base: 'chatgpt' | 'claude') => {
    window.open(aiPromptUrl(base, pathname), '_blank', 'noopener,noreferrer')
  }

  let StatusIcon =
    copyState === 'copied'
      ? CheckIcon
      : copyState === 'error'
        ? AlertIcon
        : ClipboardIcon

  let label = 'Copy Markdown'

  let splitShell =
    'inline-flex items-stretch rounded-lg border text-xs font-medium transition-colors ' +
    'border-zinc-300/60 bg-white/50 text-zinc-600 ' +
    'dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:text-zinc-300'

  let primaryPart =
    'flex cursor-pointer items-center gap-x-1.5 rounded-l-lg px-2.5 py-1 ' +
    'hover:bg-white hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'

  let chevronPart =
    'flex cursor-pointer items-center rounded-r-lg border-l border-zinc-300/60 px-1.5 ' +
    'hover:bg-white hover:text-zinc-900 data-open:bg-white dark:border-zinc-700/60 ' +
    'dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:data-open:bg-zinc-900'

  return (
    <div className={splitShell}>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy page as Markdown"
        className={primaryPart}
      >
        {copyState === 'copying' ? (
          <span
            aria-hidden
            className="size-3.5 animate-spin rounded-full border-2 border-current/20 border-t-current/70"
          />
        ) : (
          <StatusIcon
            className={clsx(
              'h-3.5 w-3.5 fill-current',
              copyState === 'copied' && 'text-emerald-600 dark:text-emerald-400',
              copyState === 'error' && 'text-red-600 dark:text-red-400',
            )}
          />
        )}
        <span>{label}</span>
      </button>
      <Menu as="div" className="relative flex">
        <MenuButton className={chevronPart} aria-label="More markdown actions">
          <ChevronDownIcon className="h-3 w-3 fill-current opacity-60" />
        </MenuButton>
        <MenuItems
          transition
          anchor={{ to: 'bottom end', gap: 8, padding: 8 }}
          className={clsx(
            'z-10 w-60 origin-top-right space-y-1 rounded-xl bg-white p-1 text-sm font-medium shadow-md ring-1 shadow-black/5 ring-black/5',
            'dark:bg-zinc-800 dark:ring-white/5',
            'transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0',
            'focus:outline-none',
          )}
        >
          <MenuRowLink href={mdUrl(pathname)}>
            <RowIcon>
              <ExternalIcon className="h-4 w-4 fill-zinc-400" />
            </RowIcon>
            <div className="ml-3">
              <div>Open as Markdown</div>
              <div className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                View the raw .md source
              </div>
            </div>
          </MenuRowLink>
          <MenuRowButton onClick={() => openAI('chatgpt')}>
            <RowIcon>
              <ChatGPTIcon className="h-4 w-4 fill-zinc-600 dark:fill-zinc-300" />
            </RowIcon>
            <div className="ml-3">
              <div>Open in ChatGPT</div>
              <div className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                Ask about this page
              </div>
            </div>
          </MenuRowButton>
          <MenuRowButton onClick={() => openAI('claude')}>
            <RowIcon>
              <ClaudeIcon className="h-4 w-4 fill-zinc-600 dark:fill-zinc-300" />
            </RowIcon>
            <div className="ml-3">
              <div>Open in Claude</div>
              <div className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                Ask about this page
              </div>
            </div>
          </MenuRowButton>
        </MenuItems>
      </Menu>
    </div>
  )
}
