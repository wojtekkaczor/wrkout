import { expect, test, type Page } from '@playwright/test'

/** A small made-up backup: two exercises, three workouts over two weeks, three cardio entries. */
function backupFile() {
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

async function importBackup(page: Page) {
  await page.goto('/profil')
  await page.getByLabel('Plik kopii do importu').setInputFiles({
    name: 'kopia.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backupFile())),
  })
  await expect(page.getByRole('status')).toContainText('Import zakończony')
}

test('imports a backup and reports what was rejected', async ({ page }) => {
  await importBackup(page)

  await expect(page.getByRole('status')).toContainText('dodano 8')
  await expect(page.getByRole('status')).toContainText('odrzucono 1')
  await expect(page.getByText('Treningi: 3 · Biegi: 3 · Ćwiczenia: 2')).toBeVisible()
})

test('importing the same file again adds nothing', async ({ page }) => {
  await importBackup(page)
  await importBackup(page)

  await expect(page.getByRole('status')).toContainText('dodano 0')
  await expect(page.getByText('Treningi: 3 · Biegi: 3 · Ćwiczenia: 2')).toBeVisible()
})

test('rejects a file that is not a backup', async ({ page }) => {
  await page.goto('/profil')
  await page.getByLabel('Plik kopii do importu').setInputFiles({
    name: 'inne.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"hello":"world"}'),
  })

  await expect(page.getByRole('status')).toContainText('To nie jest plik kopii wrkout')
})

test('shows strength progress and exercise details', async ({ page }) => {
  await importBackup(page)
  await page.getByRole('link', { name: 'Postępy' }).click()

  const bench = page.getByRole('link', { name: /Wyciskanie testowe/ })
  // 65 kg × 8 → 82.33, shown rounded to the nearest half kilogram.
  await expect(bench).toContainText('82,5 kg')
  await expect(bench).toContainText('+6,5 kg od początku')
  await expect(page.getByRole('link', { name: /Podciąganie testowe/ })).toContainText('8 powt.')

  await bench.click()
  await expect(page.getByRole('heading', { level: 1, name: 'Wyciskanie testowe' })).toBeVisible()
  await expect(page.getByRole('img', { name: /Szacowany maks/ })).toBeVisible()
  await expect(page.getByText('Największy ciężar')).toBeVisible()
  await expect(page.getByText('65 kg × 8, 8, 7')).toBeVisible()
  await expect(page.getByText('zapas 2 · tempo 3010').first()).toBeVisible()
})

test('shows running totals and the list of activities', async ({ page }) => {
  await importBackup(page)
  await page.goto('/postepy?widok=bieganie')

  await expect(page.getByRole('img', { name: /Kilometraż tygodniowy/ })).toBeVisible()
  await expect(page.getByText('8 km · 50:00 · 6:15 /km')).toBeVisible()
  await expect(page.getByText('Plan: 2 km spokojnie + 3x1000 m')).toBeVisible()
  await expect(page.getByText('Rower')).toBeVisible()
})

test('builds the weekly report and steps between weeks', async ({ page }) => {
  await importBackup(page)
  await page.goto('/postepy?widok=raporty')

  await expect(page.getByRole('heading', { name: '7–13 września' })).toBeVisible()
  const strength = page.locator('section', { hasText: 'serie robocze' })
  await expect(strength).toContainText('2')
  await expect(strength).toContainText('8')
  await expect(page.locator('section', { hasText: 'Serie na partię' })).toContainText('Klatka')
  await expect(page.locator('section', { hasText: 'Rekordy tygodnia' })).toContainText(
    'Wyciskanie testowe',
  )
  await expect(page.getByText('Inne cardio: 55:00')).toBeVisible()

  await page.getByRole('button', { name: 'Starszy tydzień' }).click()
  await expect(page.getByRole('heading', { name: '31 sierpnia – 6 września' })).toBeVisible()
  await expect(page.getByText('Bez nowych rekordów e1RM.')).toBeVisible()
})

test('opens a workout from the history', async ({ page }) => {
  await importBackup(page)
  await page.goto('/postepy?widok=historia')

  await expect(page.getByText('Wpisy (6)')).toBeVisible()
  await page.getByRole('link', { name: /Trening A/ }).first().click()

  await expect(page.getByRole('heading', { level: 1, name: 'Trening A' })).toBeVisible()
  await expect(page.getByText('czwartek, 10 września 2026')).toBeVisible()
  await expect(page.getByText('65 kg × 8, 8, 7')).toBeVisible()
  await expect(page.getByText('8 powt.')).toBeVisible()

  await page.getByRole('link', { name: '‹ Historia' }).click()
  await expect(page.getByText('Wpisy (6)')).toBeVisible()
})

test('exports a backup that contains the imported documents', async ({ page }) => {
  await importBackup(page)

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Eksportuj kopię' }).click()
  const file = await download

  expect(file.suggestedFilename()).toMatch(/^wrkout-kopia-\d{4}-\d{2}-\d{2}\.json$/)
  await expect(page.getByRole('status')).toContainText('Kopia zawiera 8 dokumentów')
})
