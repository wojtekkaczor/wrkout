type Choice<T> = {
  value: T
  label: string
}

type ChoiceChipsProps<T> = {
  label: string
  choices: Choice<T>[]
  value: T | undefined
  /** Tapping the selected chip again clears it when allowed. */
  onChange: (value: T | undefined) => void
  clearable?: boolean
}

/** One-tap choice from a short list, e.g. reps in reserve or effort. */
export function ChoiceChips<T extends string | number>({
  label,
  choices,
  value,
  onChange,
  clearable = true,
}: ChoiceChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {choices.map((choice) => {
        const selected = choice.value === value
        return (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected && clearable ? undefined : choice.value)}
            className={[
              'tabular min-h-12 min-w-12 rounded-xl px-3 text-base',
              selected
                ? 'bg-accent font-semibold text-accent-contrast'
                : 'border border-border bg-surface-2 text-text',
            ].join(' ')}
          >
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}
