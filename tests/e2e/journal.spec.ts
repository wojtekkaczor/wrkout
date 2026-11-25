import { expect, test, type Page } from '@playwright/test'
import { importBackup } from './fixtures'

/** Imports the fixture and starts "Trening A" from the Today tab. */
async function startTrainingA(page: Page) {
  await importBackup(page)
  await page.getByRole('link', { name: 'Dziś' }).click()
  await page.getByRole('button', { name: /Trening A/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Trening A' })).toBeVisible()
}

const bench = (page: Page) => page.getByRole('region', { name: 'Wyciskanie testowe' })

test('offers the sessions from "Moje treningi" with the date they were last done', async ({ page }) => {
  await importBackup(page)
  await page.getByRole('link', { name: 'Dziś' }).click()

  await expect(page.getByRole('button', { name: /Trening A/ })).toContainText('ostatnio 10 wrz')
})

test('starts a workout filled in like last time', async ({ page }) => {
  await startTrainingA(page)

  await expect(page.getByText('dziś · 0 z 4 serii')).toBeVisible()
  await expect(bench(page)).toContainText('Ostatnio (10 wrz): 65 kg × 8, 8, 7')
  await expect(bench(page)).toContainText('Główne · tempo 3010 · cel: zapas 2')
  await expect(bench(page).getByRole('button', { name: 'Seria 3: powtórzenia' })).toHaveText('7')
  await expect(bench(page).getByRole('button', { name: 'Seria 1: ciężar' })).toHaveText('65 kg')
  // Logging takes the whole screen: no tab bar.
  await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toHaveCount(0)
})

test('logs a workout like last time in five taps', async ({ page }) => {
  await importBackup(page)
  await page.getByRole('link', { name: 'Dziś' }).click()

  await page.getByRole('button', { name: /Trening A/ }).click() // 1
  await page.getByRole('button', { name: 'Wszystko jak ostatnio' }).click() // 2
  await page.getByRole('button', { name: 'Zakończ' }).click() // 3
  await page.getByRole('radio', { name: '7', exact: true }).click() // 4
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click() // 5

  await expect(page.getByText('Wysiłek: 7 / 10')).toBeVisible()
  await expect(page.getByText('65 kg × 8, 8, 7')).toBeVisible()
  await page.getByRole('link', { name: '‹ Historia' }).click()
  await expect(page.getByText('Wpisy (7)')).toBeVisible()
})

test('ticks single sets and a whole exercise', async ({ page }) => {
  await startTrainingA(page)

  await bench(page).getByRole('button', { name: 'Seria 1: zrobiona' }).click()
  await expect(page.getByText('dziś · 1 z 4 serii')).toBeVisible()
  await expect(bench(page).getByRole('button', { name: 'Seria 1: zrobiona' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await bench(page).getByRole('button', { name: '✓ wszystkie serie' }).click()
  await expect(page.getByText('dziś · 3 z 4 serii')).toBeVisible()
})

test('edits a set and carries the new weight to the sets after it', async ({ page }) => {
  await startTrainingA(page)

  await bench(page).getByRole('button', { name: 'Seria 1: ciężar' }).click()
  const sheet = page.getByRole('dialog', { name: 'Wyciskanie testowe · seria 1' })
  await sheet.getByRole('button', { name: 'Ciężar: więcej' }).click()
  await sheet.getByRole('button', { name: 'Powtórzenia: mniej' }).click()
  await sheet.getByRole('button', { name: 'Zapisz ✓' }).click()

  await expect(bench(page).getByRole('button', { name: 'Seria 1: ciężar' })).toHaveText('67,5 kg')
  await expect(bench(page).getByRole('button', { name: 'Seria 1: powtórzenia' })).toHaveText('7')
  await expect(bench(page).getByRole('button', { name: 'Seria 2: ciężar' })).toHaveText('67,5 kg')
  await expect(bench(page).getByRole('button', { name: 'Seria 3: ciężar' })).toHaveText('67,5 kg')
  await expect(page.getByText('dziś · 1 z 4 serii')).toBeVisible()
})

test('accepts a typed weight with a decimal comma', async ({ page }) => {
  await startTrainingA(page)

  await bench(page).getByRole('button', { name: 'Seria 2: ciężar' }).click()
  const sheet = page.getByRole('dialog', { name: 'Wyciskanie testowe · seria 2' })
  await sheet.getByLabel('Ciężar (kg)').fill('66,25')
  await sheet.getByRole('button', { name: 'Zapisz ✓' }).click()

  await expect(bench(page).getByRole('button', { name: 'Seria 2: ciężar' })).toHaveText('66,25 kg')
  await expect(bench(page).getByRole('button', { name: 'Seria 1: ciężar' })).toHaveText('65 kg')
})

test('records reps in reserve once per exercise', async ({ page }) => {
  await startTrainingA(page)

  await page.getByRole('radiogroup', { name: 'Zapas: Wyciskanie testowe' }).getByRole('radio', { name: '1' }).click()
  await page.getByRole('button', { name: 'Wszystko jak ostatnio' }).click()
  await page.getByRole('button', { name: 'Zakończ' }).click()
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click()

  await expect(page.getByText('Główne · zapas 1 · tempo 3010')).toBeVisible()
})

test('keeps a workout in progress across a reload and offers to continue it', async ({ page }) => {
  await startTrainingA(page)
  await bench(page).getByRole('button', { name: 'Seria 1: zrobiona' }).click()
  await expect(page.getByText('dziś · 1 z 4 serii')).toBeVisible()

  await page.reload()
  await expect(bench(page).getByRole('button', { name: 'Seria 1: zrobiona' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await page.getByRole('link', { name: '‹ Dziś' }).click()
  const resume = page.getByRole('link', { name: /Kontynuuj: Trening A/ })
  await expect(resume).toContainText('1 z 4 serii')
  await resume.click()
  await expect(page.getByRole('heading', { level: 1, name: 'Trening A' })).toBeVisible()
})

test('does not count an unfinished workout in history or progress', async ({ page }) => {
  await startTrainingA(page)
  await page.getByRole('button', { name: 'Wszystko jak ostatnio' }).click()

  await page.goto('/postepy?widok=historia')

  await expect(page.getByText('Wpisy (6)')).toBeVisible()
})

test('enters a workout after the fact with its own date', async ({ page }) => {
  await startTrainingA(page)

  await page.getByRole('button', { name: 'Data i inne' }).click()
  await page.getByLabel('Data treningu').fill('2026-09-15')
  await page.getByRole('button', { name: 'Zamknij' }).click()
  await expect(page.getByText('wtorek, 15 września 2026 · 0 z 4 serii')).toBeVisible()

  await page.getByRole('button', { name: 'Wszystko jak ostatnio' }).click()
  await page.getByRole('button', { name: 'Zakończ' }).click()
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click()

  await expect(page.getByText('wtorek, 15 września 2026')).toBeVisible()
})

test('adds a brand new exercise to an empty workout', async ({ page }) => {
  await importBackup(page)
  await page.getByRole('link', { name: 'Dziś' }).click()
  await page.getByRole('button', { name: 'Inny trening' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Trening' })).toBeVisible()

  await page.getByRole('button', { name: 'Dodaj ćwiczenie' }).click()
  await page.getByLabel('Szukaj ćwiczenia').fill('Wznosy bokiem')
  await expect(page.getByText('Brak ćwiczeń o takiej nazwie.')).toBeVisible()
  await page.getByRole('button', { name: 'Nowe ćwiczenie' }).click()
  await expect(page.getByLabel('Nazwa')).toHaveValue('Wznosy bokiem')
  await page.getByRole('dialog').getByRole('button', { name: 'Dodaj ćwiczenie' }).click()

  const added = page.getByRole('region', { name: 'Wznosy bokiem' })
  await expect(added).toContainText('Pierwszy raz')
  await expect(added.getByRole('button', { name: /Seria \d: ciężar/ })).toHaveCount(3)
})

test('swaps an exercise and removes one from the workout', async ({ page }) => {
  await startTrainingA(page)

  await page.getByRole('button', { name: 'Więcej: Podciąganie testowe' }).click()
  await page.getByRole('button', { name: 'Zamień ćwiczenie' }).click()
  await page.getByRole('dialog').getByRole('button', { name: /Wyciskanie testowe/ }).click()
  await expect(page.getByRole('region', { name: 'Podciąganie testowe' })).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Wyciskanie testowe' })).toHaveCount(2)

  await page.getByRole('button', { name: 'Więcej: Wyciskanie testowe' }).last().click()
  await page.getByRole('button', { name: 'Usuń z treningu' }).click()
  await expect(page.getByRole('region', { name: 'Wyciskanie testowe' })).toHaveCount(1)
})

test('edits and deletes a workout from the history', async ({ page }) => {
  await importBackup(page)
  await page.goto('/postepy?widok=historia')
  await page.getByRole('link', { name: /Trening A/ }).first().click()

  await page.getByRole('link', { name: 'Edytuj trening' }).click()
  await bench(page).getByRole('button', { name: 'Seria 3: powtórzenia' }).click()
  const sheet = page.getByRole('dialog', { name: 'Wyciskanie testowe · seria 3' })
  await sheet.getByRole('button', { name: 'Powtórzenia: więcej' }).click()
  await sheet.getByRole('button', { name: 'Zapisz ✓' }).click()
  await page.getByRole('button', { name: 'Zapisz zmiany' }).click()
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click()
  await expect(page.getByText('65 kg × 8, 8, 8')).toBeVisible()

  await page.getByRole('button', { name: 'Usuń trening' }).click()
  await page.getByRole('button', { name: 'Tak, usuń trening' }).click()
  await expect(page.getByText('Wpisy (5)')).toBeVisible()
})

test('logs a run by hand and computes the pace', async ({ page }) => {
  await importBackup(page)
  await page.getByRole('link', { name: 'Dziś' }).click()
  await page.getByRole('link', { name: 'Bieg lub cardio' }).click()

  await page.getByLabel('Data').fill('2026-09-20')
  await page.getByLabel('Dystans (km)').fill('8,4')
  await page.getByLabel('Czas').fill('45,10')
  await page.getByRole('radio', { name: '5', exact: true }).click()
  await page.getByLabel('Notatka (opcjonalnie)').fill('Lekko')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  await expect(page.getByText('8,4 km · 45:10 · 5:23 /km · RPE 5')).toBeVisible()
  await expect(page.getByText('Notatka: Lekko')).toBeVisible()
  await expect(page.getByText('Aktywności (4)')).toBeVisible()
})

test('explains a time it cannot read instead of saving', async ({ page }) => {
  await page.goto('/bieg/nowy')

  await page.getByLabel('Czas').fill('dużo')
  await page.getByRole('button', { name: 'Zapisz' }).click()

  await expect(page.getByRole('alert')).toContainText('Czas wpisz jako')
  await expect(page.getByRole('heading', { level: 1, name: 'Nowy bieg' })).toBeVisible()
})

test('edits and deletes a cardio entry', async ({ page }) => {
  await importBackup(page)
  await page.goto('/postepy?widok=bieganie')

  await page.locator('li', { hasText: 'Rower' }).getByRole('link', { name: 'Edytuj' }).click()
  await expect(page.getByRole('radio', { name: 'Rower' })).toBeChecked()
  await expect(page.getByLabel('Czas')).toHaveValue('55:00')
  await page.getByLabel('Czas').fill('1:05:00')
  await page.getByRole('button', { name: 'Zapisz' }).click()
  await expect(page.locator('li', { hasText: 'Rower' })).toContainText('1:05:00')

  await page.locator('li', { hasText: 'Rower' }).getByRole('link', { name: 'Edytuj' }).click()
  await page.getByRole('button', { name: 'Usuń wpis' }).click()
  await page.getByRole('button', { name: 'Tak, usuń wpis' }).click()
  await expect(page.getByText('Aktywności (2)')).toBeVisible()
})

test('creates a session in "Moje treningi" and offers it on Today', async ({ page }) => {
  await importBackup(page)
  await page.getByRole('link', { name: 'Treningi' }).click()
  await expect(page.getByRole('link', { name: /Trening A/ })).toContainText('2 ćwiczenia · 4 serie')

  await page.getByRole('link', { name: 'Nowy trening' }).click()
  await page.getByRole('button', { name: 'Zapisz trening' }).click()
  await expect(page.getByRole('alert')).toContainText('Nadaj treningowi nazwę')

  await page.getByLabel('Nazwa').fill('Góra B')
  await page.getByRole('button', { name: 'Dodaj ćwiczenie' }).click()
  await page.getByRole('dialog').getByRole('button', { name: /Podciąganie testowe/ }).click()
  const slot = page.getByRole('region', { name: 'Podciąganie testowe' })
  await slot.getByLabel('Serie').fill('4')
  await slot.getByLabel('Tempo').fill('3010')
  await page.getByRole('button', { name: 'Zapisz trening' }).click()

  await expect(page.getByRole('link', { name: /Góra B/ })).toContainText('1 ćwiczenie · 4 serie')
  await page.getByRole('link', { name: 'Dziś' }).click()
  await expect(page.getByRole('button', { name: /Góra B/ })).toContainText('jeszcze nie robiony')

  await page.getByRole('button', { name: /Góra B/ }).click()
  const chin = page.getByRole('region', { name: 'Podciąganie testowe' })
  await expect(chin.getByRole('button', { name: /Seria \d: powtórzenia/ })).toHaveCount(4)
  await expect(chin).toContainText('tempo 3010')
})

test('removes a session from "Moje treningi" without touching the history', async ({ page }) => {
  await importBackup(page)
  await page.getByRole('link', { name: 'Treningi' }).click()
  await page.getByRole('link', { name: /Trening A/ }).click()

  await page.getByRole('button', { name: 'Usuń trening z listy' }).click()
  await page.getByRole('button', { name: 'Tak, usuń trening z listy' }).click()

  await expect(page.getByText('Brak treningów')).toBeVisible()
  await page.goto('/postepy?widok=historia')
  await expect(page.getByText('Wpisy (6)')).toBeVisible()
})
