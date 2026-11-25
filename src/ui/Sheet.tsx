import { useEffect, type ReactNode } from 'react'

type SheetProps = {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Bottom sheet for details and edits that should not leave the current
 * screen. Closes on the backdrop and on Escape.
 */
export function Sheet({ title, onClose, children }: SheetProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Zamknij"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[88%] overflow-y-auto rounded-t-2xl border-t border-border bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
      >
        <div className="mx-auto flex max-w-xl flex-col gap-4">
          <h2 className="text-base font-semibold [overflow-wrap:anywhere]">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  )
}
