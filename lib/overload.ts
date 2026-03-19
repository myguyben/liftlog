import { SetEntry } from './models';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OverloadRecommendation {
  type: 'increase_weight' | 'maintain' | 'deload' | 'add_rep' | null;
  message: string;
  suggestedWeight: number | null;
  suggestedReps: number | null;
}

export type ExerciseCategory = 'barbell' | 'dumbbell' | 'bodyweight' | 'machine' | 'cable' | 'other';

/**
 * A single session summary used as input for overload computation.
 */
export interface SessionSummary {
  date: string;
  weight: number;
  unit: string;
  targetReps: number;
  completedReps: number;
  sets: number;
}

// ─── Category Detection ─────────────────────────────────────────────────────

const BARBELL_KEYWORDS = ['barbell', 'bench press', 'squat', 'deadlift', 'overhead press', 'row', 'clean', 'snatch', 'jerk'];
const DUMBBELL_KEYWORDS = ['dumbbell', 'db '];
const BODYWEIGHT_KEYWORDS = ['bodyweight', 'pull-up', 'pullup', 'push-up', 'pushup', 'dip', 'chin-up', 'chinup', 'plank', 'lunge'];
const MACHINE_KEYWORDS = ['machine', 'leg press', 'smith', 'hack squat', 'pec deck', 'lat pulldown'];
const CABLE_KEYWORDS = ['cable', 'tricep pushdown', 'face pull'];

export function getExerciseCategory(name: string): ExerciseCategory {
  const lower = name.toLowerCase();

  if (BODYWEIGHT_KEYWORDS.some((k) => lower.includes(k))) return 'bodyweight';
  if (BARBELL_KEYWORDS.some((k) => lower.includes(k))) return 'barbell';
  if (DUMBBELL_KEYWORDS.some((k) => lower.includes(k))) return 'dumbbell';
  if (MACHINE_KEYWORDS.some((k) => lower.includes(k))) return 'machine';
  if (CABLE_KEYWORDS.some((k) => lower.includes(k))) return 'cable';

  return 'other';
}

// ─── Weight Increment Lookup ────────────────────────────────────────────────

function getWeightIncrement(category: ExerciseCategory, unit: string): number {
  const isKg = unit === 'kg';
  switch (category) {
    case 'barbell':
      return isKg ? 2.5 : 5;
    case 'dumbbell':
      return isKg ? 2 : 5;
    case 'machine':
    case 'cable':
      return isKg ? 2.5 : 5;
    case 'bodyweight':
      return 0; // bodyweight uses rep progression
    default:
      return isKg ? 2.5 : 5;
  }
}

// ─── Overload Engine ────────────────────────────────────────────────────────

/**
 * Compute a progressive-overload recommendation based on recent session
 * history (most-recent first).
 *
 * Rules:
 *  1. No history  → null recommendation (nothing to base it on)
 *  2. Bodyweight  → suggest +1 rep
 *  3. All target reps completed in most recent session → increase weight
 *  4. Partial reps completed → maintain weight
 *  5. Three consecutive sessions of declining reps → deload (reduce weight ~10%)
 */
export function computeOverload(
  exerciseName: string,
  history: SessionSummary[]
): OverloadRecommendation {
  // Rule 1: no history
  if (!history || history.length === 0) {
    return {
      type: null,
      message: 'No previous data. Complete a session first to get recommendations.',
      suggestedWeight: null,
      suggestedReps: null,
    };
  }

  const category = getExerciseCategory(exerciseName);
  const latest = history[0];

  // Rule 2: bodyweight → add a rep
  if (category === 'bodyweight') {
    return {
      type: 'add_rep',
      message: `Try ${latest.completedReps + 1} reps next session.`,
      suggestedWeight: null,
      suggestedReps: latest.completedReps + 1,
    };
  }

  // Rule 5: three consecutive declining sessions → deload
  if (history.length >= 3) {
    const [a, b, c] = history; // a = most recent
    if (a.completedReps < b.completedReps && b.completedReps < c.completedReps) {
      const deloadWeight = Math.round(latest.weight * 0.9);
      return {
        type: 'deload',
        message: `Reps have declined 3 sessions in a row. Deload to ${deloadWeight}${latest.unit} and rebuild.`,
        suggestedWeight: deloadWeight,
        suggestedReps: latest.targetReps,
      };
    }
  }

  // Rule 3: all target reps completed → increase weight
  if (latest.completedReps >= latest.targetReps) {
    const increment = getWeightIncrement(category, latest.unit);
    const newWeight = latest.weight + increment;
    return {
      type: 'increase_weight',
      message: `Great job! Increase to ${newWeight}${latest.unit} next session.`,
      suggestedWeight: newWeight,
      suggestedReps: latest.targetReps,
    };
  }

  // Rule 4: partial reps → maintain
  return {
    type: 'maintain',
    message: `Keep at ${latest.weight}${latest.unit} and aim for ${latest.targetReps} reps.`,
    suggestedWeight: latest.weight,
    suggestedReps: latest.targetReps,
  };
}
