import { expect, type Page } from '@playwright/test'

/**
 * A small made-up backup: two exercises, one session in "Moje treningi",
 * three workouts over two weeks, three cardio entries and one broken document.
 */
export function backupFile() {
  const doc = (id: string, type: string, updatedAt: number, data: unknown) => ({
    id,
    type,
    updatedAt,
    schemaVersion: 1,
    data,
  })
  const set = (weightKg: number | undefined, reps: number) => ({
    kind: 'work',
    done: true,
    reps,
    ...(weightKg === undefined ? {} : { weightKg }),
  })
  const workout = (id: string, date: string, benchKg: number, chinReps: number) =>
    doc(id, 'workoutLog', 1, {
      templateId: 'tpl:a',
      title: 'Trening A',
      date,
      loggedAt: 1,
      context: { label: 'Blok testowy · Tydzień 1' },
      exercises: [
        {
          exerciseId: 'ex:bench',
          tier: 'main',
          rir: 2,
          tempo: '3010',
          sets: [set(benchKg, 8), set(benchKg, 8), set(benchKg, 7)],
        },
        { exerciseId: 'ex:chin', tier: 'supplementary', sets: [set(undefined, chinReps)] },
      ],
    })

  return {
    app: 'wrkout',
    exportedAt: 1,
    formatVersion: 1,
    docs: [
      doc('ex:bench', 'exercise', 1, {
        name: 'Wyciskanie testowe',
        tier: 'main',
        measure: 'reps',
        load: 'external',
        unilateral: false,
        primary: 'chest',
        secondary: ['triceps'],
      }),
      doc('ex:chin', 'exercise', 1, {
        name: 'Podciąganie testowe',
        tier: 'supplementary',
        measure: 'reps',
        load: 'bodyweight',
        unilateral: false,
        primary: 'back',
        secondary: ['biceps'],
      }),
      doc('tpl:a', 'workoutTemplate', 1, {
        name: 'Trening A',
        order: 0,
        slots: [
          { id: 's1', exerciseId: 'ex:bench', tier: 'main', sets: 3, range: [8, 8], rir: 2, tempo: '3010' },
          { id: 's2', exerciseId: 'ex:chin', tier: 'supplementary', sets: 1, range: [6, 8] },
        ],
      }),
      workout('wl:1', '2026-09-01', 60, 6),
      workout('wl:2', '2026-09-08', 62.5, 7),
      workout('wl:3', '2026-09-10', 65, 8),
      doc('run:1', 'runLog', 1, {
        date: '2026-09-02',
        sport: 'run',
        runType: 'easy',
        source: 'manual',
        distanceM: 6000,
        movingSec: 2400,
        rpe: 4,
      }),
      doc('run:2', 'runLog', 1, {
        date: '2026-09-09',
        sport: 'run',
        runType: 'intervals',
        source: 'manual',
        distanceM: 8000,
        movingSec: 3000,
        planned: '2 km spokojnie + 3x1000 m',
        note: 'Mocne nogi',
      }),
      doc('run:3', 'runLog', 1, { date: '2026-09-11', sport: 'bike', source: 'manual', movingSec: 3300 }),
      { id: 'broken', type: 'exercise', updatedAt: 1, schemaVersion: 1, data: { name: '' } },
    ],
  }
}

export async function importBackup(page: Page) {
  await page.goto('/profil')
  await page.getByLabel('Plik kopii do importu').setInputFiles({
    name: 'kopia.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backupFile())),
  })
  await expect(page.getByRole('status')).toContainText('Import zakończony')
}

