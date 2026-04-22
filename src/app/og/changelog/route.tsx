import { renderOgCard } from '@/app/og/_lib/card'

export const dynamic = 'force-static'

export async function GET() {
  return renderOgCard({
    surface: 'changelog',
    title: "What's new",
    description: 'Recent changes and releases across HappyHQ.',
    eyebrow: 'Changelog',
  })
}
