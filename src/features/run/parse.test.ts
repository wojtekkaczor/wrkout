import { describe, expect, it } from 'vitest'
import { parseDuration } from './parse'

describe('parseDuration', () => {
  it('reads minutes and seconds', () => {
    expect(parseDuration('45:10')).toBe(2710)
    expect(parseDuration(' 5:07 ')).toBe(307)
  })

  it('reads hours, minutes and seconds', () => {
    expect(parseDuration('1:02:03')).toBe(3723)
  })

  it('accepts a comma or a dot where the keyboard has no colon', () => {
    expect(parseDuration('45,10')).toBe(2710)
    expect(parseDuration('1.02.03')).toBe(3723)
  })

  it('treats a plain number as minutes', () => {
    expect(parseDuration('45')).toBe(2700)
  })

  it('distinguishes an empty field from a mistake', () => {
    expect(parseDuration('')).toBeUndefined()
    expect(parseDuration('abc')).toBeNull()
    expect(parseDuration('45:99')).toBeNull()
    expect(parseDuration('1:2:3:4')).toBeNull()
  })
})
