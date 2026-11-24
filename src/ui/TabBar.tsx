import type { ReactNode } from 'react'
import { NavLink } from 'react-router'

export type TabItem = {
  to: string
  label: string
  icon: ReactNode
}

/** Bottom navigation. Sits above the iOS home indicator via the safe-area inset. */
export function TabBar({ items }: { items: TabItem[] }) {
  return (
    <nav
      aria-label="Główna nawigacja"
      className="border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-xl">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[13px]',
                  isActive ? 'font-semibold text-accent' : 'text-muted',
                ].join(' ')
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
