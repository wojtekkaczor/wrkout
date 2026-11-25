import { useMemo } from 'react'
import { useExercises, useRunLogs, useWorkoutLogs } from '@/data'
import type { Doc, Exercise, RunLog, WorkoutLog } from '@/domain'

const NO_LOGS: Doc<WorkoutLog>[] = []
const NO_RUNS: Doc<RunLog>[] = []

/** Everything the progress screens read: exercises, finished workouts and runs. */
export function useProgressData() {
  const exerciseDocs = useExercises()
  const allLogs = useWorkoutLogs()
  const runs = useRunLogs()

  // A workout still being filled in is not history yet.
  const logs = useMemo(() => allLogs?.filter((log) => log.data.status === 'done'), [allLogs])

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
