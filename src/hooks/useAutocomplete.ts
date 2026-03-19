import { useState, useRef, useCallback, useEffect } from 'react';
import Fuse from 'fuse.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { ExerciseTemplate, UserExerciseStats } from '../db/models';

interface ScoredSuggestion {
  template: ExerciseTemplate;
  score: number;
}

export function useAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ExerciseTemplate[]>([]);
  const fuseRef = useRef<Fuse<ExerciseTemplate> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const templates = useLiveQuery(() => db.exerciseTemplates.toArray()) ?? [];
  const stats = useLiveQuery(() => db.userExerciseStats.toArray()) ?? [];

  useEffect(() => {
    if (templates.length === 0) return;
    fuseRef.current = new Fuse(templates, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'primaryMuscles', weight: 0.2 },
        { name: 'equipment', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }, [templates]);

  const search = useCallback(
    (q: string) => {
      setQuery(q);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (q.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      debounceRef.current = setTimeout(() => {
        if (!fuseRef.current) return;

        const results = fuseRef.current.search(q, { limit: 20 });
        const statsMap = new Map<string, UserExerciseStats>();
        for (const s of stats) {
          statsMap.set(s.exerciseName.toLowerCase(), s);
        }

        const now = Date.now();
        const scored: ScoredSuggestion[] = results.map((r) => {
          const fuseScore = 1 - (r.score ?? 1);
          const stat = statsMap.get(r.item.name.toLowerCase());
          const daysSince = stat ? (now - stat.lastUsedAt) / 86400000 : Infinity;
          const recency = 1 / (1 + daysSince);
          const frequency = stat ? Math.min(stat.useCount / 20, 1) : 0;
          const composite = fuseScore * 0.4 + recency * 0.35 + frequency * 0.25;
          return { template: r.item, score: composite };
        });

        scored.sort((a, b) => b.score - a.score);
        setSuggestions(scored.slice(0, 8).map((s) => s.template));
      }, 150);
    },
    [stats],
  );

  return { query, search, suggestions, setQuery };
}
