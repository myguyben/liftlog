import Dexie, { type Table } from 'dexie';
import type {
  Workout,
  ExerciseEntry,
  SetEntry,
  ExerciseTemplate,
  UserExerciseStats,
  UserPreferences,
} from './models';

export class LiftLogDB extends Dexie {
  workouts!: Table<Workout, number>;
  exerciseEntries!: Table<ExerciseEntry, number>;
  setEntries!: Table<SetEntry, number>;
  exerciseTemplates!: Table<ExerciseTemplate, string>;
  userExerciseStats!: Table<UserExerciseStats, number>;
  userPreferences!: Table<UserPreferences, number>;

  constructor() {
    super('LiftLogDB');
    this.version(1).stores({
      workouts: '++id, date, createdAt, updatedAt',
      exerciseEntries: '++id, workoutId, name, order',
      setEntries: '++id, exerciseEntryId, setNumber, timestamp',
      exerciseTemplates: 'id, name, *primaryMuscles, equipment, category',
      userExerciseStats: '++id, exerciseName, lastUsedAt, useCount',
      userPreferences: 'id',
    });
  }
}

export const db = new LiftLogDB();
