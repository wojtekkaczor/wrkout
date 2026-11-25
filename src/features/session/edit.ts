import type { LoggedExercise, LoggedSet, WorkoutLog } from '@/domain'

/*
 * Pure edits of a workout being logged. Each returns a new workout, which the
 * screen saves straight away, so nothing is lost if the app is closed.
 */

function withExercise(
  log: WorkoutLog,
  index: number,
  change: (exercise: LoggedExercise) => LoggedExercise,
): WorkoutLog {
  return {
    ...log,
    exercises: log.exercises.map((exercise, position) =>
      position === index ? change(exercise) : exercise,
    ),
  }
}

export function toggleSet(log: WorkoutLog, exerciseIndex: number, setIndex: number): WorkoutLog {
  return withExercise(log, exerciseIndex, (exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set, position) =>
      position === setIndex ? { ...set, done: !set.done } : set,
    ),
  }))
}

/** Saves an edited set as done; optionally carries its weight to the sets after it. */
export function saveSet(
  log: WorkoutLog,
  exerciseIndex: number,
  setIndex: number,
  edited: LoggedSet,
  carryWeight: boolean,
): WorkoutLog {
  return withExercise(log, exerciseIndex, (exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set, position) => {
      if (position === setIndex) {
        return { ...edited, done: true }
      }
      if (carryWeight && position > setIndex && !set.done) {
        const { weightKg: _previous, ...rest } = set
        return edited.weightKg === undefined ? rest : { ...rest, weightKg: edited.weightKg }
      }
      return set
    }),
  }))
}

export function markExerciseDone(log: WorkoutLog, exerciseIndex: number): WorkoutLog {
  return withExercise(log, exerciseIndex, (exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({ ...set, done: true })),
  }))
}

export function markAllDone(log: WorkoutLog): WorkoutLog {
  return {
    ...log,
    exercises: log.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set, done: true })),
    })),
  }
}

/** Adds a set that repeats the last one, not yet done. */
export function addSet(log: WorkoutLog, exerciseIndex: number): WorkoutLog {
  return withExercise(log, exerciseIndex, (exercise) => {
    const last = exercise.sets.at(-1)
    const next: LoggedSet = last ? { ...last, done: false } : { kind: 'work', done: false }
    delete next.rir
    return { ...exercise, sets: [...exercise.sets, next] }
  })
}

export function removeSet(log: WorkoutLog, exerciseIndex: number, setIndex: number): WorkoutLog {
  return withExercise(log, exerciseIndex, (exercise) => ({
    ...exercise,
    sets: exercise.sets.filter((_, position) => position !== setIndex),
  }))
}

export function setExerciseRir(
  log: WorkoutLog,
  exerciseIndex: number,
  rir: number | undefined,
): WorkoutLog {
  return withExercise(log, exerciseIndex, (exercise) => {
    const { rir: _previous, ...rest } = exercise
    return rir === undefined ? rest : { ...rest, rir }
  })
}

export function addExercise(log: WorkoutLog, exercise: LoggedExercise): WorkoutLog {
  return { ...log, exercises: [...log.exercises, exercise] }
}

export function replaceExercise(
  log: WorkoutLog,
  exerciseIndex: number,
  exercise: LoggedExercise,
): WorkoutLog {
  return withExercise(log, exerciseIndex, () => exercise)
}

export function removeExercise(log: WorkoutLog, exerciseIndex: number): WorkoutLog {
  return { ...log, exercises: log.exercises.filter((_, position) => position !== exerciseIndex) }
}

export function moveExercise(log: WorkoutLog, exerciseIndex: number, direction: -1 | 1): WorkoutLog {
  const target = exerciseIndex + direction
  if (target < 0 || target >= log.exercises.length) {
    return log
  }
  const exercises = [...log.exercises]
  const [moved] = exercises.splice(exerciseIndex, 1)
  if (moved) {
    exercises.splice(target, 0, moved)
  }
  return { ...log, exercises }
}

export function countDone(log: WorkoutLog): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const exercise of log.exercises) {
    for (const set of exercise.sets) {
      total += 1
      if (set.done) {
        done += 1
      }
    }
  }
  return { done, total }
}
