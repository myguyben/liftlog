import { describe, it, expect } from 'vitest';
import { parseExerciseInput } from './parser';

describe('parseExerciseInput', () => {
  it('parses "bench press 100lbs 10 reps"', () => {
    const result = parseExerciseInput('bench press 100lbs 10 reps');
    expect(result.name).toBe('bench press');
    expect(result.weight).toBe(100);
    expect(result.unit).toBe('lbs');
    expect(result.reps).toBe(10);
  });

  it('parses compact format "3x10x135 squat"', () => {
    const result = parseExerciseInput('3x10x135 squat');
    expect(result.sets).toBe(3);
    expect(result.reps).toBe(10);
    expect(result.weight).toBe(135);
    expect(result.name).toBe('squat');
  });

  it('parses "pull ups x12"', () => {
    const result = parseExerciseInput('pull ups x12');
    expect(result.name).toBe('pull ups');
    expect(result.reps).toBe(12);
  });

  it('parses "deadlift 225# for 5"', () => {
    const result = parseExerciseInput('deadlift 225# for 5');
    expect(result.name).toBe('deadlift');
    expect(result.weight).toBe(225);
    expect(result.unit).toBe('lbs');
  });

  it('parses "50kg overhead press 5x5"', () => {
    const result = parseExerciseInput('50kg overhead press 5x5');
    expect(result.name).toBe('overhead press');
    expect(result.weight).toBe(50);
    expect(result.unit).toBe('kg');
    expect(result.sets).toBe(5);
    expect(result.reps).toBe(5);
  });

  it('parses "dumbbell incline bench press 100lbs 10 reps 3 sets"', () => {
    const result = parseExerciseInput('dumbbell incline bench press 100lbs 10 reps 3 sets');
    expect(result.name).toBe('dumbbell incline bench press');
    expect(result.weight).toBe(100);
    expect(result.unit).toBe('lbs');
    expect(result.reps).toBe(10);
    expect(result.sets).toBe(3);
  });

  it('returns confidence > 0 for valid input', () => {
    const result = parseExerciseInput('bench press 100lbs 10 reps');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('handles empty input', () => {
    const result = parseExerciseInput('');
    expect(result.name).toBe('');
    expect(result.confidence).toBe(0);
  });

  it('parses reps with "x" prefix like "x10"', () => {
    const result = parseExerciseInput('curls x10');
    expect(result.name).toBe('curls');
    expect(result.reps).toBe(10);
  });

  it('parses "3x10" as sets x reps', () => {
    const result = parseExerciseInput('3x10 bench press');
    expect(result.sets).toBe(3);
    expect(result.reps).toBe(10);
    expect(result.name).toBe('bench press');
  });
});
