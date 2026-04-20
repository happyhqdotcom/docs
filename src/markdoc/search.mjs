import Markdoc from '@markdoc/markdoc'
import { slugifyWithCounter } from '@sindresorhus/slugify'
import glob from 'fast-glob'
import * as fs from 'fs'
import * as path from 'path'
import { createLoader } from 'simple-functional-loader'
import * as url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const slugify = slugifyWithCounter()

const SURFACES = ['docs', 'changelog']

function toString(node) {
  let str =
    node.type === 'text' && typeof node.attributes?.content === 'string'
      ? node.attributes.content
      : ''
  if ('children' in node) {
    for (let child of node.children) {
      str += toString(child)
    }
  }
  return str
}

function extractSections(node, sections, isRoot = true) {
  if (isRoot) {
    slugify.reset()
  }
  if (node.type === 'heading' || node.type === 'paragraph') {
    let content = toString(node).trim()
    if (node.type === 'heading' && node.attributes.level <= 2) {
      let hash = node.attributes?.id ?? slugify(content)
      sections.push([content, hash, []])
    } else {
      sections.at(-1)[2].push(content)
    }
  } else if ('children' in node) {
    for (let child of node.children) {
      extractSections(child, sections, false)
    }
  }
}

export default function withSearch(nextConfig = {}) {
  let cache = new Map()

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: __filename,
        use: [
          createLoader(function () {
            let contentBase = path.resolve('./src/content')
            this.addContextDependency(contentBase)

            let data = []
            for (let surface of SURFACES) {
              let surfaceDir = path.join(contentBase, surface)
              if (!fs.existsSync(surfaceDir)) continue
              let files = glob.sync('**/*.md', { cwd: surfaceDir })
              for (let file of files) {
                let noExt = file.replace(/\.md$/, '')
                let withinSurface =
                  noExt === 'index' ? '' : `/${noExt.replace(/\/index$/, '')}`
                let pageUrl = `/${surface}${withinSurface}`
                let md = fs.readFileSync(path.join(surfaceDir, file), 'utf8')

                let sections
                let cacheKey = `${surface}:${file}`
                if (cache.get(cacheKey)?.[0] === md) {
                  sections = cache.get(cacheKey)[1]
                } else {
                  let ast = Markdoc.parse(md)
                  let title = ast.attributes?.frontmatter?.match(
                    /^title:\s*(.*?)\s*$/m,
                  )?.[1]
                  sections = [[title, null, []]]
                  extractSections(ast, sections)
                  cache.set(cacheKey, [md, sections])
                }

                data.push({ url: pageUrl, sections })
              }
            }

            return `
              import FlexSearch from 'flexsearch'

              let sectionIndex = new FlexSearch.Document({
                tokenize: 'full',
                document: {
                  id: 'url',
                  index: 'content',
                  store: ['title', 'pageTitle'],
                },
                context: {
                  resolution: 9,
                  depth: 2,
                  bidirectional: true
                }
              })

              let data = ${JSON.stringify(data)}

              for (let { url, sections } of data) {
                for (let [title, hash, content] of sections) {
                  sectionIndex.add({
                    url: url + (hash ? ('#' + hash) : ''),
                    title,
                    content: [title, ...content].join('\\n'),
                    pageTitle: hash ? sections[0][0] : undefined,
                  })
                }
              }

              export function search(query, options = {}) {
                let result = sectionIndex.search(query, {
                  ...options,
                  enrich: true,
                })
                if (result.length === 0) {
                  return []
                }
                return result[0].result.map((item) => ({
                  url: item.id,
                  title: item.doc.title,
                  pageTitle: item.doc.pageTitle,
                }))
              }
            `
          }),
        ],
      })

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}
