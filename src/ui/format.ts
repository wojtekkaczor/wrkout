/*
 * Polish formatting for numbers, dates and training values.
 * Data is stored in kilograms, metres and seconds; conversion happens here.
 */

type SetLike = { weightKg?: number; reps?: number; durationSec?: number }

export function formatNumber(value: number, maximumFractionDigits = 1): string {
  return value.toLocaleString('pl-PL', { maximumFractionDigits })
}

/** Weights keep two decimals so that 1.25 kg plates show exactly (`66,25`). */
export function formatWeight(value: number): string {
  return formatNumber(value, 2)
}

export function formatKg(value: number): string {
  return `${formatWeight(value)} kg`
}

function toDate(day: string): Date {
  return new Date(`${day}T00:00:00Z`)
}

const DAY_SHORT = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const DAY_LONG = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const DAY_MONTH = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', timeZone: 'UTC' })

/** `5 sie` */
export function formatDay(day: string): string {
  return DAY_SHORT.format(toDate(day))
}

/** `środa, 5 sierpnia 2026` */
export function formatDayLong(day: string): string {
  return DAY_LONG.format(toDate(day))
}

/** `7–13 września` or `31 sierpnia – 6 września` */
export function formatDayRange(start: string, end: string): string {
  if (start.slice(0, 7) === end.slice(0, 7)) {
    return `${toDate(start).getUTCDate()}–${DAY_MONTH.format(toDate(end))}`
  }
  return `${DAY_MONTH.format(toDate(start))} – ${DAY_MONTH.format(toDate(end))}`
}

/** `45:10` or `1:00:23` */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.round(totalSeconds)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = String(seconds % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`
}

/** `6:41 /km` */
export function formatPace(secondsPerKm: number): string {
  return `${formatDuration(secondsPerKm)} /km`
}

/** `5,98 km` */
export function formatDistance(metres: number): string {
  return `${formatNumber(metres / 1000, 2)} km`
}

/**
 * Polish plural: `plural(1, FORMS)` → `1 seria`, 2–4 → `serie`, 5+ → `serii`
 * (and 12–14 → `serii`). Forms are given as [one, few, many].
 */
export function plural(count: number, forms: readonly [string, string, string]): string {
  const lastTwo = Math.abs(count) % 100
  const last = lastTwo % 10
  const form =
    count === 1 ? forms[0] : last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? forms[1] : forms[2]
  return `${count} ${form}`
}

export const EXERCISES_FORMS = ['ćwiczenie', 'ćwiczenia', 'ćwiczeń'] as const
export const SETS_FORMS = ['seria', 'serie', 'serii'] as const

function amountOf(set: SetLike): string {
  if (set.durationSec !== undefined) {
    return `${formatNumber(set.durationSec)} s`
  }
  return set.reps === undefined ? '–' : String(set.reps)
}

/**
 * Compact description of the sets of one exercise:
 * `80 kg × 6, 6, 5` (same weight), `60×6, 70×6, 75×6 kg` (ramping),
 * `8, 7, 6 powt.` (no load), `30 s, 30 s` (timed). A set whose weight was
 * not recorded among weighted sets shows as `?×8`.
 */
export function describeSets(sets: SetLike[]): string {
  if (sets.length === 0) {
    return '–'
  }
  const weights = sets.map((set) => set.weightKg)
  const amounts = sets.map(amountOf)
  const timed = sets.some((set) => set.durationSec !== undefined)
  if (weights.every((weight) => weight === undefined)) {
    return timed ? amounts.join(', ') : `${amounts.join(', ')} powt.`
  }
  const [firstWeight] = weights
  if (firstWeight !== undefined && weights.every((weight) => weight === firstWeight)) {
    return `${formatKg(firstWeight)} × ${amounts.join(', ')}`
  }
  const parts = sets.map((set, index) =>
    `${set.weightKg === undefined ? '?' : formatWeight(set.weightKg)}×${amounts[index] ?? '–'}`,
  )
  return `${parts.join(', ')} kg`
}
