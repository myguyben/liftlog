import { ParsedExercise } from './models';

/**
 * Parse a free-form exercise input string into structured data.
 *
 * Supported formats:
 *   "Bench Press 3x10x135"       → 3 sets, 10 reps, 135 lbs
 *   "Bench Press 3x10 135lbs"    → 3 sets, 10 reps, 135 lbs
 *   "Bench Press 135lbs 3x10"    → 3 sets, 10 reps, 135 lbs
 *   "Bench Press 225#"           → 1 set, null reps, 225 lbs
 *   "Bench Press 50kg 10"        → 1 set, 10 reps, 50 kg
 *   "Bench Press 10 reps"        → 1 set, 10 reps, no weight
 *   "Bench Press"                → name only
 */
export function parseExerciseInput(input: string): ParsedExercise {
  const trimmed = input.trim();
  if (!trimmed) {
    return { name: '', weight: null, unit: 'lbs', reps: null, sets: 1, confidence: 0 };
  }

  let remaining = trimmed;
  let weight: number | null = null;
  let unit = 'lbs';
  let reps: number | null = null;
  let sets = 1;
  let confidence = 0;

  // ─── Compact format: SxRxW (e.g. 3x10x135) ──────────────────────────────
  const compactMatch = remaining.match(/(\d+)\s*x\s*(\d+)\s*x\s*([\d.]+)\s*(lbs?|kgs?|#)?/i);
  if (compactMatch) {
    sets = parseInt(compactMatch[1], 10);
    reps = parseInt(compactMatch[2], 10);
    weight = parseFloat(compactMatch[3]);
    if (compactMatch[4]) {
      unit = normalizeUnit(compactMatch[4]);
    }
    remaining = remaining.replace(compactMatch[0], '').trim();
    confidence = 0.95;
  }

  // ─── Sets x Reps format: SxR (e.g. 3x10) ────────────────────────────────
  if (!compactMatch) {
    const setsRepsMatch = remaining.match(/(\d+)\s*x\s*(\d+)/i);
    if (setsRepsMatch) {
      sets = parseInt(setsRepsMatch[1], 10);
      reps = parseInt(setsRepsMatch[2], 10);
      remaining = remaining.replace(setsRepsMatch[0], '').trim();
      confidence = 0.8;
    }
  }

  // ─── Weight with unit: 135lbs, 50kg, 225# ────────────────────────────────
  if (weight === null) {
    const weightMatch = remaining.match(/([\d.]+)\s*(lbs?|kgs?|#)/i);
    if (weightMatch) {
      weight = parseFloat(weightMatch[1]);
      unit = normalizeUnit(weightMatch[2]);
      remaining = remaining.replace(weightMatch[0], '').trim();
      confidence = Math.max(confidence, 0.8);
    }
  }

  // ─── Bare number for weight (if weight not yet found, look for larger nums)
  if (weight === null) {
    const bareWeightMatch = remaining.match(/\b([\d.]+)\b/);
    if (bareWeightMatch) {
      const num = parseFloat(bareWeightMatch[1]);
      // Numbers > 20 are likely weight; smaller numbers are likely reps
      if (num > 20) {
        weight = num;
        remaining = remaining.replace(bareWeightMatch[0], '').trim();
        confidence = Math.max(confidence, 0.5);
      }
    }
  }

  // ─── Reps: "10 reps" or bare number ──────────────────────────────────────
  if (reps === null) {
    const repsLabelMatch = remaining.match(/(\d+)\s*reps?/i);
    if (repsLabelMatch) {
      reps = parseInt(repsLabelMatch[1], 10);
      remaining = remaining.replace(repsLabelMatch[0], '').trim();
      confidence = Math.max(confidence, 0.7);
    } else {
      // Try bare number as reps
      const bareRepsMatch = remaining.match(/\b(\d+)\b/);
      if (bareRepsMatch) {
        reps = parseInt(bareRepsMatch[1], 10);
        remaining = remaining.replace(bareRepsMatch[0], '').trim();
        confidence = Math.max(confidence, 0.4);
      }
    }
  }

  // ─── Whatever is left is the exercise name ────────────────────────────────
  const name = remaining
    .replace(/[,\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (name && confidence === 0) {
    confidence = 0.3;
  }

  return { name, weight, unit, reps, sets, confidence };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeUnit(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower === '#' || lower.startsWith('lb')) return 'lbs';
  if (lower.startsWith('kg')) return 'kg';
  return 'lbs';
}
