import {
  SETTINGS_ID,
  SETTINGS_SCHEMA_VERSION,
  defaultSettings,
  settingsSchema,
  type Settings,
} from '@/domain'
import { db, type WrkoutDb } from './db'
import { DocRepo } from './docRepo'

export function createSettingsRepo(database: WrkoutDb, now?: () => number): DocRepo<Settings> {
  return new DocRepo<Settings>({
    table: database.singletons,
    type: 'settings',
    schema: settingsSchema,
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    now,
  })
}

const settingsRepo = createSettingsRepo(db)

/** Stored settings, or the defaults when nothing has been saved yet. */
export async function loadSettings(repo: DocRepo<Settings> = settingsRepo): Promise<Settings> {
  const doc = await repo.get(SETTINGS_ID)
  return doc?.data ?? defaultSettings
}

export async function updateSettings(
  patch: Partial<Settings>,
  repo: DocRepo<Settings> = settingsRepo,
): Promise<Settings> {
  const current = await loadSettings(repo)
  const saved = await repo.put(SETTINGS_ID, { ...current, ...patch })
  return saved.data
}
