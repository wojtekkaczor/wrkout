import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { WrkoutDb } from './db'
import { DocRepo, NewerSchemaError } from './docRepo'

const noteSchema = z.object({ text: z.string().min(1) })
type Note = z.infer<typeof noteSchema>

let counter = 0
let database: WrkoutDb
let clock: number

function createRepo(schemaVersion = 1, migrate?: (data: unknown, from: number) => unknown) {
  return new DocRepo<Note>({
    table: database.singletons,
    type: 'settings',
    schema: noteSchema,
    schemaVersion,
    migrate,
    now: () => clock,
  })
}

beforeEach(() => {
  counter += 1
  database = new WrkoutDb(`doc-repo-test-${counter}`)
  clock = 1000
})

afterEach(async () => {
  await database.delete()
})

describe('DocRepo', () => {
  it('stores a document in the envelope and reads it back', async () => {
    const repo = createRepo()

    await repo.put('a', { text: 'hello' })

    expect(await repo.get('a')).toEqual({
      id: 'a',
      type: 'settings',
      updatedAt: 1000,
      schemaVersion: 1,
      data: { text: 'hello' },
    })
  })

  it('marks every write as pending sync', async () => {
    const repo = createRepo()

    await repo.put('a', { text: 'hello' })

    expect((await database.singletons.get('a'))?.dirty).toBe(1)
  })

  it('stamps updates with the current time', async () => {
    const repo = createRepo()
    await repo.put('a', { text: 'first' })

    clock = 2000
    await repo.put('a', { text: 'second' })

    expect(await repo.get('a')).toMatchObject({ updatedAt: 2000, data: { text: 'second' } })
  })

  it('rejects data that does not match the schema', async () => {
    const repo = createRepo()

    await expect(repo.put('a', { text: '' })).rejects.toThrow()
    expect(await repo.get('a')).toBeUndefined()
  })

  it('removes by leaving a tombstone that still needs to sync', async () => {
    const repo = createRepo()
    await repo.put('a', { text: 'hello' })

    clock = 3000
    await repo.remove('a')

    expect(await repo.get('a')).toBeUndefined()
    expect(await repo.list()).toEqual([])
    expect(await database.singletons.get('a')).toMatchObject({
      deleted: true,
      updatedAt: 3000,
      dirty: 1,
    })
  })

  it('lists only live documents of its own type', async () => {
    const repo = createRepo()
    await repo.put('a', { text: 'one' })
    await repo.put('b', { text: 'two' })
    await repo.remove('a')
    await database.singletons.put({
      id: 'other',
      type: 'profile',
      updatedAt: 1,
      schemaVersion: 1,
      data: {},
      dirty: 0,
    })

    expect((await repo.list()).map((doc) => doc.id)).toEqual(['b'])
  })

  it('lifts documents written by an older schema version', async () => {
    await database.singletons.put({
      id: 'a',
      type: 'settings',
      updatedAt: 1,
      schemaVersion: 1,
      data: { body: 'old shape' },
      dirty: 0,
    })
    const repo = createRepo(2, (data) => ({ text: (data as { body: string }).body }))

    expect(await repo.get('a')).toMatchObject({ schemaVersion: 2, data: { text: 'old shape' } })
  })

  it('refuses documents written by a newer app version', async () => {
    await database.singletons.put({
      id: 'a',
      type: 'settings',
      updatedAt: 1,
      schemaVersion: 5,
      data: { text: 'from the future' },
      dirty: 0,
    })

    await expect(createRepo().get('a')).rejects.toBeInstanceOf(NewerSchemaError)
  })
})
