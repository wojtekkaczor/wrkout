import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { deleteRun, saveRun, today, useRunLog } from '@/data'
import { RUN_TYPES, type RunLog } from '@/domain'
import { RUN_TYPE_LABELS, SPORT_LABELS } from '@/features/progress/labels'
import { Button, Card, ChoiceChips, Screen, formatDuration, parseDecimal } from '@/ui'
import { parseDuration } from './parse'

const SPORTS = (['run', 'bike', 'other'] as const).map((value) => ({
  value,
  label: SPORT_LABELS[value],
}))

const EFFORT = Array.from({ length: 10 }, (_, index) => ({
  value: index + 1,
  label: String(index + 1),
}))

const inputClass = 'min-h-12 w-full rounded-xl border border-border bg-bg px-3 text-base text-text'
const labelClass = 'flex flex-col gap-1 text-[13px] text-muted'

/** Manual entry of a run or other cardio session (FR-RUN-3). */
export function RunFormScreen() {
  const { runId } = useParams()
  const loaded = useRunLog(runId)
  const back = { to: runId ? '/postepy?widok=bieganie' : '/', label: runId ? 'Bieganie' : 'Dziś' }

  if (runId && !loaded) {
    return <Screen title="Bieg" back={back}>{null}</Screen>
  }
  if (runId && !loaded?.doc) {
    return (
      <Screen title="Bieg" back={back}>
        <Card title="Nie znaleziono">
          <p className="text-muted">Tego wpisu nie ma w historii.</p>
        </Card>
      </Screen>
    )
  }
  return (
    <Screen title={runId ? 'Edycja wpisu' : 'Nowy bieg'} back={back}>
      <RunForm key={runId ?? 'new'} runId={runId} initial={loaded?.doc?.data} />
    </Screen>
  )
}

function RunForm({ runId, initial }: { runId?: string; initial?: RunLog }) {
  const navigate = useNavigate()
  const [date, setDate] = useState(initial?.date ?? today())
  const [sport, setSport] = useState<RunLog['sport']>(initial?.sport ?? 'run')
  const [runType, setRunType] = useState<RunLog['runType'] | ''>(initial?.runType ?? 'easy')
  const [distance, setDistance] = useState(
    initial?.distanceM ? String(initial.distanceM / 1000).replace('.', ',') : '',
  )
  const [duration, setDuration] = useState(
    initial?.movingSec ? formatDuration(initial.movingSec) : '',
  )
  const [rpe, setRpe] = useState(initial?.rpe)
  const [heartRate, setHeartRate] = useState(initial?.avgHr ? String(initial.avgHr) : '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [error, setError] = useState<string>()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const done = () => navigate('/postepy?widok=bieganie')

  const save = async () => {
    const movingSec = parseDuration(duration)
    const distanceKm = parseDecimal(distance)
    const avgHr = parseDecimal(heartRate)
    if (movingSec === null) {
      setError('Czas wpisz jako min:s (45:10 albo 45,10), godz:min:s (1:02:03) albo same minuty (45).')
      return
    }
    if (distance.trim() !== '' && (distanceKm === undefined || distanceKm < 0)) {
      setError('Dystans wpisz w kilometrach, np. 8,4.')
      return
    }
    if (!date) {
      setError('Wybierz datę.')
      return
    }
    // Start from the stored entry so imported details (laps, links) survive an edit.
    const {
      distanceM: _distance,
      movingSec: _moving,
      avgHr: _hr,
      rpe: _rpe,
      note: _note,
      runType: _type,
      ...kept
    } = initial ?? ({ source: 'manual' } as RunLog)
    const run: RunLog = { ...kept, date, sport }
    if (sport === 'run' && runType) {
      run.runType = runType
    }
    if (distanceKm !== undefined && distanceKm > 0) {
      run.distanceM = Math.round(distanceKm * 1000)
    }
    if (movingSec !== undefined && movingSec > 0) {
      run.movingSec = movingSec
    }
    if (avgHr !== undefined && avgHr > 0) {
      run.avgHr = avgHr
    }
    if (rpe !== undefined) {
      run.rpe = rpe
    }
    if (note.trim()) {
      run.note = note.trim()
    }
    await saveRun(runId, run)
    done()
  }

  return (
    <>
      <Card>
        <div className="flex flex-col gap-4">
          <label className={labelClass}>
            Data
            <input
              type="date"
              value={date}
              max={today()}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
            />
          </label>
          <ChoiceChips
            label="Rodzaj aktywności"
            choices={SPORTS}
            value={sport}
            clearable={false}
            onChange={(value) => setSport(value ?? 'run')}
          />
          {sport === 'run' ? (
            <label className={labelClass}>
              Typ biegu
              <select
                value={runType}
                onChange={(event) => setRunType(event.target.value as RunLog['runType'])}
                className={inputClass}
              >
                {RUN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {RUN_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <label className={labelClass}>
              Dystans (km)
              <input
                inputMode="decimal"
                autoComplete="off"
                placeholder="8,4"
                value={distance}
                onChange={(event) => setDistance(event.target.value)}
                className={`${inputClass} tabular`}
              />
            </label>
            <label className={labelClass}>
              Czas
              <input
                inputMode="decimal"
                autoComplete="off"
                placeholder="45:10"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className={`${inputClass} tabular`}
              />
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-muted">Wysiłek (RPE)</p>
            <ChoiceChips label="Wysiłek" choices={EFFORT} value={rpe} onChange={setRpe} />
          </div>
          <label className={labelClass}>
            Średnie tętno (opcjonalnie)
            <input
              inputMode="numeric"
              autoComplete="off"
              value={heartRate}
              onChange={(event) => setHeartRate(event.target.value)}
              className={`${inputClass} tabular`}
            />
          </label>
          <label className={labelClass}>
            Notatka (opcjonalnie)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-bg p-3 text-base text-text"
            />
          </label>
        </div>
      </Card>
      {error ? (
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
      ) : null}
      <Button onClick={() => void save()}>Zapisz</Button>
      {runId ? (
        confirmDelete ? (
          <Button variant="secondary" onClick={() => void deleteRun(runId).then(done)}>
            Tak, usuń wpis
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
            Usuń wpis
          </Button>
        )
      ) : null}
    </>
  )
}
