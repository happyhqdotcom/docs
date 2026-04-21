import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from '@shikijs/transformers'
import {
  createHighlighterCore,
  type HighlighterCore,
  type ShikiTransformer,
} from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'

// Strip Shiki's inlined background-color on the <pre> so the wrapper's
// layered surfaces show through (see Fence / CodeTabs frame styling).
const transformerNoBackground: ShikiTransformer = {
  name: 'fence-no-bg',
  pre(node: { properties: { style?: unknown } }) {
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

// Languages explicitly bundled into the Worker. Any fence whose language
// is outside this set falls back to plain text. Add here as docs grow.
const LANGS = [
  'bash',
  'css',
  'diff',
  'go',
  'html',
  'javascript',
  'json',
  'jsonc',
  'jsx',
  'markdown',
  'python',
  'tsx',
  'typescript',
  'yaml',
] as const

type Lang = (typeof LANGS)[number]

const LANG_ALIASES: Record<string, Lang> = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  shellscript: 'bash',
  md: 'markdown',
  py: 'python',
}

let highlighterPromise: Promise<HighlighterCore> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [import('@shikijs/themes/github-dark-dimmed')],
      langs: [
        import('@shikijs/langs/bash'),
        import('@shikijs/langs/css'),
        import('@shikijs/langs/diff'),
        import('@shikijs/langs/go'),
        import('@shikijs/langs/html'),
        import('@shikijs/langs/javascript'),
        import('@shikijs/langs/json'),
        import('@shikijs/langs/jsonc'),
        import('@shikijs/langs/jsx'),
        import('@shikijs/langs/markdown'),
        import('@shikijs/langs/python'),
        import('@shikijs/langs/tsx'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/yaml'),
      ],
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}

function resolveLang(language?: string): Lang | 'text' {
  if (!language) return 'text'
  let normalized = language.toLowerCase()
  if (normalized in LANG_ALIASES) return LANG_ALIASES[normalized]
  if ((LANGS as readonly string[]).includes(normalized)) return normalized as Lang
  return 'text'
}

export async function highlight(code: string, language?: string) {
  let lang = resolveLang(language)
  let highlighter = await getHighlighter()

  if (lang === 'text') {
    // Render as a plain <pre> to avoid loading an extra grammar for the null case.
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `<pre class="shiki"><code>${escaped}</code></pre>`
  }

  return highlighter.codeToHtml(code, {
    lang,
    theme: THEME,
    transformers: BASE_TRANSFORMERS,
  })
}
