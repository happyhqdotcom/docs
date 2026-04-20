'use client'

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'

export function ZoomableImage({
  src,
  alt = '',
  caption,
}: {
  src: string
  alt?: string
  caption?: string
}) {
  let [open, setOpen] = useState(false)

  return (
    <>
      <figure className="not-prose my-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={clsx(
            'block w-full cursor-zoom-in overflow-hidden rounded-lg',
            'ring-1 ring-zinc-200 transition-shadow hover:ring-zinc-300',
            'dark:ring-zinc-700/60 dark:hover:ring-zinc-600',
            // Suppress the default browser focus ring on click-return from
            // the dialog; keep a tasteful brand ring for keyboard users.
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF436D]/60',
          )}
          aria-label={alt ? `Open image: ${alt}` : 'Open image'}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="block h-auto w-full" />
        </button>
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {caption}
          </figcaption>
        )}
      </figure>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200 data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
          <DialogPanel
            transition
            className="max-h-full max-w-full cursor-zoom-out transition-transform duration-200 data-closed:scale-95 data-closed:opacity-0"
            onClick={() => setOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="block max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
            />
            {caption && (
              <div className="mt-3 text-center text-sm text-white/70">
                {caption}
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
