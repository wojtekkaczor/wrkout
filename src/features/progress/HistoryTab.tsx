import { useMemo } from 'react'
import { Link } from 'react-router'
import type { Doc, RunLog, WorkoutLog } from '@/domain'
import { Card, formatDay } from '@/ui'
import { RunEntry } from './RunningTab'
import type { ProgressData } from './useProgressData'

type Entry =
  | { kind: 'workout'; date: string; id: string; log: Doc<WorkoutLog> }
  | { kind: 'run'; date: string; id: string; run: Doc<RunLog> }

function countSets(log: WorkoutLog): number {
  return log.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.done).length,
    0,
  )
}

/** Everything that was logged, newest first. */
export function HistoryTab({ data }: { data: ProgressData }) {
  const entries = useMemo(() => {
    const all: Entry[] = [
      ...data.logs.map((log) => ({ kind: 'workout' as const, date: log.data.date, id: log.id, log })),
      ...data.runs.map((run) => ({ kind: 'run' as const, date: run.data.date, id: run.id, run })),
    ]
    return all.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  }, [data.logs, data.runs])

  if (entries.length === 0) {
    return (
      <Card title="Brak wpisów">
        <p className="text-muted">Tu pojawi się lista treningów i biegów.</p>
      </Card>
    )
  }

  return (
    <Card title={`Wpisy (${entries.length})`}>
      <ul className="-my-1 divide-y divide-border">
        {entries.map((entry) =>
          entry.kind === 'run' ? (
            <li key={entry.id}>
              <RunEntry run={entry.run} />
            </li>
          ) : (
            <li key={entry.id}>
              <Link
                to={`/postepy/trening/${encodeURIComponent(entry.id)}`}
                className="block min-h-12 py-2"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-semibold">{entry.log.data.title}</span>
                  <span className="shrink-0 text-[13px] text-muted">{formatDay(entry.date)}</span>
                </span>
                <span className="block text-[13px] text-muted">
                  {[
                    entry.log.data.context?.label,
                    `${entry.log.data.exercises.length} ćwiczeń`,
                    `${countSets(entry.log.data)} serii`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </Link>
            </li>
          ),
        )}
      </ul>
    </Card>
  )
}
