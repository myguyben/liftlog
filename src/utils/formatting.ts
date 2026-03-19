export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatWeight(weight: number, unit: 'lbs' | 'kg'): string {
  return `${weight}${unit}`;
}

export function formatSetSummary(weight: number, unit: 'lbs' | 'kg', reps: number): string {
  return `${weight}${unit} × ${reps}`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? singular + 's')}`;
}
