/**
 * Estimated one-rep max (Epley): weight × (1 + (reps + RIR) / 30).
 *
 * Prescriptions pass the reps in reserve, because they need an estimate of
 * what was possible. Progress charts and records leave it at 0, so that a
 * subjective rating never rewrites history (docs/03-silnik-treningowy.md §5.1).
 *
 * A single rep with nothing in reserve is the max itself.
 */
export function estimateOneRepMax(weightKg: number, reps: number, rir = 0): number | undefined {
  if (!(weightKg > 0) || !(reps > 0) || rir < 0) {
    return undefined
  }
  const effectiveReps = reps + rir
  if (effectiveReps === 1) {
    return weightKg
  }
  return weightKg * (1 + effectiveReps / 30)
}
