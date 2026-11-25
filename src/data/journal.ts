import {
  uuidv7,
  type Day,
  type Doc,
  type Exercise,
  type RunLog,
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
