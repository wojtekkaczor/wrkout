import type { MuscleGroup, RunLog, Tier } from '@/domain'

export const TIER_LABELS: Record<Tier, string> = {
  main: 'Główne',
  supplementary: 'Uzupełniające',
  accessory: 'Dodatkowe',
}

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Klatka',
  back: 'Plecy',
  shoulders: 'Barki',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Czworogłowe',
  hamstrings: 'Dwugłowe',
  glutes: 'Pośladki',
  calves: 'Łydki',
  abs: 'Brzuch',
}

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
