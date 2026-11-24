import { describe, expect, it } from 'vitest'
import { uuidv7 } from './ids'

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('uuidv7', () => {
  it('produces a version 7 UUID', () => {
    expect(uuidv7(1_795_000_000_000)).toMatch(UUID_V7)
  })

  it('encodes the timestamp in the first 48 bits', () => {
    const id = uuidv7(0x0123456789ab, new Uint8Array(10))

    expect(id.startsWith('01234567-89ab-7')).toBe(true)
  })

  it('sorts later timestamps after earlier ones', () => {
    const random = new Uint8Array(10).fill(0xff)
    const earlier = uuidv7(1_795_000_000_000, random)
    const later = uuidv7(1_795_000_000_001, new Uint8Array(10))

    expect(earlier < later).toBe(true)
  })

  it('differs between calls at the same millisecond', () => {
    expect(uuidv7(1_795_000_000_000)).not.toBe(uuidv7(1_795_000_000_000))
  })

  it('rejects too little randomness', () => {
    expect(() => uuidv7(0, new Uint8Array(4))).toThrow()
  })
})
