import { z } from 'zod'
import { rirSchema, tempoSchema, tierSchema } from './common'

export const WORKOUT_TEMPLATE_SCHEMA_VERSION = 1

/** A place for one exercise in a session. See docs/06-model-danych.md §4.3. */
export const slotSchema = z
  .object({
    id: z.string().min(1),
    exerciseId: z.string().min(1),
    tier: tierSchema.optional(),
    sets: z.number().int().min(1).max(10),
    /** Reps (or seconds for timed exercises); equal bounds mean a fixed target. */
    range: z.tuple([z.number().int().min(1), z.number().int().min(1)]),
    rir: rirSchema.optional(),
    tempo: tempoSchema.optional(),
    locked: z.boolean().optional(),
    edited: z.boolean().optional(),
  })
  .refine((slot) => slot.range[0] <= slot.range[1], {
    message: 'Range must go from low to high',
    path: ['range'],
  })

export type Slot = z.infer<typeof slotSchema>

/** A session the user can pick to log ("Moje treningi"). */
export const workoutTemplateSchema = z.object({
  name: z.string().min(1).max(80),
  order: z.number().int().nonnegative(),
  focus: z.enum(['upper', 'lower', 'full', 'push', 'pull', 'legs']).optional(),
  slots: z.array(slotSchema),
  archived: z.boolean().optional(),
})

export type WorkoutTemplate = z.infer<typeof workoutTemplateSchema>
