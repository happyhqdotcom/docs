import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import withSearch from './src/markdoc/search.mjs'

initOpenNextCloudflareForDev()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No `assetPrefix`. Next emits Next.js assets at `/_next/*`; the CF Worker's
  // ASSETS binding finds them in `.open-next/assets/_next/*` at those same
  // paths. The compose Worker in front of this origin also routes `/_next/*`
  // to this origin so assets resolve through the composed domain too.
  async rewrites() {
    return [
      // /<surface>/<path>.md → /raw/<surface>/<path>
      { source: '/:path*.md', destination: '/raw/:path*' },
    ]
  },
}

export default withSearch(nextConfig)
