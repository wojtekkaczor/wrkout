import type { Table } from 'dexie'
import type { z } from 'zod'
import type { Doc, DocType } from '@/domain'
import type { StoredDoc } from './db'

/** The stored document was written by a newer app version than this one. */
export class NewerSchemaError extends Error {
  readonly docId: string
  readonly found: number
  readonly supported: number

  constructor(docId: string, found: number, supported: number) {
    super(`Document ${docId} has schema version ${found}; this app supports up to ${supported}`)
    this.name = 'NewerSchemaError'
    this.docId = docId
    this.found = found
    this.supported = supported
  }
}

export type DocRepoOptions<T> = {
  table: Table<StoredDoc, string>
  type: DocType
  schema: z.ZodType<T>
  schemaVersion: number
  /** Lifts data written by an older schema version to the current shape. */
  migrate?: (data: unknown, fromVersion: number) => unknown
  now?: () => number
}

/**
 * Typed access to one document type. Every write validates the data, stamps
 * `updatedAt` and marks the document as pending sync. Removal leaves a
 * tombstone so it can propagate to other devices.
 */
export class DocRepo<T> {
  private readonly table: Table<StoredDoc, string>
  private readonly type: DocType
  private readonly schema: z.ZodType<T>
  private readonly schemaVersion: number
  private readonly migrate?: (data: unknown, fromVersion: number) => unknown
  private readonly now: () => number

  constructor(options: DocRepoOptions<T>) {
    this.table = options.table
    this.type = options.type
    this.schema = options.schema
    this.schemaVersion = options.schemaVersion
    this.migrate = options.migrate
    this.now = options.now ?? Date.now
  }

  async get(id: string): Promise<Doc<T> | undefined> {
    const stored = await this.table.get(id)
    if (!stored || stored.deleted || stored.type !== this.type) {
      return undefined
    }
    return this.toDoc(stored)
  }

  async list(): Promise<Doc<T>[]> {
    const stored = await this.table.toArray()
    return stored
      .filter((doc) => !doc.deleted && doc.type === this.type)
      .map((doc) => this.toDoc(doc))
  }

  async put(id: string, data: T): Promise<Doc<T>> {
    const doc: Doc<T> = {
      id,
      type: this.type,
      updatedAt: this.now(),
      schemaVersion: this.schemaVersion,
      data: this.schema.parse(data),
    }
    await this.table.put({ ...doc, dirty: 1 })
    return doc
  }

  async remove(id: string): Promise<void> {
    const stored = await this.table.get(id)
    if (!stored || stored.deleted) {
      return
    }
    await this.table.put({ ...stored, deleted: true, updatedAt: this.now(), dirty: 1 })
  }

  private toDoc(stored: StoredDoc): Doc<T> {
    if (stored.schemaVersion > this.schemaVersion) {
      throw new NewerSchemaError(stored.id, stored.schemaVersion, this.schemaVersion)
    }
    const { dirty: _dirty, ...envelope } = stored
    const raw =
      stored.schemaVersion < this.schemaVersion && this.migrate
        ? this.migrate(stored.data, stored.schemaVersion)
        : stored.data
    return { ...envelope, schemaVersion: this.schemaVersion, data: this.schema.parse(raw) }
  }
}
