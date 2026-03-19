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
      <div className="px-4 pb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full px-4 py-2.5 bg-notes-card border border-notes-divider rounded-full text-sm placeholder:text-notes-muted focus:outline-none focus:ring-2 focus:ring-notes-accent/30"
        />
      </div>

      {/* Muscle group chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {MUSCLE_GROUPS.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMuscle(m)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedMuscle === m
                ? 'bg-notes-accent text-white'
                : 'bg-notes-card text-notes-muted border border-notes-divider'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="px-4 flex flex-col gap-1">
        {filtered.map((t) => (
          <div key={t.id} className="bg-notes-card rounded-[var(--radius-card)] px-4 py-3">
            <p className="font-medium text-sm text-gray-900">{t.name}</p>
            <div className="flex gap-1.5 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">{t.equipment}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full">{t.category}</span>
              {t.primaryMuscles.slice(0, 2).map((m) => (
                <span key={m} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">{m}</span>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-notes-muted py-8">No exercises found</p>
        )}
      </div>
    </div>
  );
}
