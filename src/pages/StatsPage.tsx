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

    const totalExercises = allStats.reduce((sum, s) => sum + s.useCount, 0);

    return { totalWorkouts, prs, streak, totalExercises };
  });

  if (!stats) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Stats" />

      {/* Stat cards */}
      <div className="px-4 grid grid-cols-3 gap-2 pt-3 mb-6">
        <StatCard value={stats.totalWorkouts} label="Workouts" />
        <StatCard value={stats.streak} label="Day Streak" icon="flame" />
        <StatCard value={stats.totalExercises} label="Exercises" />
      </div>

      {/* Personal Records */}
      <div className="px-4">
        <h2 className="text-[13px] font-semibold text-notes-muted/70 uppercase tracking-wider mb-2 px-1">
          Personal Records
        </h2>
        {stats.prs.length === 0 ? (
          <div className="bg-notes-card rounded-[var(--radius-card)] px-4 py-10 text-center">
            <p className="text-[15px] text-notes-muted/50">Log exercises to track PRs</p>
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] overflow-hidden stagger-children">
            {stats.prs.map((s) => (
              <div key={s.id} className="bg-notes-card px-4 py-3.5 border-b border-notes-divider/40 last:border-b-0 flex justify-between items-center animate-fade-in-up">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[15px] text-notes-text capitalize truncate">{s.exerciseName}</p>
                  <p className="text-[12px] text-notes-muted/60 mt-0.5">{s.useCount} sessions logged</p>
                </div>
                {s.personalBest && (
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-bold text-[17px] text-notes-accent tabular-nums">
                      {formatWeight(s.personalBest.weight, s.personalBest.unit)}
                    </p>
                    <p className="text-[11px] text-notes-muted/50 tabular-nums">{s.personalBest.reps} reps</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: number; label: string; icon?: string }) {
  return (
    <div className="bg-notes-card rounded-[var(--radius-card)] p-4 text-center">
      <p className="text-[28px] font-bold text-notes-accent tabular-nums leading-none">
        {icon === 'flame' && value > 0 ? (
          <span className="relative">
            {value}
            <span className="absolute -top-1 -right-3 text-[14px]">🔥</span>
          </span>
        ) : (
          value
        )}
      </p>
      <p className="text-[11px] text-notes-muted/70 mt-1.5 font-medium tracking-wide">{label}</p>
    </div>
  );
}
