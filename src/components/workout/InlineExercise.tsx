import { useState } from 'react';
import type { ExerciseEntry } from '../../db/models';
import { useExerciseSets, addSet, deleteExerciseEntry } from '../../hooks/useWorkouts';
import { useOverload } from '../../hooks/useOverload';
import { InlineSetRow } from './InlineSetRow';
import { OverloadBadge } from '../recommendations/OverloadBadge';
import { LastPerformance } from '../recommendations/LastPerformance';

export function InlineExercise({ entry }: { entry: ExerciseEntry }) {
  const sets = useExerciseSets(entry.id);
  const recommendation = useOverload(entry.name);
  const [showRemove, setShowRemove] = useState(false);

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
    <div className="mb-6 animate-fade-in-up">
      {/* Exercise name */}
      <div className="flex items-baseline gap-2">
        <h3
          className="text-[17px] font-semibold text-notes-text leading-snug"
          onClick={() => setShowRemove(!showRemove)}
        >
          {entry.name}
        </h3>
        {showRemove && (
          <button
            onClick={() => deleteExerciseEntry(entry.id!)}
            className="text-[12px] text-notes-danger/70 active:text-notes-danger animate-fade-in"
          >
            remove
          </button>
        )}
      </div>

      {/* Last performance + overload */}
      <LastPerformance exerciseName={entry.name} />
      {recommendation && recommendation.type && (
        <OverloadBadge recommendation={recommendation} onApply={handleApplyRecommendation} />
      )}

      {/* Sets */}
      <div className="mt-2 space-y-0.5">
        {sets.map((s) => (
          <InlineSetRow key={s.id} set={s} />
        ))}
      </div>

      {/* Add set */}
      <button
        onClick={handleAddSet}
        className="text-[14px] text-notes-accent/80 mt-2 active:text-notes-accent transition-colors flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add set
      </button>
    </div>
  );
}
