import type { Doc, Exercise, LoggedExercise, LoggedSet, WorkoutLog, WorkoutTemplate } from '@/domain'
import { exerciseHistory } from '../strength/history'

type DraftInput = {
  template: WorkoutTemplate
  /** Finished workouts; the source of "like last time". */
  logs: Doc<WorkoutLog>[]
  exercises: Map<string, Exercise>
}

/**
 * Sets for one exercise, filled in like the last time it was done: the same
 * weights and reps, set by set. Without history the weights stay empty and
 * the amount comes from the bottom of the slot's range. Nothing is marked done.
 */
export function draftSets(
  exerciseId: string,
  logs: Doc<WorkoutLog>[],
  options: { sets: number; amount?: number; timed: boolean },
): LoggedSet[] {
  const last = exerciseHistory(logs, exerciseId).at(-1)
  const sets: LoggedSet[] = []
  for (let index = 0; index < options.sets; index += 1) {
    const previous = last?.sets[index] ?? last?.sets.at(-1)
    const set: LoggedSet = { kind: 'work', done: false }
    if (previous?.weightKg !== undefined) {
      set.weightKg = previous.weightKg
    }
    if (options.timed) {
      set.durationSec = previous?.durationSec ?? options.amount
    } else {
      set.reps = previous?.reps ?? options.amount
    }
    sets.push(set)
  }
  return sets
}

/** The exercises of a new workout started from one of "Moje treningi". */
export function draftExercises({ template, logs, exercises }: DraftInput): LoggedExercise[] {
  return template.slots.map((slot) => {
    const exercise = exercises.get(slot.exerciseId)
    const logged: LoggedExercise = {
      exerciseId: slot.exerciseId,
      slotId: slot.id,
      range: slot.range,
      sets: draftSets(slot.exerciseId, logs, {
        sets: slot.sets,
        amount: slot.range[0],
        timed: exercise?.measure === 'time',
      }),
    }
    const tier = slot.tier ?? exercise?.tier
    if (tier) {
      logged.tier = tier
    }
    if (slot.rir !== undefined) {
      logged.targetRir = slot.rir
    }
    if (slot.tempo) {
      logged.tempo = slot.tempo
    }
    return logged
  })
}
