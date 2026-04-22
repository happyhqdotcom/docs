import {
  readdirSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  statSync,
} from 'node:fs'
import { join, relative, basename, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import matter from 'gray-matter'

import { renderOgPng } from './og/card.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOCS_SRC = join(ROOT, 'src', 'content', 'docs')
const CHANGELOG_SRC = join(ROOT, 'src', 'content', 'changelog')
const OUT_DIR = join(ROOT, 'public', 'og')

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (entry.endsWith('.md')) out.push(full)
  }
  return out
}

function titleCase(segment) {
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function slugFromPath(file, srcRoot) {
  const rel = relative(srcRoot, file).replace(/\\/g, '/')
  const noExt = rel.slice(0, -extname(rel).length)
  if (noExt === 'index') return []
  return noExt.split('/').filter((s) => s !== 'index')
}

function loadMd(file) {
  const src = readFileSync(file, 'utf8')
  const { data } = matter(src)
  const override = data?.nextjs?.metadata ?? {}
  return {
    title: data.title ?? '',
    description: data.description ?? override.description ?? '',
    date: data.date ?? '',
    hidden: Boolean(data.hidden),
  }
}

async function writeCard(outPath, props) {
  mkdirSync(dirname(outPath), { recursive: true })
  const png = await renderOgPng(props)
  writeFileSync(outPath, png)
  const relPath = relative(ROOT, outPath)
  console.log(`  ✓ ${relPath}`)
}

async function main() {
  const tasks = []

  // Docs: one card per page (index.md → /og/docs.png, etc.)
  for (const file of walk(DOCS_SRC)) {
    const fm = loadMd(file)
    if (fm.hidden) continue
    const slug = slugFromPath(file, DOCS_SRC)
    const out =
      slug.length === 0
        ? join(OUT_DIR, 'docs', '_root.png')
        : join(OUT_DIR, 'docs', ...slug.slice(0, -1), `${slug[slug.length - 1]}.png`)
    tasks.push(
      writeCard(out, {
        title: fm.title || 'HappyHQ Docs',
        description:
          fm.description || 'The AI workspace for everyday work.',
        eyebrow: slug.length > 0 ? titleCase(slug[0]) : 'Docs',
      }),
    )
  }

  // Changelog entries: one card per entry
  for (const file of walk(CHANGELOG_SRC)) {
    const fm = loadMd(file)
    if (fm.hidden) continue
    const slug = slugFromPath(file, CHANGELOG_SRC)
    if (slug.length === 0) continue
    const out = join(
      OUT_DIR,
      'changelog',
      ...slug.slice(0, -1),
      `${slug[slug.length - 1]}.png`,
    )
    tasks.push(
      writeCard(out, {
        title: fm.title || 'HappyHQ Changelog',
        description: fm.description || '',
        eyebrow: 'Changelog',
        date: fm.date
          ? new Date(fm.date).toISOString().slice(0, 10)
          : '',
      }),
    )
  }

  // Changelog index
  tasks.push(
    writeCard(join(OUT_DIR, 'changelog', '_root.png'), {
      title: "What's new",
      description: 'Recent changes and releases across HappyHQ.',
      eyebrow: 'Changelog',
    }),
  )

  console.log(`og-generate: rendering ${tasks.length} PNG(s) to ${relative(ROOT, OUT_DIR)}`)
  await Promise.all(tasks)
  console.log(`og-generate: done (${tasks.length} PNG(s))`)
}

main().catch((err) => {
  console.error('og-generate: failed')
  console.error(err)
  process.exit(1)
})
