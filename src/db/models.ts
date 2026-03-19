export interface Workout {
  id?: number;
  date: string;
  title: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExerciseEntry {
  id?: number;
  workoutId: number;
  name: string;
  order: number;
  notes: string;
  createdAt: number;
}

export interface SetEntry {
  id?: number;
  exerciseEntryId: number;
  setNumber: number;
  weight: number;
  unit: 'lbs' | 'kg';
  reps: number;
  rpe: number | null;
  completed: boolean;
  timestamp: number;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string;
  level: string;
  force: string | null;
  mechanic: string | null;
}

export interface UserExerciseStats {
  id?: number;
  exerciseName: string;
  lastUsedAt: number;
  useCount: number;
  personalBest: { weight: number; unit: 'lbs' | 'kg'; reps: number; date: string } | null;
}

export interface UserPreferences {
  id: number;
  defaultUnit: 'lbs' | 'kg';
  theme: 'light' | 'dark' | 'system';
}
