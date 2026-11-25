import { describe, expect, it } from 'vitest'
import type { Doc, Exercise, WorkoutLog, WorkoutTemplate } from '@/domain'
import { draftExercises, draftSets } from './draft'

const bench: Exercise = {
  name: 'Bench Press',
  tier: 'main',
  measure: 'reps',
  load: 'external',
  unilateral: false,
  secondary: [],
}
const plank: Exercise = { ...bench, name: 'Plank', tier: 'accessory', measure: 'time', load: 'none' }
const exercises = new Map([
  ['bench', bench],
  ['plank', plank],
])

function workout(id: string, date: string, exercisesLogged: WorkoutLog['exercises']): Doc<WorkoutLog> {
  return {
    id,
    type: 'workoutLog',
    updatedAt: 0,
    schemaVersion: 1,
    data: { title: 'Trening 1', status: 'done', date, loggedAt: 0, exercises: exercisesLogged },
  }
}

const done = (weightKg: number, reps: number) => ({ kind: 'work' as const, done: true, weightKg, reps })

const template: WorkoutTemplate = {
  name: 'Trening 1',
  order: 0,
  slots: [
    { id: 's1', exerciseId: 'bench', sets: 3, range: [6, 8], rir: 2, tempo: '3010' },
    { id: 's2', exerciseId: 'plank', sets: 2, range: [30, 30] },
  ],
}

describe('draftExercises', () => {
  it('fills the sets like the most recent workout, set by set, and marks nothing done', () => {
    const logs = [
      workout('old', '2026-10-01', [{ exerciseId: 'bench', sets: [done(55, 8), done(55, 8)] }]),
      workout('new', '2026-10-08', [
        { exerciseId: 'bench', sets: [done(60, 8), done(62.5, 7), done(62.5, 6)] },
      ]),
    ]

    const [first] = draftExercises({ template, logs, exercises })

    expect(first).toMatchObject({
      exerciseId: 'bench',
      slotId: 's1',
      tier: 'main',
      range: [6, 8],
      targetRir: 2,
      tempo: '3010',
    })
    expect(first?.sets).toEqual([
      { kind: 'work', done: false, weightKg: 60, reps: 8 },
      { kind: 'work', done: false, weightKg: 62.5, reps: 7 },
      { kind: 'work', done: false, weightKg: 62.5, reps: 6 },
    ])
  })

  it('repeats the last known set when the slot now has more sets', () => {
    const logs = [workout('a', '2026-10-08', [{ exerciseId: 'bench', sets: [done(60, 8)] }])]

    const [first] = draftExercises({ template, logs, exercises })

    expect(first?.sets.map((set) => set.weightKg)).toEqual([60, 60, 60])
  })

  it('starts a never-done exercise with empty weights and the bottom of the range', () => {
    const [first, second] = draftExercises({ template, logs: [], exercises })

    expect(first?.sets).toEqual(Array(3).fill({ kind: 'work', done: false, reps: 6 }))
    expect(second?.sets).toEqual(Array(2).fill({ kind: 'work', done: false, durationSec: 30 }))
  })

  it('does not carry reps in reserve over from last time', () => {
    const logs = [
      workout('a', '2026-10-08', [{ exerciseId: 'bench', rir: 0, sets: [done(60, 8)] }]),
    ]

    const [first] = draftExercises({ template, logs, exercises })

    expect(first?.rir).toBeUndefined()
  })
})

describe('draftSets', () => {
  it('leaves the amount empty when there is neither history nor a target', () => {
    expect(draftSets('bench', [], { sets: 2, timed: false })).toEqual([
      { kind: 'work', done: false },
      { kind: 'work', done: false },
    ])
  })
})
