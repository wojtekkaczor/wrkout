import type { Day, Doc, LoggedSet, WorkoutLog } from '@/domain'
import { estimateOneRepMax } from './e1rm'

/** One exercise as performed in one workout, with the numbers charts need. */
export type Performance = {
  logId: string
  date: Day
  title: string
  label?: string
  /** Work sets that were done. */
  sets: LoggedSet[]
  rir?: number
  tempo?: string
  topWeightKg?: number
  /** Best estimated max of the workout, from what was actually lifted. */
  bestE1rm?: { value: number; weightKg: number; reps: number }
  bestReps?: number
  bestDurationSec?: number
  totalReps: number
  /** Σ weight × reps over the sets with a recorded weight. */
  volumeKg: number
}

export type Records = {
  e1rm?: { value: number; weightKg: number; reps: number; date: Day }
  heaviest?: { weightKg: number; reps?: number; date: Day }
  mostReps?: { reps: number; weightKg?: number; date: Day }
  longest?: { durationSec: number; date: Day }
}

export type ProgressMetric = 'e1rm' | 'reps' | 'time'

export type ExerciseSummary = {
  exerciseId: string
  history: Performance[]
  metric?: ProgressMetric
  /** Value of the metric in the first and the latest workout that has it. */
  first?: number
  latest?: number
  best?: number
}

/** Workouts in the order they happened: training date first, then entry order. */
export function sortLogs(logs: Doc<WorkoutLog>[]): Doc<WorkoutLog>[] {
  return [...logs].sort(
    (a, b) =>
      a.data.date.localeCompare(b.data.date) ||
      a.data.loggedAt - b.data.loggedAt ||
      a.id.localeCompare(b.id),
  )
}

function toPerformance(
  log: Doc<WorkoutLog>,
  exercise: WorkoutLog['exercises'][number],
): Performance | undefined {
  const sets = exercise.sets.filter((set) => set.done && set.kind !== 'warmup')
  if (sets.length === 0) {
    return undefined
  }
  const performance: Performance = {
    logId: log.id,
    date: log.data.date,
    title: log.data.title,
    label: log.data.context?.label,
    sets,
    rir: exercise.rir,
    tempo: exercise.tempo,
    totalReps: 0,
    volumeKg: 0,
  }
  for (const set of sets) {
    const { weightKg, reps, durationSec } = set
    if (reps !== undefined) {
      performance.totalReps += reps
      performance.bestReps = Math.max(performance.bestReps ?? 0, reps)
    }
    if (durationSec !== undefined) {
      performance.bestDurationSec = Math.max(performance.bestDurationSec ?? 0, durationSec)
    }
    if (weightKg !== undefined && weightKg > 0) {
      performance.topWeightKg = Math.max(performance.topWeightKg ?? 0, weightKg)
      if (reps !== undefined) {
        performance.volumeKg += weightKg * reps
        const value = estimateOneRepMax(weightKg, reps)
        if (value !== undefined && value > (performance.bestE1rm?.value ?? 0)) {
          performance.bestE1rm = { value, weightKg, reps }
        }
      }
    }
  }
  return performance
}

/** Every workout in which the exercise was done, oldest first. */
export function exerciseHistory(logs: Doc<WorkoutLog>[], exerciseId: string): Performance[] {
  const history: Performance[] = []
  for (const log of sortLogs(logs)) {
    for (const exercise of log.data.exercises) {
      if (exercise.exerciseId !== exerciseId) {
        continue
      }
      const performance = toPerformance(log, exercise)
      if (performance) {
        history.push(performance)
      }
    }
  }
  return history
}

export function exerciseRecords(history: Performance[]): Records {
  const records: Records = {}
  for (const performance of history) {
    const { date } = performance
    if (performance.bestE1rm && performance.bestE1rm.value > (records.e1rm?.value ?? 0)) {
      records.e1rm = { ...performance.bestE1rm, date }
    }
    for (const set of performance.sets) {
      if (set.weightKg !== undefined && set.weightKg > (records.heaviest?.weightKg ?? 0)) {
        records.heaviest = { weightKg: set.weightKg, reps: set.reps, date }
      }
      if (set.reps !== undefined && set.reps > (records.mostReps?.reps ?? 0)) {
        records.mostReps = { reps: set.reps, weightKg: set.weightKg, date }
      }
      if (set.durationSec !== undefined && set.durationSec > (records.longest?.durationSec ?? 0)) {
        records.longest = { durationSec: set.durationSec, date }
      }
    }
  }
  return records
}

