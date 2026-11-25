import type { RunLog } from '@/domain'

export { MUSCLE_LABELS, TIER_LABELS } from '@/features/exercises/labels'

export const RUN_TYPE_LABELS: Record<NonNullable<RunLog['runType']>, string> = {
  easy: 'Bieg spokojny',
  easy_strides: 'Bieg spokojny z przebieżkami',
  long: 'Bieg długi',
  tempo: 'Tempo',
  intervals: 'Interwały',
  hills: 'Podbiegi',
  recovery: 'Bieg regeneracyjny',
  test: 'Test',
  race: 'Zawody',
}

export const SPORT_LABELS: Record<RunLog['sport'], string> = {
  run: 'Bieg',
  bike: 'Rower',
  other: 'Inna aktywność',
}

export function runTitle(run: RunLog): string {
  if (run.sport !== 'run') {
    return SPORT_LABELS[run.sport]
  }
  return run.runType ? RUN_TYPE_LABELS[run.runType] : SPORT_LABELS.run
}
