import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const BRAND_DIR = join(process.cwd(), 'src/brand')
const FONTS_DIR = join(process.cwd(), 'src/app/og/_fonts')

function loadBrandImage(name: string): string {
  const bytes = readFileSync(join(BRAND_DIR, name))
  return `data:image/png;base64,${bytes.toString('base64')}`
}

function loadFont(name: string): Buffer {
  return readFileSync(join(FONTS_DIR, name))
}

export const images = {
  wordmark: loadBrandImage('logo-wordmark.png'),
  bush: loadBrandImage('bush.png'),
}

export const fonts = [
  {
    name: 'Coiny',
    data: loadFont('Coiny-Regular.ttf'),
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: loadFont('Inter-Regular.ttf'),
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: loadFont('Inter-Bold.ttf'),
    weight: 700 as const,
    style: 'normal' as const,
  },
]
