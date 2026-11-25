import {
  EXERCISE_SCHEMA_VERSION,
  RUN_LOG_SCHEMA_VERSION,
  WORKOUT_LOG_SCHEMA_VERSION,
  WORKOUT_TEMPLATE_SCHEMA_VERSION,
  exerciseSchema,
  runLogSchema,
  workoutLogSchema,
  workoutTemplateSchema,
  type Exercise,
  type RunLog,
  type WorkoutLog,
  type WorkoutTemplate,
} from '@/domain'
import { db, type WrkoutDb } from './db'
import { DocRepo } from './docRepo'

export function createRepos(database: WrkoutDb, now?: () => number) {
  return {
    exercises: new DocRepo<Exercise>({
      table: database.exercises,
      type: 'exercise',
      schema: exerciseSchema,
      schemaVersion: EXERCISE_SCHEMA_VERSION,
      now,
    }),
    workoutTemplates: new DocRepo<WorkoutTemplate>({
      table: database.workoutTemplates,
      type: 'workoutTemplate',
      schema: workoutTemplateSchema,
      schemaVersion: WORKOUT_TEMPLATE_SCHEMA_VERSION,
      now,
    }),
    workoutLogs: new DocRepo<WorkoutLog>({
      table: database.workoutLogs,
      type: 'workoutLog',
      schema: workoutLogSchema,
      schemaVersion: WORKOUT_LOG_SCHEMA_VERSION,
      now,
    }),
    runLogs: new DocRepo<RunLog>({
      table: database.runLogs,
      type: 'runLog',
      schema: runLogSchema,
      schemaVersion: RUN_LOG_SCHEMA_VERSION,
      now,
    }),
  }
}

export type Repos = ReturnType<typeof createRepos>

export const repos = createRepos(db)
