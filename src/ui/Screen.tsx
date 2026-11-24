import type { ReactNode } from 'react'

type ScreenProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

/** Page frame for a tab: heading plus scrollable content with screen margins. */
export function Screen({ title, subtitle, children }: ScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <header>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-[13px] text-muted">{subtitle}</p> : null}
      </header>
      {children}
    </div>
  )
}
