import type { Day, Doc, Exercise, MuscleGroup, RunLog, Weekday, WorkoutLog } from '@/domain'
import { addDays, startOfWeek } from '../dates'
import { estimateOneRepMax } from '../strength/e1rm'
import { sortLogs } from '../strength/history'

export type WeekRecord = {
  exerciseId: string
  value: number
  previous: number
  weightKg: number
  reps: number
}

export type WeekReport = {
  weekStart: Day
  weekEnd: Day
  strengthSessions: number
  workSets: number
  /** Work sets per muscle group: 1 for the primary muscle, 0.5 for each secondary. */
  setsByMuscle: Partial<Record<MuscleGroup, number>>
  runs: number
  runDistanceM: number
  runMovingSec: number
  /** Cycling and other cardio. */
  otherCardioSec: number
  /** Exercises whose estimated max beat everything logged before this week. */
  records: WeekRecord[]
}

type ReportInput = {
  logs: Doc<WorkoutLog>[]
  runs: Doc<RunLog>[]
  exercises: Map<string, Exercise>
  weekStart: Day
}

/** What happened in the seven days starting at `weekStart`. Computed from logs only. */
export function weekReport({ logs, runs, exercises, weekStart }: ReportInput): WeekReport {
  const weekEnd = addDays(weekStart, 6)
  const report: WeekReport = {
    weekStart,
    weekEnd,
    strengthSessions: 0,
    workSets: 0,
    setsByMuscle: {},
    runs: 0,
    runDistanceM: 0,
    runMovingSec: 0,
    otherCardioSec: 0,
    records: [],
  }
  const bestBefore = new Map<string, number>()
  const bestInWeek = new Map<string, { value: number; weightKg: number; reps: number }>()

  for (const log of sortLogs(logs)) {
    const { date } = log.data
    if (date > weekEnd) {
      continue
    }
    const inWeek = date >= weekStart
    if (inWeek) {
      report.strengthSessions += 1
    }
    for (const logged of log.data.exercises) {
      const exercise = exercises.get(logged.exerciseId)
      for (const set of logged.sets) {
        if (!set.done || set.kind === 'warmup') {
          continue
        }
        if (inWeek) {
          report.workSets += 1
          if (exercise?.primary) {
            addSets(report.setsByMuscle, exercise.primary, 1)
            for (const muscle of exercise.secondary) {
              addSets(report.setsByMuscle, muscle, 0.5)
            }
          }
        }
        const value =
          set.weightKg !== undefined && set.reps !== undefined
            ? estimateOneRepMax(set.weightKg, set.reps)
            : undefined
        if (value === undefined || set.weightKg === undefined || set.reps === undefined) {
          continue
        }
        if (!inWeek) {
          bestBefore.set(logged.exerciseId, Math.max(bestBefore.get(logged.exerciseId) ?? 0, value))
        } else if (value > (bestInWeek.get(logged.exerciseId)?.value ?? 0)) {
          bestInWeek.set(logged.exerciseId, { value, weightKg: set.weightKg, reps: set.reps })
        }
      }
    }
  }

  for (const [exerciseId, best] of bestInWeek) {
    const previous = bestBefore.get(exerciseId)
    // The first time an exercise is logged sets the baseline; it is not a record.
    if (previous !== undefined && best.value > previous) {
      report.records.push({ exerciseId, previous, ...best })
    }
  }
  report.records.sort((a, b) => b.value - b.previous - (a.value - a.previous))

  for (const run of runs) {
    const { date, sport, distanceM = 0, movingSec = 0 } = run.data
    if (date < weekStart || date > weekEnd) {
      continue
    }
    if (sport === 'run') {
      report.runs += 1
      report.runDistanceM += distanceM
      report.runMovingSec += movingSec
    } else {
      report.otherCardioSec += movingSec
    }
  }

  return report
}

function addSets(
  target: Partial<Record<MuscleGroup, number>>,
  muscle: MuscleGroup,
  amount: number,
): void {
  target[muscle] = (target[muscle] ?? 0) + amount
}

/** Week starts that contain at least one workout or run, newest first. */
export function weeksWithEntries(
  logs: Doc<WorkoutLog>[],
  runs: Doc<RunLog>[],
  weekStart: Weekday = 1,
): Day[] {
  const weeks = new Set<Day>()
  for (const log of logs) {
    weeks.add(startOfWeek(log.data.date, weekStart))
  }
  for (const run of runs) {
    weeks.add(startOfWeek(run.data.date, weekStart))
  }
  return [...weeks].sort().reverse()
}
