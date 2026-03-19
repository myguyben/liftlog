import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { PageHeader } from '../components/layout/PageHeader';
import { formatWeight } from '../utils/formatting';

export function StatsPage() {
  const stats = useLiveQuery(async () => {
    const totalWorkouts = await db.workouts.count();
    const allStats = await db.userExerciseStats.toArray();
    const prs = allStats
      .filter((s) => s.personalBest)
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 20);

    // Workout streak
    const workouts = await db.workouts.orderBy('date').reverse().toArray();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < workouts.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      const expectedStr = expected.toISOString().slice(0, 10);
      if (workouts.some((w) => w.date === expectedStr)) {
        streak++;
      } else {
        break;
      }
    }

    return { totalWorkouts, prs, streak };
  });

  if (!stats) return null;

  return (
    <div>
      <PageHeader title="Stats" />

      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <div className="bg-notes-card rounded-[var(--radius-card)] p-4 text-center">
          <p className="text-3xl font-bold text-notes-accent">{stats.totalWorkouts}</p>
          <p className="text-xs text-notes-muted mt-1">Total Workouts</p>
        </div>
        <div className="bg-notes-card rounded-[var(--radius-card)] p-4 text-center">
          <p className="text-3xl font-bold text-notes-accent">{stats.streak}</p>
          <p className="text-xs text-notes-muted mt-1">Day Streak</p>
        </div>
      </div>

      <div className="px-4">
        <h2 className="font-semibold text-gray-900 mb-2">Personal Records</h2>
        {stats.prs.length === 0 && (
          <p className="text-sm text-notes-muted py-4 text-center">Log some exercises to see your PRs</p>
        )}
        {stats.prs.map((s) => (
          <div key={s.id} className="bg-notes-card rounded-[var(--radius-card)] px-4 py-3 mb-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm text-gray-900 capitalize">{s.exerciseName}</p>
                <p className="text-xs text-notes-muted">{s.useCount} sessions</p>
              </div>
              {s.personalBest && (
                <div className="text-right">
                  <p className="font-bold text-sm text-notes-accent">
                    {formatWeight(s.personalBest.weight, s.personalBest.unit)}
                  </p>
                  <p className="text-[10px] text-notes-muted">{s.personalBest.reps} reps · {s.personalBest.date}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
