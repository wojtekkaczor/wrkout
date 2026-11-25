import { useMemo, useState } from 'react'
import { createExercise, useExercises } from '@/data'
import { MUSCLE_GROUPS, TIERS, type Exercise, type MuscleGroup, type Tier } from '@/domain'
import { Button, Segmented, Sheet } from '@/ui'
import { MUSCLE_LABELS, TIER_LABELS } from './labels'

type ExercisePickerProps = {
  title: string
  onPick: (exerciseId: string) => void
  onClose: () => void
}

const LOADS: { value: Exercise['load']; label: string }[] = [
  { value: 'external', label: 'Z ciężarem' },
  { value: 'bodyweight', label: 'Masa ciała' },
  { value: 'none', label: 'Bez obciążenia' },
]

const inputClass =
  'min-h-12 w-full rounded-xl border border-border bg-bg px-3 text-base placeholder:text-muted'

/** Choose an exercise from the list, or add a new one (FR-EDIT-8). */
export function ExercisePicker({ title, onPick, onClose }: ExercisePickerProps) {
  const exercises = useExercises()
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('pl')
    return (exercises ?? [])
      .filter((doc) => doc.data.name.toLocaleLowerCase('pl').includes(needle))
      .sort((a, b) => a.data.name.localeCompare(b.data.name, 'pl'))
  }, [exercises, query])

  if (creating) {
    return (
      <Sheet title="Nowe ćwiczenie" onClose={onClose}>
        <NewExerciseForm initialName={query.trim()} onCreated={onPick} />
      </Sheet>
    )
  }

  return (
    <Sheet title={title} onClose={onClose}>
      <input
        type="search"
        aria-label="Szukaj ćwiczenia"
        placeholder="Szukaj"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className={inputClass}
      />
      <ul className="-my-1 max-h-[45vh] divide-y divide-border overflow-y-auto">
        {matches.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() => onPick(doc.id)}
              className="block min-h-12 w-full py-2 text-left"
            >
              <span className="block text-base [overflow-wrap:anywhere]">{doc.data.name}</span>
              <span className="block text-[13px] text-muted">
                {[TIER_LABELS[doc.data.tier], doc.data.primary ? MUSCLE_LABELS[doc.data.primary] : undefined]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </button>
          </li>
        ))}
        {exercises && matches.length === 0 ? (
          <li className="py-3 text-muted">Brak ćwiczeń o takiej nazwie.</li>
        ) : null}
      </ul>
      <Button variant="secondary" onClick={() => setCreating(true)}>
        Nowe ćwiczenie
      </Button>
    </Sheet>
  )
}

function NewExerciseForm({
  initialName,
  onCreated,
}: {
  initialName: string
  onCreated: (exerciseId: string) => void
}) {
  const [name, setName] = useState(initialName)
  const [tier, setTier] = useState<Tier>('accessory')
  const [measure, setMeasure] = useState<Exercise['measure']>('reps')
  const [load, setLoad] = useState<Exercise['load']>('external')
  const [unilateral, setUnilateral] = useState(false)
  const [primary, setPrimary] = useState<MuscleGroup | ''>('')
  const [saving, setSaving] = useState(false)

  const create = async () => {
    setSaving(true)
    const exercise: Exercise = { name: name.trim(), tier, measure, load, unilateral, secondary: [] }
    if (primary) {
      exercise.primary = primary
    }
    onCreated(await createExercise(exercise))
  }

  return (
    <>
      <label className="flex flex-col gap-1 text-[13px] text-muted">
        Nazwa
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={`${inputClass} text-text`}
        />
      </label>
      <Segmented
        label="Rola w treningu"
        options={TIERS.map((value) => ({ value, label: TIER_LABELS[value] }))}
        value={tier}
        onChange={setTier}
      />
      <Segmented
        label="Sposób liczenia"
        options={[
          { value: 'reps', label: 'Powtórzenia' },
          { value: 'time', label: 'Czas' },
        ]}
        value={measure}
        onChange={setMeasure}
      />
      <Segmented label="Obciążenie" options={LOADS} value={load} onChange={setLoad} />
      <label className="flex flex-col gap-1 text-[13px] text-muted">
        Główna partia (do raportu serii)
        <select
          value={primary}
          onChange={(event) => setPrimary(event.target.value as MuscleGroup | '')}
          className={`${inputClass} text-text`}
        >
          <option value="">Nie liczy się do objętości</option>
          {MUSCLE_GROUPS.map((muscle) => (
            <option key={muscle} value={muscle}>
              {MUSCLE_LABELS[muscle]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-h-12 items-center gap-3 text-base">
        <input
          type="checkbox"
          checked={unilateral}
          onChange={(event) => setUnilateral(event.target.checked)}
          className="size-5 accent-[var(--accent)]"
        />
        Jednostronne (powtórzenia na stronę)
      </label>
      <Button disabled={saving || name.trim() === ''} onClick={() => void create()}>
        Dodaj ćwiczenie
      </Button>
    </>
  )
}
