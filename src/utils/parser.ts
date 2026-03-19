export interface ParsedExercise {
  name: string;
  weight: number | null;
  unit: 'lbs' | 'kg' | null;
  reps: number | null;
  sets: number | null;
  confidence: number;
}

export function parseExerciseInput(input: string): ParsedExercise {
  let remaining = input.trim();
  let weight: number | null = null;
  let unit: 'lbs' | 'kg' | null = null;
  let reps: number | null = null;
  let sets: number | null = null;
  let confidence = 0;

  // 1. Compact format: 3x10x135 or 3x10
  const compactMatch = remaining.match(/(\d+)\s*x\s*(\d+)(?:\s*x\s*(\d+(?:\.\d+)?))?/i);
  if (compactMatch) {
    if (compactMatch[3] !== undefined) {
      sets = parseInt(compactMatch[1], 10);
      reps = parseInt(compactMatch[2], 10);
      weight = parseFloat(compactMatch[3]);
    } else {
      // Could be sets x reps or reps x weight — heuristic: if second number > 30, it's weight
      const a = parseInt(compactMatch[1], 10);
      const b = parseInt(compactMatch[2], 10);
      if (b > 30) {
        reps = a;
        weight = b;
      } else {
        sets = a;
        reps = b;
      }
    }
    remaining = remaining.replace(compactMatch[0], ' ');
  }

  // 2. Weight: 100lbs, 50kg, 225#
  if (weight === null) {
    const weightMatch = remaining.match(/(\d+(?:\.\d+)?)\s*(?:(lbs?|pounds?)|(kg|kgs?|kilos?|kilograms?)|(#))/i);
    if (weightMatch) {
      weight = parseFloat(weightMatch[1]);
      if (weightMatch[3]) {
        unit = 'kg';
      } else {
        unit = 'lbs';
      }
      remaining = remaining.replace(weightMatch[0], ' ');
    }
  }

  // 3. Reps: 10 reps, x12
  if (reps === null) {
    const repsMatch = remaining.match(/(?:x\s*|for\s+)?(\d+)\s*(?:reps?|repetitions?)\b/i);
    if (repsMatch) {
      reps = parseInt(repsMatch[1], 10);
      remaining = remaining.replace(repsMatch[0], ' ');
    }
  }

  // 4. Sets: 3 sets
  if (sets === null) {
    const setsMatch = remaining.match(/(\d+)\s*(?:sets?)\b/i);
    if (setsMatch) {
      sets = parseInt(setsMatch[1], 10);
      remaining = remaining.replace(setsMatch[0], ' ');
    }
  }

  // 5. Standalone "x12" or "x 12" (reps without "reps" keyword)
  if (reps === null) {
    const xRepsMatch = remaining.match(/\bx\s*(\d+)\b/i);
    if (xRepsMatch) {
      reps = parseInt(xRepsMatch[1], 10);
      remaining = remaining.replace(xRepsMatch[0], ' ');
    }
  }

  // Exercise name: remaining text, cleaned up
  const name = remaining
    .replace(/[#×]/g, ' ')
    .replace(/\b(for|and|with|at)\b/gi, ' ')
    .replace(/\d+(\.\d+)?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Confidence scoring
  if (name.length > 0) confidence += 0.4;
  if (weight !== null) confidence += 0.2;
  if (reps !== null) confidence += 0.2;
  if (sets !== null) confidence += 0.1;
  if (unit !== null) confidence += 0.1;

  return { name, weight, unit, reps, sets, confidence };
}
