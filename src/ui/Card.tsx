import type { ReactNode } from 'react'

type CardProps = {
  title?: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      {title ? <h2 className="mb-2 text-base font-semibold">{title}</h2> : null}
      {children}
    </section>
  )
}
