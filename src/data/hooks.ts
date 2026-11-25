import { useLiveQuery } from 'dexie-react-hooks'
import type {
  BodyMetric,
  Doc,
  Exercise,
  ExercisePrefs,
  RunLog,
  Settings,
  WorkoutLog,
  WorkoutTemplate,
} from '@/domain'
import { getLastExportAt } from './backup'
import { repos } from './repos'
import { loadSettings } from './settings'

/*
 * Live queries: components re-render when the underlying tables change.
 * Each hook returns `undefined` until the first read completes.
 */

export function useSettings(): Settings | undefined {
  return useLiveQuery(() => loadSettings(), [])
}

export function useExercises(): Doc<Exercise>[] | undefined {
  return useLiveQuery(() => repos.exercises.list(), [])
}

export function useWorkoutTemplates(): Doc<WorkoutTemplate>[] | undefined {
  return useLiveQuery(() => repos.workoutTemplates.list(), [])
}

export function useWorkoutLogs(): Doc<WorkoutLog>[] | undefined {
  return useLiveQuery(() => repos.workoutLogs.list(), [])
}

export function useRunLogs(): Doc<RunLog>[] | undefined {
  return useLiveQuery(() => repos.runLogs.list(), [])
}

/** Settings per exercise, keyed by exercise id. */
export function useExercisePrefs(): Map<string, ExercisePrefs> | undefined {
  return useLiveQuery(async () => {
    const docs = await repos.exercisePrefs.list()
    return new Map(docs.map((doc) => [doc.data.exerciseId, doc.data]))
  }, [])
}

/** Body weight measurements, oldest first. */
export function useBodyMetrics(): BodyMetric[] | undefined {
  return useLiveQuery(async () => {
    const docs = await repos.bodyMetrics.list()
    return docs.map((doc) => doc.data).sort((a, b) => a.date.localeCompare(b.date))
  }, [])
}

/** When the data was last exported from this device; `{}` if never. */
export function useLastExport(): { at?: number } | undefined {
  return useLiveQuery(async () => ({ at: await getLastExportAt() }), [])
}

/*
 * Single documents. The result is `undefined` while loading and
 * `{ doc: undefined }` when the document does not exist.
 */

export function useWorkoutLog(id: string): { doc?: Doc<WorkoutLog> } | undefined {
  return useLiveQuery(async () => ({ doc: await repos.workoutLogs.get(id) }), [id])
}

export function useRunLog(id: string | undefined): { doc?: Doc<RunLog> } | undefined {
  return useLiveQuery(async () => ({ doc: id ? await repos.runLogs.get(id) : undefined }), [id])
}

export function useWorkoutTemplate(
  id: string | undefined,
): { doc?: Doc<WorkoutTemplate> } | undefined {
  return useLiveQuery(
    async () => ({ doc: id ? await repos.workoutTemplates.get(id) : undefined }),
    [id],
  )
}
