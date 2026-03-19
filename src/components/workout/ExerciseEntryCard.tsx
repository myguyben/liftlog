import type { ExerciseEntry } from '../../db/models';
import { useExerciseSets, addSet, deleteExerciseEntry } from '../../hooks/useWorkouts';
import { useOverload } from '../../hooks/useOverload';
import { SetRow } from './SetRow';
import { OverloadBadge } from '../recommendations/OverloadBadge';
import { LastPerformance } from '../recommendations/LastPerformance';

export function ExerciseEntryCard({ entry }: { entry: ExerciseEntry }) {
  const sets = useExerciseSets(entry.id);
  const recommendation = useOverload(entry.name);

  async function handleAddSet() {
    const lastSet = sets.length > 0 ? sets[sets.length - 1] : null;
    await addSet(
      entry.id!,
      lastSet?.weight ?? 0,
      lastSet?.unit ?? 'lbs',
      lastSet?.reps ?? 0,
    );
  }

  function handleApplyRecommendation() {
    if (!recommendation?.weight || !recommendation?.reps) return;
    addSet(entry.id!, recommendation.weight, recommendation.unit, recommendation.reps);
  }

  return (
    <div className="bg-notes-card rounded-[var(--radius-card)] px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold text-gray-900 text-sm">{entry.name}</h4>
        <button
          onClick={() => deleteExerciseEntry(entry.id!)}
          className="text-notes-danger text-xs px-2 py-0.5"
        >
          Remove
        </button>
      </div>

      <LastPerformance exerciseName={entry.name} />

      {recommendation && recommendation.type && (
        <OverloadBadge recommendation={recommendation} onApply={handleApplyRecommendation} />
      )}

      <div className="mt-2">
        {sets.map((s) => (
          <SetRow key={s.id} set={s} />
        ))}
      </div>

      <button
        onClick={handleAddSet}
        className="mt-2 text-sm text-notes-accent font-medium w-full text-center py-1.5"
      >
        + Add Set
      </button>
    </div>
  );
}
