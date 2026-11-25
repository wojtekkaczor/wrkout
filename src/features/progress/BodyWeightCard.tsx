import { useState } from 'react'
import { deleteBodyWeight, saveBodyWeight, today, useBodyMetrics } from '@/data'
import type { BodyMetric } from '@/domain'
import { Button, Card, LineChart, NumberStepper, Sheet, formatDay, formatKg, formatNumber } from '@/ui'

function describeChange(metrics: BodyMetric[]): string | undefined {
  const first = metrics[0]
  const latest = metrics.at(-1)
  if (!first || !latest || metrics.length < 2) {
    return undefined
  }
  const change = Math.round((latest.weightKg - first.weightKg) * 10) / 10
  if (change === 0) {
    return `bez zmian od ${formatDay(first.date)}`
  }
  return `${change > 0 ? '+' : '−'}${formatNumber(Math.abs(change))} kg od ${formatDay(first.date)}`
}

/** Optional body weight tracking with a trend (FR-RDY-6). */
export function BodyWeightCard() {
  const metrics = useBodyMetrics()
  const [open, setOpen] = useState(false)

  if (!metrics) {
    return null
  }
  const latest = metrics.at(-1)
  const change = describeChange(metrics)

  return (
    <Card title="Waga ciała">
      {latest ? (
        <p className="tabular text-xl font-semibold">
          {formatKg(latest.weightKg)}{' '}
          <span className="text-[13px] font-normal text-muted">
            {formatDay(latest.date)}
            {change ? ` · ${change}` : ''}
          </span>
        </p>
      ) : (
        <p className="text-muted">Brak pomiarów. Waga jest opcjonalna.</p>
      )}
      {metrics.length > 1 ? (
        <LineChart
          points={metrics.map((metric) => ({ label: formatDay(metric.date), value: metric.weightKg }))}
          formatValue={formatKg}
          description={`Waga ciała w ${metrics.length} pomiarach, ostatnio ${formatKg(latest?.weightKg ?? 0)}`}
        />
      ) : null}
      <Button variant="secondary" className="mt-3 w-full" onClick={() => setOpen(true)}>
        Dodaj pomiar wagi
      </Button>
      {open ? <BodyWeightSheet metrics={metrics} onClose={() => setOpen(false)} /> : null}
    </Card>
  )
}

function BodyWeightSheet({ metrics, onClose }: { metrics: BodyMetric[]; onClose: () => void }) {
  const find = (day: string) => metrics.find((metric) => metric.date === day)
  const [date, setDate] = useState(today())
  const [weightKg, setWeightKg] = useState(find(today())?.weightKg ?? metrics.at(-1)?.weightKg)
  const existing = find(date)

  return (
    <Sheet title="Waga ciała" onClose={onClose}>
      <label className="flex flex-col gap-1 text-[13px] text-muted">
        Data pomiaru
        <input
          type="date"
          value={date}
          max={today()}
          onChange={(event) => {
            const next = event.target.value
            if (!next) {
              return
            }
            setDate(next)
            const saved = find(next)
            if (saved) {
              setWeightKg(saved.weightKg)
            }
          }}
          className="min-h-12 rounded-xl border border-border bg-bg px-3 text-base text-text"
        />
      </label>
      <NumberStepper label="Waga" unit="kg" value={weightKg} step={0.1} onChange={setWeightKg} />
      <Button
        disabled={weightKg === undefined || weightKg <= 0}
        onClick={() => {
          if (weightKg !== undefined && weightKg > 0) {
            void saveBodyWeight(date, weightKg).then(onClose)
          }
        }}
      >
        Zapisz
      </Button>
      {existing ? (
        <Button variant="secondary" onClick={() => void deleteBodyWeight(date).then(onClose)}>
          Usuń pomiar z {formatDay(date)}
        </Button>
      ) : null}
    </Sheet>
  )
}
