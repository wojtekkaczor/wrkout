import { expect, test } from '@playwright/test'

test('opens on the Today tab', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: 'Dziś' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toBeVisible()
})

test('switches between the four tabs', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Główna nawigacja' })

  for (const tab of ['Plan', 'Postępy', 'Profil', 'Dziś']) {
    await nav.getByRole('link', { name: tab }).click()
    await expect(page.getByRole('heading', { level: 1, name: tab })).toBeVisible()
  }
})

test('serves client-side routes on a direct visit', async ({ page }) => {
  await page.goto('/profil')

  await expect(page.getByRole('heading', { level: 1, name: 'Profil' })).toBeVisible()
})

test('sends unknown paths back to Today', async ({ page }) => {
  await page.goto('/nie-ma-takiej-strony')

  await expect(page.getByRole('heading', { level: 1, name: 'Dziś' })).toBeVisible()
})

test('keeps the chosen theme after a reload', async ({ page }) => {
  await page.goto('/profil')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('radio', { name: 'Jasny' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('radio', { name: 'Jasny' })).toBeChecked()
})

test('shows the app version in the profile', async ({ page }) => {
  await page.goto('/profil')

  await expect(page.getByText(/^Wersja \d+\.\d+\.\d+$/)).toBeVisible()
})

test('answers the health check from the API', async ({ request }) => {
  const response = await request.get('/api/health')

  expect(response.ok()).toBe(true)
  expect(await response.json()).toMatchObject({ ok: true, version: expect.any(String) })
})

test('answers unknown API routes with JSON, not the app shell', async ({ request }) => {
  const response = await request.get('/api/unknown')

  expect(response.status()).toBe(404)
  expect(await response.json()).toMatchObject({ error: { code: 'not_found' } })
})

test('exposes an installable manifest', async ({ page, request }) => {
  await page.goto('/')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBeTruthy()

  const manifest = await (await request.get(href ?? '')).json()
  expect(manifest).toMatchObject({ name: 'wrkout', display: 'standalone', lang: 'pl' })
  expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
})

test('works offline after the first visit', async ({ page, context, browserName }) => {
  test.skip(
    browserName === 'webkit',
    'Offline service worker behaviour is checked on a real iPhone; Playwright WebKit is not reliable here.',
  )

  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })

  await context.setOffline(true)
  await page.reload()

  await expect(page.getByRole('heading', { level: 1, name: 'Dziś' })).toBeVisible()
  await page.getByRole('link', { name: 'Profil' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Profil' })).toBeVisible()
})
