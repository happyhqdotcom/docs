import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WIDTH = 1200
const HEIGHT = 630

const BRAND_DIR = join(__dirname, '..', '..', 'src', 'brand')
const FONTS_DIR = __dirname

function loadImage(name) {
  const bytes = readFileSync(join(BRAND_DIR, name))
  return `data:image/png;base64,${bytes.toString('base64')}`
}

function loadFont(name) {
  return readFileSync(join(FONTS_DIR, name))
}

const images = {
  wordmark: loadImage('logo-wordmark.png'),
  bush: loadImage('bush.png'),
}

const fonts = [
  { name: 'Coiny', data: loadFont('Coiny-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'Inter', data: loadFont('Inter-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'Inter', data: loadFont('Inter-Bold.ttf'), weight: 700, style: 'normal' },
]

const REACT_ELEMENT = Symbol.for('react.element')
const h = (type, props = {}, ...children) => {
  const filtered = children.flat().filter((c) => c != null && c !== false)
  return {
    $$typeof: REACT_ELEMENT,
    type,
    key: null,
    ref: null,
    props: { ...props, children: filtered.length === 1 ? filtered[0] : filtered },
  }
}

function titleFontSize(title) {
  const len = title.length
  if (len > 65) return 56
  if (len > 45) return 64
  return 72
}

function card({ title, description, eyebrow, date }) {
  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 80px',
        background: '#EDE9E3',
        fontFamily: 'Inter',
        position: 'relative',
      },
    },
    h('img', { src: images.wordmark, alt: 'HappyHQ', style: { width: 320 } }),
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          flex: 1,
          justifyContent: 'flex-end',
          maxWidth: 760,
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#F95F7C',
            textTransform: 'uppercase',
          },
        },
        date ? `${eyebrow} · ${date}` : eyebrow,
      ),
      h(
        'div',
        {
          style: {
            fontSize: titleFontSize(title),
            fontWeight: 800,
            color: '#000',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          },
        },
        title,
      ),
      description &&
        h(
          'div',
          {
            style: {
              fontSize: 28,
              fontWeight: 400,
              lineHeight: 1.35,
              color: 'rgba(0, 0, 0, 0.65)',
              maxWidth: 720,
            },
          },
          description,
        ),
    ),
    h('img', {
      src: images.bush,
      alt: '',
      style: {
        position: 'absolute',
        right: -80,
        top: -50,
        width: 320,
      },
    }),
  )
}

export async function renderOgPng(props) {
  const svg = await satori(card(props), { width: WIDTH, height: HEIGHT, fonts })
  return new Resvg(svg).render().asPng()
}
