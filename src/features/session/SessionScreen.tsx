import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  deleteWorkout,
  saveWorkout,
  today,
  useExercisePrefs,
  useExercises,
  useSettings,
  useWorkoutLog,
  useWorkoutLogs,
} from '@/data'
import { defaultSettings, type Exercise, type LoggedExercise, type WorkoutLog } from '@/domain'
import { draftSets, exerciseHistory } from '@/engine'
import { ExercisePicker } from '@/features/exercises/ExercisePicker'
import { ExercisePrefsSheet } from '@/features/exercises/ExercisePrefsSheet'
import { TIER_LABELS } from '@/features/exercises/labels'
import {
  Button,
  Card,
  ChoiceChips,
  Screen,
  Sheet,
  describeSets,
  formatDay,
  formatDayLong,
  formatKg,
  formatNumber,
} from '@/ui'
import {
  addExercise,
  addSet,
  countDone,
  markAllDone,
  markExerciseDone,
  moveExercise,
  removeExercise,
  removeSet,
  replaceExercise,
  saveSet,
  setExerciseRir,
  toggleSet,
} from './edit'
import { FinishSheet } from './FinishSheet'
import { SetSheet } from './SetSheet'

const RIR_CHOICES = [0, 1, 2, 3, 4].map((value) => ({
  value,
  label: value === 4 ? '4+' : String(value),
}))

type Panel =
  | { kind: 'set'; exercise: number; set: number }
  | { kind: 'exercise'; exercise: number }
  | { kind: 'prefs'; exercise: number }
  | { kind: 'pick'; replace?: number }
  | { kind: 'menu' }
  | { kind: 'finish' }

const cellClass = 'tabular min-h-14 rounded-xl bg-surface-2 px-2 text-xl font-semibold'

/**
 * Logging a workout, live between sets or afterwards: the same screen.
 * Every change is saved immediately (FR-STR-6); there is no timer (ADR-8).
 */
