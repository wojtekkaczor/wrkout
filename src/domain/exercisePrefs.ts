import { z } from 'zod'

export const EXERCISE_PREFS_SCHEMA_VERSION = 1

/** The user's own settings for one exercise; see docs/06-model-danych.md §4.2. */
export const exercisePrefsSchema = z
  .object({
    exerciseId: z.string().min(1),
    /** Load step for this exercise in kilograms; overrides the equipment default. */
    increment: z.number().positive().max(50).optional(),
    /** Preferred rep range (or seconds), used when the exercise is added to a session. */
    range: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
    /** Shown every time the exercise comes up, e.g. a machine setting. */
    note: z.string().max(500).optional(),
  })
  .refine((prefs) => !prefs.range || prefs.range[0] <= prefs.range[1], {
    message: 'Range must go from low to high',
    path: ['range'],
  })

export type ExercisePrefs = z.infer<typeof exercisePrefsSchema>

/** One preferences document per exercise, so two devices converge on the same id. */
export function exercisePrefsId(exerciseId: string): string {
  return `pref:${exerciseId}`
}
