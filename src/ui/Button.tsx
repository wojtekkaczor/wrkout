import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

const VARIANTS = {
  primary: 'bg-accent text-accent-contrast',
  secondary: 'border border-border bg-surface-2 text-text',
} as const

/** Touch target is at least 48 px high (NFR-5). */
export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'min-h-12 rounded-xl px-4 text-base font-semibold disabled:opacity-50',
        VARIANTS[variant],
        className,
      ].join(' ')}
      {...rest}
    />
  )
}
