import { describe, expect, it } from 'vitest'
import {
  describeSets,
  formatDay,
  formatDayLong,
  formatDayRange,
  formatDistance,
  formatDuration,
  formatKg,
  formatPace,
} from './format'

// Intl output uses non-breaking spaces in places; compare on plain spaces.
const plain = (text: string) => text.replace(/\s/g, ' ')

describe('formatting', () => {
  it('uses a decimal comma for weights and distances', () => {
    expect(plain(formatKg(82.5))).toBe('82,5 kg')
    expect(plain(formatKg(80))).toBe('80 kg')
    expect(plain(formatDistance(5980))).toBe('5,98 km')
  })

  it('formats durations with and without hours', () => {
    expect(formatDuration(2710)).toBe('45:10')
    expect(formatDuration(3623)).toBe('1:00:23')
    expect(formatPace(401.4)).toBe('6:41 /km')
  })

  it('formats days in Polish regardless of the local time zone', () => {
    expect(plain(formatDay('2026-08-05'))).toBe('5 sie')
    expect(plain(formatDayLong('2026-09-10'))).toBe('czwartek, 10 września 2026')
  })

  it('shortens a range within one month', () => {
    expect(plain(formatDayRange('2026-09-07', '2026-09-13'))).toBe('7–13 września')
    expect(plain(formatDayRange('2026-08-31', '2026-09-06'))).toBe('31 sierpnia – 6 września')
  })
})

describe('describeSets', () => {
  const set = (weightKg: number | undefined, reps: number) => ({ weightKg, reps })

  it('names the weight once when every set used the same one', () => {
    expect(plain(describeSets([set(80, 6), set(80, 6), set(80, 5)]))).toBe('80 kg × 6, 6, 5')
  })

  it('lists weight and reps per set when the weight changes', () => {
    expect(plain(describeSets([set(60, 6), set(70, 6), set(75, 6)]))).toBe('60×6, 70×6, 75×6 kg')
  })

  it('marks a set whose weight was not recorded', () => {
    expect(plain(describeSets([set(60, 8), set(undefined, 8)]))).toBe('60×8, ?×8 kg')
  })

  it('handles work without load and timed work', () => {
    expect(describeSets([set(undefined, 8), set(undefined, 7)])).toBe('8, 7 powt.')
    expect(plain(describeSets([{ durationSec: 30 }, { durationSec: 40 }]))).toBe('30 s, 40 s')
    expect(describeSets([])).toBe('–')
  })
})
