import { useMemo } from 'react'
import { Link } from 'react-router'
import { useSettings } from '@/data'
import type { Doc, RunLog } from '@/domain'
import { paceSecPerKm, weeklyRunTotals } from '@/engine'
import {
  BarChart,
  Card,
  formatDay,
  formatDistance,
  formatDuration,
  formatNumber,
  formatPace,
} from '@/ui'
import { runTitle } from './labels'
import type { ProgressData } from './useProgressData'

export function RunSummaryLine({ run }: { run: RunLog }) {
  const pace = run.sport === 'run' ? paceSecPerKm(run.distanceM, run.movingSec) : undefined
  const parts = [
    run.distanceM ? formatDistance(run.distanceM) : undefined,
    run.movingSec ? formatDuration(run.movingSec) : undefined,
    pace ? formatPace(pace) : undefined,
    run.avgHr ? `tętno ${formatNumber(run.avgHr, 0)}` : undefined,
    run.rpe !== undefined ? `RPE ${formatNumber(run.rpe)}` : undefined,
  ].filter(Boolean)
  return <span className="tabular block text-base">{parts.length > 0 ? parts.join(' · ') : '–'}</span>
}

export function RunEntry({ run }: { run: Doc<RunLog> }) {
  const { data } = run
  return (
    <div className="py-2">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-base font-semibold">{runTitle(data)}</span>
        <span className="shrink-0 text-[13px] text-muted">{formatDay(data.date)}</span>
      </span>
      <RunSummaryLine run={data} />
      {data.planned ? <p className="text-[13px] text-muted">Plan: {data.planned}</p> : null}
      {data.note ? <p className="text-[13px] text-muted">Notatka: {data.note}</p> : null}
      <span className="flex gap-4">
        <Link
          to={`/bieg/${encodeURIComponent(run.id)}`}
          className="inline-flex min-h-12 items-center text-[13px] text-accent"
        >
          Edytuj
        </Link>
        {data.url ? (
          <a
            href={data.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center text-[13px] text-accent"
          >
            Otwórz aktywność
          </a>
        ) : null}
      </span>
    </div>
  )
}

export function RunningTab({ data }: { data: ProgressData }) {
  const firstWeekday = useSettings()?.weekStart ?? 1
  const { weeks, sorted, totals } = useMemo(() => {
    const runsOnly = data.runs.filter((run) => run.data.sport === 'run')
    const distanceM = runsOnly.reduce((sum, run) => sum + (run.data.distanceM ?? 0), 0)
    const timed = runsOnly.filter((run) => run.data.distanceM && run.data.movingSec)
    const timedDistance = timed.reduce((sum, run) => sum + (run.data.distanceM ?? 0), 0)
    const timedSeconds = timed.reduce((sum, run) => sum + (run.data.movingSec ?? 0), 0)
    return {
      weeks: weeklyRunTotals(data.runs, firstWeekday),
      sorted: [...data.runs].sort(
        (a, b) => b.data.date.localeCompare(a.data.date) || b.id.localeCompare(a.id),
      ),
      totals: {
        runs: runsOnly.length,
        distanceM,
        averagePace: paceSecPerKm(timedDistance, timedSeconds),
      },
    }
  }, [data.runs, firstWeekday])

  if (sorted.length === 0) {
    return (
      <Card title="Brak biegów">
        <p className="text-muted">Kilometraż pojawi się po wpisaniu albo zaimportowaniu biegów.</p>
      </Card>
    )
  }

  return (
    <>
      <Card title="Łącznie">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div>
            <dd className="tabular text-xl font-semibold">{totals.runs}</dd>
            <dt className="text-[13px] text-muted">biegów</dt>
          </div>
          <div>
            <dd className="tabular text-xl font-semibold">{formatNumber(totals.distanceM / 1000, 0)}</dd>
            <dt className="text-[13px] text-muted">km</dt>
          </div>
          <div>
            <dd className="tabular text-xl font-semibold">
              {totals.averagePace ? formatDuration(totals.averagePace) : '–'}
            </dd>
            <dt className="text-[13px] text-muted">śr. tempo /km</dt>
          </div>
        </dl>
      </Card>

      {weeks.length > 1 ? (
        <Card title="Kilometry w tygodniu">
          <BarChart
            points={weeks.map((week) => ({
              label: formatDay(week.weekStart),
              value: Math.round(week.distanceM / 100) / 10,
            }))}
            description={`Kilometraż tygodniowy w ${weeks.length} tygodniach`}
          />
        </Card>
      ) : null}

      <Card title={`Aktywności (${sorted.length})`}>
        <ul className="-my-1 divide-y divide-border">
          {sorted.map((run) => (
            <li key={run.id}>
              <RunEntry run={run} />
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
