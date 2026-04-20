import clsx from 'clsx'
import { type Metadata } from 'next'
import { Nunito } from 'next/font/google'

import { Providers } from '@/app/providers'
import { Layout, type SurfaceInfo } from '@/components/Layout'

import { getWaitlistStatus } from '@/app/actions/waitlist'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import PostHogPageView from '@/components/PosthogPageView'
import { type Surface } from '@/lib/frontmatter-schemas'
import {
  getNavigation,
  getSurfaces,
  surfaceHasSidebar,
  surfaceLabel,
  surfacePrefix,
  type NavTree,
} from '@/lib/source'
import '@/styles/tailwind.css'
import { cookies } from 'next/headers'

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: {
    template: '%s - HappyHQ',
    default: 'HappyHQ — The shared brain for teams.',
  },
  description: 'A modern knowledge base for high performance.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isOnWaitlist = await getWaitlistStatus()
  const cookieStore = await cookies()
  const hasClerkSession = cookieStore.has('__session')
  const knownUser = cookieStore.has('knownUser')
  const navigations: Record<Surface, NavTree> = Object.fromEntries(
    getSurfaces().map((s) => [s, getNavigation(s)]),
  ) as Record<Surface, NavTree>
  const surfaces: SurfaceInfo[] = getSurfaces().map((s) => ({
    key: s,
    label: surfaceLabel(s),
    href: surfacePrefix(s),
    hasSidebar: surfaceHasSidebar(s),
  }))

  return (
    <html
      lang="en"
      className={clsx('h-full overscroll-none antialiased', nunito.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full bg-[oklch(0.93_0.01_80)] text-[17px] font-medium dark:bg-[#0F0A14]">
        <Providers>
          <Layout
            isOnWaitlist={isOnWaitlist}
            hasClerkSession={hasClerkSession}
            knownUser={knownUser}
            navigations={navigations}
            surfaces={surfaces}
          >
            {children}
            <PostHogPageView />
            <KeyboardShortcuts />
          </Layout>
        </Providers>
      </body>
    </html>
  )
}
