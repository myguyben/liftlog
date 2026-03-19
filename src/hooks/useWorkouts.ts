import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Workout } from '../db/models';

export function useWorkouts() {
  const workouts = useLiveQuery(() => db.workouts.orderBy('createdAt').reverse().toArray()) ?? [];
  return workouts;
}

export function useWorkout(id: number | undefined) {
  return useLiveQuery(() => (id ? db.workouts.get(id) : undefined), [id]);
}

export function useWorkoutExercises(workoutId: number | undefined) {
  return useLiveQuery(
    () => (workoutId ? db.exerciseEntries.where('workoutId').equals(workoutId).sortBy('order') : []),
    [workoutId],
  ) ?? [];
}

export function useExerciseSets(exerciseEntryId: number | undefined) {
  return useLiveQuery(
    () => (exerciseEntryId ? db.setEntries.where('exerciseEntryId').equals(exerciseEntryId).sortBy('setNumber') : []),
    [exerciseEntryId],
  ) ?? [];
}

export async function createWorkout(partial?: Partial<Workout>): Promise<number> {
  const now = Date.now();
  return db.workouts.add({
    date: new Date().toISOString().slice(0, 10),
    title: '',
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...partial,
  });
}

export async function updateWorkout(id: number, changes: Partial<Workout>) {
  await db.workouts.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteWorkout(id: number) {
  await db.transaction('rw', [db.workouts, db.exerciseEntries, db.setEntries], async () => {
    const entries = await db.exerciseEntries.where('workoutId').equals(id).toArray();
    const entryIds = entries.map((e) => e.id!);
    await db.setEntries.where('exerciseEntryId').anyOf(entryIds).delete();
    await db.exerciseEntries.where('workoutId').equals(id).delete();
    await db.workouts.delete(id);
  });
}

export async function addExerciseEntry(workoutId: number, name: string) {
  const existing = await db.exerciseEntries.where('workoutId').equals(workoutId).count();
  return db.exerciseEntries.add({
    workoutId,
    name,
    order: existing,
    notes: '',
    createdAt: Date.now(),
  });
}

export async function deleteExerciseEntry(id: number) {
  await db.transaction('rw', [db.exerciseEntries, db.setEntries], async () => {
    await db.setEntries.where('exerciseEntryId').equals(id).delete();
    await db.exerciseEntries.delete(id);
  });
}

export async function addSet(
  exerciseEntryId: number,
  weight: number,
  unit: 'lbs' | 'kg',
  reps: number,
) {
  const existing = await db.setEntries.where('exerciseEntryId').equals(exerciseEntryId).count();
  return db.setEntries.add({
    exerciseEntryId,
    setNumber: existing + 1,
    weight,
    unit,
    reps,
    rpe: null,
    completed: true,
    timestamp: Date.now(),
  });
}

export async function updateSet(id: number, changes: Partial<{ weight: number; reps: number; completed: boolean; rpe: number | null }>) {
  await db.setEntries.update(id, changes);
}

export async function deleteSet(id: number) {
  await db.setEntries.delete(id);
}
