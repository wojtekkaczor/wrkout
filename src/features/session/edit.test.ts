import { describe, expect, it } from 'vitest'
import type { LoggedSet, WorkoutLog } from '@/domain'
import {
  addSet,
  countDone,
  markAllDone,
  markExerciseDone,
  moveExercise,
  removeSet,
  saveSet,
  setExerciseRir,
  toggleSet,
} from './edit'

const set = (weightKg: number | undefined, reps: number, done = false): LoggedSet => ({
  kind: 'work',
  done,
  reps,
  ...(weightKg === undefined ? {} : { weightKg }),
})

function log(): WorkoutLog {
  return {
    title: 'Trening 1',
    status: 'in_progress',
    date: '2026-11-25',
    loggedAt: 1,
    exercises: [
      { exerciseId: 'bench', sets: [set(60, 8), set(60, 8), set(60, 8)] },
      { exerciseId: 'chin', sets: [set(undefined, 6)] },
    ],
  }
}

describe('session edits', () => {
  it('toggles a single set and leaves the original untouched', () => {
    const original = log()

    const next = toggleSet(original, 0, 1)

    expect(next.exercises[0]?.sets.map((entry) => entry.done)).toEqual([false, true, false])
    expect(original.exercises[0]?.sets[1]?.done).toBe(false)
  })

  it('saves an edited set as done and carries its weight to the sets after it', () => {
    const next = saveSet(log(), 0, 0, set(62.5, 7), true)

    expect(next.exercises[0]?.sets).toEqual([set(62.5, 7, true), set(62.5, 8), set(62.5, 8)])
  })

  it('does not change later sets that are already done', () => {
    const started = toggleSet(log(), 0, 2)

    const next = saveSet(started, 0, 0, set(62.5, 7), true)

    expect(next.exercises[0]?.sets[2]).toEqual(set(60, 8, true))
  })

  it('keeps later weights when carrying is off', () => {
    const next = saveSet(log(), 0, 0, set(62.5, 7), false)

    expect(next.exercises[0]?.sets[1]).toEqual(set(60, 8))
  })

  it('marks one exercise or the whole workout as done', () => {
    expect(countDone(markExerciseDone(log(), 0))).toEqual({ done: 3, total: 4 })
    expect(countDone(markAllDone(log()))).toEqual({ done: 4, total: 4 })
  })

  it('adds a set that repeats the last one, not yet done', () => {
    const next = addSet(markExerciseDone(log(), 0), 0)

    expect(next.exercises[0]?.sets).toHaveLength(4)
    expect(next.exercises[0]?.sets[3]).toEqual(set(60, 8))
  })

  it('removes a set', () => {
    expect(removeSet(log(), 0, 0).exercises[0]?.sets).toHaveLength(2)
  })

  it('sets and clears the reps in reserve of an exercise', () => {
    const withRir = setExerciseRir(log(), 0, 2)

    expect(withRir.exercises[0]?.rir).toBe(2)
    expect('rir' in (setExerciseRir(withRir, 0, undefined).exercises[0] ?? {})).toBe(false)
  })

  it('moves an exercise and ignores moves past the ends', () => {
    expect(moveExercise(log(), 0, 1).exercises.map((entry) => entry.exerciseId)).toEqual([
      'chin',
      'bench',
    ])
    expect(moveExercise(log(), 0, -1).exercises.map((entry) => entry.exerciseId)).toEqual([
      'bench',
      'chin',
    ])
  })
})
