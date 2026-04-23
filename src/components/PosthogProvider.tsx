// @/components/PosthogProvider.tsx
'use client'

import { PostHogProvider as PostHogProviderSlim } from 'posthog-js/react/slim'
import type { PostHog } from 'posthog-js'
import { useEffect, useState, type ReactNode } from 'react'

type PostHogProviderProps = {
  readonly children: ReactNode
}

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  const [client, setClient] = useState<PostHog | null>(null)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return
    let cancelled = false
    // Dynamic import keeps posthog-js (plus its core-js polyfills) out of the
    // critical-path chunks. See PageSpeed "Reduce unused JavaScript" / "Legacy
    // JavaScript" — both flags traced back to posthog-js being statically
    // imported. The slim React wrapper imports only React so we can keep using
    // the <PostHogProvider> + usePostHog hook surface.
    import('posthog-js').then(({ default: posthog }) => {
      if (cancelled) return
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        ui_host: 'https://us.posthog.com',
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        person_profiles: 'identified_only', // this means we do not create profiles for anonymous users
      })
      setClient(posthog)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!client) return <>{children}</>
  return <PostHogProviderSlim client={client}>{children}</PostHogProviderSlim>
}

export { usePostHog as useAnalytics } from 'posthog-js/react/slim'
