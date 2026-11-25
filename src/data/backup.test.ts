import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { backupStatus, getLastExportAt, markExported } from './backup'
import { WrkoutDb } from './db'

const DAY = 86_400_000

describe('backupStatus', () => {
  it('asks for a first backup as soon as there is something to lose', () => {
    expect(backupStatus({ lastExportAt: undefined, now: 0, entries: 0 })).toEqual({ due: false })
    expect(backupStatus({ lastExportAt: undefined, now: 0, entries: 3 })).toEqual({ due: true })
  })

  it('stays quiet for a week after an export, then reminds', () => {
    const exported = 10 * DAY

    expect(backupStatus({ lastExportAt: exported, now: exported + 6 * DAY, entries: 5 })).toEqual({
      due: false,
      daysSince: 6,
    })
    expect(backupStatus({ lastExportAt: exported, now: exported + 7 * DAY, entries: 5 })).toEqual({
      due: true,
      daysSince: 7,
    })
  })

  it('never reminds about an empty journal', () => {
    expect(backupStatus({ lastExportAt: 0, now: 30 * DAY, entries: 0 }).due).toBe(false)
  })
})

describe('last export time', () => {
  let counter = 0
  let database: WrkoutDb

  beforeEach(() => {
    counter += 1
    database = new WrkoutDb(`backup-test-${counter}`)
  })

  afterEach(async () => {
    await database.delete()
  })

  it('is unknown until an export happens and then remembered on the device', async () => {
    expect(await getLastExportAt(database)).toBeUndefined()

    await markExported(1234, database)

    expect(await getLastExportAt(database)).toBe(1234)
  })
})
