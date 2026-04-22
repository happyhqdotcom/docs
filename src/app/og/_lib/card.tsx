import { ImageResponse } from 'next/og'

import { fonts, images } from './assets'

const SIZE = { width: 1200, height: 630 } as const

export type Surface = 'docs' | 'changelog'

export interface CardProps {
  surface: Surface
  title: string
  description: string
  eyebrow: string
  date?: string
}

export function renderOgCard(props: CardProps): ImageResponse {
  return new ImageResponse(<CreamCard {...props} />, { ...SIZE, fonts })
}

function CreamCard({ title, description, eyebrow, date }: CardProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 80px',
        background: '#F5EDDE',
        fontFamily: 'Inter',
        position: 'relative',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images.wordmark} alt="HappyHQ" style={{ width: 320 }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          flex: 1,
          justifyContent: 'flex-end',
          maxWidth: 960,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#F95F7C',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
          {date && (
            <span style={{ color: '#A04EA3', fontWeight: 700 }}>
              · {date}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#000',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.35,
              color: 'rgba(0, 0, 0, 0.65)',
              maxWidth: 900,
            }}
          >
            {description}
          </div>
        )}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images.bush}
        alt=""
        style={{
          position: 'absolute',
          right: -80,
          top: -50,
          width: 320,
        }}
      />
    </div>
  )
}

