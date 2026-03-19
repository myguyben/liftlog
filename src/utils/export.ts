import { db } from '../db/database';

export async function exportData(): Promise<string> {
  const [workouts, exerciseEntries, setEntries, userExerciseStats, userPreferences] =
    await Promise.all([
      db.workouts.toArray(),
      db.exerciseEntries.toArray(),
      db.setEntries.toArray(),
      db.userExerciseStats.toArray(),
      db.userPreferences.toArray(),
    ]);

  return JSON.stringify(
    { workouts, exerciseEntries, setEntries, userExerciseStats, userPreferences, exportedAt: new Date().toISOString() },
    null,
    2,
  );
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json);

  await db.transaction('rw', [db.workouts, db.exerciseEntries, db.setEntries, db.userExerciseStats, db.userPreferences], async () => {
    await db.workouts.clear();
    await db.exerciseEntries.clear();
    await db.setEntries.clear();
    await db.userExerciseStats.clear();
    await db.userPreferences.clear();

    if (data.workouts) await db.workouts.bulkAdd(data.workouts);
    if (data.exerciseEntries) await db.exerciseEntries.bulkAdd(data.exerciseEntries);
    if (data.setEntries) await db.setEntries.bulkAdd(data.setEntries);
    if (data.userExerciseStats) await db.userExerciseStats.bulkAdd(data.userExerciseStats);
    if (data.userPreferences) await db.userPreferences.bulkAdd(data.userPreferences);
  });
}
