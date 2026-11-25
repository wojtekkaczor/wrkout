import { useRef, useState, type ChangeEvent } from 'react'
import {
  ImportFileError,
  db,
  exportAll,
  importFile,
  markExported,
  useExercises,
  useLastExport,
  useRunLogs,
  useWorkoutLogs,
  type ImportResult,
} from '@/data'
import { Button, Card, formatDayLong } from '@/ui'

function describeImport(result: ImportResult): string {
  const parts = [`dodano ${result.added}`, `zaktualizowano ${result.updated}`]
  if (result.unchanged > 0) {
    parts.push(`bez zmian ${result.unchanged}`)
  }
  if (result.unsupported > 0) {
    parts.push(`pominięto ${result.unsupported} (nieobsługiwany typ)`)
  }
  if (result.invalid.length > 0) {
    parts.push(`odrzucono ${result.invalid.length}`)
  }
  return `Import zakończony: ${parts.join(', ')}.`
}

/** Hands the file to the user. Returns false when they cancelled. */
async function saveFile(file: File): Promise<boolean> {
  // On an iPhone the share sheet is the reliable way to keep a file
  // ("Zachowaj w Plikach"); elsewhere a normal download works.
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: file.name })
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return false
      }
    }
  }
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  URL.revokeObjectURL(url)
  return true
}

/** Backup and restore of everything stored on the device (FR-SYNC-2, FR-SYNC-8). */
export function DataCard() {
  const exercises = useExercises()
  const logs = useWorkoutLogs()
  const runs = useRunLogs()
  const lastExport = useLastExport()
  const input = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string>()
  const [problems, setProblems] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  async function onExport() {
    setBusy(true)
    try {
      const now = Date.now()
      const backup = await exportAll(db, now)
      const day = new Date(now).toISOString().slice(0, 10)
      const file = new File([JSON.stringify(backup)], `wrkout-kopia-${day}.json`, {
        type: 'application/json',
      })
      if (await saveFile(file)) {
        await markExported(now)
        setMessage(`Kopia zawiera ${backup.docs.length} dokumentów.`)
        setProblems([])
      }
    } finally {
      setBusy(false)
    }
  }

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    setBusy(true)
    try {
      const result = await importFile(db, JSON.parse(await file.text()))
      setMessage(describeImport(result))
      setProblems(result.invalid.slice(0, 5).map((entry) => `${entry.id ?? '?'}: ${entry.reason}`))
    } catch (error) {
      setProblems([])
      setMessage(
        error instanceof ImportFileError
          ? error.message
          : 'Nie udało się odczytać pliku. Wybierz plik kopii w formacie JSON.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Dane">
      <p className="tabular text-muted">
        Treningi: {logs?.length ?? '…'} · Biegi: {runs?.length ?? '…'} · Ćwiczenia:{' '}
        {exercises?.length ?? '…'}
      </p>
      {lastExport ? (
        <p className="text-muted">
          {lastExport.at === undefined
            ? 'Kopia zapasowa: jeszcze nie zrobiona.'
            : `Ostatnia kopia: ${formatDayLong(new Date(lastExport.at).toISOString().slice(0, 10))}.`}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" className="flex-1" disabled={busy} onClick={() => void onExport()}>
          Eksportuj kopię
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          Importuj kopię
        </Button>
      </div>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        aria-label="Plik kopii do importu"
        className="sr-only"
        onChange={(event) => void onImport(event)}
      />
      {message ? (
        <p role="status" className="mt-3 text-base">
          {message}
        </p>
      ) : null}
      {problems.length > 0 ? (
        <ul className="mt-1 list-disc pl-5 text-[13px] text-muted">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-[13px] text-muted">
        Do czasu synchronizacji w chmurze jedyna kopia danych jest w tym telefonie, więc eksportuj
        ją co tydzień. Import scala dane: przy tym samym dokumencie zostaje nowsza wersja, więc ten
        sam plik można wczytać ponownie bez duplikatów.
      </p>
    </Card>
  )
}
