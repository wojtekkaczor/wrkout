import { z } from 'zod'

/** Calendar day in the user's time zone, `YYYY-MM-DD`. */
export const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
export type Day = z.infer<typeof daySchema>

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
] as const
export const muscleGroupSchema = z.enum(MUSCLE_GROUPS)
export type MuscleGroup = z.infer<typeof muscleGroupSchema>

/** Role of an exercise within a session: main lift, supplementary lift, accessory work. */
export const TIERS = ['main', 'supplementary', 'accessory'] as const
export const tierSchema = z.enum(TIERS)
export type Tier = z.infer<typeof tierSchema>

export const rirSchema = z.number().int().min(0).max(10)
export const rpeSchema = z.number().min(1).max(10)

/** Lifting tempo, e.g. `3010`; `xxxx` means "as fast as possible". */
export const tempoSchema = z.string().regex(/^[0-9xX]{4}$/, 'Expected four characters such as 3010')
