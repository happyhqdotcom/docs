import { Children, isValidElement, type ReactElement } from 'react'

type StepProps = { title?: string; children?: React.ReactNode }

// A single step. Tabs-style pattern: Step is a shape carrier whose `title`
// prop is rendered by Steps alongside a numbered marker; children become the
// step's body.
export function Step({ children }: StepProps) {
  return <>{children}</>
}

export function Steps({ children }: { children: React.ReactNode }) {
  let steps = Children.toArray(children).filter(
    (c): c is ReactElement<StepProps> => isValidElement(c),
  )

  if (steps.length === 0) return null

  return (
    <ol className="not-prose my-6 ml-3 list-none border-l border-zinc-200 pl-6 dark:border-zinc-800">
      {steps.map((step, i) => (
        <li key={i} className="relative mb-8 last:mb-0">
          <span
            aria-hidden
            className="absolute -left-[calc(1.5rem+0.875rem)] flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-[oklch(0.93_0.01_80)] font-mono text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-[#0F0A14] dark:text-zinc-300"
          >
            {i + 1}
          </span>
          {step.props.title && (
            <h3 className="mb-2 font-heading text-base font-semibold text-zinc-900 dark:text-white">
              {step.props.title}
            </h3>
          )}
          <div className="prose prose-zinc dark:prose-invert max-w-none text-[0.95rem] prose-headings:mt-0 dark:text-zinc-400">
            {step.props.children}
          </div>
        </li>
      ))}
    </ol>
  )
}
