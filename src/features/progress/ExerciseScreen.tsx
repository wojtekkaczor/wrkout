import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import {
  exerciseHistory,
  exerciseRecords,
  metricSeries,
  progressMetric,
  type ProgressMetric,
} from '@/engine'
import {
  Card,
  LineChart,
  Screen,
  describeSets,
  formatDay,
  formatKg,
  formatNumber,
  formatWeight,
} from '@/ui'
import { MUSCLE_LABELS, TIER_LABELS } from './labels'
import { formatMetric } from './StrengthTab'
import { useProgressData } from './useProgressData'

const METRIC_TITLES: Record<ProgressMetric, string> = {
  e1rm: 'Szacowany maks (e1RM)',
  reps: 'Najlepsza seria (powtórzenia)',
  time: 'Najdłuższa seria',
}

export function ExerciseScreen() {
  const { exerciseId = '' } = useParams()
  const data = useProgressData()
  const exercise = data.exercises.get(exerciseId)

  const { history, records, metric, series } = useMemo(() => {
    const performances = exerciseHistory(data.logs, exerciseId)
    const chosen = progressMetric(performances)
    return {
      history: performances,
      records: exerciseRecords(performances),
      metric: chosen,
      series: chosen ? metricSeries(performances, chosen) : [],
    }
  }, [data.logs, exerciseId])

  const back = { to: '/postepy', label: 'Postępy' }

  if (!data.ready) {
    return <Screen title="Ćwiczenie" back={back}>{null}</Screen>
  }
  if (!exercise && history.length === 0) {
    return (
      <Screen title="Ćwiczenie" back={back}>
        <Card title="Nie znaleziono">
          <p className="text-muted">Tego ćwiczenia nie ma w historii.</p>
        </Card>
      </Screen>
    )
  }

  const traits = [
    exercise ? TIER_LABELS[exercise.tier] : undefined,
    exercise?.primary ? MUSCLE_LABELS[exercise.primary] : undefined,
    exercise?.unilateral ? 'na stronę' : undefined,
  ].filter(Boolean)

  return (
    <Screen title={exercise?.name ?? 'Ćwiczenie'} subtitle={traits.join(' · ')} back={back}>
      {metric && series.length > 1 ? (
        <Card title={METRIC_TITLES[metric]}>
          <LineChart
            points={series.map((point) => ({ label: formatDay(point.date), value: point.value }))}
            formatValue={(value) => formatMetric(metric, value)}
            description={`${METRIC_TITLES[metric]}: od ${formatMetric(metric, series[0]?.value ?? 0)} do ${formatMetric(metric, series.at(-1)?.value ?? 0)} w ${series.length} treningach`}
          />
        </Card>
      ) : null}

      <Card title="Rekordy">
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-base">
          {records.e1rm ? (
            <>
              <dt className="text-muted">Najlepszy e1RM</dt>
              <dd className="tabular text-right">
                {formatKg(Math.round(records.e1rm.value * 2) / 2)}
                <span className="text-muted">
                  {' '}
                  ({formatWeight(records.e1rm.weightKg)}×{records.e1rm.reps}, {formatDay(records.e1rm.date)})
                </span>
              </dd>
            </>
          ) : null}
          {records.heaviest ? (
            <>
              <dt className="text-muted">Największy ciężar</dt>
              <dd className="tabular text-right">
                {formatKg(records.heaviest.weightKg)}
                <span className="text-muted"> ({formatDay(records.heaviest.date)})</span>
              </dd>
            </>
          ) : null}
          {records.mostReps ? (
            <>
              <dt className="text-muted">Najwięcej powtórzeń</dt>
              <dd className="tabular text-right">
                {records.mostReps.reps}
                {records.mostReps.weightKg !== undefined
                  ? ` × ${formatKg(records.mostReps.weightKg)}`
                  : ''}
                <span className="text-muted"> ({formatDay(records.mostReps.date)})</span>
              </dd>
            </>
          ) : null}
          {records.longest ? (
            <>
              <dt className="text-muted">Najdłuższa seria</dt>
              <dd className="tabular text-right">
                {formatNumber(records.longest.durationSec)} s
                <span className="text-muted"> ({formatDay(records.longest.date)})</span>
              </dd>
            </>
          ) : null}
        </dl>
      </Card>

      <Card title={`Historia (${history.length})`}>
        <ul className="-my-1 divide-y divide-border">
          {[...history].reverse().map((entry) => (
            <li key={entry.logId}>
              <Link to={`/postepy/trening/${encodeURIComponent(entry.logId)}`} className="block py-2">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-muted">{formatDay(entry.date)}</span>
                  <span className="text-[13px] text-muted">
                    {[
                      entry.rir !== undefined ? `zapas ${entry.rir}` : undefined,
                      entry.tempo ? `tempo ${entry.tempo}` : undefined,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="tabular block text-base">{describeSets(entry.sets)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </Screen>
  )
}
