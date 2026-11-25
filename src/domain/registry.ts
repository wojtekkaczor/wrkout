import type { z } from 'zod'
import type { DocType } from './doc'
import { EXERCISE_SCHEMA_VERSION, exerciseSchema } from './exercise'
import { RUN_LOG_SCHEMA_VERSION, runLogSchema } from './runLog'
import { SETTINGS_SCHEMA_VERSION, settingsSchema } from './settings'
import { WORKOUT_LOG_SCHEMA_VERSION, workoutLogSchema } from './workoutLog'
import { WORKOUT_TEMPLATE_SCHEMA_VERSION, workoutTemplateSchema } from './workoutTemplate'

export type DocSchema = { schema: z.ZodType; version: number }

/**
 * Document types the app can currently read and write, with the schema of
 * their `data` and its version. Types from the data model that are not built
 * yet are simply absent.
 */
export const DOC_SCHEMAS = {
  settings: { schema: settingsSchema, version: SETTINGS_SCHEMA_VERSION },
  exercise: { schema: exerciseSchema, version: EXERCISE_SCHEMA_VERSION },
  workoutTemplate: { schema: workoutTemplateSchema, version: WORKOUT_TEMPLATE_SCHEMA_VERSION },
  workoutLog: { schema: workoutLogSchema, version: WORKOUT_LOG_SCHEMA_VERSION },
  runLog: { schema: runLogSchema, version: RUN_LOG_SCHEMA_VERSION },
} satisfies Partial<Record<DocType, DocSchema>>

export type SupportedDocType = keyof typeof DOC_SCHEMAS

export function isSupportedDocType(type: DocType): type is SupportedDocType {
  return type in DOC_SCHEMAS
}
