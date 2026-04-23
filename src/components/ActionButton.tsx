'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/catalyst/button'
import { Smile, TicketCheck } from 'lucide-react'

type AuthState = {
  isOnWaitlist: boolean
  hasClerkSession: boolean
  knownUser: boolean
}

function readAuthState(): AuthState {
  if (typeof document === 'undefined') {
    return { isOnWaitlist: false, hasClerkSession: false, knownUser: false }
  }
  const cookies = document.cookie.split(';').map((c) => c.trim())
  const get = (name: string) =>
    cookies.find((c) => c.startsWith(name + '='))?.slice(name.length + 1)

  const waitlistRaw = get('happyhq_waitlist')
  let isOnWaitlist = false
  if (waitlistRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(waitlistRaw))
      isOnWaitlist = Boolean(parsed?.email)
    } catch {
      // malformed cookie — treat as not on waitlist
    }
  }

  return {
    isOnWaitlist,
    hasClerkSession: Boolean(get('__session')),
    knownUser: Boolean(get('knownUser')),
  }
}

export function ActionButton({ className }: { className?: string } = {}) {
  const [state, setState] = useState<AuthState | null>(null)

  useEffect(() => {
    setState(readAuthState())
  }, [])

  // Pre-hydration / pre-effect: render nothing to avoid a layout-shifting flash
  // between "Join Waitlist" and whatever the cookie says. The button is small
  // enough that omission is less disruptive than a visible swap.
  if (!state) return null

  if (state.hasClerkSession) {
    return (
      <Button color="pink" href="https://app.happyhq.com" className={className}>
        <Smile className="h-4 w-4" />
        Open App
      </Button>
    )
  }

  if (state.knownUser) {
    return (
      <Button color="amber" href="https://app.happyhq.com" className={className}>
        <Smile className="h-4 w-4" />
        Login
      </Button>
    )
  }

  return (
    <Button
      color={state.isOnWaitlist ? 'green' : 'violet'}
      href="https://app.happyhq.com/waitlist"
      className={className}
    >
      {state.isOnWaitlist ? (
        <>
          <TicketCheck className="h-4 w-4" />
          You&apos;re on the waitlist
        </>
      ) : (
        'Join Waitlist'
      )}
    </Button>
  )
}
