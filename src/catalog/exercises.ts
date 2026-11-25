import type { Exercise } from '@/domain'

export type CatalogExercise = Exercise & { id: string }

function entry(
  id: string,
  name: string,
  tier: Exercise['tier'],
  primary: NonNullable<Exercise['primary']>,
  secondary: Exercise['secondary'],
  incrementKind: NonNullable<Exercise['incrementKind']>,
  extra: Partial<Exercise> = {},
): CatalogExercise {
  return {
    id: `cat:${id}`,
    name,
    tier,
    measure: 'reps',
    load: incrementKind === 'bodyweight' ? 'bodyweight' : 'external',
    unilateral: false,
    primary,
    secondary,
    incrementKind,
    ...extra,
  }
}

/**
 * Built-in exercises used by the starter sets. Ids never change: workouts
 * logged against them must stay readable. The full library for automatic
 * programming is planned for a later milestone.
 */
export const CATALOG_EXERCISES: CatalogExercise[] = [
  entry('squat', 'Przysiad ze sztangą', 'main', 'quads', ['glutes'], 'barbell'),
  entry('bench-press', 'Wyciskanie sztangi na ławce poziomej', 'main', 'chest', ['triceps', 'shoulders'], 'barbell'),
  entry('overhead-press', 'Wyciskanie sztangi nad głowę', 'main', 'shoulders', ['triceps'], 'barbell'),
  entry('romanian-deadlift', 'Martwy ciąg rumuński', 'supplementary', 'hamstrings', ['glutes', 'back'], 'barbell'),
  entry('hip-thrust', 'Hip thrust ze sztangą', 'supplementary', 'glutes', ['hamstrings'], 'barbell'),
  entry('barbell-row', 'Wiosłowanie sztangą w opadzie', 'supplementary', 'back', ['biceps'], 'barbell'),
  entry('seated-row', 'Wiosłowanie na wyciągu siedząc', 'supplementary', 'back', ['biceps'], 'machine'),
  entry('lat-pulldown', 'Ściąganie drążka wyciągu do klatki', 'supplementary', 'back', ['biceps'], 'machine'),
  entry('pull-up', 'Podciąganie na drążku', 'supplementary', 'back', ['biceps'], 'bodyweight'),
  entry('db-shoulder-press', 'Wyciskanie hantli nad głowę siedząc', 'supplementary', 'shoulders', ['triceps'], 'dumbbell'),
  entry('incline-db-press', 'Wyciskanie hantli na ławce skośnej', 'supplementary', 'chest', ['shoulders', 'triceps'], 'dumbbell'),
  entry('leg-press', 'Wypychanie na suwnicy', 'supplementary', 'quads', ['glutes'], 'machine'),
  entry('split-squat', 'Przysiad bułgarski z hantlami', 'supplementary', 'quads', ['glutes'], 'dumbbell', {
    unilateral: true,
  }),
  entry('leg-curl', 'Uginanie nóg leżąc', 'accessory', 'hamstrings', [], 'machine'),
  entry('leg-extension', 'Prostowanie nóg siedząc', 'accessory', 'quads', [], 'machine'),
  entry('calf-raise', 'Wspięcia na palce stojąc', 'accessory', 'calves', [], 'machine'),
  entry('lateral-raise', 'Wznosy hantli bokiem', 'accessory', 'shoulders', [], 'dumbbell'),
  entry('rear-delt-fly', 'Odwrotne rozpiętki z hantlami', 'accessory', 'shoulders', ['back'], 'dumbbell'),
  entry('face-pull', 'Face pull na wyciągu', 'accessory', 'shoulders', ['back'], 'machine'),
  entry('biceps-curl', 'Uginanie ramion z hantlami', 'accessory', 'biceps', [], 'dumbbell'),
  entry('triceps-pushdown', 'Prostowanie ramion na wyciągu', 'accessory', 'triceps', [], 'machine'),
  entry('cable-crunch', 'Spięcia brzucha na wyciągu', 'accessory', 'abs', [], 'machine'),
  entry('hanging-leg-raise', 'Unoszenie nóg w zwisie', 'accessory', 'abs', [], 'bodyweight'),
  entry('plank', 'Deska', 'accessory', 'abs', [], 'bodyweight', { measure: 'time', load: 'none' }),
]
