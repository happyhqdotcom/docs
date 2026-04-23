import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_API = 'https://us.i.posthog.com'
const POSTHOG_ASSETS = 'https://us-assets.i.posthog.com'

function proxyTarget(pathname: string): string | null {
  if (pathname.startsWith('/ingest/static/')) {
    return POSTHOG_ASSETS + pathname.slice('/ingest'.length)
  }
  if (pathname.startsWith('/ingest/')) {
    return POSTHOG_API + pathname.slice('/ingest'.length)
  }
  if (POSTHOG_KEY && pathname === `/${POSTHOG_KEY}/config.js`) {
    return POSTHOG_ASSETS + pathname
  }
  if (POSTHOG_KEY && pathname === `/${POSTHOG_KEY}/config`) {
    return POSTHOG_API + pathname
  }
  return null
}

async function proxyToPostHog(request: NextRequest, target: string): Promise<Response> {
  const url = new URL(target)
  url.search = new URL(request.url).search

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('cookie')

  return fetch(url, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
    // @ts-expect-error — duplex required by undici/CF when streaming a request body
    duplex: 'half',
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const target = proxyTarget(pathname)
  if (target) {
    return proxyToPostHog(request, target)
  }

  const host = request.headers.get('host')

  // Temporary: redirect the old shared docs.happyhq.workers.dev URL to
  // docs-preview until cutover. Remove after the Launch checklist completes.
  if (host === 'docs.happyhq.workers.dev') {
    const redirectTarget = new URL(request.url)
    redirectTarget.host = 'docs-preview.happyhq.workers.dev'
    return NextResponse.redirect(redirectTarget, 302)
  }

  const response = NextResponse.next()

  if (host !== 'happyhq.com') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: '/:path*',
}
