// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Workout {
  id: number;
  date: string;
  title: string;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

export interface ExerciseEntry {
  id: number;
  workout_id: number;
  name: string;
  sort_order: number;
  notes: string | null;
  created_at: number;
}

export interface SetEntry {
  id: number;
  exercise_entry_id: number;
  set_number: number;
  weight: number;
  unit: string;
  reps: number;
  rpe: number | null;
  completed: number; // 0 or 1 (SQLite boolean)
  timestamp: number;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  equipment: string | null;
  primary_muscles: string | null;
  secondary_muscles: string | null;
  category: string | null;
  level: string | null;
  force: string | null;
  mechanic: string | null;
}

export interface UserExerciseStats {
  id: number;
  exercise_name: string;
  last_used_at: number;
  use_count: number;
  personal_best: string | null; // JSON string: { weight, reps, date }
}

export interface UserPreferences {
  id: number;
  default_unit: string;
  theme: string;
}

// ─── Parser Types ─────────────────────────────────────────────────────────────

export interface ParsedExercise {
  name: string;
  weight: number | null;
  unit: string;
  reps: number | null;
  sets: number;
  confidence: number;
}
