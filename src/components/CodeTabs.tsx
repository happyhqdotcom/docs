import { Children, isValidElement, type ReactElement } from 'react'

import { CodeTabsClient } from '@/components/CodeTabsClient'
import { highlight } from '@/lib/highlight'

// Props carried by each <CodeTab> element (populated by the Markdoc transform
// in `src/markdoc/tags.js` which pulls raw fence content out of the AST).
type CodeTabProps = { label: string; code: string; language: string }

// Shape carrier — CodeTabs reads this element's props. Returning null means
// a stray `{% code-tab %}` outside a `{% code-tabs %}` renders nothing
// rather than raw text.
export function CodeTab(_: CodeTabProps) {
  return null
}

export async function CodeTabs({ children }: { children: React.ReactNode }) {
  let tabs = Children.toArray(children)
    .filter((c): c is ReactElement<CodeTabProps> => isValidElement(c))
    .map((c) => c.props)
    .filter((p): p is CodeTabProps => typeof p?.code === 'string')

  if (tabs.length === 0) return null

  let highlighted = await Promise.all(
    tabs.map(async (t) => ({
      label: t.label,
      code: t.code,
      html: await highlight(t.code, t.language),
    })),
  )

  return <CodeTabsClient tabs={highlighted} />
}
