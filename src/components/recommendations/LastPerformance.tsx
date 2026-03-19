import { useExerciseHistory } from '../../hooks/useExerciseHistory';
import { formatDate, formatSetSummary } from '../../utils/formatting';

export function LastPerformance({ exerciseName }: { exerciseName: string }) {
  const history = useExerciseHistory(exerciseName, 1);

  if (history.length === 0) return null;

  const last = history[0];
  const completedSets = last.sets.filter((s) => s.completed);
  if (completedSets.length === 0) return null;

  const topSet = completedSets.reduce((best, s) => (s.weight > best.weight ? s : best), completedSets[0]);

  return (
    <p className="text-[13px] text-notes-muted/70 mt-0.5 flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-notes-muted/50">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      Last: {formatSetSummary(topSet.weight, topSet.unit, topSet.reps)} ({formatDate(last.date)})
    </p>
  );
}
