// @/components/PosthogProvider.tsx
'use client'

import posthog, { type PostHog } from 'posthog-js'
import { PostHogProvider as PostHogProviderRaw } from 'posthog-js/react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

type PostHogProviderProps = {
  readonly children: ReactNode
}

export const PostHogProvider = ({
  children,
}: Omit<PostHogProviderProps, 'client'>) => {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      person_profiles: 'identified_only', // this means we do not create profiles for anonymous users
    }) as PostHog
  }, [])

  return <PostHogProviderRaw client={posthog}>{children}</PostHogProviderRaw>
}

export { usePostHog as useAnalytics } from 'posthog-js/react'
