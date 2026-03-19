import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Fuse from 'fuse.js';
import { db } from '../db/database';
import { PageHeader } from '../components/layout/PageHeader';
import type { ExerciseTemplate } from '../db/models';

const MUSCLE_GROUPS = [
  'All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quadriceps', 'Hamstrings', 'Glutes', 'Abdominals', 'Calves',
];

export function ExerciseLibraryPage() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');

  const templates = useLiveQuery(() => db.exerciseTemplates.toArray()) ?? [];

  const fuse = useMemo(
    () => new Fuse(templates, { keys: ['name', 'primaryMuscles', 'equipment'], threshold: 0.4 }),
    [templates],
  );

  const filtered = useMemo(() => {
    let results: ExerciseTemplate[];
    if (search.trim()) {
      results = fuse.search(search).map((r) => r.item);
    } else {
      results = templates;
    }

    if (selectedMuscle !== 'All') {
      results = results.filter((t) =>
        t.primaryMuscles.some((m) => m.toLowerCase() === selectedMuscle.toLowerCase()),
      );
    }

    return results.slice(0, 50);
  }, [search, selectedMuscle, fuse, templates]);

  return (
    <div>
      <PageHeader title="Exercises" />

      {/* Search */}
      <div className="px-4 pb-3 pt-1">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full px-4 py-2.5 bg-notes-fill border border-notes-divider rounded-xl text-sm text-notes-text placeholder:text-notes-muted/60 focus:border-notes-accent/50 focus:ring-1 focus:ring-notes-accent/20 transition-colors"
        />
      </div>

      {/* Muscle group chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {MUSCLE_GROUPS.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMuscle(m)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedMuscle === m
                ? 'bg-notes-accent text-black'
                : 'bg-notes-card text-notes-muted'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="px-4 flex flex-col gap-0.5">
        {filtered.map((t) => (
          <div key={t.id} className="bg-notes-card rounded-[var(--radius-card)] px-4 py-3">
            <p className="font-medium text-[15px] text-notes-text">{t.name}</p>
            <div className="flex gap-1.5 mt-1.5">
              <span className="text-[10px] px-1.5 py-0.5 bg-notes-blue/15 text-notes-blue rounded-full">{t.equipment}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/15 text-purple-400 rounded-full">{t.category}</span>
              {t.primaryMuscles.slice(0, 2).map((m) => (
                <span key={m} className="text-[10px] px-1.5 py-0.5 bg-notes-fill text-notes-muted rounded-full">{m}</span>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-notes-muted py-12">No exercises found</p>
        )}
      </div>
    </div>
  );
}
