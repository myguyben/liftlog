import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Workout } from '../../db/models';
import { formatDate, pluralize } from '../../utils/formatting';

export function WorkoutCard({ workout }: { workout: Workout }) {
  const navigate = useNavigate();

  const details = useLiveQuery(async () => {
    const entries = await db.exerciseEntries.where('workoutId').equals(workout.id!).sortBy('order');
    let totalSets = 0;
    for (const e of entries) {
      totalSets += await db.setEntries.where('exerciseEntryId').equals(e.id!).count();
    }
    const names = entries.slice(0, 3).map((e) => e.name);
    return { exerciseCount: entries.length, totalSets, names, hasMore: entries.length > 3 };
  }, [workout.id]);

  const title = workout.title || formatDate(workout.date) + ' Workout';

  return (
    <button
      onClick={() => navigate(`/workout/${workout.id}`)}
      className="w-full text-left bg-notes-card px-4 py-3.5 active:bg-notes-card-elevated transition-colors duration-100 animate-fade-in-up"
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-notes-text truncate text-[16px] leading-snug">{title}</h3>

          <p className="text-[13px] text-notes-muted mt-0.5 leading-snug">
            {formatDate(workout.date)}
            {details && details.exerciseCount > 0 && (
              <span>
                {' \u00b7 '}
                {pluralize(details.exerciseCount, 'exercise')}
                {' \u00b7 '}
                {pluralize(details.totalSets, 'set')}
              </span>
            )}
          </p>

          {details && details.names.length > 0 && (
            <p className="text-[13px] text-notes-text-secondary mt-1.5 leading-snug truncate">
              {details.names.join(', ')}{details.hasMore ? '...' : ''}
            </p>
          )}
        </div>

        <svg className="w-4 h-4 text-notes-muted/30 flex-shrink-0 mt-1.5 ml-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
}
