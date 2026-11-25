import { useLiveQuery } from 'dexie-react-hooks'
import type { Doc, Exercise, RunLog, Settings, WorkoutLog, WorkoutTemplate } from '@/domain'
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
