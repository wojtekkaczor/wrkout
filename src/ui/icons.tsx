import type { ReactNode } from 'react'

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function TodayIcon() {
  return (
    <Icon>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function PlanIcon() {
  return (
    <Icon>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M3.5 6h.5M3.5 12h.5M3.5 18h.5" strokeWidth="2.6" />
    </Icon>
  )
}

export function ProgressIcon() {
  return (
    <Icon>
      <path d="M4 20V4M4 20h16" />
      <path d="M7.5 15l4-4.5 3 2.5L19 7" />
    </Icon>
  )
}

export function ProfileIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </Icon>
  )
}
