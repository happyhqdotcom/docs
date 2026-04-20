'use server'

import { cookies } from 'next/headers'

export async function getWaitlistStatus() {
  const cookieStore = await cookies()
  const waitlistCookie = cookieStore.get('happyhq_waitlist')

  try {
    if (waitlistCookie?.value) {
      const waitlistData = JSON.parse(waitlistCookie.value)
      return !!waitlistData.email
    }
  } catch (error) {
    console.error('Error parsing waitlist cookie:', error)
  }

  return false
}
