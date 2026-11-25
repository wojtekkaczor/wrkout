import { describe, expect, it } from 'vitest'
import type { Doc, Exercise, LoggedSet, RunLog, WorkoutLog } from '@/domain'
import {
  addDays,
  estimateOneRepMax,
  exerciseHistory,
  exerciseRecords,
  metricSeries,
  paceSecPerKm,
  startOfWeek,
  summarizeExercises,
  weekReport,
  weekdayOf,
  workoutRecords,
  weeklyRunTotals,
  weeksWithEntries,
} from './index'

function set(weightKg: number | undefined, reps: number, extra: Partial<LoggedSet> = {}): LoggedSet {
  return { kind: 'work', done: true, weightKg, reps, ...extra }
}

function workout(
  id: string,
  date: string,
  exercises: WorkoutLog['exercises'],
  loggedAt = 0,
): Doc<WorkoutLog> {
  return {
    id,
    type: 'workoutLog',
    updatedAt: loggedAt,
    schemaVersion: 1,
    data: { title: 'Trening 1', status: 'done', date, loggedAt, exercises },
  }
}

function run(id: string, date: string, data: Partial<RunLog> = {}): Doc<RunLog> {
  return {
    id,
    type: 'runLog',
    updatedAt: 0,
    schemaVersion: 1,
    data: { date, sport: 'run', source: 'manual', ...data },
  }
}

const bench: Exercise = {
  name: 'Bench Press',
  tier: 'main',
  measure: 'reps',
  load: 'external',
  unilateral: false,
  primary: 'chest',
  secondary: ['triceps', 'shoulders'],
}
const pogo: Exercise = {
  name: 'Pogo',
  tier: 'accessory',
  measure: 'reps',
  load: 'none',
  unilateral: false,
  secondary: [],
}

describe('estimateOneRepMax', () => {
  it('follows the Epley formula', () => {
    expect(estimateOneRepMax(80, 10)).toBeCloseTo(106.667, 3)
  })

  it('adds reps in reserve when asked, as in the spec example (80 × 10 at RIR 2 = 112)', () => {
    expect(estimateOneRepMax(80, 10, 2)).toBeCloseTo(112, 6)
  })

  it('treats a single all-out rep as the max itself', () => {
    expect(estimateOneRepMax(140, 1)).toBe(140)
  })

  it('has no value without load or reps', () => {
    expect(estimateOneRepMax(0, 10)).toBeUndefined()
    expect(estimateOneRepMax(50, 0)).toBeUndefined()
  })
})

describe('dates', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02')
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
  })

  it('numbers weekdays from Monday', () => {
    expect(weekdayOf('2026-11-23')).toBe(1)
    expect(weekdayOf('2026-11-29')).toBe(7)
  })

  it('finds the start of the week for either convention', () => {
    expect(startOfWeek('2026-11-25')).toBe('2026-11-23')
    expect(startOfWeek('2026-11-23')).toBe('2026-11-23')
    expect(startOfWeek('2026-11-25', 7)).toBe('2026-11-22')
  })
})

