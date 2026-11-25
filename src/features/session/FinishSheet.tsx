import { useState } from 'react'
import { Button, ChoiceChips, Sheet } from '@/ui'

type FinishSheetProps = {
  initialRpe?: number
  initialNote?: string
  onSave: (report: { sessionRpe?: number; note?: string }) => void
  onClose: () => void
}

const EFFORT = Array.from({ length: 10 }, (_, index) => ({
  value: index + 1,
  label: String(index + 1),
}))

/** Workout report: effort and an optional note. Both can be skipped. */
export function FinishSheet({ initialRpe, initialNote, onSave, onClose }: FinishSheetProps) {
  const [sessionRpe, setSessionRpe] = useState(initialRpe)
  const [note, setNote] = useState(initialNote ?? '')

  return (
    <Sheet title="Raport z treningu" onClose={onClose}>
      <div className="flex flex-col gap-2">
        <p className="text-[13px] text-muted">Jak ciężko było? (1 lekko, 10 maksymalnie)</p>
        <ChoiceChips label="Wysiłek" choices={EFFORT} value={sessionRpe} onChange={setSessionRpe} />
      </div>
      <label className="flex flex-col gap-1 text-[13px] text-muted">
        Notatka (opcjonalnie)
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-bg p-3 text-base text-text"
        />
      </label>
      <Button onClick={() => onSave({ sessionRpe, note: note.trim() || undefined })}>Zapisz</Button>
    </Sheet>
  )
}
