import { z } from 'zod'

/** Every persisted entity type. See docs/06-model-danych.md §2. */
export const DOC_TYPES = [
  'profile',
  'settings',
  'exercise',
  'exercisePrefs',
  'workoutTemplate',
  'plan',
  'block',
  'week',
  'plannedSession',
  'planOverride',
  'workoutLog',
  'runLog',
  'externalActivity',
  'readiness',
  'fitnessEvent',
  'bodyMetric',
  'pause',
  'proposal',
  'planChange',
  'aiInteraction',
] as const

export type DocType = (typeof DOC_TYPES)[number]

/**
 * Common envelope shared by IndexedDB, the sync API and the export file.
 * `updatedAt` decides conflicts (last write wins per document); `deleted`
 * is a tombstone so removals can sync.
 */
export type Doc<T = unknown> = {
  id: string
  type: DocType
  updatedAt: number
  deleted?: true
  schemaVersion: number
  data: T
}

export const docEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(DOC_TYPES),
  updatedAt: z.number().int().nonnegative(),
  deleted: z.literal(true).optional(),
  schemaVersion: z.number().int().positive(),
  data: z.unknown(),
})
