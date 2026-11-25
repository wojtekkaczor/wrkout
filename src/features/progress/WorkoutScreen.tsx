import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteWorkout } from '@/data'
import { Button, Card, Screen, describeSets, formatDayLong, formatNumber } from '@/ui'
import { TIER_LABELS } from './labels'
import { useProgressData } from './useProgressData'

/** One logged workout: every exercise with its sets. */
export function WorkoutScreen() {
  const { logId = '' } = useParams()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const data = useProgressData()
  const log = data.logs.find((entry) => entry.id === logId)
  const back = { to: '/postepy?widok=historia', label: 'Historia' }

  if (!data.ready) {
    return <Screen title="Trening" back={back}>{null}</Screen>
  }
  if (!log) {
    return (
      <Screen title="Trening" back={back}>
        <Card title="Nie znaleziono">
          <p className="text-muted">Tego treningu nie ma w historii.</p>
        </Card>
      </Screen>
    )
  }

  const { title, date, context, exercises, sessionRpe, note } = log.data
  const subtitle = [formatDayLong(date), context?.label].filter(Boolean).join(' · ')

  return (
    <Screen title={title} subtitle={subtitle} back={back}>
      {sessionRpe !== undefined || note ? (
        <Card title="Raport">
          {sessionRpe !== undefined ? (
            <p className="text-base">Wysiłek: {formatNumber(sessionRpe)} / 10</p>
          ) : null}
          {note ? <p className="text-muted">{note}</p> : null}
        </Card>
      ) : null}
      <Card>
        <ol className="-my-1 divide-y divide-border">
          {exercises.map((logged, index) => {
            const exercise = data.exercises.get(logged.exerciseId)
            const tier = logged.tier ?? exercise?.tier
            const details = [
              tier ? TIER_LABELS[tier] : undefined,
              logged.rir !== undefined ? `zapas ${logged.rir}` : undefined,
              logged.tempo ? `tempo ${logged.tempo}` : undefined,
              exercise?.unilateral ? 'na stronę' : undefined,
            ].filter(Boolean)
            return (
              <li key={`${logged.exerciseId}-${index}`}>
                <Link
                  to={`/postepy/cwiczenie/${encodeURIComponent(logged.exerciseId)}`}
                  className="block py-2"
                >
                  <span className="block text-base font-semibold">
                    {exercise?.name ?? 'Nieznane ćwiczenie'}
                  </span>
                  <span className="tabular block text-base">
                    {describeSets(logged.sets.filter((set) => set.done))}
                  </span>
                  <span className="block text-[13px] text-muted">{details.join(' · ')}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </Card>
      <Link
        to={`/trening/${encodeURIComponent(logId)}`}
        className="flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-base font-semibold"
      >
        Edytuj trening
      </Link>
      {confirmDelete ? (
        <Button
          variant="secondary"
          onClick={() => void deleteWorkout(logId).then(() => navigate('/postepy?widok=historia'))}
        >
          Tak, usuń trening
        </Button>
      ) : (
        <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
          Usuń trening
        </Button>
      )}
    </Screen>
  )
}
