'use client'

import { Header } from '@/components/Header'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars2Icon, XMarkIcon } from '@heroicons/react/20/solid'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { Button } from './Button'

import { Navigation } from '@/components/Navigation'
import { type NavTree } from '@/lib/source'

function CloseOnNavigation({ close }: { close: () => void }) {
  let pathname = usePathname()
  let searchParams = useSearchParams()

  useEffect(() => {
    close()
  }, [pathname, searchParams, close])

  return null
}

export function MobileNavigation({
  insideDialog = false,
  isOnWaitlist,
  hasClerkSession,
  knownUser,
  navigation,
}: {
  insideDialog?: boolean
  isOnWaitlist: boolean
  hasClerkSession: boolean
  knownUser: boolean
  navigation: NavTree
}) {
  let [isOpen, setIsOpen] = useState(false)
  let close = useCallback(() => setIsOpen(false), [setIsOpen])

  function onLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
    let link = event.currentTarget
    if (
      link.pathname + link.search + link.hash ===
      window.location.pathname + window.location.search + window.location.hash
    ) {
      close()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={insideDialog ? close : () => setIsOpen(true)}
        className="group relative -m-2 cursor-pointer rounded-md p-2 hover:bg-zinc-400/20 lg:hidden dark:hover:bg-zinc-400/10"
        aria-label={insideDialog ? 'Close navigation' : 'Open navigation'}
      >
        {insideDialog ? (
          <XMarkIcon className="h-4 w-4 fill-zinc-600/40 stroke-zinc-600/40 group-hover:fill-zinc-500 group-hover:stroke-zinc-500 before:absolute before:-inset-3 before:bg-transparent before:content-[''] dark:fill-zinc-400 dark:group-hover:fill-zinc-300 dark:group-hover:stroke-zinc-300" />
        ) : (
          <Bars2Icon className="h-4 w-4 fill-zinc-600/40 stroke-zinc-600/40 group-hover:fill-zinc-500 group-hover:stroke-zinc-500 before:absolute before:-inset-3 before:bg-transparent before:content-[''] dark:fill-zinc-400 dark:group-hover:fill-zinc-300 dark:group-hover:stroke-zinc-300" />
        )}
      </button>

      <Suspense fallback={null}>
        <CloseOnNavigation close={close} />
      </Suspense>

      <Dialog
        open={isOpen}
        onClose={() => close()}
        className="fixed inset-0 z-50 flex items-start lg:hidden"
        aria-label="Navigation"
      >
        <div className="relative h-full w-full overflow-y-auto bg-[oklch(0.93_0.01_80)] dark:bg-[#0F0A14]">
          <Header
            insideDialog={insideDialog}
            isOnWaitlist={isOnWaitlist}
            hasClerkSession={hasClerkSession}
            knownUser={knownUser}
            navigation={navigation}
          />

          <DialogPanel className="min-h-full overflow-y-auto px-4 pt-5 pb-12 sm:px-6">
            <Button
              href="https://happyhq.com/"
              className="flex justify-center md:hidden"
            >
              Join the waitlist
            </Button>
            <Navigation
              navigation={navigation}
              className="mt-5 px-1"
              onLinkClick={onLinkClick}
            />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
