// Shared "ghost button" surface. Semi-transparent rounded chip that sits
// softly on the page bg and turns fully opaque on hover. Mirrors the
// MarkdownMenu trigger and the dropdown card, so all page-chrome controls
// feel like they belong to the same family.

export const ghostPill =
  'inline-flex items-center gap-x-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ' +
  'border-zinc-300/60 bg-white/50 text-zinc-600 hover:bg-white hover:text-zinc-900 ' +
  'dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'

export const ghostIconButton =
  'inline-flex items-center justify-center rounded-md border transition-colors ' +
  'border-zinc-300/60 bg-white/50 text-zinc-500 hover:bg-white hover:text-zinc-900 ' +
  'dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
