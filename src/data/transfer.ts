import { z } from 'zod'
import {
  DOC_SCHEMAS,
  docEnvelopeSchema,
  isSupportedDocType,
  type Doc,
  type SupportedDocType,
} from '@/domain'
import { tableFor, type StoredDoc, type WrkoutDb } from './db'

export const EXPORT_FORMAT_VERSION = 1

/** The backup file: every document in its envelope. See docs/06-model-danych.md §10. */
export type ExportFile = {
  app: 'wrkout'
  exportedAt: number
  formatVersion: number
  docs: Doc[]
}

const exportFileSchema = z.object({
  app: z.literal('wrkout'),
  exportedAt: z.number().int().nonnegative(),
  formatVersion: z.number().int().positive(),
  docs: z.array(z.unknown()),
})

export type ImportResult = {
  /** Documents that did not exist locally. */
  added: number
  /** Documents replaced because the file had a newer version. */
  updated: number
  /** Documents left alone because the local version is the same age or newer. */
  unchanged: number
  /** Documents of a type this app version does not handle yet. */
  unsupported: number
  /** Documents rejected, with the reason. */
  invalid: { id?: string; reason: string }[]
  /** Added plus updated, per document type. */
  byType: Partial<Record<SupportedDocType, number>>
}

export class ImportFileError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImportFileError'
  }
}

const SUPPORTED_TYPES = Object.keys(DOC_SCHEMAS) as SupportedDocType[]

export async function exportAll(database: WrkoutDb, now: number): Promise<ExportFile> {
  const docs: Doc[] = []
  for (const type of SUPPORTED_TYPES) {
    const stored = await tableFor(database, type).toArray()
    for (const { dirty: _dirty, ...doc } of stored) {
      if (doc.type === type) {
        docs.push(doc)
      }
    }
  }
  return { app: 'wrkout', exportedAt: now, formatVersion: EXPORT_FORMAT_VERSION, docs }
}

/**
 * Merges a backup file into the local database with the same rule as sync:
 * per document, the newer `updatedAt` wins. Every document is validated;
 * a bad one is reported and skipped without affecting the rest.
 */
export async function importFile(database: WrkoutDb, file: unknown): Promise<ImportResult> {
  const header = exportFileSchema.safeParse(file)
  if (!header.success) {
    throw new ImportFileError('To nie jest plik kopii wrkout.')
  }
  if (header.data.formatVersion > EXPORT_FORMAT_VERSION) {
    throw new ImportFileError('Plik pochodzi z nowszej wersji aplikacji. Zaktualizuj aplikację.')
  }

  const result: ImportResult = {
    added: 0,
    updated: 0,
    unchanged: 0,
    unsupported: 0,
    invalid: [],
    byType: {},
  }
  const accepted: { type: SupportedDocType; doc: Doc }[] = []

  for (const raw of header.data.docs) {
    const envelope = docEnvelopeSchema.safeParse(raw)
    if (!envelope.success) {
      const id = typeof (raw as { id?: unknown } | null)?.id === 'string' ? (raw as { id: string }).id : undefined
      result.invalid.push({ id, reason: 'Niepoprawna koperta dokumentu' })
      continue
    }
    const doc = envelope.data as Doc
    if (!isSupportedDocType(doc.type)) {
      result.unsupported += 1
      continue
    }
    const { schema, version } = DOC_SCHEMAS[doc.type]
    if (doc.schemaVersion > version) {
      result.invalid.push({ id: doc.id, reason: 'Dokument z nowszej wersji aplikacji' })
      continue
    }
    if (doc.deleted) {
      accepted.push({ type: doc.type, doc })
      continue
    }
    const data = schema.safeParse(doc.data)
    if (!data.success) {
      const issue = data.error.issues[0]
      const where = issue ? `${issue.path.join('.')}: ${issue.message}` : 'niepoprawne dane'
      result.invalid.push({ id: doc.id, reason: where })
      continue
    }
    accepted.push({ type: doc.type, doc: { ...doc, data: data.data } })
  }

  const tables = SUPPORTED_TYPES.map((type) => tableFor(database, type))
  await database.transaction('rw', tables, async () => {
    for (const { type, doc } of accepted) {
      const table = tableFor(database, type)
      const existing = await table.get(doc.id)
      if (existing && existing.updatedAt >= doc.updatedAt) {
        result.unchanged += 1
        continue
      }
      const stored: StoredDoc = { ...doc, dirty: 1 }
      await table.put(stored)
      if (existing) {
        result.updated += 1
      } else {
        result.added += 1
      }
      result.byType[type] = (result.byType[type] ?? 0) + 1
    }
  })

  return result
}
