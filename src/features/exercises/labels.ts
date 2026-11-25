import type { MuscleGroup, Tier } from '@/domain'

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
