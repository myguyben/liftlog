import { db } from './database';
import type { ExerciseTemplate } from './models';

export async function seedDatabase() {
  const count = await db.exerciseTemplates.count();
  if (count > 0) return;

  const raw = await import('../data/exercises.json');
  const exercises: ExerciseTemplate[] = (raw.default as Record<string, unknown>[]).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    equipment: (e.equipment as string) || 'body only',
    primaryMuscles: (e.primaryMuscles as string[]) || [],
    secondaryMuscles: (e.secondaryMuscles as string[]) || [],
    category: (e.category as string) || 'strength',
    level: (e.level as string) || 'beginner',
    force: (e.force as string) || null,
    mechanic: (e.mechanic as string) || null,
  }));

  await db.exerciseTemplates.bulkAdd(exercises);

  const prefsCount = await db.userPreferences.count();
  if (prefsCount === 0) {
    await db.userPreferences.add({ id: 1, defaultUnit: 'lbs', theme: 'system' });
  }
}
