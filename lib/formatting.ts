/**
 * Format a date string (YYYY-MM-DD or ISO) for display.
 * Returns e.g. "Mar 18, 2026" or "Today" / "Yesterday" when applicable.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  // Strip time for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a weight value with its unit, e.g. "135 lbs" or "60 kg".
 * Returns empty string for zero / null weight (bodyweight exercises).
 */
export function formatWeight(weight: number | null | undefined, unit: string = 'lbs'): string {
  if (weight == null || weight === 0) return '';
  // Remove trailing zeros for clean display
  const formatted = Number.isInteger(weight) ? weight.toString() : weight.toFixed(1).replace(/\.0$/, '');
  return `${formatted} ${unit}`;
}

/**
 * Summarise a collection of sets into a compact string.
 *
 * Examples:
 *   3 sets of 10 reps @ 135 lbs  → "3x10 @ 135 lbs"
 *   Mixed reps (10, 8, 6)        → "10, 8, 6 @ 135 lbs"
 *   Bodyweight                    → "3x10"
 */
export function formatSetSummary(
  sets: { reps: number; weight: number; unit: string }[]
): string {
  if (sets.length === 0) return '';

  const repsArr = sets.map((s) => s.reps);
  const weight = sets[0].weight;
  const unit = sets[0].unit;
  const allSameReps = repsArr.every((r) => r === repsArr[0]);

  let repsPart: string;
  if (allSameReps) {
    repsPart = `${sets.length}x${repsArr[0]}`;
  } else {
    repsPart = repsArr.join(', ');
  }

  const weightPart = formatWeight(weight, unit);
  if (!weightPart) return repsPart;

  return `${repsPart} @ ${weightPart}`;
}

/**
 * Simple pluralisation helper.
 *   pluralize(1, 'set')  → "1 set"
 *   pluralize(3, 'set')  → "3 sets"
 *   pluralize(1, 'rep')  → "1 rep"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? singular + 's');
  return `${count} ${word}`;
}