export function SessionScreen() {
  const { logId = '' } = useParams()
  const navigate = useNavigate()
  const loaded = useWorkoutLog(logId)
  const exerciseDocs = useExercises()
  const allLogs = useWorkoutLogs()
  const settings = useSettings() ?? defaultSettings
  const prefs = useExercisePrefs()
  const [panel, setPanel] = useState<Panel>()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const exercises = useMemo(
    () => new Map<string, Exercise>((exerciseDocs ?? []).map((doc) => [doc.id, doc.data])),
    [exerciseDocs],
  )
  // "Last time" never includes the workout being edited.
  const earlier = useMemo(
    () => (allLogs ?? []).filter((log) => log.id !== logId && log.data.status === 'done'),
    [allLogs, logId],
  )

  const back = { to: '/', label: 'Dziś' }
  if (!loaded || !exerciseDocs || !allLogs) {
    return <Screen title="Trening" back={back}>{null}</Screen>
  }
  if (!loaded.doc) {
    return (
      <Screen title="Trening" back={back}>
        <Card title="Nie znaleziono">
          <p className="text-muted">Ten trening nie istnieje albo został usunięty.</p>
        </Card>
      </Screen>
    )
  }

  const log = loaded.doc.data
  const save = (next: WorkoutLog) => void saveWorkout(logId, next)
  const close = () => setPanel(undefined)
  const progress = countDone(log)
  const finished = log.status === 'done'

  const newExercise = (exerciseId: string): LoggedExercise => {
    const exercise = exercises.get(exerciseId)
    const logged: LoggedExercise = {
      exerciseId,
      sets: draftSets(exerciseId, earlier, { sets: 3, timed: exercise?.measure === 'time' }),
    }
    if (exercise) {
      logged.tier = exercise.tier
    }
    return logged
  }

  const defaultStep = (exercise: Exercise | undefined) =>
    settings.increments[exercise?.incrementKind ?? 'barbell']

  const active =
    panel?.kind === 'set' || panel?.kind === 'exercise' || panel?.kind === 'prefs'
      ? log.exercises[panel.exercise]
      : undefined
  const activeExercise = active ? exercises.get(active.exerciseId) : undefined
  const activeName = activeExercise?.name ?? 'Ćwiczenie'

  return (
    <Screen
      title={log.title}
      subtitle={[
        log.date === today() ? 'dziś' : formatDayLong(log.date),
        `${progress.done} z ${progress.total} serii`,
      ].join(' · ')}
      back={finished ? { to: `/postepy/trening/${encodeURIComponent(logId)}`, label: 'Trening' } : back}
    >
      {progress.done === 0 && progress.total > 0 ? (
        <Button variant="secondary" onClick={() => save(markAllDone(log))}>
          Wszystko jak ostatnio
        </Button>
      ) : null}

      {log.exercises.map((logged, exerciseIndex) => {
        const exercise = exercises.get(logged.exerciseId)
        const name = exercise?.name ?? 'Nieznane ćwiczenie'
        const timed = exercise?.measure === 'time'
        const last = exerciseHistory(earlier, logged.exerciseId).at(-1)
        const note = prefs?.get(logged.exerciseId)?.note
        const traits = [
          logged.tier ? TIER_LABELS[logged.tier] : undefined,
          logged.tempo ? `tempo ${logged.tempo}` : undefined,
          exercise?.unilateral ? 'na stronę' : undefined,
          logged.targetRir !== undefined ? `cel: zapas ${logged.targetRir}` : undefined,
        ].filter(Boolean)
        return (
          <section
            key={`${logged.exerciseId}-${exerciseIndex}`}
            aria-label={name}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-semibold [overflow-wrap:anywhere]">{name}</h2>
                {traits.length > 0 ? (
                  <p className="text-[13px] text-muted">{traits.join(' · ')}</p>
                ) : null}
                <p className="tabular text-[13px] text-muted">
                  {last
                    ? `Ostatnio (${formatDay(last.date)}): ${describeSets(last.sets)}`
                    : 'Pierwszy raz: wpisz ciężar i powtórzenia'}
                </p>
                {note ? (
                  <p className="text-[13px] [overflow-wrap:anywhere]">Notatka: {note}</p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label={`Więcej: ${name}`}
                onClick={() => setPanel({ kind: 'exercise', exercise: exerciseIndex })}
                className="-mr-2 -mt-2 min-h-12 min-w-12 shrink-0 text-xl text-muted"
              >
                ⋯
              </button>
            </div>

            <ol className="mt-3 flex flex-col gap-2">
              {logged.sets.map((set, setIndex) => {
                const amount = timed ? set.durationSec : set.reps
                const open = () => setPanel({ kind: 'set', exercise: exerciseIndex, set: setIndex })
                return (
                  <li
                    key={setIndex}
                    className="grid grid-cols-[1.5rem_1fr_1fr_3.5rem] items-center gap-2"
                  >
                    <span className="tabular text-center text-[13px] text-muted">{setIndex + 1}</span>
                    <button
                      type="button"
                      aria-label={`Seria ${setIndex + 1}: ciężar`}
                      onClick={open}
                      className={cellClass}
                    >
                      {set.weightKg === undefined ? (
                        <span className="text-muted">— kg</span>
                      ) : (
                        formatKg(set.weightKg)
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label={`Seria ${setIndex + 1}: ${timed ? 'czas' : 'powtórzenia'}`}
                      onClick={open}
                      className={cellClass}
                    >
                      {amount === undefined ? (
                        <span className="text-muted">—</span>
                      ) : timed ? (
                        `${formatNumber(amount)} s`
                      ) : (
                        amount
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label={`Seria ${setIndex + 1}: zrobiona`}
                      aria-pressed={set.done}
                      onClick={() => save(toggleSet(log, exerciseIndex, setIndex))}
                      className={[
                        'min-h-14 rounded-xl text-xl font-semibold',
                        set.done
                          ? 'bg-success text-accent-contrast'
                          : 'border border-border bg-bg text-muted',
                      ].join(' ')}
                    >
                      {set.done ? '✓' : '○'}
                    </button>
                  </li>
                )
              })}
            </ol>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => save(addSet(log, exerciseIndex))}
                className="min-h-12 flex-1 rounded-xl text-base text-accent"
              >
                + seria
              </button>
              <button
                type="button"
                onClick={() => save(markExerciseDone(log, exerciseIndex))}
                className="min-h-12 flex-1 rounded-xl text-base text-accent"
              >
                ✓ wszystkie serie
              </button>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-[13px] text-muted">Zapas</span>
              <ChoiceChips
                label={`Zapas: ${name}`}
                choices={RIR_CHOICES}
                value={logged.rir === undefined ? undefined : Math.min(logged.rir, 4)}
                onChange={(rir) => save(setExerciseRir(log, exerciseIndex, rir))}
              />
            </div>
          </section>
        )
      })}

      <Button variant="secondary" onClick={() => setPanel({ kind: 'pick' })}>
        Dodaj ćwiczenie
      </Button>
      <Button variant="secondary" onClick={() => setPanel({ kind: 'menu' })}>
        Data i inne
      </Button>
      <Button onClick={() => setPanel({ kind: 'finish' })}>
        {finished ? 'Zapisz zmiany' : 'Zakończ'}
      </Button>

      {panel?.kind === 'set' && active?.sets[panel.set] ? (
        <SetSheet
          exerciseName={activeName}
          setNumber={panel.set + 1}
          set={active.sets[panel.set] ?? { kind: 'work', done: false }}
          weightStep={prefs?.get(active.exerciseId)?.increment ?? defaultStep(activeExercise)}
          timed={activeExercise?.measure === 'time'}
          unilateral={activeExercise?.unilateral ?? false}
          onSave={(set, carryWeight) => {
            save(saveSet(log, panel.exercise, panel.set, set, carryWeight))
            close()
          }}
          onDelete={() => {
            save(removeSet(log, panel.exercise, panel.set))
            close()
          }}
          onClose={close}
        />
      ) : null}

      {panel?.kind === 'exercise' && active ? (
        <Sheet title={activeName} onClose={close}>
          <Button
            variant="secondary"
            onClick={() => setPanel({ kind: 'pick', replace: panel.exercise })}
          >
            Zamień ćwiczenie
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={panel.exercise === 0}
              onClick={() => {
                save(moveExercise(log, panel.exercise, -1))
                close()
              }}
            >
              Wyżej
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              disabled={panel.exercise === log.exercises.length - 1}
              onClick={() => {
                save(moveExercise(log, panel.exercise, 1))
                close()
              }}
            >
              Niżej
            </Button>
          </div>
          <Button
            variant="secondary"
            onClick={() => setPanel({ kind: 'prefs', exercise: panel.exercise })}
          >
            Notatka i ustawienia
          </Button>
          <Link
            to={`/postepy/cwiczenie/${encodeURIComponent(active.exerciseId)}`}
            className="flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-base font-semibold"
          >
            Historia ćwiczenia
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              save(removeExercise(log, panel.exercise))
              close()
            }}
          >
            Usuń z treningu
          </Button>
        </Sheet>
      ) : null}

      {panel?.kind === 'prefs' && active ? (
        <ExercisePrefsSheet
          exerciseId={active.exerciseId}
          exerciseName={activeName}
          timed={activeExercise?.measure === 'time'}
          prefs={prefs?.get(active.exerciseId)}
          defaultIncrement={defaultStep(activeExercise)}
          onClose={close}
        />
      ) : null}

      {panel?.kind === 'pick' ? (
        <ExercisePicker
          title={panel.replace === undefined ? 'Dodaj ćwiczenie' : 'Zamień ćwiczenie'}
          onPick={(exerciseId) => {
            const exercise = newExercise(exerciseId)
            save(
              panel.replace === undefined
                ? addExercise(log, exercise)
                : replaceExercise(log, panel.replace, exercise),
            )
            close()
          }}
          onClose={close}
        />
      ) : null}

      {panel?.kind === 'menu' ? (
        <Sheet title="Trening" onClose={close}>
          <label className="flex flex-col gap-1 text-[13px] text-muted">
            Data treningu
            <input
              type="date"
              value={log.date}
              max={today()}
              onChange={(event) => {
                if (event.target.value) {
                  save({ ...log, date: event.target.value })
                }
              }}
              className="min-h-12 rounded-xl border border-border bg-bg px-3 text-base text-text"
            />
          </label>
          {confirmDelete ? (
            <Button
              onClick={() => {
                void deleteWorkout(logId).then(() => navigate('/'))
              }}
            >
              Tak, usuń trening
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
              Usuń trening
            </Button>
          )}
        </Sheet>
      ) : null}

      {panel?.kind === 'finish' ? (
        <FinishSheet
          initialRpe={log.sessionRpe}
          initialNote={log.note}
          onSave={(report) => {
            const { sessionRpe: _rpe, note: _note, ...rest } = log
            const next: WorkoutLog = { ...rest, status: 'done' }
            if (report.sessionRpe !== undefined) {
              next.sessionRpe = report.sessionRpe
            }
            if (report.note) {
              next.note = report.note
            }
            void saveWorkout(logId, next).then(() =>
              navigate(`/postepy/trening/${encodeURIComponent(logId)}`),
            )
          }}
          onClose={close}
        />
      ) : null}
    </Screen>
  )
}
