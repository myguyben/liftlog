import type { ExerciseEntry } from '../../db/models';
import { useExerciseSets, addSet, deleteExerciseEntry } from '../../hooks/useWorkouts';
import { useOverload } from '../../hooks/useOverload';
import { InlineSetRow } from './InlineSetRow';
import { OverloadBadge } from '../recommendations/OverloadBadge';
import { LastPerformance } from '../recommendations/LastPerformance';

export function InlineExercise({ entry }: { entry: ExerciseEntry }) {
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
    <div className="mb-5">
      {/* Exercise name — bold inline heading like a note subheading */}
      <div className="flex items-baseline justify-between group">
        <h3 className="text-[17px] font-semibold text-notes-text">{entry.name}</h3>
        <button
          onClick={() => deleteExerciseEntry(entry.id!)}
          className="text-[11px] text-notes-danger opacity-0 group-hover:opacity-60 active:opacity-100 transition-opacity"
        >
          remove
        </button>
      </div>

      <LastPerformance exerciseName={entry.name} />

      {recommendation && recommendation.type && (
        <OverloadBadge recommendation={recommendation} onApply={handleApplyRecommendation} />
      )}

      {/* Sets — inline like bullet points in a note */}
      <div className="mt-1.5 ml-0.5">
        {sets.map((s) => (
          <InlineSetRow key={s.id} set={s} />
        ))}
      </div>

      {/* Add set — subtle inline link */}
      <button
        onClick={handleAddSet}
        className="text-[13px] text-notes-accent mt-1 ml-0.5 active:opacity-60 transition-opacity"
      >
        + set
      </button>
    </div>
  );
}
