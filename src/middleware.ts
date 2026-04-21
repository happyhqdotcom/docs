import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')

  // Temporary: redirect the old shared docs.happyhq.workers.dev URL to
  // docs-preview until cutover. Remove after the Launch checklist completes.
  if (host === 'docs.happyhq.workers.dev') {
    const target = new URL(request.url)
    target.host = 'docs-preview.happyhq.workers.dev'
    return NextResponse.redirect(target, 302)
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
