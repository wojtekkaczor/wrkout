import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Doc, Exercise } from '@/domain'
import { WrkoutDb } from './db'
import { createRepos } from './repos'
import { ImportFileError, exportAll, importFile, type ExportFile } from './transfer'

const exercise: Exercise = {
  name: 'Bench Press',
  tier: 'main',
  measure: 'reps',
  load: 'external',
  unilateral: false,
  primary: 'chest',
  secondary: ['triceps'],
}

function exerciseDoc(id: string, updatedAt: number, data: unknown = exercise): Doc {
  return { id, type: 'exercise', updatedAt, schemaVersion: 1, data }
}

function backup(docs: unknown[], overrides: Partial<ExportFile> = {}): unknown {
  return { app: 'wrkout', exportedAt: 1, formatVersion: 1, docs, ...overrides }
}

let counter = 0
let database: WrkoutDb

beforeEach(() => {
  counter += 1
  database = new WrkoutDb(`transfer-test-${counter}`)
})

afterEach(async () => {
  await database.delete()
})

describe('importFile', () => {
  it('adds new documents and marks them for sync', async () => {
    const result = await importFile(database, backup([exerciseDoc('ex:bench', 100)]))

    expect(result).toMatchObject({ added: 1, updated: 0, unchanged: 0, invalid: [] })
    expect(result.byType).toEqual({ exercise: 1 })
    expect(await database.exercises.get('ex:bench')).toMatchObject({ dirty: 1, updatedAt: 100 })
  })

  it('replaces a document only when the file has a newer version', async () => {
    await importFile(database, backup([exerciseDoc('ex:bench', 100)]))

    const older = await importFile(
      database,
      backup([exerciseDoc('ex:bench', 50, { ...exercise, name: 'Old name' })]),
    )
    const newer = await importFile(
      database,
      backup([exerciseDoc('ex:bench', 200, { ...exercise, name: 'New name' })]),
    )

    expect(older).toMatchObject({ added: 0, updated: 0, unchanged: 1 })
    expect(newer).toMatchObject({ added: 0, updated: 1, unchanged: 0 })
    expect((await createRepos(database).exercises.get('ex:bench'))?.data.name).toBe('New name')
  })

  it('is repeatable: importing the same file twice changes nothing', async () => {
    const file = backup([exerciseDoc('ex:bench', 100), exerciseDoc('ex:squat', 100)])
    await importFile(database, file)

    expect(await importFile(database, file)).toMatchObject({ added: 0, updated: 0, unchanged: 2 })
  })

  it('skips invalid documents and still imports the rest', async () => {
    const result = await importFile(
      database,
      backup([
        exerciseDoc('ex:bad', 100, { ...exercise, name: '' }),
        { id: 'no-type', updatedAt: 1 },
        exerciseDoc('ex:good', 100),
      ]),
    )

    expect(result.added).toBe(1)
    expect(result.invalid.map((entry) => entry.id)).toEqual(['ex:bad', 'no-type'])
    expect(await database.exercises.get('ex:bad')).toBeUndefined()
  })

  it('counts documents of types this version does not handle', async () => {
    const result = await importFile(
      database,
      backup([{ id: 'p', type: 'proposal', updatedAt: 1, schemaVersion: 1, data: {} }]),
    )

    expect(result).toMatchObject({ added: 0, unsupported: 1, invalid: [] })
  })

  it('rejects documents written by a newer schema version', async () => {
    const result = await importFile(
      database,
      backup([{ ...exerciseDoc('ex:bench', 100), schemaVersion: 99 }]),
    )

    expect(result.added).toBe(0)
    expect(result.invalid).toHaveLength(1)
  })

  it('brings deletions across as tombstones', async () => {
    await importFile(database, backup([exerciseDoc('ex:bench', 100)]))

    await importFile(database, backup([{ ...exerciseDoc('ex:bench', 200, null), deleted: true }]))

    expect(await createRepos(database).exercises.list()).toEqual([])
  })

  it('refuses files that are not wrkout backups', async () => {
    await expect(importFile(database, { hello: 'world' })).rejects.toBeInstanceOf(ImportFileError)
    await expect(importFile(database, backup([], { formatVersion: 99 }))).rejects.toBeInstanceOf(
      ImportFileError,
    )
  })
})

describe('exportAll', () => {
  it('round-trips into an empty database', async () => {
    const repos = createRepos(database, () => 500)
    await repos.exercises.put('ex:bench', exercise)
    await repos.runLogs.put('run:1', { date: '2026-11-20', sport: 'run', source: 'manual' })
    await repos.exercises.put('ex:gone', exercise)
    await repos.exercises.remove('ex:gone')

    const file = await exportAll(database, 900)
    const target = new WrkoutDb(`${database.name}-target`)
    try {
      const result = await importFile(target, JSON.parse(JSON.stringify(file)))

      expect(file).toMatchObject({ app: 'wrkout', exportedAt: 900, formatVersion: 1 })
      expect(file.docs.every((doc) => !('dirty' in doc))).toBe(true)
      expect(result).toMatchObject({ added: 3, invalid: [] })
      expect((await createRepos(target).exercises.list()).map((doc) => doc.id)).toEqual(['ex:bench'])
      expect(await createRepos(target).runLogs.list()).toHaveLength(1)
    } finally {
      await target.delete()
    }
  })
})

/*
 * Optional check for a converted spreadsheet (scripts/import-results):
 *   WRKOUT_IMPORT_FILE=/path/to/file.json pnpm test
 * The file holds personal data, so it is never part of the repository.
 */
const realFile = process.env.WRKOUT_IMPORT_FILE

describe.skipIf(!realFile)('converted spreadsheet', () => {
  it('imports without a single rejected document', async () => {
    const file = JSON.parse(readFileSync(realFile ?? '', 'utf8')) as ExportFile

    const result = await importFile(database, file)

    expect(result.invalid).toEqual([])
    expect(result.unsupported).toBe(0)
    expect(result.added).toBe(file.docs.length)
  })
})
