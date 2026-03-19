import type { Workout } from '../../db/models';
import { WorkoutCard } from './WorkoutCard';

export function WorkoutList({ workouts }: { workouts: Workout[] }) {
  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 px-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-[22px] bg-notes-card flex items-center justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5v11M17.5 6.5v11M6.5 12h11M4 9v6M20 9v6" />
          </svg>
        </div>
        <h3 className="text-[20px] font-semibold text-notes-text mb-2">No Workouts Yet</h3>
        <p className="text-[15px] text-notes-muted leading-relaxed">
          Tap <span className="text-notes-accent font-semibold">+</span> to start logging
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-3">
      <div className="rounded-[var(--radius-card)] overflow-hidden ios-group stagger-children">
        {workouts.map((w) => (
          <WorkoutCard key={w.id} workout={w} />
        ))}
      </div>
    </div>
  );
}
