import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { MUSCLE_GROUPS } from '@/domain'
import { addDays, paceSecPerKm, weekReport, weeksWithEntries, type WeekReport } from '@/engine'
import {
  Card,
  formatDayRange,
  formatDistance,
  formatDuration,
  formatKg,
  formatNumber,
  formatPace,
  formatWeight,
} from '@/ui'
import { MUSCLE_LABELS } from './labels'
import type { ProgressData } from './useProgressData'

function describeDelta(current: number, previous: number, unit = ''): string {
  const change = Math.round((current - previous) * 10) / 10
  if (change === 0) {
    return 'bez zmian'
  }
  return `${change > 0 ? '+' : '−'}${formatNumber(Math.abs(change))}${unit}`
}

function Stat({ value, label, delta }: { value: string; label: string; delta?: string }) {
  return (
    <div>
      <dd className="tabular text-xl font-semibold">{value}</dd>
      <dt className="text-[13px] text-muted">{label}</dt>
      {delta ? <p className="text-[13px] text-muted">{delta}</p> : null}
    </div>
  )
}

function MuscleSets({ report }: { report: WeekReport }) {
  const rows = MUSCLE_GROUPS.map((muscle) => ({ muscle, sets: report.setsByMuscle[muscle] ?? 0 }))
    .filter((row) => row.sets > 0)
    .sort((a, b) => b.sets - a.sets)
  const max = Math.max(...rows.map((row) => row.sets), 1)

  if (rows.length === 0) {
    return <p className="text-muted">Brak serii w tym tygodniu.</p>
  }
  return (
    <ul className="flex flex-col gap-2">
      {rows.map(({ muscle, sets }) => (
        <li key={muscle} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2 text-base">
          <span>{MUSCLE_LABELS[muscle]}</span>
          <span className="h-2 rounded-full bg-surface-2">
            <span
              className="block h-2 rounded-full bg-accent"
              style={{ width: `${(sets / max) * 100}%` }}
            />
          </span>
          <span className="tabular text-right">{formatNumber(sets)}</span>
        </li>
      ))}
    </ul>
  )
}

/** Weekly report computed on the device from the logs (FR-PROG-8). */
export function ReportsTab({ data }: { data: ProgressData }) {
  const weeks = useMemo(() => weeksWithEntries(data.logs, data.runs), [data.logs, data.runs])
  const [selected, setSelected] = useState<string>()
  const weekStart = selected && weeks.includes(selected) ? selected : weeks[0]

  const { report, previous } = useMemo(() => {
    if (!weekStart) {
      return { report: undefined, previous: undefined }
    }
    const input = { logs: data.logs, runs: data.runs, exercises: data.exercises }
    return {
      report: weekReport({ ...input, weekStart }),
      previous: weekReport({ ...input, weekStart: addDays(weekStart, -7) }),
    }
  }, [data.logs, data.runs, data.exercises, weekStart])

  if (!report || !previous || !weekStart) {
    return (
      <Card title="Brak danych">
        <p className="text-muted">Raport tygodnia pojawi się po pierwszym wpisanym treningu.</p>
      </Card>
    )
  }

  const index = weeks.indexOf(weekStart)
  const older = weeks[index + 1]
  const newer = index > 0 ? weeks[index - 1] : undefined
  const pace = paceSecPerKm(report.runDistanceM, report.runMovingSec)

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Starszy tydzień"
          disabled={!older}
          onClick={() => setSelected(older)}
          className="min-h-12 min-w-12 rounded-xl bg-surface-2 text-xl disabled:opacity-40"
        >
          ‹
        </button>
        <h2 className="text-base font-semibold">
          {formatDayRange(report.weekStart, report.weekEnd)}
        </h2>
        <button
          type="button"
          aria-label="Nowszy tydzień"
          disabled={!newer}
          onClick={() => setSelected(newer)}
          className="min-h-12 min-w-12 rounded-xl bg-surface-2 text-xl disabled:opacity-40"
        >
          ›
        </button>
      </div>

      <Card title="Siła">
        <dl className="grid grid-cols-2 gap-2 text-center">
          <Stat
            value={String(report.strengthSessions)}
            label="treningi"
            delta={describeDelta(report.strengthSessions, previous.strengthSessions)}
          />
          <Stat
            value={String(report.workSets)}
            label="serie robocze"
            delta={describeDelta(report.workSets, previous.workSets)}
          />
        </dl>
      </Card>

      <Card title="Serie na partię">
        <MuscleSets report={report} />
      </Card>

      <Card title="Bieganie">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat value={String(report.runs)} label="biegi" />
          <Stat
            value={formatDistance(report.runDistanceM)}
            label="dystans"
            delta={describeDelta(report.runDistanceM / 1000, previous.runDistanceM / 1000, ' km')}
          />
          <Stat value={pace ? formatPace(pace) : '–'} label="śr. tempo" />
        </dl>
        {report.otherCardioSec > 0 ? (
          <p className="mt-2 text-[13px] text-muted">
            Inne cardio: {formatDuration(report.otherCardioSec)}
          </p>
        ) : null}
      </Card>

      <Card title="Rekordy tygodnia">
        {report.records.length === 0 ? (
          <p className="text-muted">Bez nowych rekordów e1RM.</p>
        ) : (
          <ul className="-my-1 divide-y divide-border">
            {report.records.map((record) => (
              <li key={record.exerciseId}>
                <Link
                  to={`/postepy/cwiczenie/${encodeURIComponent(record.exerciseId)}`}
                  className="flex min-h-12 items-center justify-between gap-3 py-1"
                >
                  <span className="min-w-0 text-base [overflow-wrap:anywhere]">
                    {data.exercises.get(record.exerciseId)?.name ?? 'Ćwiczenie'}
                  </span>
                  <span className="tabular shrink-0 text-right text-base">
                    {formatWeight(record.weightKg)}×{record.reps}
                    <span className="text-muted">
                      {' '}
                      (+{formatKg(Math.round((record.value - record.previous) * 10) / 10)})
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p className="text-[13px] text-muted">Zmiany podane względem poprzedniego tygodnia.</p>
    </>
  )
}
