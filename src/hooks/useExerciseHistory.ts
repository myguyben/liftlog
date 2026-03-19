import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { SetEntry } from '../db/models';

interface SessionHistory {
  date: string;
  sets: SetEntry[];
}

export function useExerciseHistory(exerciseName: string, limit = 5): SessionHistory[] {
  return useLiveQuery(async () => {
    if (!exerciseName) return [];

    const entries = await db.exerciseEntries
      .where('name')
      .equalsIgnoreCase(exerciseName)
      .toArray();

    if (entries.length === 0) return [];

    const workoutIds = [...new Set(entries.map((e) => e.workoutId))];
    const workouts = await db.workouts.bulkGet(workoutIds);

    const sessions: SessionHistory[] = [];
    for (const entry of entries) {
      const workout = workouts.find((w) => w?.id === entry.workoutId);
      if (!workout) continue;
      const sets = await db.setEntries
        .where('exerciseEntryId')
        .equals(entry.id!)
        .sortBy('setNumber');
      sessions.push({ date: workout.date, sets });
    }

    sessions.sort((a, b) => b.date.localeCompare(a.date));
    return sessions.slice(0, limit);
  }, [exerciseName, limit]) ?? [];
}
