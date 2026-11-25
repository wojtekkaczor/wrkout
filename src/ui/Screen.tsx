import type { ReactNode } from 'react'
import { Link } from 'react-router'

type ScreenProps = {
  title: string
  subtitle?: string
  /** Link shown above the title on detail screens. */
  back?: { to: string; label: string }
  children: ReactNode
}

/** Page frame: heading plus scrollable content with screen margins. */
export function Screen({ title, subtitle, back, children }: ScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header>
        {back ? (
          <Link to={back.to} className="-ml-1 inline-flex min-h-12 items-center text-base text-accent">
            ‹ {back.label}
          </Link>
        ) : null}
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-[13px] text-muted">{subtitle}</p> : null}
      </header>
      {children}
    </div>
  )
}
