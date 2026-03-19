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
      <div className="px-4 pb-3 pt-2">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-notes-muted/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-notes-fill rounded-xl text-[15px] text-notes-text placeholder:text-notes-muted/40 focus:ring-1 focus:ring-notes-accent/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-notes-fill-secondary rounded-full flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Muscle group chips */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
        {MUSCLE_GROUPS.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMuscle(m)}
            className={`flex-shrink-0 px-3.5 py-[6px] rounded-full text-[13px] font-medium transition-all duration-200 ${
              selectedMuscle === m
                ? 'bg-notes-accent text-black shadow-[0_2px_8px_rgba(255,214,10,0.2)]'
                : 'bg-notes-card text-notes-muted active:bg-notes-card-elevated'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="px-4">
        <div className="rounded-[var(--radius-card)] overflow-hidden stagger-children">
          {filtered.map((t) => (
            <div key={t.id} className="bg-notes-card px-4 py-3 border-b border-notes-divider/40 last:border-b-0 animate-fade-in-up">
              <p className="font-medium text-[15px] text-notes-text leading-snug">{t.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] px-2 py-[2px] bg-notes-blue/12 text-notes-blue rounded-full font-medium">{t.equipment}</span>
                <span className="text-[11px] px-2 py-[2px] bg-notes-purple/12 text-notes-purple rounded-full font-medium">{t.category}</span>
                {t.primaryMuscles.slice(0, 1).map((m) => (
                  <span key={m} className="text-[11px] text-notes-muted/60">{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-[15px] text-notes-muted/60">No exercises found</p>
          </div>
        )}
      </div>
    </div>
  );
}
