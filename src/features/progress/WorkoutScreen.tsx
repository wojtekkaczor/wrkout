import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteWorkout } from '@/data'
import { workoutRecords, type WorkoutRecord } from '@/engine'
import {
  Button,
  Card,
  Screen,
  describeSets,
  formatDayLong,
  formatKg,
  formatNumber,
  formatWeight,
} from '@/ui'
import { TIER_LABELS } from './labels'
import { useProgressData } from './useProgressData'

function describeRecord(record: WorkoutRecord): string {
  const gain = Math.round((record.value - record.previous) * 10) / 10
  if (record.metric === 'e1rm' && record.weightKg !== undefined) {
    const max = formatKg(Math.round(record.value * 2) / 2)
    return `${formatWeight(record.weightKg)}×${record.reps} · e1RM ${max} (+${formatNumber(gain)} kg)`
  }
  return record.metric === 'time'
    ? `${formatNumber(record.value)} s (+${formatNumber(gain)} s)`
    : `${formatNumber(record.value)} powt. (+${formatNumber(gain)})`
}

/** One logged workout: every exercise with its sets. */
export function WorkoutScreen() {
  const { logId = '' } = useParams()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const data = useProgressData()
  const records = useMemo(() => workoutRecords(data.logs, logId), [data.logs, logId])
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
      {records.length > 0 ? (
        <Card title="Rekordy w tym treningu">
          <ul className="flex flex-col gap-2">
            {records.map((record) => (
              <li key={record.exerciseId}>
                <span className="block text-base font-semibold [overflow-wrap:anywhere]">
                  {data.exercises.get(record.exerciseId)?.name ?? 'Ćwiczenie'}
                </span>
                <span className="tabular block text-base">{describeRecord(record)}</span>
              </li>
            ))}
          </ul>
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
