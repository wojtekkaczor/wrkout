import { describe, expect, it } from 'vitest'
import { exerciseSchema, slotSchema } from '@/domain'
import { CATALOG_EXERCISES, STARTER_SETS } from './index'

describe('catalogue', () => {
  it('has valid exercises with unique ids and names', () => {
    for (const { id: _id, ...exercise } of CATALOG_EXERCISES) {
      expect(exerciseSchema.safeParse(exercise).success, exercise.name).toBe(true)
    }
    expect(new Set(CATALOG_EXERCISES.map((exercise) => exercise.id)).size).toBe(
      CATALOG_EXERCISES.length,
    )
    expect(new Set(CATALOG_EXERCISES.map((exercise) => exercise.name)).size).toBe(
      CATALOG_EXERCISES.length,
    )
  })

  it('builds starter sets only from catalogue exercises and valid slots', () => {
    const known = new Set(CATALOG_EXERCISES.map((exercise) => exercise.id))
    for (const set of STARTER_SETS) {
      expect(set.sessions.length).toBeGreaterThan(0)
      for (const session of set.sessions) {
        for (const [index, slot] of session.slots.entries()) {
          expect(known.has(`cat:${slot.exercise}`), `${set.id}: ${slot.exercise}`).toBe(true)
          const parsed = slotSchema.safeParse({
            id: `s${index}`,
            exerciseId: `cat:${slot.exercise}`,
            sets: slot.sets,
            range: slot.range,
          })
          expect(parsed.success, `${set.id} / ${session.name} / ${slot.exercise}`).toBe(true)
        }
      }
    }
  })

  it('gives timed exercises a range in seconds', () => {
    const timed = new Set(
      CATALOG_EXERCISES.filter((exercise) => exercise.measure === 'time').map((exercise) => exercise.id),
    )
    const slots = STARTER_SETS.flatMap((set) => set.sessions.flatMap((session) => session.slots))

    for (const slot of slots.filter((entry) => timed.has(`cat:${entry.exercise}`))) {
      expect(slot.range[0]).toBeGreaterThanOrEqual(20)
    }
  })
})
