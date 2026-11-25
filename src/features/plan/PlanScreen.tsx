import { useState } from 'react'
import { Link } from 'react-router'
import { STARTER_SETS } from '@/catalog'
import { addStarterSet, useWorkoutTemplates } from '@/data'
import { Button, Card, EXERCISES_FORMS, SETS_FORMS, Screen, Sheet, plural } from '@/ui'

const SESSIONS_FORMS = ['trening', 'treningi', 'treningów'] as const

/** "Moje treningi": the sessions the user picks from when logging (FR-PLAN-10). */
export function PlanScreen() {
  const templates = useWorkoutTemplates()
  const [choosing, setChoosing] = useState(false)
  const [adding, setAdding] = useState(false)
  const sorted = [...(templates ?? [])].sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name, 'pl'),
  )

  const add = async (setId: string) => {
    setAdding(true)
    try {
      await addStarterSet(setId)
      setChoosing(false)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Screen title="Moje treningi" subtitle="Sesje, z których wybierasz trening do wpisania">
      {templates && sorted.length === 0 ? (
        <Card title="Brak treningów">
          <p className="text-muted">
            Ułóż własny trening albo zacznij od gotowego zestawu. Potem wybierzesz trening jednym
            dotknięciem na ekranie Dziś, a serie wypełnią się wynikami z poprzedniego razu.
          </p>
        </Card>
      ) : null}
      {sorted.length > 0 ? (
        <Card>
          <ul className="-my-1 divide-y divide-border">
            {sorted.map((template) => {
              const sets = template.data.slots.reduce((total, slot) => total + slot.sets, 0)
              return (
                <li key={template.id}>
                  <Link
                    to={`/plan/trening/${encodeURIComponent(template.id)}`}
                    className="flex min-h-14 items-center justify-between gap-3 py-2"
                  >
                    <span className="text-base font-semibold">{template.data.name}</span>
                    <span className="tabular shrink-0 text-[13px] text-muted">
                      {plural(template.data.slots.length, EXERCISES_FORMS)} ·{' '}
                      {plural(sets, SETS_FORMS)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : null}
      <Link
        to="/plan/trening/nowy"
        className="flex min-h-12 items-center justify-center rounded-xl bg-accent px-4 text-base font-semibold text-accent-contrast"
      >
        Nowy trening
      </Link>
      <Button variant="secondary" onClick={() => setChoosing(true)}>
        Dodaj gotowy zestaw
      </Button>

      {choosing ? (
        <Sheet title="Gotowe zestawy treningów" onClose={() => setChoosing(false)}>
          <p className="text-[13px] text-muted">
            Zestaw dodaje treningi do listy. Każdy możesz potem zmienić albo usunąć.
          </p>
          <ul className="flex flex-col gap-2">
            {STARTER_SETS.map((set) => {
              const exercises = set.sessions.reduce((total, session) => total + session.slots.length, 0)
              return (
                <li key={set.id}>
                  <button
                    type="button"
                    disabled={adding}
                    onClick={() => void add(set.id)}
                    className="block min-h-14 w-full rounded-xl border border-border bg-surface-2 px-4 py-2 text-left disabled:opacity-50"
                  >
                    <span className="block text-base font-semibold">{set.name}</span>
                    <span className="block text-[13px] text-muted">
                      {set.description} · {plural(set.sessions.length, SESSIONS_FORMS)} ·{' '}
                      {plural(exercises, EXERCISES_FORMS)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Sheet>
      ) : null}
    </Screen>
  )
}
