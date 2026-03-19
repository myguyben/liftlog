import { describe, it, expect } from 'vitest';
import { computeOverload, getExerciseCategory } from './overload';
import type { SetEntry, ExerciseTemplate } from '../db/models';

function makeSet(overrides: Partial<SetEntry> = {}): SetEntry {
  return {
    id: 1,
    exerciseEntryId: 1,
    setNumber: 1,
    weight: 100,
    unit: 'lbs',
    reps: 10,
    rpe: null,
    completed: true,
    timestamp: Date.now(),
    ...overrides,
  };
}

function makeTemplate(overrides: Partial<ExerciseTemplate> = {}): ExerciseTemplate {
  return {
    id: 'test',
    name: 'Test Exercise',
    equipment: 'barbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: [],
    category: 'strength',
    level: 'intermediate',
    force: 'push',
    mechanic: 'compound',
    ...overrides,
  };
}

describe('getExerciseCategory', () => {
  it('returns bodyweight for body only', () => {
    expect(getExerciseCategory(makeTemplate({ equipment: 'body only' }))).toBe('bodyweight');
  });

  it('returns lower_compound for squats', () => {
    expect(getExerciseCategory(makeTemplate({ primaryMuscles: ['quadriceps'], mechanic: 'compound' }))).toBe('lower_compound');
  });

  it('returns isolation for isolation exercises', () => {
    expect(getExerciseCategory(makeTemplate({ mechanic: 'isolation' }))).toBe('isolation');
  });

  it('returns upper_compound for bench press', () => {
    expect(getExerciseCategory(makeTemplate({ primaryMuscles: ['chest'], mechanic: 'compound' }))).toBe('upper_compound');
  });
});

describe('computeOverload', () => {
  it('returns null recommendation for no history', () => {
    const result = computeOverload([], 'upper_compound', 'lbs');
    expect(result.type).toBeNull();
  });

  it('recommends weight increase when all reps completed', () => {
    const sessions = [
      { date: '2026-03-18', sets: [makeSet({ reps: 10 }), makeSet({ reps: 10 }), makeSet({ reps: 10 })] },
    ];
    const result = computeOverload(sessions, 'upper_compound', 'lbs');
    expect(result.type).toBe('increase_weight');
    expect(result.weight).toBe(105);
    expect(result.reps).toBe(8);
  });

  it('recommends maintaining weight with partial reps', () => {
    const sessions = [
      { date: '2026-03-18', sets: [makeSet({ reps: 10 }), makeSet({ reps: 9 }), makeSet({ reps: 8 })] },
    ];
    const result = computeOverload(sessions, 'upper_compound', 'lbs');
    expect(result.type).toBe('maintain_weight');
    expect(result.weight).toBe(100);
    expect(result.reps).toBe(9);
  });

  it('recommends deload after 3 declining sessions', () => {
    const sessions = [
      { date: '2026-03-18', sets: [makeSet({ reps: 6 })] },
      { date: '2026-03-16', sets: [makeSet({ reps: 8 })] },
      { date: '2026-03-14', sets: [makeSet({ reps: 10 })] },
    ];
    const result = computeOverload(sessions, 'upper_compound', 'lbs');
    expect(result.type).toBe('deload');
    expect(result.weight).toBe(90);
  });

  it('recommends rep increase for bodyweight', () => {
    const sessions = [
      { date: '2026-03-18', sets: [makeSet({ weight: 0, reps: 10 })] },
    ];
    const result = computeOverload(sessions, 'bodyweight', 'lbs');
    expect(result.type).toBe('increase_reps');
    expect(result.reps).toBe(11);
  });

  it('uses correct increment for isolation exercises', () => {
    const sessions = [
      { date: '2026-03-18', sets: [makeSet({ reps: 12 }), makeSet({ reps: 12 })] },
    ];
    const result = computeOverload(sessions, 'isolation', 'lbs');
    expect(result.type).toBe('increase_weight');
    expect(result.weight).toBe(102.5);
  });
});
