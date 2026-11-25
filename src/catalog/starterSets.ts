import type { Tier } from '@/domain'

export type StarterSlot = {
  /** Catalogue exercise id without the `cat:` prefix. */
  exercise: string
  sets: number
  range: [number, number]
  tier?: Tier
}

export type StarterSet = {
  id: string
  name: string
  description: string
  sessions: { name: string; slots: StarterSlot[] }[]
}

const slot = (exercise: string, sets: number, low: number, high: number): StarterSlot => ({
  exercise,
  sets,
  range: [low, high],
})

const UPPER_A = [
  slot('bench-press', 3, 6, 10),
  slot('barbell-row', 3, 8, 12),
  slot('db-shoulder-press', 3, 8, 12),
  slot('lat-pulldown', 3, 10, 15),
  slot('lateral-raise', 3, 12, 20),
  slot('triceps-pushdown', 2, 10, 15),
  slot('biceps-curl', 2, 10, 15),
]

const LOWER_A = [
  slot('squat', 3, 6, 10),
  slot('romanian-deadlift', 3, 8, 12),
  slot('leg-press', 2, 10, 15),
  slot('leg-curl', 3, 10, 15),
  slot('calf-raise', 3, 10, 15),
  slot('cable-crunch', 3, 10, 15),
]

/**
 * Ready-made sessions for a first start, following the splits in
 * docs/03-silnik-treningowy.md §4.1. The user can change everything afterwards.
 */
export const STARTER_SETS: StarterSet[] = [
  {
    id: 'full-body-2',
    name: 'Całe ciało A / B',
    description: '2 treningi siłowe w tygodniu',
    sessions: [
      {
        name: 'Całe ciało A',
        slots: [
          slot('squat', 3, 6, 10),
          slot('bench-press', 3, 6, 10),
          slot('barbell-row', 3, 8, 12),
          slot('db-shoulder-press', 2, 8, 12),
          slot('leg-curl', 2, 10, 15),
          slot('biceps-curl', 2, 10, 15),
          slot('plank', 2, 30, 60),
        ],
      },
      {
        name: 'Całe ciało B',
        slots: [
          slot('romanian-deadlift', 3, 8, 12),
          slot('overhead-press', 3, 6, 10),
          slot('lat-pulldown', 3, 10, 15),
          slot('leg-press', 3, 10, 15),
          slot('incline-db-press', 2, 8, 12),
          slot('triceps-pushdown', 2, 10, 15),
          slot('hanging-leg-raise', 2, 8, 12),
        ],
      },
    ],
  },
  {
    id: 'upper-lower-full-3',
    name: 'Góra / Dół / Całe ciało',
    description: '3 treningi siłowe w tygodniu',
    sessions: [
      { name: 'Góra', slots: UPPER_A },
      { name: 'Dół', slots: LOWER_A },
      {
        name: 'Całe ciało',
        slots: [
          slot('incline-db-press', 3, 8, 12),
          slot('seated-row', 3, 8, 12),
          slot('split-squat', 3, 8, 12),
          slot('hip-thrust', 3, 8, 12),
          slot('lateral-raise', 2, 12, 20),
          slot('face-pull', 2, 12, 20),
          slot('plank', 2, 30, 60),
        ],
      },
    ],
  },
  {
    id: 'upper-lower-4',
    name: 'Góra A / Dół A / Góra B / Dół B',
    description: '4 treningi siłowe w tygodniu',
    sessions: [
      { name: 'Góra A', slots: UPPER_A },
      { name: 'Dół A', slots: LOWER_A },
      {
        name: 'Góra B',
        slots: [
          slot('overhead-press', 3, 6, 10),
          slot('pull-up', 3, 6, 10),
          slot('incline-db-press', 3, 8, 12),
          slot('seated-row', 3, 8, 12),
          slot('rear-delt-fly', 3, 12, 20),
          slot('biceps-curl', 2, 10, 15),
          slot('triceps-pushdown', 2, 10, 15),
        ],
      },
      {
        name: 'Dół B',
        slots: [
          slot('hip-thrust', 3, 8, 12),
          slot('split-squat', 3, 8, 12),
          slot('leg-extension', 3, 10, 15),
          slot('leg-curl', 3, 10, 15),
          slot('calf-raise', 3, 10, 15),
          slot('hanging-leg-raise', 3, 8, 12),
        ],
      },
    ],
  },
]
