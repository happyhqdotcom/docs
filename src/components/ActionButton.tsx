'use client'

import { Button } from '@/components/catalyst/button'
import { Smile, TicketCheck } from 'lucide-react'

interface ActionButtonProps {
  isOnWaitlist: boolean
  hasClerkSession: boolean
  knownUser: boolean
}

export function ActionButton({
  isOnWaitlist,
  hasClerkSession,
  knownUser,
}: ActionButtonProps) {
  // If user is logged in, show "Open App" button
  if (hasClerkSession) {
    return (
      <Button color="pink" href="https://app.happyhq.com">
        <Smile className="h-4 w-4" />
        Open App
      </Button>
    )
  }

  if (knownUser) {
    return (
      <Button color="amber" href="https://app.happyhq.com">
        <Smile className="h-4 w-4" />
        Login
      </Button>
    )
  }

  // Otherwise, show waitlist button
  return (
    <Button
      color={isOnWaitlist ? 'green' : 'violet'}
      href="https://app.happyhq.com/waitlist"
    >
      {isOnWaitlist ? (
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
