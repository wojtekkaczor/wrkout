import Dexie, { type Table } from 'dexie'
import type { Doc, SupportedDocType } from '@/domain'

/** A document as stored locally: the envelope plus a flag for pending sync. */
export type StoredDoc<T = unknown> = Doc<T> & { dirty: 0 | 1 }

export type SyncState = {
  id: 'sync'
  cursor: number
  lastSyncAt?: number
  deviceId: string
}

type DocTable = Table<StoredDoc, string>

/**
 * Local database. One table per document type; whole documents are stored
 * and only queried fields are indexed (docs/06-model-danych.md §7).
 * Add tables in a new `version()` step, never by editing an existing one.
 */
export class WrkoutDb extends Dexie {
  singletons!: DocTable
  exercises!: DocTable
  workoutTemplates!: DocTable
  workoutLogs!: DocTable
  runLogs!: DocTable
  syncState!: Table<SyncState, string>

  constructor(name = 'wrkout') {
    super(name)
    this.version(1).stores({
      singletons: 'id, dirty',
      syncState: 'id',
    })
    this.version(2).stores({
      exercises: 'id, dirty',
      workoutTemplates: 'id, dirty',
      workoutLogs: 'id, dirty, data.date',
      runLogs: 'id, dirty, data.date',
    })
  }
}

const TABLE_BY_TYPE = {
  settings: 'singletons',
  exercise: 'exercises',
  workoutTemplate: 'workoutTemplates',
  workoutLog: 'workoutLogs',
  runLog: 'runLogs',
} as const satisfies Record<SupportedDocType, keyof WrkoutDb>

export function tableFor(database: WrkoutDb, type: SupportedDocType): DocTable {
  return database[TABLE_BY_TYPE[type]]
}

export const db = new WrkoutDb()