describe('exercise history', () => {
  it('orders workouts by training date, not by when they were entered (S19)', () => {
    const enteredFirst = workout('b', '2026-09-10', [{ exerciseId: 'bench', sets: [set(60, 8)] }], 1)
    const enteredLater = workout('a', '2026-09-03', [{ exerciseId: 'bench', sets: [set(55, 8)] }], 2)

    const history = exerciseHistory([enteredFirst, enteredLater], 'bench')

    expect(history.map((performance) => performance.date)).toEqual(['2026-09-03', '2026-09-10'])
  })

  it('summarises a workout from the work sets that were done', () => {
    const log = workout('a', '2026-09-03', [
      {
        exerciseId: 'bench',
        rir: 1,
        tempo: '3010',
        sets: [
          set(40, 10, { kind: 'warmup' }),
          set(60, 8),
          set(65, 6),
          set(65, 5, { done: false }),
        ],
      },
    ])

    const [performance] = exerciseHistory([log], 'bench')

    expect(performance).toMatchObject({
      rir: 1,
      tempo: '3010',
      topWeightKg: 65,
      totalReps: 14,
      volumeKg: 60 * 8 + 65 * 6,
      bestReps: 8,
    })
    expect(performance?.sets).toHaveLength(2)
    expect(performance?.bestE1rm).toMatchObject({ weightKg: 65, reps: 6 })
    expect(performance?.bestE1rm?.value).toBeCloseTo(78, 6)
  })

  it('leaves out workouts where no set of the exercise was done', () => {
    const log = workout('a', '2026-09-03', [
      { exerciseId: 'bench', sets: [set(60, 8, { done: false })] },
    ])

    expect(exerciseHistory([log], 'bench')).toEqual([])
  })

  it('finds records across the whole history', () => {
    const history = exerciseHistory(
      [
        workout('a', '2026-09-03', [{ exerciseId: 'bench', sets: [set(60, 10), set(70, 3)] }]),
        workout('b', '2026-09-10', [{ exerciseId: 'bench', sets: [set(65, 8)] }]),
      ],
      'bench',
    )

    expect(exerciseRecords(history)).toMatchObject({
      e1rm: { weightKg: 65, reps: 8, date: '2026-09-10' },
      heaviest: { weightKg: 70, reps: 3, date: '2026-09-03' },
      mostReps: { reps: 10, weightKg: 60, date: '2026-09-03' },
    })
  })

  it('tracks bodyweight work by reps and timed work by duration', () => {
    const logs = [
      workout('a', '2026-09-03', [
        { exerciseId: 'chin', sets: [set(undefined, 6), set(undefined, 5)] },
        { exerciseId: 'plank', sets: [{ kind: 'work', done: true, durationSec: 30 }] },
      ]),
      workout('b', '2026-09-10', [
        { exerciseId: 'chin', sets: [set(undefined, 8)] },
        { exerciseId: 'plank', sets: [{ kind: 'work', done: true, durationSec: 40 }] },
      ]),
    ]

    const summaries = summarizeExercises(logs)

    expect(summaries.get('chin')).toMatchObject({ metric: 'reps', first: 6, latest: 8, best: 8 })
    expect(summaries.get('plank')).toMatchObject({ metric: 'time', first: 30, latest: 40 })
    expect(metricSeries(summaries.get('chin')?.history ?? [], 'reps')).toEqual([
      { date: '2026-09-03', value: 6 },
      { date: '2026-09-10', value: 8 },
    ])
  })
})

describe('workoutRecords', () => {
  const logs = [
    workout('w1', '2026-09-01', [
      { exerciseId: 'bench', sets: [set(60, 8)] },
      { exerciseId: 'chin', sets: [set(undefined, 6)] },
      { exerciseId: 'plank', sets: [{ kind: 'work', done: true, durationSec: 30 }] },
    ]),
    workout('w2', '2026-09-08', [
      { exerciseId: 'bench', sets: [set(62.5, 8), set(62.5, 7)] },
      { exerciseId: 'chin', sets: [set(undefined, 6)] },
      { exerciseId: 'plank', sets: [{ kind: 'work', done: true, durationSec: 45 }] },
      { exerciseId: 'curl', sets: [set(12, 10)] },
    ]),
    workout('w3', '2026-09-15', [{ exerciseId: 'bench', sets: [set(60, 8)] }]),
  ]

  it('lists the exercises that beat every earlier workout', () => {
    const records = workoutRecords(logs, 'w2')

    expect(records.map((record) => [record.exerciseId, record.metric])).toEqual([
      ['bench', 'e1rm'],
      ['plank', 'time'],
    ])
    expect(records[0]).toMatchObject({ weightKg: 62.5, reps: 8 })
    expect(records[0]?.previous).toBeCloseTo(76, 6)
    expect(records[1]).toMatchObject({ value: 45, previous: 30 })
  })

  it('does not count a first-ever exercise, a tie or a weaker day', () => {
    expect(workoutRecords(logs, 'w1')).toEqual([])
    expect(workoutRecords(logs, 'w3')).toEqual([])
    expect(workoutRecords(logs, 'missing')).toEqual([])
  })

  it('compares against earlier training dates even when entered later', () => {
    const lateEntry = workout('late', '2026-08-25', [{ exerciseId: 'bench', sets: [set(70, 8)] }], 99)

    expect(workoutRecords([...logs, lateEntry], 'w2').map((record) => record.exerciseId)).toEqual([
      'plank',
    ])
  })
})

