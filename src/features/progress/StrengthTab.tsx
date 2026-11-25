import { useMemo } from 'react'
import { Link } from 'react-router'
import { TIERS, type Tier } from '@/domain'
import { summarizeExercises, type ExerciseSummary, type ProgressMetric } from '@/engine'
import { Card, formatDay, formatKg, formatNumber } from '@/ui'
import { TIER_LABELS } from './labels'
import type { ProgressData } from './useProgressData'

export function formatMetric(metric: ProgressMetric, value: number): string {
  if (metric === 'e1rm') {
    return formatKg(Math.round(value * 2) / 2)
  }
  return metric === 'time' ? `${formatNumber(value)} s` : `${formatNumber(value)} powt.`
}

function describeChange(summary: ExerciseSummary): string | undefined {
  const { metric, first, latest } = summary
  if (!metric || first === undefined || latest === undefined || summary.history.length < 2) {
    return undefined
  }
  const change = metric === 'e1rm' ? Math.round((latest - first) * 2) / 2 : latest - first
  if (change === 0) {
    return 'bez zmian'
  }
  const unit = metric === 'e1rm' ? ' kg' : metric === 'time' ? ' s' : ''
  return `${change > 0 ? '+' : '−'}${formatNumber(Math.abs(change))}${unit} od początku`
}

type Row = { id: string; name: string; summary: ExerciseSummary }

export function StrengthTab({ data }: { data: ProgressData }) {
  const groups = useMemo(() => {
    const summaries = summarizeExercises(data.logs)
    const byTier = new Map<Tier, Row[]>()
    for (const [id, summary] of summaries) {
      const exercise = data.exercises.get(id)
      const tier = exercise?.tier ?? 'accessory'
      const rows = byTier.get(tier) ?? []
      rows.push({ id, name: exercise?.name ?? 'Nieznane ćwiczenie', summary })
      byTier.set(tier, rows)
    }
    for (const rows of byTier.values()) {
      rows.sort(
        (a, b) =>
          (b.summary.history.at(-1)?.date ?? '').localeCompare(a.summary.history.at(-1)?.date ?? '') ||
          a.name.localeCompare(b.name, 'pl'),
      )
    }
    return TIERS.map((tier) => ({ tier, rows: byTier.get(tier) ?? [] })).filter(
      (group) => group.rows.length > 0,
    )
  }, [data.logs, data.exercises])

  if (groups.length === 0) {
    return (
      <Card title="Brak treningów siłowych">
        <p className="text-muted">Wykresy pojawią się po wpisaniu albo zaimportowaniu treningów.</p>
      </Card>
    )
  }

  return (
    <>
      {groups.map(({ tier, rows }) => (
        <Card key={tier} title={TIER_LABELS[tier]}>
          <ul className="-my-1 divide-y divide-border">
            {rows.map(({ id, name, summary }) => {
              const last = summary.history.at(-1)
              const change = describeChange(summary)
              return (
                <li key={id}>
                  <Link
                    to={`/postepy/cwiczenie/${encodeURIComponent(id)}`}
                    className="flex min-h-14 items-center justify-between gap-3 py-2"
                  >
                    <span className="min-w-0">
                      <span className="block text-base [overflow-wrap:anywhere]">{name}</span>
                      <span className="block text-[13px] text-muted">
                        {summary.history.length} × · ostatnio {last ? formatDay(last.date) : '–'}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      {summary.metric && summary.latest !== undefined ? (
                        <span className="tabular block text-base font-semibold">
                          {formatMetric(summary.metric, summary.latest)}
                        </span>
                      ) : null}
                      {change ? <span className="block text-[13px] text-muted">{change}</span> : null}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      ))}
      <p className="text-[13px] text-muted">
        Dla ćwiczeń z ciężarem pokazany jest szacowany maks na jedno powtórzenie (e1RM), liczony z
        faktycznie wykonanych serii.
      </p>
    </>
  )
}
