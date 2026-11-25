import { useState } from 'react'
import { updateSettings, useSettings } from '@/data'
import type { Settings } from '@/domain'
import { Card, Segmented, parseDecimal } from '@/ui'

type IncrementKind = keyof Settings['increments']

const INCREMENTS: { kind: IncrementKind; label: string }[] = [
  { kind: 'barbell', label: 'Sztanga' },
  { kind: 'dumbbell', label: 'Hantle' },
  { kind: 'machine', label: 'Maszyna' },
  { kind: 'bodyweight', label: 'Masa ciała' },
]

const WEEK_STARTS = [
  { value: '1', label: 'Poniedziałek' },
  { value: '7', label: 'Niedziela' },
] as const

function IncrementField({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (value: number) => void
}) {
  // Shows what is being typed; the value is saved when the field loses focus.
  const [draft, setDraft] = useState<string>()

  return (
    <label className="flex flex-col gap-1 text-[13px] text-muted">
      {label}
      <input
        inputMode="decimal"
        autoComplete="off"
        value={draft ?? String(value).replace('.', ',')}
        onFocus={(event) => event.target.select()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          const parsed = draft === undefined ? undefined : parseDecimal(draft)
          if (parsed !== undefined && parsed > 0 && parsed <= 50) {
            onCommit(parsed)
          }
          setDraft(undefined)
        }}
        className="tabular min-h-12 w-full rounded-xl border border-border bg-bg px-2 text-center text-base text-text"
      />
    </label>
  )
}

/** Week start and the load steps used by the − / + buttons (FR-SYS-4). */
export function TrainingSettingsCard() {
  const settings = useSettings()
  if (!settings) {
    return null
  }

  return (
    <Card title="Trening">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-muted">Początek tygodnia w raportach</p>
          <Segmented
            label="Początek tygodnia"
            options={[...WEEK_STARTS]}
            value={settings.weekStart === 7 ? '7' : '1'}
            onChange={(value) => void updateSettings({ weekStart: value === '7' ? 7 : 1 })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-muted">
            Skok ciężaru w kilogramach: o tyle zmieniają ciężar przyciski − i +
          </p>
          <div className="grid grid-cols-4 gap-2">
            {INCREMENTS.map(({ kind, label }) => (
              <IncrementField
                key={kind}
                label={label}
                value={settings.increments[kind]}
                onCommit={(value) =>
                  void updateSettings({ increments: { ...settings.increments, [kind]: value } })
                }
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