describe('weekReport', () => {
  const exercises = new Map([
    ['bench', bench],
    ['pogo', pogo],
  ])
  const logs = [
    workout('w1', '2026-09-01', [{ exerciseId: 'bench', sets: [set(60, 8)] }]),
    workout('w2', '2026-09-08', [
      { exerciseId: 'bench', sets: [set(62.5, 8), set(62.5, 8), set(62.5, 7)] },
      { exerciseId: 'pogo', sets: [set(undefined, 20), set(undefined, 20)] },
    ]),
    workout('w3', '2026-09-12', [{ exerciseId: 'bench', sets: [set(60, 8)] }]),
  ]
  const runs = [
    run('r1', '2026-09-09', { distanceM: 6000, movingSec: 2400 }),
    run('r2', '2026-09-13', { distanceM: 9000, movingSec: 3900 }),
    run('r3', '2026-09-10', { sport: 'bike', movingSec: 3300 }),
    run('r4', '2026-09-15', { distanceM: 5000, movingSec: 2000 }),
  ]

  it('counts sessions, sets and volume per muscle for the week', () => {
    const report = weekReport({ logs, runs, exercises, weekStart: '2026-09-07' })

    expect(report).toMatchObject({
      weekEnd: '2026-09-13',
      strengthSessions: 2,
      workSets: 6,
      setsByMuscle: { chest: 4, triceps: 2, shoulders: 2 },
    })
  })

  it('separates running from other cardio', () => {
    const report = weekReport({ logs, runs, exercises, weekStart: '2026-09-07' })

    expect(report).toMatchObject({
      runs: 2,
      runDistanceM: 15000,
      runMovingSec: 6300,
      otherCardioSec: 3300,
    })
  })

  it('reports a record when an estimated max beats everything before the week', () => {
    const report = weekReport({ logs, runs, exercises, weekStart: '2026-09-07' })

    expect(report.records).toHaveLength(1)
    expect(report.records[0]).toMatchObject({ exerciseId: 'bench', weightKg: 62.5, reps: 8 })
    expect(report.records[0]?.previous).toBeCloseTo(76, 6)
  })

  it('does not call the first ever workout of an exercise a record', () => {
    const report = weekReport({ logs, runs, exercises, weekStart: '2026-08-31' })

    expect(report.strengthSessions).toBe(1)
    expect(report.records).toEqual([])
  })

  it('lists weeks that have entries, newest first', () => {
    expect(weeksWithEntries(logs, runs)).toEqual(['2026-09-14', '2026-09-07', '2026-08-31'])
  })
})

describe('running', () => {
  it('computes pace from distance and time', () => {
    expect(paceSecPerKm(5980, 2401)).toBeCloseTo(401.5, 1)
    expect(paceSecPerKm(undefined, 2401)).toBeUndefined()
  })

  it('totals running per week and keeps empty weeks in between', () => {
    const totals = weeklyRunTotals([
      run('a', '2026-09-01', { distanceM: 5000, movingSec: 2000 }),
      run('b', '2026-09-03', { distanceM: 7000, movingSec: 2900 }),
      run('bike', '2026-09-09', { sport: 'bike', movingSec: 3000 }),
      run('c', '2026-09-16', { distanceM: 8000, movingSec: 3300 }),
    ])

    expect(totals).toEqual([
      { weekStart: '2026-08-31', runs: 2, distanceM: 12000, movingSec: 4900 },
      { weekStart: '2026-09-07', runs: 0, distanceM: 0, movingSec: 0 },
      { weekStart: '2026-09-14', runs: 1, distanceM: 8000, movingSec: 3300 },
    ])
  })
})
