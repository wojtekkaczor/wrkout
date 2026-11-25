import { CATALOG_EXERCISES, STARTER_SETS } from '@/catalog'
import {
  bodyMetricId,
  exercisePrefsId,
  uuidv7,
  type Day,
  type Doc,
  type Exercise,
  type ExercisePrefs,
  type RunLog,
  type Slot,
  type WorkoutLog,
  type WorkoutTemplate,
} from '@/domain'
import { draftExercises } from '@/engine'
import { repos } from './repos'

/** Today's calendar day in the device's time zone. */
export function today(now: Date = new Date()): Day {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export async function finishedWorkoutLogs(): Promise<Doc<WorkoutLog>[]> {
  const logs = await repos.workoutLogs.list()
  return logs.filter((log) => log.data.status === 'done')
}

/**
 * Starts a workout and returns its id. From one of "Moje treningi" the sets
 * come filled in like last time; without a template the workout starts empty.
 */
export async function startWorkout(options: { templateId?: string; date?: Day } = {}): Promise<string> {
  const now = Date.now()
  const template = options.templateId
    ? await repos.workoutTemplates.get(options.templateId)
    : undefined
  let exercises: WorkoutLog['exercises'] = []
  if (template) {
    const exerciseDocs = await repos.exercises.list()
    exercises = draftExercises({
      template: template.data,
      logs: await finishedWorkoutLogs(),
      exercises: new Map<string, Exercise>(exerciseDocs.map((doc) => [doc.id, doc.data])),
    })
  }
  const id = uuidv7(now)
  const data: WorkoutLog = {
    title: template?.data.name ?? 'Trening',
    status: 'in_progress',
    date: options.date ?? today(),
    loggedAt: now,
    exercises,
  }
  if (template) {
    data.templateId = template.id
  }
  await repos.workoutLogs.put(id, data)
  return id
}

export async function saveWorkout(id: string, data: WorkoutLog): Promise<void> {
  await repos.workoutLogs.put(id, data)
}

export async function deleteWorkout(id: string): Promise<void> {
  await repos.workoutLogs.remove(id)
}

/** Saves a run or other cardio entry; creates it when no id is given. */
export async function saveRun(id: string | undefined, data: RunLog): Promise<string> {
  const runId = id ?? uuidv7(Date.now())
  await repos.runLogs.put(runId, data)
  return runId
}

export async function deleteRun(id: string): Promise<void> {
  await repos.runLogs.remove(id)
}

export async function saveTemplate(id: string | undefined, data: WorkoutTemplate): Promise<string> {
  const templateId = id ?? uuidv7(Date.now())
  await repos.workoutTemplates.put(templateId, data)
  return templateId
}

export async function deleteTemplate(id: string): Promise<void> {
  await repos.workoutTemplates.remove(id)
}

export async function createExercise(data: Exercise): Promise<string> {
  const id = uuidv7(Date.now())
  await repos.exercises.put(id, data)
  return id
}

/** Saves the user's settings for one exercise; empty settings remove the document. */
export async function saveExercisePrefs(
  exerciseId: string,
  prefs: Omit<ExercisePrefs, 'exerciseId'>,
): Promise<void> {
  const id = exercisePrefsId(exerciseId)
  const data: ExercisePrefs = { exerciseId }
  if (prefs.increment !== undefined) {
    data.increment = prefs.increment
  }
  if (prefs.range) {
    data.range = prefs.range
  }
  if (prefs.note?.trim()) {
    data.note = prefs.note.trim()
  }
  if (Object.keys(data).length === 1) {
    await repos.exercisePrefs.remove(id)
    return
  }
  await repos.exercisePrefs.put(id, data)
}

/** One body weight per day; saving again for the same day replaces it. */
export async function saveBodyWeight(date: Day, weightKg: number): Promise<void> {
  await repos.bodyMetrics.put(bodyMetricId(date), { date, weightKg })
}

export async function deleteBodyWeight(date: Day): Promise<void> {
  await repos.bodyMetrics.remove(bodyMetricId(date))
}

/**
 * Adds a ready-made set of sessions to "Moje treningi". Catalogue exercises
 * become ordinary exercise documents the first time they are needed, so they
 * can be renamed or adjusted like any other.
 */
export async function addStarterSet(setId: string): Promise<number> {
  const starter = STARTER_SETS.find((set) => set.id === setId)
  if (!starter) {
    throw new Error(`Unknown starter set: ${setId}`)
  }
  const now = Date.now()
  const needed = new Set(
    starter.sessions.flatMap((session) => session.slots.map((slot) => `cat:${slot.exercise}`)),
  )
  for (const { id, ...exercise } of CATALOG_EXERCISES) {
    if (needed.has(id) && !(await repos.exercises.get(id))) {
      await repos.exercises.put(id, exercise)
    }
  }
  const existing = await repos.workoutTemplates.list()
  let order = existing.reduce((highest, doc) => Math.max(highest, doc.data.order + 1), 0)
  for (const [sessionIndex, session] of starter.sessions.entries()) {
    const slots: Slot[] = session.slots.map((slot, slotIndex) => ({
      id: uuidv7(now + sessionIndex * 100 + slotIndex),
      exerciseId: `cat:${slot.exercise}`,
      sets: slot.sets,
      range: slot.range,
    }))
    await repos.workoutTemplates.put(uuidv7(now + sessionIndex), {
      name: session.name,
      order,
      slots,
    })
    order += 1
  }
  return starter.sessions.length
}
