import withSearch from './src/markdoc/search.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '/_content',
  // Twoslash pulls in @typescript/vfs which uses Node-native `path` /
  // dynamic requires that Webpack can't bundle. Marking them as externals
  // lets Next require them straight from node_modules at runtime.
  serverExternalPackages: [
    'typescript',
    '@typescript/vfs',
    'twoslash',
    '@shikijs/twoslash',
  ],
  async rewrites() {
    return [
      // /<surface>/<path>.md → /raw/<surface>/<path>
      { source: '/:path*.md', destination: '/raw/:path*' },
    ]
  },
}

export default withSearch(nextConfig)
