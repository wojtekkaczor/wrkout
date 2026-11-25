import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  backupStatus,
  startWorkout,
  today,
  useLastExport,
  useRunLogs,
  useSettings,
  useWorkoutLogs,
  useWorkoutTemplates,
} from '@/data'
import { startOfWeek } from '@/engine'
import { countDone } from '@/features/session/edit'
import { Button, Card, Screen, formatDay, formatDistance, isStandalone, plural } from '@/ui'

const DATE_FORMAT = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function formatToday(date: Date): string {
  const text = DATE_FORMAT.format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const DAYS_FORMS = ['dzień', 'dni', 'dni'] as const

const linkButton =
  'flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface-2 px-4 text-base font-semibold'

/** Journal mode: pick a workout to log, continue one in progress, or add a run. */
export function TodayScreen() {
  const navigate = useNavigate()
  const templates = useWorkoutTemplates()
  const logs = useWorkoutLogs()
  const runs = useRunLogs()
  const lastExport = useLastExport()
  const firstWeekday = useSettings()?.weekStart ?? 1
  const [starting, setStarting] = useState(false)
  const [now] = useState(() => Date.now())

  const { inProgress, lastDone, week, entries } = useMemo(() => {
    const weekStart = startOfWeek(today(), firstWeekday)
    const last = new Map<string, string>()
    let sessions = 0
    for (const log of logs ?? []) {
      if (log.data.status !== 'done') {
        continue
      }
      if (log.data.date >= weekStart) {
        sessions += 1
      }
      const key = log.data.templateId
      if (key && log.data.date > (last.get(key) ?? '')) {
        last.set(key, log.data.date)
      }
    }
    const weekRuns = (runs ?? []).filter(
      (run) => run.data.sport === 'run' && run.data.date >= weekStart,
    )
    return {
      inProgress: (logs ?? [])
        .filter((log) => log.data.status === 'in_progress')
        .sort((a, b) => b.data.loggedAt - a.data.loggedAt),
      lastDone: last,
      entries: (logs ?? []).length + (runs ?? []).length,
      week: {
        sessions,
        runs: weekRuns.length,
        distanceM: weekRuns.reduce((sum, run) => sum + (run.data.distanceM ?? 0), 0),
      },
    }
  }, [logs, runs, firstWeekday])

  // Until cloud sync exists, the phone holds the only copy of the data.
  const backup = lastExport
    ? backupStatus({ lastExportAt: lastExport.at, now, entries })
    : undefined

  const start = async (templateId?: string) => {
    setStarting(true)
    try {
      const id = await startWorkout({ templateId })
      navigate(`/trening/${encodeURIComponent(id)}`)
    } finally {
      setStarting(false)
    }
  }

  const sortedTemplates = [...(templates ?? [])]
    .filter((template) => !template.data.archived)
    .sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name, 'pl'))

  return (
    <Screen title="Dziś" subtitle={formatToday(new Date())}>
      {inProgress.length > 0 ? (
        <Card title="W trakcie">
          <ul className="flex flex-col gap-2">
            {inProgress.map((log) => {
              const progress = countDone(log.data)
              return (
                <li key={log.id}>
                  <Link
                    to={`/trening/${encodeURIComponent(log.id)}`}
                    className="flex min-h-14 items-center justify-between gap-3 rounded-xl bg-accent px-4 text-accent-contrast"
                  >
                    <span className="text-base font-semibold">Kontynuuj: {log.data.title}</span>
                    <span className="tabular shrink-0 text-[13px]">
                      {progress.done} z {progress.total} serii
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : null}

      <Card title="Wpisz trening">
        {templates && sortedTemplates.length === 0 ? (
          <p className="mb-3 text-muted">
            Nie masz jeszcze swoich treningów. Ułóż je w zakładce Treningi albo wczytaj kopię w
            Profilu.
          </p>
        ) : null}
        <ul className="flex flex-col gap-2">
          {sortedTemplates.map((template) => {
            const last = lastDone.get(template.id)
            return (
              <li key={template.id}>
                <button
                  type="button"
                  disabled={starting}
                  onClick={() => void start(template.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 text-left disabled:opacity-50"
                >
                  <span className="text-base font-semibold">{template.data.name}</span>
                  <span className="shrink-0 text-[13px] text-muted">
                    {last ? `ostatnio ${formatDay(last)}` : 'jeszcze nie robiony'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="mt-2 flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={starting}
            onClick={() => void start()}
          >
            Inny trening
          </Button>
          <Link to="/bieg/nowy" className={`${linkButton} flex-1`}>
            Bieg lub cardio
          </Link>
        </div>
      </Card>

      {backup?.due ? (
        <Card title="Zrób kopię danych">
          <p className="text-muted">
            {backup.daysSince === undefined
              ? 'Twoje wpisy są tylko w tym telefonie i nie mają jeszcze kopii.'
              : `Ostatnia kopia: ${plural(backup.daysSince, DAYS_FORMS)} temu.`}
          </p>
          <Link to="/profil" className={`${linkButton} mt-3`}>
            Przejdź do kopii w Profilu
          </Link>
        </Card>
      ) : null}

      <Card title="Ten tydzień">
        <p className="tabular text-base">
          Treningi siłowe: {week.sessions} · Biegi: {week.runs}
          {week.distanceM > 0 ? ` · ${formatDistance(week.distanceM)}` : ''}
        </p>
      </Card>

      {isStandalone() ? null : (
        <Card title="Zainstaluj aplikację">
          <p className="text-muted">
            W Safari wybierz Udostępnij, a potem „Do ekranu początkowego”. Zainstalowana
            aplikacja działa bez sieci i trzyma dane osobno od przeglądarki, więc treningi
            wpisuj już po instalacji.
          </p>
        </Card>
      )}
    </Screen>
  )
}
