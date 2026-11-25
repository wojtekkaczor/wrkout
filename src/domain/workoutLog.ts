import { z } from 'zod'
import { daySchema, rirSchema, rpeSchema, tempoSchema, tierSchema } from './common'

export const WORKOUT_LOG_SCHEMA_VERSION = 1

export const loggedSetSchema = z.object({
  kind: z.enum(['work', 'warmup', 'drop']),
  /** Absent when no load was used or recorded. For bodyweight work: the added load. */
  weightKg: z.number().finite().optional(),
  /** Per side for unilateral exercises. */
  reps: z.number().int().nonnegative().optional(),
  durationSec: z.number().nonnegative().optional(),
  /** Overrides the exercise-level value for this one set. */
  rir: rirSchema.optional(),
  done: z.boolean(),
})

export type LoggedSet = z.infer<typeof loggedSetSchema>

export const loggedExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  slotId: z.string().min(1).optional(),
  tier: tierSchema.optional(),
  range: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
  targetRir: rirSchema.optional(),
  /** Reps in reserve reported once for the exercise (usually the last set). */
  rir: rirSchema.optional(),
  tempo: tempoSchema.optional(),
  sets: z.array(loggedSetSchema),
  note: z.string().max(1000).optional(),
})

export type LoggedExercise = z.infer<typeof loggedExerciseSchema>

export const workoutLogSchema = z.object({
  plannedSessionId: z.string().min(1).optional(),
  templateId: z.string().min(1).optional(),
  /** Session name at the time of logging, e.g. "Trening 1". */
  title: z.string().min(1).max(80),
  /** The day the workout happened, which may be earlier than the day it was entered. */
  date: daySchema,
  loggedAt: z.number().int().nonnegative(),
  durationMin: z.number().positive().optional(),
  readinessId: z.string().min(1).optional(),
  context: z
    .object({
      label: z.string().max(120).optional(),
      blockId: z.string().min(1).optional(),
      weekIndex: z.number().int().positive().optional(),
      isDeload: z.boolean().optional(),
      readinessScore: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
  exercises: z.array(loggedExerciseSchema),
  sessionRpe: rpeSchema.optional(),
  note: z.string().max(2000).optional(),
})

export type WorkoutLog = z.infer<typeof workoutLogSchema>
