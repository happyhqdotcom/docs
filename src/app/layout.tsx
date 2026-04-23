import clsx from 'clsx'
import { type Metadata } from 'next'
import { Nunito } from 'next/font/google'

import { Providers } from '@/app/providers'
import { Layout, type SurfaceInfo } from '@/components/Layout'

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

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://happyhq.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s - HappyHQ',
    default: 'HappyHQ — The AI workspace for everyday work.',
  },
  description:
    'The AI workspace for everyday work. You teach it how you do anything, and it does that work for you — the way you would have done it.',
  icons: {
    icon: { url: '/icon.svg', type: 'image/svg+xml' },
    apple: { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          <Layout navigations={navigations} surfaces={surfaces}>
            {children}
            <PostHogPageView />
            <KeyboardShortcuts />
          </Layout>
        </Providers>
      </body>
    </html>
  )
}
