type Option<T extends string> = {
  value: T
  label: string
}

type SegmentedProps<T extends string> = {
  label: string
  options: Option<T>[]
  value: T | undefined
  onChange: (value: T) => void
}

/** Single-choice control for a handful of options, e.g. the theme. */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl bg-surface-2 p-1">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={[
              'min-h-12 flex-1 rounded-lg px-2 text-base',
              selected ? 'bg-accent font-semibold text-accent-contrast' : 'text-muted',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
