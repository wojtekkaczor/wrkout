import { useMemo } from 'react'
import { useExercises, useRunLogs, useWorkoutLogs } from '@/data'
import type { Doc, Exercise, RunLog, WorkoutLog } from '@/domain'

const NO_LOGS: Doc<WorkoutLog>[] = []
const NO_RUNS: Doc<RunLog>[] = []

/** Everything the progress screens read, loaded once per screen. */
export function useProgressData() {
  const exerciseDocs = useExercises()
  const logs = useWorkoutLogs()
  const runs = useRunLogs()

  const exercises = useMemo(
    () => new Map<string, Exercise>((exerciseDocs ?? []).map((doc) => [doc.id, doc.data])),
    [exerciseDocs],
  )

  return {
    ready: exerciseDocs !== undefined && logs !== undefined && runs !== undefined,
    exercises,
    logs: logs ?? NO_LOGS,
    runs: runs ?? NO_RUNS,
  }
}

export type ProgressData = ReturnType<typeof useProgressData>
