import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { computeOverload, getExerciseCategory, type OverloadRecommendation } from '../utils/overload';

export function useOverload(exerciseName: string, unit: 'lbs' | 'kg' = 'lbs'): OverloadRecommendation | null {
  return useLiveQuery(async () => {
    if (!exerciseName) return null;

    const template = await db.exerciseTemplates
      .where('name')
      .equalsIgnoreCase(exerciseName)
      .first() ?? null;

    const entries = await db.exerciseEntries
      .where('name')
      .equalsIgnoreCase(exerciseName)
      .toArray();

    if (entries.length === 0) return null;

    const workoutIds = [...new Set(entries.map((e) => e.workoutId))];
    const workouts = await db.workouts.bulkGet(workoutIds);

    const sessions = [];
    for (const entry of entries) {
      const workout = workouts.find((w) => w?.id === entry.workoutId);
      if (!workout) continue;
      const sets = await db.setEntries
        .where('exerciseEntryId')
        .equals(entry.id!)
        .sortBy('setNumber');
      if (sets.length > 0) {
        sessions.push({ date: workout.date, sets });
      }
    }

    sessions.sort((a, b) => b.date.localeCompare(a.date));
    const category = getExerciseCategory(template);
    return computeOverload(sessions.slice(0, 5), category, unit);
  }, [exerciseName, unit]) ?? null;
}
