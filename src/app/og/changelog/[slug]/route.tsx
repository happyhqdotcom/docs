import { ImageResponse } from 'next/og'

import { getPage, getPages } from '@/lib/source'

export const dynamic = 'force-static'

const SIZE = { width: 1200, height: 630 } as const

export function generateStaticParams() {
  return getPages('changelog').map((page) => ({ slug: page.slug.join('/') }))
}

type Params = { slug: string }

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params
  const page = getPage('changelog', [slug])
  const title = page?.frontmatter.title ?? 'HappyHQ Changelog'
  const description = page?.frontmatter.description ?? ''
  const date = page?.frontmatter.date ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #0F0A14 0%, #13101A 55%, #1A1020 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background:
                  'linear-gradient(135deg, #EF436D 0%, #F95F7C 60%, #EEB5F0 100%)',
              }}
            />
            HappyHQ
          </div>
          <div
            style={{
              display: 'flex',
              padding: '8px 14px',
              borderRadius: 999,
              border: '1px solid rgba(239,67,109,0.5)',
              color: '#F95F7C',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Changelog
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            maxWidth: 1040,
          }}
        >
          {date && (
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              {date}
            </div>
          )}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.4,
                color: 'rgba(255,255,255,0.65)',
                maxWidth: 940,
              }}
            >
              {description}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 18,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <div
            style={{
              width: 48,
              height: 4,
              borderRadius: 2,
              background: '#F95F7C',
            }}
          />
          happyhq.com/changelog/{slug}
        </div>
      </div>
    ),
    SIZE,
  )
}
