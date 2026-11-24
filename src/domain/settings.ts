import { z } from 'zod'

export const SETTINGS_ID = 'settings'
export const SETTINGS_SCHEMA_VERSION = 1

export const themeSchema = z.enum(['dark', 'light', 'system'])
export type Theme = z.infer<typeof themeSchema>

/** 1 = Monday … 7 = Sunday. */
export const weekdaySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
])
export type Weekday = z.infer<typeof weekdaySchema>

export const settingsSchema = z.object({
  weekStart: weekdaySchema,
  theme: themeSchema,
  /** Smallest load step per equipment kind, in kilograms. */
  increments: z.object({
    barbell: z.number().positive(),
    dumbbell: z.number().positive(),
    machine: z.number().positive(),
    bodyweight: z.number().positive(),
  }),
  blockWorkWeeks: z.number().int().min(3).max(6),
  ai: z.object({ enabled: z.boolean() }),
})

export type Settings = z.infer<typeof settingsSchema>

export const defaultSettings: Settings = {
  weekStart: 1,
  theme: 'dark',
  increments: { barbell: 2.5, dumbbell: 2, machine: 5, bodyweight: 2.5 },
  blockWorkWeeks: 4,
  ai: { enabled: false },
}
