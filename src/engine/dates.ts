import type { Day, Weekday } from '@/domain'

const DAY_MS = 86_400_000

/** Midnight UTC of a calendar day; used only for day arithmetic. */
export function dayToUtcMs(day: Day): number {
  const [year, month, date] = day.split('-').map(Number)
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, date ?? 1)
}

export function utcMsToDay(ms: number): Day {
  return new Date(ms).toISOString().slice(0, 10)
}

export function addDays(day: Day, count: number): Day {
  return utcMsToDay(dayToUtcMs(day) + count * DAY_MS)
}

/** 1 = Monday … 7 = Sunday. */
export function weekdayOf(day: Day): Weekday {
  const sundayBased = new Date(dayToUtcMs(day)).getUTCDay()
  return (sundayBased === 0 ? 7 : sundayBased) as Weekday
}

/** First day of the week containing `day`. */
export function startOfWeek(day: Day, weekStart: Weekday = 1): Day {
  const offset = (weekdayOf(day) - weekStart + 7) % 7
  return addDays(day, -offset)
}