export type WorkoutRecord = {
  exerciseId: string
  metric: ProgressMetric
  value: number
  /** The best value in any earlier workout. */
  previous: number
  weightKg?: number
  reps?: number
}

function ownMetric(performance: Performance): ProgressMetric | undefined {
  if (performance.bestE1rm) {
    return 'e1rm'
  }
  if (performance.bestDurationSec !== undefined) {
    return 'time'
  }
  return performance.bestReps !== undefined ? 'reps' : undefined
}

/**
 * Exercises in one workout that beat every earlier workout: a higher
 * estimated max, more reps without load, or a longer hold. The first time an
 * exercise is logged sets the baseline and is not a record.
 */
export function workoutRecords(logs: Doc<WorkoutLog>[], logId: string): WorkoutRecord[] {
  const sorted = sortLogs(logs)
  const position = sorted.findIndex((log) => log.id === logId)
  const target = sorted[position]
  if (!target) {
    return []
  }
  const earlier = sorted.slice(0, position)
  const records: WorkoutRecord[] = []
  const seen = new Set<string>()
  for (const logged of target.data.exercises) {
    const performance = toPerformance(target, logged)
    const metric = performance ? ownMetric(performance) : undefined
    if (!performance || !metric || seen.has(logged.exerciseId)) {
      continue
    }
    seen.add(logged.exerciseId)
    const value = metricValue(performance, metric)
    const before = metricSeries(exerciseHistory(earlier, logged.exerciseId), metric)
    if (value === undefined || before.length === 0) {
      continue
    }
    const previous = Math.max(...before.map((point) => point.value))
    if (value > previous) {
      records.push({
        exerciseId: logged.exerciseId,
        metric,
        value,
        previous,
        weightKg: performance.bestE1rm?.weightKg,
        reps: metric === 'e1rm' ? performance.bestE1rm?.reps : performance.bestReps,
      })
    }
  }
  return records
}

function metricValue(performance: Performance, metric: ProgressMetric): number | undefined {
  if (metric === 'e1rm') {
    return performance.bestE1rm?.value
  }
  return metric === 'time' ? performance.bestDurationSec : performance.bestReps
}

/** Value series for a chart: one point per workout that has the metric. */
export function metricSeries(
  history: Performance[],
  metric: ProgressMetric,
): { date: Day; value: number }[] {
  const series: { date: Day; value: number }[] = []
  for (const performance of history) {
    const value = metricValue(performance, metric)
    if (value !== undefined) {
      series.push({ date: performance.date, value })
    }
  }
  return series
}

/** The measure that shows progress for an exercise: load, hold time, or reps. */
export function progressMetric(history: Performance[]): ProgressMetric | undefined {
  if (history.some((performance) => performance.bestE1rm)) {
    return 'e1rm'
  }
  if (history.some((performance) => performance.bestDurationSec !== undefined)) {
    return 'time'
  }
  return history.some((performance) => performance.bestReps !== undefined) ? 'reps' : undefined
}

/** Progress per exercise across all workouts. */
export function summarizeExercises(logs: Doc<WorkoutLog>[]): Map<string, ExerciseSummary> {
  const histories = new Map<string, Performance[]>()
  for (const log of sortLogs(logs)) {
    for (const exercise of log.data.exercises) {
      const performance = toPerformance(log, exercise)
      if (!performance) {
        continue
      }
      const history = histories.get(exercise.exerciseId) ?? []
      history.push(performance)
      histories.set(exercise.exerciseId, history)
    }
  }

  const summaries = new Map<string, ExerciseSummary>()
  for (const [exerciseId, history] of histories) {
    const metric = progressMetric(history)
    const values = metric ? metricSeries(history, metric).map((point) => point.value) : []
    summaries.set(exerciseId, {
      exerciseId,
      history,
      metric,
      first: values[0],
      latest: values.at(-1),
      best: values.length > 0 ? Math.max(...values) : undefined,
    })
  }
  return summaries
}
