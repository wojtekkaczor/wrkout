import { useId, useState } from 'react'

type NumberStepperProps = {
  label: string
  value: number | undefined
  step: number
  unit?: string
  min?: number
  onChange: (value: number | undefined) => void
}

/** Accepts both `82.5` and `82,5`; empty or invalid text is "no value". */
export function parseDecimal(text: string): number | undefined {
  const normalized = text.trim().replace(',', '.')
  if (normalized === '') {
    return undefined
  }
  const value = Number(normalized)
  return Number.isFinite(value) ? value : undefined
}

function format(value: number | undefined): string {
  return value === undefined ? '' : String(value).replace('.', ',')
}

/**
 * A number with large − / + buttons and a field for typing. The buttons move
 * by `step` (the load increment for weights, 1 for reps).
 */
export function NumberStepper({ label, value, step, unit, min = 0, onChange }: NumberStepperProps) {
  const id = useId()
  // While the field has focus it shows exactly what was typed (e.g. "82,").
  const [draft, setDraft] = useState<string>()

  const nudge = (direction: 1 | -1) => {
    const next = Math.max(min, Math.round(((value ?? 0) + direction * step) * 100) / 100)
    setDraft(undefined)
    onChange(next)
  }

  const buttonClass = 'min-h-14 min-w-16 rounded-xl bg-surface-2 text-xl font-semibold'

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] text-muted">
        {label}
        {unit ? ` (${unit})` : ''}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label}: mniej`}
          onClick={() => nudge(-1)}
          className={buttonClass}
        >
          −
        </button>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={draft ?? format(value)}
          onFocus={(event) => event.target.select()}
          onChange={(event) => {
            setDraft(event.target.value)
            const parsed = parseDecimal(event.target.value)
            onChange(parsed === undefined ? undefined : Math.max(min, parsed))
          }}
          onBlur={() => setDraft(undefined)}
          className="tabular min-h-14 min-w-0 flex-1 rounded-xl border border-border bg-bg text-center text-[28px] font-semibold"
        />
        <button
          type="button"
          aria-label={`${label}: więcej`}
          onClick={() => nudge(1)}
          className={buttonClass}
        >
          +
        </button>
      </div>
    </div>
  )
}
