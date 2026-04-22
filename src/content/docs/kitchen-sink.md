---
title: Kitchen Sink Doc
description: A temporary kitchen sink doc to showcase all of the components and syntax of creating docs in this repo.
hidden: true
---

A temporary kitchen sink doc to showcase all of the components and syntax of creating docs in this repo.

---

## **Headings**

## Heading 1

### Heading 2

#### Heading 3

##### Heading 4

###### Heading 5

---

## **Text Formatting**

- **Bold** → `**Bold**`
- _Italic_ → `_Italic_`
- ~~Strikethrough~~ → `~~Strikethrough~~`
- `Inline Code` → `` `Inline Code` ``
- [Links](https://example.com) → `[Links](https://example.com)`

---

## **Lists**

### **Unordered List**

- Item 1
- Item 2
- Item 3

### **Ordered List**

1. First Item
2. Second Item
3. Third Item

### **Checklist**

- [x] Done Item
- [ ] Pending Item
- [ ] Another Pending Item

---

## **Tables**

| **Column 1** | **Column 2** | **Column 3** |
| ------------ | ------------ | ------------ |
| Row 1        | ✅ Yes       | ❌ No        |
| Row 2        | 🚀 Fast      | 🏗️ Building  |

---

## **Callouts**

{% callout type="warning" title="Oh no! Something bad happened!" %}
This is what a disclaimer message looks like. You might want to include inline `code` in it. Or maybe you’ll want to include a [link](/) in it. I don’t think we should get too carried away with other scenarios like lists or tables — that would be silly.
{% /callout %}

{% callout title="A normal callout" %}
This is what a disclaimer message looks like. You might want to include inline `code` in it. Or maybe you’ll want to include a [link](/) in it. I don’t think we should get too carried away with other scenarios like lists or tables — that would be silly.
{% /callout %}

---

## **Code Blocks**

### **JavaScript Example**

```js
const message = 'Hello, World!'
console.log(message)
```

---

## **Images**

![Example Image](https://images.unsplash.com/photo-1607293348316-817135a4b38b?q=80&w=1546&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D 'Example Image')

---

## **Quotes**

> This is a quote. It’s useful for highlighting key points.

---

## **Quick Links**

{% quick-links %}

{% quick-link title="Installation" icon="installation" href="/" description="Step-by-step guides to setting up your system and installing the library." /%}

{% quick-link title="Architecture guide" icon="presets" href="/" description="Learn how the internals work and contribute." /%}

{% quick-link title="Plugins" icon="plugins" href="/" description="Extend the library with third-party plugins or write your own." /%}

{% quick-link title="API reference" icon="theming" href="/" description="Learn to easily customize and modify your app's visual design to fit your brand." /%}

{% /quick-links %}

---

## Code fence with filename

Use the `title` attribute to add a filename header to a code block. Shiki notation comments (`[!code highlight]`, `[!code ++]`, `[!code --]`, `[!code focus]`) still work inside.

```ts {% title="app/providers.tsx" %}
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system"> // [!code highlight]
      {children}
    </ThemeProvider>
  )
}
```

Diff notation:

```diff {% title="package.json" %}
{
  "dependencies": {
-   "prism-react-renderer": "^2.0.6",
+   "shiki": "^4.0.2",
+   "@shikijs/transformers": "^4.0.2"
  }
}
```

---

## Tabs

Use `{% tabs %}` with one or more `{% tab label="..." %}` children. Great for package-manager-specific install commands or per-language examples.

{% tabs %}
{% tab label="pnpm" %}

```bash
pnpm add shiki @shikijs/transformers
```

{% /tab %}
{% tab label="npm" %}

```bash
npm install shiki @shikijs/transformers
```

{% /tab %}
{% tab label="yarn" %}

```bash
yarn add shiki @shikijs/transformers
```

{% /tab %}
{% /tabs %}

Tabs can hold any content, not just code:

{% tabs %}
{% tab label="What it does" %}

Tabs let you show alternative content for the same idea — different package managers, languages, or UI frameworks — without cluttering the page.

{% /tab %}
{% tab label="When to use" %}

- Install commands across npm / pnpm / yarn
- API examples in multiple languages
- Before / After comparisons

{% /tab %}
{% /tabs %}

---

## Code tabs

Unified single-frame variant for tabbed code. Each `{% code-tab %}` contains exactly one fence; the tab strip replaces the filename row and the active tab's code is copied by the persistent top-right copy button.

{% code-tabs %}

{% code-tab label="pnpm" %}

```bash
pnpm add shiki @shikijs/transformers
```

{% /code-tab %}

{% code-tab label="npm" %}

```bash
npm install shiki @shikijs/transformers
```

{% /code-tab %}

{% code-tab label="yarn" %}

```bash
yarn add shiki @shikijs/transformers
```

{% /code-tab %}

{% code-tab label="bun" %}

```bash
bun add shiki @shikijs/transformers
```

{% /code-tab %}

{% /code-tabs %}

Also useful for showing the same example in multiple languages:

{% code-tabs %}

{% code-tab label="TypeScript" %}

```ts
export async function fetchMemory(id: string) {
  const res = await fetch(`/api/memories/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
```

{% /code-tab %}

{% code-tab label="Python" %}

```python
import httpx

async def fetch_memory(memory_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"/api/memories/{memory_id}")
        res.raise_for_status()
        return res.json()
```

{% /code-tab %}

{% code-tab label="Go" %}

```go
func FetchMemory(ctx context.Context, id string) (*Memory, error) {
    req, _ := http.NewRequestWithContext(ctx, "GET", "/api/memories/"+id, nil)
    res, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer res.Body.Close()
    var m Memory
    return &m, json.NewDecoder(res.Body).Decode(&m)
}
```

{% /code-tab %}

{% /code-tabs %}

---

## Line numbers

Set `lineNumbers=true` on a fence to render a muted line-number gutter on the left of each line. Works with notations.

```ts {% title="src/lib/fibonacci.ts" lineNumbers=true %}
export function fib(n: number): number {
  if (n < 2) return n
  let a = 0
  let b = 1
  for (let i = 2; i <= n; i++) {
    let next = a + b // [!code highlight]
    a = b
    b = next
  }
  return b
}
```

---

## Image zoom

The `{% figure %}` tag now opens a fullscreen lightbox when clicked. ESC or click-outside closes it.

{% figure src="https://picsum.photos/id/1018/1600/900" alt="Scenic mountains" caption="Click the image to zoom. Press ESC or click outside to close." /%}

---

## Steps

Numbered vertical walkthrough. Each `{% step %}` takes an optional `title` and holds any markdown body.

{% steps %}

{% step title="Install dependencies" %}

Pick your package manager and install the required packages:

```bash
pnpm add shiki @shikijs/transformers
```

{% /step %}

{% step title="Configure Markdoc" %}

Register the new component in `src/markdoc/tags.js` and add it to the `components` map in each per-surface route that renders Markdoc (`src/app/docs/[[...slug]]/page.tsx` and `src/app/changelog/[slug]/page.tsx`).

{% /step %}

{% step title="Write your first page" %}

Drop a new `.md` file under `src/content/docs/` (for example `src/content/docs/my-topic.md`) with frontmatter `title` and `description`. The nav picks it up automatically; add an entry to the folder's `_meta.json` if you want explicit ordering.

{% /step %}

{% /steps %}

---

## Cards

Grid of rich linked cards. Pass `title`, `description`, and `href` as attributes. Any content inside a card body renders below the description.

{% cards %}

{% card title="Quickstart" description="Capture your first memory in under two minutes." href="/quickstart/capture-a-memory" icon="→" /%}

{% card title="Streams" description="Group related memories into dynamic collections." href="/fundamentals/streams" icon="→" /%}

{% card title="Digests" description="Summarise stream activity on a schedule." href="/fundamentals/digests" icon="→" /%}

{% card title="Discussions" description="Let your team comment on any memory or page." href="/fundamentals/discussions" icon="→" /%}

{% /cards %}

---

## Accordion

Collapsible FAQ-style blocks. Group multiple `{% accordion %}` items inside `{% accordions %}`.

{% accordions %}

{% accordion title="What counts as a memory?" %}

A memory is any unit of captured context — a decision, a link, a screenshot with notes, a short log. You decide the grain. Most teams start with one memory per meaningful artefact.

{% /accordion %}

{% accordion title="Do I need to tag every memory?" %}

No. Tags are optional. If you skip them, HappyHQ infers structure from the memory's type and the stream it lands in.

{% /accordion %}

{% accordion title="How does search work across workspaces?" %}

Search is scoped to the current workspace by default. You can opt into cross-workspace search if you have admin access on multiple workspaces.

{% /accordion %}

{% /accordions %}

---

## Files

ASCII-style file tree. Nest `{% folder %}` and `{% file %}` to any depth.

{% files %}

{% folder name="src" %}

{% folder name="content" %}

{% folder name="docs" %}
{% file name="index.md" /%}
{% file name="kitchen-sink.md" /%}
{% file name="_meta.json" /%}
{% /folder %}

{% folder name="changelog" %}
{% file name="2026-04-19-multi-surface.md" /%}
{% /folder %}

{% /folder %}

{% folder name="lib" %}
{% file name="source.ts" /%}
{% file name="frontmatter-schemas.ts" /%}
{% /folder %}

{% /folder %}

{% file name="next.config.mjs" /%}

{% /files %}

---

## Banner

A page-level announcement strip. Four variants — `info` (default), `warning`, `success`, `error`.

{% banner title="Heads up" %}
This is an informational banner. Use it for announcements, reminders, or neutral context.
{% /banner %}

{% banner variant="warning" title="Deprecation notice" %}
The `v1` memory API will be removed on 2026-09-01. Migrate to `v2` — [see the migration guide](/docs/fundamentals/memories).
{% /banner %}

{% banner variant="success" title="Shipped" %}
Streams, digests, and discussions are generally available as of 2026-04-19.
{% /banner %}

{% banner variant="error" title="Outage" %}
Webhook delivery is currently degraded. We are investigating.
{% /banner %}

---

## Keyboard shortcuts

Press <kbd>?</kbd> anywhere on this site to open a dialog showing the available keyboard shortcuts. It's mounted site-wide so the help is always one key away.

---

## Relative links

Links in markdown now resolve relative to the current page's source-file location, so you can write sibling references naturally. This page lives at `src/content/docs/kitchen-sink.md`, so:

- [`./fundamentals/streams`](./fundamentals/streams) — resolves to `/docs/fundamentals/streams`
- [`./inspiration/streams.md`](./inspiration/streams.md) — trailing `.md` is stripped → `/docs/inspiration/streams`
- [`./resources/faqs#glossary`](./resources/faqs#glossary) — hash fragments pass through
- [`/resources/faqs`](/resources/faqs) — absolute paths are left unchanged
- [External link](https://fumadocs.dev) — `http(s)://`, `mailto:`, and plain `#anchor` links pass through unchanged

From deeper pages, `../` steps up one content directory — e.g. from `docs/fundamentals/streams.md`, a link `../customizing-happyhq/memory-types` resolves to `/docs/customizing-happyhq/memory-types`.

