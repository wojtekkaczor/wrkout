import { useState } from 'react'
import type { LoggedSet } from '@/domain'
import { Button, NumberStepper, Sheet } from '@/ui'

type SetSheetProps = {
  exerciseName: string
  setNumber: number
  set: LoggedSet
  /** Load increment for this exercise, in kilograms. */
  weightStep: number
  timed: boolean
  unilateral: boolean
  onSave: (set: LoggedSet, carryWeight: boolean) => void
  onDelete: () => void
  onClose: () => void
}

/** Edits one set; saving also marks it as done (docs/04-ux-ui.md §3.4). */
export function SetSheet({
  exerciseName,
  setNumber,
  set,
  weightStep,
  timed,
  unilateral,
  onSave,
  onDelete,
  onClose,
}: SetSheetProps) {
  const [weightKg, setWeightKg] = useState(set.weightKg)
  const [amount, setAmount] = useState(timed ? set.durationSec : set.reps)
  const [carryWeight, setCarryWeight] = useState(true)

  const save = () => {
    const { weightKg: _weight, reps: _reps, durationSec: _duration, ...rest } = set
    const edited: LoggedSet = { ...rest }
    if (weightKg !== undefined && weightKg !== 0) {
      edited.weightKg = weightKg
    }
    if (amount !== undefined) {
      if (timed) {
        edited.durationSec = amount
      } else {
        edited.reps = Math.round(amount)
      }
    }
    onSave(edited, carryWeight)
  }

  const amountLabel = timed ? 'Czas' : 'Powtórzenia'

  return (
    <Sheet title={`${exerciseName} · seria ${setNumber}`} onClose={onClose}>
      <NumberStepper
        label="Ciężar"
        unit="kg"
        value={weightKg}
        step={weightStep}
        onChange={setWeightKg}
      />
      <NumberStepper
        label={unilateral ? `${amountLabel} na stronę` : amountLabel}
        unit={timed ? 's' : undefined}
        value={amount}
        step={timed ? 5 : 1}
        onChange={setAmount}
      />
      <label className="flex min-h-12 items-center gap-3 text-base">
        <input
          type="checkbox"
          checked={carryWeight}
          onChange={(event) => setCarryWeight(event.target.checked)}
          className="size-5 accent-[var(--accent)]"
        />
        Ten ciężar w kolejnych seriach
      </label>
      <Button onClick={save}>Zapisz ✓</Button>
      <Button variant="secondary" onClick={onDelete}>
        Usuń serię
      </Button>
    </Sheet>
  )
}
