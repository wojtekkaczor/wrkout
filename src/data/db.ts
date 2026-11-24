import Dexie, { type Table } from 'dexie'
import type { Doc } from '@/domain'

/** A document as stored locally: the envelope plus a flag for pending sync. */
export type StoredDoc<T = unknown> = Doc<T> & { dirty: 0 | 1 }

export type SyncState = {
  id: 'sync'
  cursor: number
  lastSyncAt?: number
  deviceId: string
}

/**
 * Local database. One table per document type; whole documents are stored
 * and only queried fields are indexed (docs/06-model-danych.md §7).
 * Add tables in a new `version()` step, never by editing an existing one.
 */
export class WrkoutDb extends Dexie {
  singletons!: Table<StoredDoc, string>
  syncState!: Table<SyncState, string>

  constructor(name = 'wrkout') {
    super(name)
    this.version(1).stores({
      singletons: 'id, dirty',
      syncState: 'id',
    })
  }
}

export const db = new WrkoutDb()
