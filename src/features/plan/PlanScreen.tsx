import { Link } from 'react-router'
import { useWorkoutTemplates } from '@/data'
import { Card, EXERCISES_FORMS, SETS_FORMS, Screen, plural } from '@/ui'

/** "Moje treningi": the sessions the user picks from when logging (FR-PLAN-10). */
export function PlanScreen() {
  const templates = useWorkoutTemplates()
  const sorted = [...(templates ?? [])].sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name, 'pl'),
  )

  return (
    <Screen title="Moje treningi" subtitle="Sesje, z których wybierasz trening do wpisania">
      {templates && sorted.length === 0 ? (
        <Card title="Brak treningów">
          <p className="text-muted">
            Dodaj trening i ułóż w nim ćwiczenia. Potem wybierzesz go jednym dotknięciem na
            ekranie Dziś, a serie wypełnią się wynikami z poprzedniego razu.
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
    </Screen>
  )
}
