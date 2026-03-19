import type { Workout } from '../../db/models';
import { WorkoutCard } from './WorkoutCard';

export function WorkoutList({ workouts }: { workouts: Workout[] }) {
  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-notes-card flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4v16M18 4v16M6 12h12M3 8v8M21 8v8" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-notes-text mb-1">No workouts yet</h3>
        <p className="text-sm text-notes-muted">Tap + to log your first workout</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 px-4 pt-2">
      {workouts.map((w) => (
        <WorkoutCard key={w.id} workout={w} />
      ))}
    </div>
  );
}
