import { expect, test, type Page } from '@playwright/test'
import { importBackup } from './fixtures'

const bench = (page: Page) => page.getByRole('region', { name: 'Wyciskanie testowe' })

async function startTrainingA(page: Page) {
  await page.getByRole('link', { name: 'Dziś', exact: true }).click()
  await page.getByRole('button', { name: /Trening A/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Trening A' })).toBeVisible()
}

test('uses the load step from the settings', async ({ page }) => {
  await importBackup(page)
  const barbell = page.getByLabel('Sztanga')
  await barbell.fill('5')
  await barbell.blur()

  await startTrainingA(page)
  await bench(page).getByRole('button', { name: 'Seria 1: ciężar' }).click()
  const sheet = page.getByRole('dialog', { name: 'Wyciskanie testowe · seria 1' })
  await sheet.getByRole('button', { name: 'Ciężar: więcej' }).click()
  await sheet.getByRole('button', { name: 'Zapisz ✓' }).click()

  await expect(bench(page).getByRole('button', { name: 'Seria 1: ciężar' })).toHaveText('70 kg')
})

test('starts the report week on the day chosen in the settings', async ({ page }) => {
  await importBackup(page)
  await page.getByRole('radio', { name: 'Niedziela' }).click()

  await page.goto('/postepy?widok=raporty')

  await expect(page.getByRole('heading', { name: '6–12 września' })).toBeVisible()
})

test('keeps a note and a personal load step for an exercise', async ({ page }) => {
  await importBackup(page)
  await startTrainingA(page)

  await page.getByRole('button', { name: 'Więcej: Wyciskanie testowe' }).click()
  await page.getByRole('button', { name: 'Notatka i ustawienia' }).click()
  const prefs = page.getByRole('dialog', { name: /notatka i ustawienia/ })
  await prefs.getByLabel('Notatka (widoczna przy każdym treningu)').fill('Chwyt na szerokość kciuka')
  await prefs.getByLabel('Skok ciężaru (kg)').fill('1,25')
  await prefs.getByRole('button', { name: 'Zapisz' }).click()

  await expect(bench(page)).toContainText('Notatka: Chwyt na szerokość kciuka')

  await bench(page).getByRole('button', { name: 'Seria 1: ciężar' }).click()
  const sheet = page.getByRole('dialog', { name: 'Wyciskanie testowe · seria 1' })
  await sheet.getByRole('button', { name: 'Ciężar: więcej' }).click()
  await sheet.getByRole('button', { name: 'Zapisz ✓' }).click()
  await expect(bench(page).getByRole('button', { name: 'Seria 1: ciężar' })).toHaveText('66,25 kg')

  await page.goto(`/postepy/cwiczenie/${encodeURIComponent('ex:bench')}`)
  await expect(page.getByText('Chwyt na szerokość kciuka')).toBeVisible()
})

test('tracks body weight with a trend', async ({ page }) => {
  await page.goto('/postepy?widok=raporty')
  await expect(page.getByText('Brak pomiarów. Waga jest opcjonalna.')).toBeVisible()

  await page.getByRole('button', { name: 'Dodaj pomiar wagi' }).click()
  let sheet = page.getByRole('dialog', { name: 'Waga ciała' })
  await sheet.getByLabel('Data pomiaru').fill('2026-11-01')
  await sheet.getByLabel('Waga (kg)').fill('83,2')
  await sheet.getByRole('button', { name: 'Zapisz' }).click()
  await expect(page.getByText('83,2 kg')).toBeVisible()

  await page.getByRole('button', { name: 'Dodaj pomiar wagi' }).click()
  sheet = page.getByRole('dialog', { name: 'Waga ciała' })
  await sheet.getByLabel('Data pomiaru').fill('2026-11-15')
  await sheet.getByRole('button', { name: 'Waga: mniej' }).click()
  await sheet.getByRole('button', { name: 'Zapisz' }).click()

  await expect(page.getByText('−0,1 kg od 1 lis')).toBeVisible()
  await expect(page.getByRole('img', { name: /Waga ciała w 2 pomiarach/ })).toBeVisible()

  await page.getByRole('button', { name: 'Dodaj pomiar wagi' }).click()
  sheet = page.getByRole('dialog', { name: 'Waga ciała' })
  await sheet.getByLabel('Data pomiaru').fill('2026-11-15')
  await sheet.getByRole('button', { name: /Usuń pomiar/ }).click()
  await expect(page.getByRole('img', { name: /Waga ciała/ })).toHaveCount(0)
})

test('reminds about a backup until one is made', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Zrób kopię danych')).toHaveCount(0)

  await importBackup(page)
  await expect(page.getByText('Kopia zapasowa: jeszcze nie zrobiona.')).toBeVisible()
  await page.getByRole('link', { name: 'Dziś', exact: true }).click()
  await expect(page.getByText('Zrób kopię danych')).toBeVisible()

  await page.getByRole('link', { name: 'Przejdź do kopii w Profilu' }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Eksportuj kopię' }).click()
  await download
  await expect(page.getByText(/^Ostatnia kopia: /)).toBeVisible()

  await page.getByRole('link', { name: 'Dziś', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Dziś' })).toBeVisible()
  await expect(page.getByText('Zrób kopię danych')).toHaveCount(0)
})

test('marks the records set in a workout', async ({ page }) => {
  await importBackup(page)
  await page.goto('/postepy?widok=historia')

  // Newest workout: 65 kg × 8 beats 62.5 kg × 8, and 8 chin-ups beat 7.
  await page.getByRole('link', { name: /Trening A/ }).first().click()
  const records = page.locator('section', { hasText: 'Rekordy w tym treningu' })
  await expect(records).toContainText('Wyciskanie testowe')
  await expect(records).toContainText('65×8 · e1RM 82,5 kg (+3,2 kg)')
  await expect(records).toContainText('8 powt. (+1)')

  // The first workout ever sets the baseline, so it shows no records.
  await page.getByRole('link', { name: '‹ Historia' }).click()
  await page.getByRole('link', { name: /Trening A/ }).last().click()
  await expect(page.getByText('1 września 2026')).toBeVisible()
  await expect(page.getByText('Rekordy w tym treningu')).toHaveCount(0)
})

test('adds a ready-made set of sessions and logs from it', async ({ page }) => {
  await page.goto('/plan')
  await expect(page.getByText('Brak treningów')).toBeVisible()

  await page.getByRole('button', { name: 'Dodaj gotowy zestaw' }).click()
  await page.getByRole('button', { name: /Całe ciało A \/ B/ }).click()

  await expect(page.getByRole('link', { name: /Całe ciało A/ })).toContainText('7 ćwiczeń · 17 serii')
  await expect(page.getByRole('link', { name: /Całe ciało B/ })).toBeVisible()

  await page.getByRole('link', { name: 'Dziś', exact: true }).click()
  await page.getByRole('button', { name: /Całe ciało A/ }).click()
  const squat = page.getByRole('region', { name: 'Przysiad ze sztangą' })
  await expect(squat).toContainText('Pierwszy raz')
  await expect(squat.getByRole('button', { name: 'Seria 1: powtórzenia' })).toHaveText('6')
  await expect(
    page.getByRole('region', { name: 'Deska' }).getByRole('button', { name: 'Seria 1: czas' }),
  ).toHaveText('30 s')
})

test('goes from the history to adding an entry', async ({ page }) => {
  await importBackup(page)
  await page.goto('/postepy?widok=historia')

  await page.getByRole('link', { name: 'Dodaj trening lub bieg' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Dziś' })).toBeVisible()
})

test('journal flow: build a session, log half, reopen, finish, see it in history and the report', async ({
  page,
}) => {
  // Build a session with a new exercise.
  await page.goto('/plan/trening/nowy')
  await page.getByLabel('Nazwa').fill('Nogi')
  await page.getByRole('button', { name: 'Dodaj ćwiczenie' }).click()
  await page.getByRole('button', { name: 'Nowe ćwiczenie' }).click()
  const form = page.getByRole('dialog', { name: 'Nowe ćwiczenie' })
  await form.getByLabel('Nazwa').fill('Przysiad testowy')
  await form.getByLabel('Główna partia (do raportu serii)').selectOption('quads')
  await form.getByRole('button', { name: 'Dodaj ćwiczenie' }).click()
  await page.getByRole('button', { name: 'Zapisz trening' }).click()
  await expect(page.getByRole('link', { name: /Nogi/ })).toContainText('1 ćwiczenie · 3 serie')

  // Log the first set, then close the app half-way.
  await page.getByRole('link', { name: 'Dziś', exact: true }).click()
  await page.getByRole('button', { name: /Nogi/ }).click()
  const squat = page.getByRole('region', { name: 'Przysiad testowy' })
  await squat.getByRole('button', { name: 'Seria 1: ciężar' }).click()
  const sheet = page.getByRole('dialog', { name: 'Przysiad testowy · seria 1' })
  await sheet.getByLabel('Ciężar (kg)').fill('100')
  await sheet.getByRole('button', { name: 'Zapisz ✓' }).click()
  await expect(page.getByText('dziś · 1 z 3 serii')).toBeVisible()

  // Reopen and continue from Today.
  await page.goto('/')
  await page.getByRole('link', { name: /Kontynuuj: Nogi/ }).click()
  await expect(squat.getByRole('button', { name: 'Seria 2: ciężar' })).toHaveText('100 kg')
  await squat.getByRole('button', { name: '✓ wszystkie serie' }).click()

  // Finish with a report.
  await page.getByRole('button', { name: 'Zakończ' }).click()
  await page.getByRole('radio', { name: '8', exact: true }).click()
  await page.getByLabel('Notatka (opcjonalnie)').fill('Dobry dzień')
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click()
  await expect(page.getByText('Wysiłek: 8 / 10')).toBeVisible()
  await expect(page.getByText('100 kg × 8, 8, 8')).toBeVisible()

  // History and the weekly report agree with what was logged.
  await page.getByRole('link', { name: '‹ Historia' }).click()
  await expect(page.getByText('Wpisy (1)')).toBeVisible()
  await page.getByRole('radio', { name: 'Raporty' }).click()
  const strength = page.locator('section', { hasText: 'serie robocze' })
  await expect(strength).toContainText('1')
  await expect(strength).toContainText('3')
  await expect(page.locator('section', { hasText: 'Serie na partię' })).toContainText('Czworogłowe')

  // Today no longer offers to continue it.
  await page.getByRole('link', { name: 'Dziś', exact: true }).click()
  await expect(page.getByRole('link', { name: /Kontynuuj/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Nogi/ })).toContainText('ostatnio')
})
