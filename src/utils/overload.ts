import type { SetEntry, ExerciseTemplate } from '../db/models';

export interface OverloadRecommendation {
  type: 'increase_weight' | 'maintain_weight' | 'deload' | 'increase_reps' | null;
  weight: number | null;
  unit: 'lbs' | 'kg';
  reps: number | null;
  message: string;
}

interface SessionData {
  sets: SetEntry[];
  date: string;
}

export function getExerciseCategory(
  template: ExerciseTemplate | null
): 'upper_compound' | 'lower_compound' | 'isolation' | 'bodyweight' {
  if (!template) return 'upper_compound';

  if (template.equipment === 'body only') return 'bodyweight';

  const lowerMuscles = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abductors', 'adductors'];
  const isLower = template.primaryMuscles.some((m) => lowerMuscles.includes(m.toLowerCase()));

  if (template.mechanic === 'isolation') return 'isolation';
  return isLower ? 'lower_compound' : 'upper_compound';
}

function getWeightIncrement(category: ReturnType<typeof getExerciseCategory>, unit: 'lbs' | 'kg'): number {
  const increments = {
    upper_compound: unit === 'lbs' ? 5 : 2.5,
    lower_compound: unit === 'lbs' ? 10 : 5,
    isolation: unit === 'lbs' ? 2.5 : 1.25,
    bodyweight: 0,
  };
  return increments[category];
}

export function computeOverload(
  sessions: SessionData[],
  category: ReturnType<typeof getExerciseCategory>,
  unit: 'lbs' | 'kg'
): OverloadRecommendation {
  if (sessions.length === 0) {
    return { type: null, weight: null, unit, reps: null, message: '' };
  }

  const latest = sessions[0];
  const completedSets = latest.sets.filter((s) => s.completed);
  if (completedSets.length === 0) {
    return { type: null, weight: null, unit, reps: null, message: '' };
  }

  const latestWeight = completedSets[0].weight;
  const targetReps = Math.max(...completedSets.map((s) => s.reps));
  const minReps = Math.min(...completedSets.map((s) => s.reps));
  const allRepsHit = completedSets.every((s) => s.reps >= targetReps);

  // Bodyweight: just add reps
  if (category === 'bodyweight') {
    return {
      type: 'increase_reps',
      weight: null,
      unit,
      reps: targetReps + 1,
      message: `Try: ${targetReps + 1} reps`,
    };
  }

  // Check for 3 sessions of declining performance
  if (sessions.length >= 3) {
    const recentMaxReps = sessions.slice(0, 3).map((s) => {
      const done = s.sets.filter((set) => set.completed);
      return done.length > 0 ? Math.min(...done.map((set) => set.reps)) : 0;
    });
    const declining = recentMaxReps[0] < recentMaxReps[1] && recentMaxReps[1] < recentMaxReps[2];
    if (declining) {
      const deloadWeight = Math.round(latestWeight * 0.9);
      return {
        type: 'deload',
        weight: deloadWeight,
        unit,
        reps: targetReps,
        message: `Deload: ${deloadWeight}${unit} × ${targetReps}`,
      };
    }
  }

  // All target reps completed → increase weight
  if (allRepsHit) {
    const increment = getWeightIncrement(category, unit);
    const newWeight = latestWeight + increment;
    const newReps = Math.max(targetReps - 2, 1);
    return {
      type: 'increase_weight',
      weight: newWeight,
      unit,
      reps: newReps,
      message: `Try: ${newWeight}${unit} × ${newReps}`,
    };
  }

  // Partial reps: maintain weight, target +1 on weakest
  return {
    type: 'maintain_weight',
    weight: latestWeight,
    unit,
    reps: minReps + 1,
    message: `Try: ${latestWeight}${unit} × ${minReps + 1}`,
  };
}
