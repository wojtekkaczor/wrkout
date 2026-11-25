import type { Day, Doc, RunLog, Weekday } from '@/domain'
import { addDays, startOfWeek } from '../dates'

export function paceSecPerKm(distanceM?: number, movingSec?: number): number | undefined {
  if (!distanceM || !movingSec) {
    return undefined
  }
  return movingSec / (distanceM / 1000)
}

export type WeekRunTotals = {
  weekStart: Day
  runs: number
  distanceM: number
  movingSec: number
}

/**
 * Running totals per week, oldest first, with empty weeks in between kept so
 * a chart shows gaps. Cycling and other cardio are not running distance.
 */
export function weeklyRunTotals(runs: Doc<RunLog>[], weekStart: Weekday = 1): WeekRunTotals[] {
  const byWeek = new Map<Day, WeekRunTotals>()
  for (const run of runs) {
    if (run.data.sport !== 'run') {
      continue
    }
    const key = startOfWeek(run.data.date, weekStart)
    const totals = byWeek.get(key) ?? { weekStart: key, runs: 0, distanceM: 0, movingSec: 0 }
    totals.runs += 1
    totals.distanceM += run.data.distanceM ?? 0
    totals.movingSec += run.data.movingSec ?? 0
    byWeek.set(key, totals)
  }
  const weeks = [...byWeek.keys()].sort()
  const first = weeks[0]
  const last = weeks.at(-1)
  if (!first || !last) {
    return []
  }
  const result: WeekRunTotals[] = []
  for (let week = first; week <= last; week = addDays(week, 7)) {
    result.push(byWeek.get(week) ?? { weekStart: week, runs: 0, distanceM: 0, movingSec: 0 })
  }
  return result
}
