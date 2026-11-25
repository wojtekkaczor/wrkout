import { z } from 'zod'
import { daySchema, rpeSchema } from './common'

export const RUN_LOG_SCHEMA_VERSION = 1

export const RUN_TYPES = [
  'easy',
  'easy_strides',
  'long',
  'tempo',
  'intervals',
  'hills',
  'recovery',
  'test',
  'race',
] as const

export const runLogSchema = z.object({
  plannedSessionId: z.string().min(1).optional(),
  date: daySchema,
  startedAt: z.number().int().nonnegative().optional(),
  /** Cycling and other cardio count towards time, not running distance. */
  sport: z.enum(['run', 'bike', 'other']),
  runType: z.enum(RUN_TYPES).optional(),
  /** The prescribed session as free text. */
  planned: z.string().max(1000).optional(),
  distanceM: z.number().nonnegative().optional(),
  movingSec: z.number().nonnegative().optional(),
  elapsedSec: z.number().nonnegative().optional(),
  avgHr: z.number().positive().optional(),
  maxHr: z.number().positive().optional(),
  elevationM: z.number().optional(),
  laps: z
    .array(
      z.object({
        distanceM: z.number().nonnegative(),
        durationSec: z.number().nonnegative(),
        avgHr: z.number().positive().optional(),
      }),
    )
    .optional(),
  rpe: rpeSchema.optional(),
  completion: z.enum(['as_planned', 'shortened', 'aborted']).optional(),
  note: z.string().max(2000).optional(),
  source: z.enum(['manual', 'garmin', 'file']),
  /** Link to the activity, e.g. in Garmin Connect. */
  url: z.url().max(500).optional(),
  externalActivityId: z.string().min(1).optional(),
})

export type RunLog = z.infer<typeof runLogSchema>
