import { z } from 'zod'
import { muscleGroupSchema, tierSchema } from './common'

export const EXERCISE_SCHEMA_VERSION = 1

export const exerciseSchema = z.object({
  name: z.string().min(1).max(120),
  /** Default role in a session; a template slot may override it. */
  tier: tierSchema,
  measure: z.enum(['reps', 'time']),
  /** `none`: jumps, mobility drills, band work, where load is not tracked. */
  load: z.enum(['external', 'bodyweight', 'assisted', 'none']),
  /** Reps and time are recorded per side. */
  unilateral: z.boolean(),
  /** Absent for work that does not count towards muscle volume (mobility, plyometrics). */
  primary: muscleGroupSchema.optional(),
  secondary: z.array(muscleGroupSchema),
  /** Which load step from the settings applies. */
  incrementKind: z.enum(['barbell', 'dumbbell', 'machine', 'bodyweight']).optional(),
  hint: z.string().max(500).optional(),
})

export type Exercise = z.infer<typeof exerciseSchema>
