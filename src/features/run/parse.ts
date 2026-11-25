/**
 * Reads a duration typed by hand: `45:10` (min:s), `1:02:03` (h:min:s) or a
 * plain number of minutes (`45`). A comma or a dot works as the separator too
 * (`45,10`), because the iPhone number pad has no colon.
 * Returns seconds, `undefined` for an empty field and `null` for text that is
 * not a duration.
 */
export function parseDuration(text: string): number | undefined | null {
  const trimmed = text.trim()
  if (trimmed === '') {
    return undefined
  }
  if (!/^\d+([:.,][0-5]?\d){0,2}$/.test(trimmed)) {
    return null
  }
  const parts = trimmed.split(/[:.,]/).map(Number)
  if (parts.length === 1) {
    return (parts[0] ?? 0) * 60
  }
  return parts.reduce((total, part) => total * 60 + part, 0)
}
