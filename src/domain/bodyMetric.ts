import { z } from 'zod'
import { daySchema, type Day } from './common'

export const BODY_METRIC_SCHEMA_VERSION = 1

export const bodyMetricSchema = z.object({
  date: daySchema,
  weightKg: z.number().positive().max(500),
})

export type BodyMetric = z.infer<typeof bodyMetricSchema>

/** One measurement per day: a second entry for the same day replaces the first. */
export function bodyMetricId(date: Day): string {
  return `bm:${date}`
}
