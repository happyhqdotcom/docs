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
    icon: [
      { url: '/assets/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
      <head>
        {/*
          Polyfill esbuild's `__name` helper in the inline-script scope.

          next-themes injects a blocking <script> in <head> that runs a theme-
          init IIFE before first paint. The function body comes from ToString()
          on a function defined in the server bundle — which OpenNext builds
          with esbuild `keepNames: true`. esbuild emits `__name(fn, "fn")` after
          each named function declaration to preserve `Function.prototype.name`.
          The helper `__name` is defined once at the top of the worker bundle,
          but the stringified inline script runs in its own scope where
          `__name` is undefined, so the IIFE throws ReferenceError at first
          paint and the theme class never gets applied (brief FOUC + a console
          error flagged by PageSpeed Insights "Best Practices").

          This one-liner defines `__name` globally before the theme script
          runs. Remove when either:
          - @opennextjs/cloudflare stops passing `keepNames: true` to its
            esbuild config for server chunks whose functions get .toString()'d
            (track upstream: opennextjs/opennextjs-cloudflare), or
          - next-themes ships an inline script that doesn't rely on bundler-
            processed identifiers (track upstream: pacocoursey/next-themes).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__name=(t,n)=>Object.defineProperty(t,'name',{value:n,configurable:true})",
          }}
        />
      </head>
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
