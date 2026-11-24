import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defaultSettings } from '@/domain'
import { WrkoutDb } from './db'
import { createSettingsRepo, loadSettings, updateSettings } from './settings'

let counter = 0
let database: WrkoutDb

beforeEach(() => {
  counter += 1
  database = new WrkoutDb(`settings-test-${counter}`)
})

afterEach(async () => {
  await database.delete()
})

describe('settings', () => {
  it('returns the defaults before anything is saved', async () => {
    expect(await loadSettings(createSettingsRepo(database))).toEqual(defaultSettings)
  })

  it('saves a partial change and keeps the rest', async () => {
    const repo = createSettingsRepo(database)

    await updateSettings({ theme: 'light' }, repo)

    expect(await loadSettings(repo)).toEqual({ ...defaultSettings, theme: 'light' })
  })

  it('survives reopening the database', async () => {
    await updateSettings({ blockWorkWeeks: 5 }, createSettingsRepo(database))
    database.close()

    const reopened = new WrkoutDb(database.name)
    try {
      expect((await loadSettings(createSettingsRepo(reopened))).blockWorkWeeks).toBe(5)
    } finally {
      reopened.close()
    }
  })

  it('rejects values outside the allowed range', async () => {
    const repo = createSettingsRepo(database)

    await expect(updateSettings({ blockWorkWeeks: 9 }, repo)).rejects.toThrow()
    expect(await loadSettings(repo)).toEqual(defaultSettings)
  })
})
