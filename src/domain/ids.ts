function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

/**
 * UUID v7: a 48-bit millisecond timestamp followed by random bits, so ids
 * created later sort later. Used for documents created by the user.
 * `nowMs` is a parameter so callers control the clock.
 */
export function uuidv7(nowMs: number, random: Uint8Array = randomBytes(10)): string {
  if (random.length < 10) {
    throw new Error('uuidv7 needs 10 random bytes')
  }
  const bytes = new Uint8Array(16)
  let timestamp = Math.floor(nowMs)
  for (let i = 5; i >= 0; i--) {
    bytes[i] = timestamp % 256
    timestamp = Math.floor(timestamp / 256)
  }
  bytes.set(random.subarray(0, 10), 6)
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-')
}
