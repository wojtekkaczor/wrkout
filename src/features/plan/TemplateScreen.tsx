import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  deleteTemplate,
  saveTemplate,
  useExercises,
  useWorkoutTemplate,
  useWorkoutTemplates,
} from '@/data'
import { uuidv7, type Slot, type WorkoutTemplate } from '@/domain'
import { ExercisePicker } from '@/features/exercises/ExercisePicker'
import { Button, Card, Screen } from '@/ui'

const back = { to: '/plan', label: 'Moje treningi' }
const inputClass = 'min-h-12 w-full rounded-xl border border-border bg-bg px-3 text-base text-text'
const smallInput = `${inputClass} tabular text-center`
const labelClass = 'flex flex-col gap-1 text-[13px] text-muted'
const iconButton = 'min-h-12 min-w-12 rounded-xl bg-surface-2 text-base disabled:opacity-40'

function clampInt(text: string, min: number, max: number, fallback: number): number {
  const value = Number.parseInt(text, 10)
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

/** Create or edit one of "Moje treningi": its exercises, sets, reps, tempo. */
export function TemplateScreen() {
  const { templateId } = useParams()
  const loaded = useWorkoutTemplate(templateId)
  const templates = useWorkoutTemplates()

  if (!templates || (templateId && !loaded)) {
    return <Screen title="Trening" back={back}>{null}</Screen>
  }
  if (templateId && !loaded?.doc) {
    return (
      <Screen title="Trening" back={back}>
        <Card title="Nie znaleziono">
          <p className="text-muted">Tego treningu nie ma na liście.</p>
        </Card>
      </Screen>
    )
  }
  const nextOrder = templates.reduce((highest, doc) => Math.max(highest, doc.data.order + 1), 0)
  return (
    <TemplateEditor
      key={templateId ?? 'new'}
      templateId={templateId}
      initial={loaded?.doc?.data ?? { name: '', order: nextOrder, slots: [] }}
    />
  )
}

function TemplateEditor({ templateId, initial }: { templateId?: string; initial: WorkoutTemplate }) {
  const navigate = useNavigate()
  const exerciseDocs = useExercises()
  const [name, setName] = useState(initial.name)
  const [slots, setSlots] = useState<Slot[]>(initial.slots)
  const [picking, setPicking] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string>()

  const nameOf = (exerciseId: string) =>
    exerciseDocs?.find((doc) => doc.id === exerciseId)?.data.name ?? 'Nieznane ćwiczenie'
  const timed = (exerciseId: string) =>
    exerciseDocs?.find((doc) => doc.id === exerciseId)?.data.measure === 'time'

  const update = (index: number, patch: Partial<Slot>) =>
    setSlots((current) =>
      current.map((slot, position) => (position === index ? { ...slot, ...patch } : slot)),
    )
  const move = (index: number, direction: -1 | 1) =>
    setSlots((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) {
        return current
      }
      const next = [...current]
      const [moved] = next.splice(index, 1)
      if (moved) {
        next.splice(target, 0, moved)
      }
      return next
    })

  const save = async () => {
    if (name.trim() === '') {
      setError('Nadaj treningowi nazwę.')
      return
    }
    const normalized = slots.map((slot) => {
      const low = Math.min(slot.range[0], slot.range[1])
      const high = Math.max(slot.range[0], slot.range[1])
      const { tempo, ...rest } = slot
      const cleanTempo = tempo?.trim().toLowerCase()
      const next: Slot = { ...rest, range: [low, high] }
      if (cleanTempo && /^[0-9x]{4}$/.test(cleanTempo)) {
        next.tempo = cleanTempo
      }
      return next
    })
    await saveTemplate(templateId, { ...initial, name: name.trim(), slots: normalized })
    navigate('/plan')
  }

  return (
    <Screen title={templateId ? 'Edycja treningu' : 'Nowy trening'} back={back}>
      <label className={labelClass}>
        Nazwa
        <input
          value={name}
          placeholder="np. Trening 1"
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
        />
      </label>

      {slots.map((slot, index) => {
        const exerciseName = nameOf(slot.exerciseId)
        return (
          <section
            key={slot.id}
            aria-label={exerciseName}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <h2 className="text-base font-semibold [overflow-wrap:anywhere]">{exerciseName}</h2>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <label className={labelClass}>
                Serie
                <input
                  inputMode="numeric"
                  value={slot.sets}
                  onFocus={(event) => event.target.select()}
                  onChange={(event) =>
                    update(index, { sets: clampInt(event.target.value, 1, 10, slot.sets) })
                  }
                  className={smallInput}
                />
              </label>
              <label className={labelClass}>
                {timed(slot.exerciseId) ? 'Sek. od' : 'Powt. od'}
                <input
                  inputMode="numeric"
                  value={slot.range[0]}
                  onFocus={(event) => event.target.select()}
                  onChange={(event) =>
                    update(index, {
                      range: [clampInt(event.target.value, 1, 600, slot.range[0]), slot.range[1]],
                    })
                  }
                  className={smallInput}
                />
              </label>
              <label className={labelClass}>
                do
                <input
                  inputMode="numeric"
                  value={slot.range[1]}
                  onFocus={(event) => event.target.select()}
                  onChange={(event) =>
                    update(index, {
                      range: [slot.range[0], clampInt(event.target.value, 1, 600, slot.range[1])],
                    })
                  }
                  className={smallInput}
                />
              </label>
              <label className={labelClass}>
                Tempo
                <input
                  autoComplete="off"
                  maxLength={4}
                  placeholder="3010"
                  value={slot.tempo ?? ''}
                  onChange={(event) => update(index, { tempo: event.target.value })}
                  className={smallInput}
                />
              </label>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                aria-label={`Wyżej: ${exerciseName}`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className={iconButton}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Niżej: ${exerciseName}`}
                disabled={index === slots.length - 1}
                onClick={() => move(index, 1)}
                className={iconButton}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => setSlots((current) => current.filter((_, position) => position !== index))}
                className={`${iconButton} flex-1 text-danger`}
              >
                Usuń ćwiczenie
              </button>
            </div>
          </section>
        )
      })}

      <Button variant="secondary" onClick={() => setPicking(true)}>
        Dodaj ćwiczenie
      </Button>
      {error ? (
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
      ) : null}
      <Button onClick={() => void save()}>Zapisz trening</Button>
      {templateId ? (
        confirmDelete ? (
          <Button
            variant="secondary"
            onClick={() => void deleteTemplate(templateId).then(() => navigate('/plan'))}
          >
            Tak, usuń trening z listy
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
            Usuń trening z listy
          </Button>
        )
      ) : null}
      {templateId ? (
        <p className="text-[13px] text-muted">
          Usunięcie z listy nie kasuje wpisanych już treningów; historia zostaje.
        </p>
      ) : null}

      {picking ? (
        <ExercisePicker
          title="Dodaj ćwiczenie"
          onPick={(exerciseId) => {
            const isTimed = timed(exerciseId)
            setSlots((current) => [
              ...current,
              {
                id: uuidv7(Date.now()),
                exerciseId,
                sets: 3,
                range: isTimed ? [30, 30] : [8, 12],
              },
            ])
            setPicking(false)
          }}
          onClose={() => setPicking(false)}
        />
      ) : null}
    </Screen>
  )
}
