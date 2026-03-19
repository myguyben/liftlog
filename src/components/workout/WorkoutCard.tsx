import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Workout } from '../../db/models';
import { formatDate, pluralize } from '../../utils/formatting';

export function WorkoutCard({ workout }: { workout: Workout }) {
  const navigate = useNavigate();

  const summary = useLiveQuery(async () => {
    const exercises = await db.exerciseEntries.where('workoutId').equals(workout.id!).count();
    const entries = await db.exerciseEntries.where('workoutId').equals(workout.id!).toArray();
    let sets = 0;
    for (const e of entries) {
      sets += await db.setEntries.where('exerciseEntryId').equals(e.id!).count();
    }
    return { exercises, sets };
  }, [workout.id]);

  const title = workout.title || formatDate(workout.date) + ' Workout';

  return (
    <button
      onClick={() => navigate(`/workout/${workout.id}`)}
      className="w-full text-left bg-notes-card rounded-[var(--radius-card)] px-4 py-3.5 active:scale-[0.98] active:bg-notes-card-elevated transition-all duration-150"
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-notes-text truncate text-[15px]">{title}</h3>
          <p className="text-[13px] text-notes-muted mt-1">
            {formatDate(workout.date)}
            {summary && (
              <span className="text-notes-muted">
                {' · '}
                {pluralize(summary.exercises, 'exercise')}, {pluralize(summary.sets, 'set')}
              </span>
            )}
          </p>
        </div>
        <svg className="w-4 h-4 text-notes-muted/50 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
}
