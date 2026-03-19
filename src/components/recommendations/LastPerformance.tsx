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
    <p className="text-xs text-notes-muted mt-0.5">
      Last: {formatSetSummary(topSet.weight, topSet.unit, topSet.reps)} ({formatDate(last.date)})
    </p>
  );
}
