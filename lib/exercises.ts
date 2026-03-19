import { getDb } from './database';

interface ExerciseSeed {
  id: string;
  name: string;
  equipment: string;
  primary_muscles: string;
  secondary_muscles: string;
  category: string;
  level: string;
  force: string;
  mechanic: string;
}

const EXERCISES: ExerciseSeed[] = [
  { id: 'barbell-bench-press', name: 'Barbell Bench Press', equipment: 'barbell', primary_muscles: 'chest', secondary_muscles: 'triceps,shoulders', category: 'strength', level: 'intermediate', force: 'push', mechanic: 'compound' },
  { id: 'incline-bench-press', name: 'Incline Bench Press', equipment: 'barbell', primary_muscles: 'chest', secondary_muscles: 'triceps,shoulders', category: 'strength', level: 'intermediate', force: 'push', mechanic: 'compound' },
  { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', equipment: 'dumbbell', primary_muscles: 'chest', secondary_muscles: 'triceps,shoulders', category: 'strength', level: 'beginner', force: 'push', mechanic: 'compound' },
  { id: 'barbell-squat', name: 'Barbell Squat', equipment: 'barbell', primary_muscles: 'quadriceps', secondary_muscles: 'glutes,hamstrings', category: 'strength', level: 'intermediate', force: 'push', mechanic: 'compound' },
  { id: 'front-squat', name: 'Front Squat', equipment: 'barbell', primary_muscles: 'quadriceps', secondary_muscles: 'glutes,hamstrings', category: 'strength', level: 'intermediate', force: 'push', mechanic: 'compound' },
  { id: 'leg-press', name: 'Leg Press', equipment: 'machine', primary_muscles: 'quadriceps', secondary_muscles: 'glutes,hamstrings', category: 'strength', level: 'beginner', force: 'push', mechanic: 'compound' },
  { id: 'deadlift', name: 'Deadlift', equipment: 'barbell', primary_muscles: 'hamstrings', secondary_muscles: 'glutes,lower back', category: 'strength', level: 'intermediate', force: 'pull', mechanic: 'compound' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', equipment: 'barbell', primary_muscles: 'hamstrings', secondary_muscles: 'glutes,lower back', category: 'strength', level: 'intermediate', force: 'pull', mechanic: 'compound' },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', equipment: 'barbell', primary_muscles: 'hamstrings', secondary_muscles: 'glutes,quadriceps', category: 'strength', level: 'intermediate', force: 'pull', mechanic: 'compound' },
  { id: 'overhead-press', name: 'Overhead Press', equipment: 'barbell', primary_muscles: 'shoulders', secondary_muscles: 'triceps', category: 'strength', level: 'intermediate', force: 'push', mechanic: 'compound' },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', equipment: 'dumbbell', primary_muscles: 'shoulders', secondary_muscles: 'triceps', category: 'strength', level: 'beginner', force: 'push', mechanic: 'compound' },
  { id: 'lateral-raise', name: 'Lateral Raise', equipment: 'dumbbell', primary_muscles: 'shoulders', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'push', mechanic: 'isolation' },
  { id: 'barbell-row', name: 'Barbell Row', equipment: 'barbell', primary_muscles: 'back', secondary_muscles: 'biceps', category: 'strength', level: 'intermediate', force: 'pull', mechanic: 'compound' },
  { id: 'dumbbell-row', name: 'Dumbbell Row', equipment: 'dumbbell', primary_muscles: 'back', secondary_muscles: 'biceps', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'compound' },
  { id: 'pull-up', name: 'Pull Up', equipment: 'bodyweight', primary_muscles: 'back', secondary_muscles: 'biceps', category: 'strength', level: 'intermediate', force: 'pull', mechanic: 'compound' },
  { id: 'chin-up', name: 'Chin Up', equipment: 'bodyweight', primary_muscles: 'back', secondary_muscles: 'biceps', category: 'strength', level: 'intermediate', force: 'pull', mechanic: 'compound' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', equipment: 'cable', primary_muscles: 'back', secondary_muscles: 'biceps', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'compound' },
  { id: 'cable-row', name: 'Cable Row', equipment: 'cable', primary_muscles: 'back', secondary_muscles: 'biceps', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'compound' },
  { id: 'barbell-curl', name: 'Barbell Curl', equipment: 'barbell', primary_muscles: 'biceps', secondary_muscles: 'forearms', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'isolation' },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', equipment: 'dumbbell', primary_muscles: 'biceps', secondary_muscles: 'forearms', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'isolation' },
  { id: 'hammer-curl', name: 'Hammer Curl', equipment: 'dumbbell', primary_muscles: 'biceps', secondary_muscles: 'forearms', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'isolation' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', equipment: 'cable', primary_muscles: 'triceps', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'push', mechanic: 'isolation' },
  { id: 'skull-crusher', name: 'Skull Crusher', equipment: 'barbell', primary_muscles: 'triceps', secondary_muscles: '', category: 'strength', level: 'intermediate', force: 'push', mechanic: 'isolation' },
  { id: 'dip', name: 'Dip', equipment: 'bodyweight', primary_muscles: 'triceps', secondary_muscles: 'chest,shoulders', category: 'strength', level: 'intermediate', force: 'push', mechanic: 'compound' },
  { id: 'leg-curl', name: 'Leg Curl', equipment: 'machine', primary_muscles: 'hamstrings', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'isolation' },
  { id: 'leg-extension', name: 'Leg Extension', equipment: 'machine', primary_muscles: 'quadriceps', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'push', mechanic: 'isolation' },
  { id: 'calf-raise', name: 'Calf Raise', equipment: 'machine', primary_muscles: 'calves', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'push', mechanic: 'isolation' },
  { id: 'face-pull', name: 'Face Pull', equipment: 'cable', primary_muscles: 'shoulders', secondary_muscles: 'back', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'compound' },
  { id: 'chest-fly', name: 'Chest Fly', equipment: 'dumbbell', primary_muscles: 'chest', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'push', mechanic: 'isolation' },
  { id: 'cable-fly', name: 'Cable Fly', equipment: 'cable', primary_muscles: 'chest', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'push', mechanic: 'isolation' },
  { id: 'hip-thrust', name: 'Hip Thrust', equipment: 'barbell', primary_muscles: 'glutes', secondary_muscles: 'hamstrings', category: 'strength', level: 'intermediate', force: 'push', mechanic: 'compound' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', equipment: 'dumbbell', primary_muscles: 'quadriceps', secondary_muscles: 'glutes', category: 'strength', level: 'intermediate', force: 'push', mechanic: 'compound' },
  { id: 'lunges', name: 'Lunges', equipment: 'dumbbell', primary_muscles: 'quadriceps', secondary_muscles: 'glutes,hamstrings', category: 'strength', level: 'beginner', force: 'push', mechanic: 'compound' },
  { id: 'plank', name: 'Plank', equipment: 'bodyweight', primary_muscles: 'core', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'static', mechanic: 'compound' },
  { id: 'ab-crunch', name: 'Ab Crunch', equipment: 'bodyweight', primary_muscles: 'core', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'isolation' },
  { id: 'cable-crunch', name: 'Cable Crunch', equipment: 'cable', primary_muscles: 'core', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'isolation' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', equipment: 'bodyweight', primary_muscles: 'core', secondary_muscles: '', category: 'strength', level: 'intermediate', force: 'pull', mechanic: 'isolation' },
  { id: 'shrug', name: 'Shrug', equipment: 'dumbbell', primary_muscles: 'traps', secondary_muscles: '', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'isolation' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', equipment: 'dumbbell', primary_muscles: 'shoulders', secondary_muscles: 'back', category: 'strength', level: 'beginner', force: 'pull', mechanic: 'isolation' },
  { id: 'push-up', name: 'Push Up', equipment: 'bodyweight', primary_muscles: 'chest', secondary_muscles: 'triceps,shoulders', category: 'strength', level: 'beginner', force: 'push', mechanic: 'compound' },
];

/**
 * Seeds the exercise_templates table with default exercises.
 * Uses INSERT OR IGNORE so it's safe to call multiple times.
 */
export function seedExercises(): void {
  const db = getDb();
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercise_templates'
  );
  if (row && row.count > 0) return;

  db.runSync('BEGIN TRANSACTION');
  try {
    for (const ex of EXERCISES) {
      db.runSync(
        `INSERT OR IGNORE INTO exercise_templates (id, name, equipment, primary_muscles, secondary_muscles, category, level, force, mechanic)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ex.id, ex.name, ex.equipment, ex.primary_muscles, ex.secondary_muscles, ex.category, ex.level, ex.force, ex.mechanic]
      );
    }
    db.runSync('COMMIT');
  } catch (error) {
    db.runSync('ROLLBACK');
    throw error;
  }
}
