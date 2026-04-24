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
      <path d="M4.709 15.955l4.72-2.647.079-.23-.079-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.242-.242.98-1.299 1.644-2.053.725-.815.845-.9.544-.431h1.027l.756.1120675.1125 1.025-.134 1.06-.42.546-.35.453-.595.6799-.379.6795-.3481.437.08.437-.17.248-.15.193-.624.433-.37.2425-.38.223-.3995.223-.2825.169-.3875.2405-.3435.2165-.38.2405-.292.1855-.2755.1685-.3315.1925-.1575.088-.0365.058-.01.012.061.014.092.0375.1075.045.0735.042.052.027.031.039.01v.013l-.1515.0485-.127.027-.058.013-.027.034-.024.033-.051.04-.127.05-.248.115-.4375.1785-.4245.1755-.389.152-.2485.092-.2105.073-.2015.079-.2715.128-.3095.146-.3955.195-.2285.1145-.2115.121-.2185.152-.188.152-.1755.158-.1875.2425-.1695.255-.224.37-.1695.292-.127.31-.223.6875-.10955.401-.05485.2875-.01815.2185-.01385.139-.00685.2335.0155.304.02385.2975.0455.2475.06.246.07.238.0815.231.0895.224.0975.217.1055.2105.1135.204.121.1975.1285.1915.135.185.1415.179.148.172.1545.1655.1605.159.1675.1525.1735.147.1795.141.1855.135.1915.1285.197.122.2025.1155.208.1085.213.1005.2185.0925.2235.084.2285.0755.233.0665.2375.057.2415.0475.245.0375.2485.028.2515.02.2545.0115.2575.0045H22.5l.0165-.0625.0545-.194.105-.3615.1515-.52.193-.6545.2255-.762.247-.836.2555-.875.253-.8775.2385-.8425.211-.772.171-.6635.1185-.5205.0495-.3525-.0055-.2055-.0525-.1125-.129-.0545-.1855-.0035-.2645.041-.347.075-.4035.0985-.447.1155-.475.1255-.4785.1275-.461.124-.4235.1145-.3625.0955-.278.0695-.1705.0365-.0385.009v.066L4.709 15.955z" />
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
          <div className="my-1 border-t border-zinc-200 dark:border-zinc-700/60" />
          <MenuRowLink href="/llms.txt">
            <RowIcon>
              <ExternalIcon className="h-4 w-4 fill-zinc-400" />
            </RowIcon>
            <div className="ml-3">
              <div>llms.txt</div>
              <div className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                Site index for LLMs
              </div>
            </div>
          </MenuRowLink>
          <MenuRowLink href="/llms-full.txt">
            <RowIcon>
              <ExternalIcon className="h-4 w-4 fill-zinc-400" />
            </RowIcon>
            <div className="ml-3">
              <div>llms-full.txt</div>
              <div className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                Full docs as a single file
              </div>
            </div>
          </MenuRowLink>
        </MenuItems>
      </Menu>
    </div>
  )
}
