import { useState } from 'react'
import { saveExercisePrefs } from '@/data'
import type { ExercisePrefs } from '@/domain'
import { Button, Sheet, parseDecimal } from '@/ui'

type ExercisePrefsSheetProps = {
  exerciseId: string
  exerciseName: string
  timed: boolean
  prefs: ExercisePrefs | undefined
  /** The step used when this exercise has none of its own, shown as a hint. */
  defaultIncrement: number
  onClose: () => void
}

const inputClass =
  'tabular min-h-12 w-full rounded-xl border border-border bg-bg px-3 text-base text-text placeholder:text-muted'
const labelClass = 'flex flex-col gap-1 text-[13px] text-muted'

function parseCount(text: string): number | undefined {
  const value = Number.parseInt(text, 10)
  return Number.isFinite(value) && value >= 1 ? value : undefined
}

/** Note and personal settings for one exercise (FR-STR-18, FR-EDIT-9). */
export function ExercisePrefsSheet({
  exerciseId,
  exerciseName,
  timed,
  prefs,
  defaultIncrement,
  onClose,
}: ExercisePrefsSheetProps) {
  const [note, setNote] = useState(prefs?.note ?? '')
  const [increment, setIncrement] = useState(
    prefs?.increment === undefined ? '' : String(prefs.increment).replace('.', ','),
  )
  const [low, setLow] = useState(prefs?.range ? String(prefs.range[0]) : '')
  const [high, setHigh] = useState(prefs?.range ? String(prefs.range[1]) : '')

  const save = async () => {
    const step = parseDecimal(increment)
    const from = parseCount(low)
    const to = parseCount(high)
    await saveExercisePrefs(exerciseId, {
      note,
      increment: step !== undefined && step > 0 && step <= 50 ? step : undefined,
      range: from !== undefined && to !== undefined ? [Math.min(from, to), Math.max(from, to)] : undefined,
    })
    onClose()
  }

  return (
    <Sheet title={`${exerciseName} · notatka i ustawienia`} onClose={onClose}>
      <label className={labelClass}>
        Notatka (widoczna przy każdym treningu)
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="np. siedzisko 4, uchwyt neutralny"
          className="w-full rounded-xl border border-border bg-bg p-3 text-base text-text placeholder:text-muted"
        />
      </label>
      <label className={labelClass}>
        Skok ciężaru (kg)
        <input
          inputMode="decimal"
          autoComplete="off"
          value={increment}
          placeholder={`domyślnie ${String(defaultIncrement).replace('.', ',')}`}
          onChange={(event) => setIncrement(event.target.value)}
          className={inputClass}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className={labelClass}>
          {timed ? 'Zwykle sekund od' : 'Zwykle powtórzeń od'}
          <input
            inputMode="numeric"
            autoComplete="off"
            value={low}
            onChange={(event) => setLow(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          do
          <input
            inputMode="numeric"
            autoComplete="off"
            value={high}
            onChange={(event) => setHigh(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <Button onClick={() => void save()}>Zapisz</Button>
    </Sheet>
  )
}
