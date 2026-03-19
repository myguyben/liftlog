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
      className="w-full text-left bg-notes-card rounded-[var(--radius-card)] px-4 py-3 active:scale-[0.98] transition-transform"
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-notes-muted mt-0.5">
            {formatDate(workout.date)}
            {summary && (
              <span>
                {' · '}
                {pluralize(summary.exercises, 'exercise')}, {pluralize(summary.sets, 'set')}
              </span>
            )}
          </p>
        </div>
        <svg className="w-5 h-5 text-notes-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
}
