import { db, type WrkoutDb } from './db'

const LAST_EXPORT_KEY = 'lastExportAt'
const DAY_MS = 86_400_000

/** How long a backup stays fresh before the app reminds the user (FR-SYNC-8). */
export const BACKUP_INTERVAL_DAYS = 7

export async function getLastExportAt(database: WrkoutDb = db): Promise<number | undefined> {
  const entry = await database.localState.get(LAST_EXPORT_KEY)
  return typeof entry?.value === 'number' ? entry.value : undefined
}

export async function markExported(now: number, database: WrkoutDb = db): Promise<void> {
  await database.localState.put({ key: LAST_EXPORT_KEY, value: now })
}

export type BackupStatus = {
  /** True when there is something to lose and the last backup is old or missing. */
  due: boolean
  /** Whole days since the last export; absent when there has never been one. */
  daysSince?: number
}

/**
 * Until cloud sync exists the only copy of the data is on the phone, so the
 * app asks for an export once a week. Nothing is due while there are no entries.
 */
export function backupStatus(input: {
  lastExportAt: number | undefined
  now: number
  entries: number
}): BackupStatus {
  if (input.lastExportAt === undefined) {
    return { due: input.entries > 0 }
  }
  const daysSince = Math.max(0, Math.floor((input.now - input.lastExportAt) / DAY_MS))
  return { due: input.entries > 0 && daysSince >= BACKUP_INTERVAL_DAYS, daysSince }
}
