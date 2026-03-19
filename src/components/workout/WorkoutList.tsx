import type { Workout } from '../../db/models';
import { WorkoutCard } from './WorkoutCard';

export function WorkoutList({ workouts }: { workouts: Workout[] }) {
  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-5xl mb-4">🏋️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No workouts yet</h3>
        <p className="text-sm text-notes-muted">Tap + to log your first workout</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      {workouts.map((w) => (
        <WorkoutCard key={w.id} workout={w} />
      ))}
    </div>
  );
}
