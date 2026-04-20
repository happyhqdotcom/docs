import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from '@shikijs/transformers'
import { transformerTwoslash } from '@shikijs/twoslash'
import { codeToHtml, type ShikiTransformer } from 'shiki'

// Strip Shiki's inlined background-color on the <pre> so the wrapper's
// layered surfaces show through (see Fence / CodeTabs frame styling).
const transformerNoBackground: ShikiTransformer = {
  name: 'fence-no-bg',
  pre(node) {
    let style = node.properties.style
    if (typeof style === 'string') {
      node.properties.style = style.replace(/background-color:[^;]+;?/g, '')
    }
  },
}

const BASE_TRANSFORMERS = [
  transformerNotationDiff(),
  transformerNotationHighlight(),
  transformerNotationFocus(),
  transformerNoBackground,
]

const THEME = 'github-dark-dimmed'

export async function highlight(
  code: string,
  language?: string,
  opts: { twoslash?: boolean } = {},
) {
  let lang = language || 'text'
  let transformers = opts.twoslash
    ? [
        transformerTwoslash({
          explicitTrigger: false,
          renderer: undefined, // use default rich renderer
        }),
        ...BASE_TRANSFORMERS,
      ]
    : BASE_TRANSFORMERS

  try {
    return await codeToHtml(code, {
      lang,
      theme: THEME,
      transformers,
    })
  } catch {
    // Unknown language / twoslash compile failure — fall back to plain text
    // so the build never fails on a single bad fence.
    return await codeToHtml(code, {
      lang: 'text',
      theme: THEME,
      transformers: [transformerNoBackground],
    })
  }
}
