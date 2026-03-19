import { useRef, useCallback } from 'react';
import { useNaturalLanguage } from '../../hooks/useNaturalLanguage';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { AutocompleteDropdown } from './AutocompleteDropdown';
import { addExerciseEntry, addSet } from '../../hooks/useWorkouts';
import { db } from '../../db/database';
import type { ExerciseTemplate } from '../../db/models';

interface NaturalLanguageInputProps {
  workoutId: number;
  defaultUnit: 'lbs' | 'kg';
}

export function NaturalLanguageInput({ workoutId, defaultUnit }: NaturalLanguageInputProps) {
  const { input, parsed, updateInput, clear } = useNaturalLanguage();
  const { suggestions, search } = useAutocomplete();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(value: string) {
    updateInput(value);
    const words = value.trim().split(/\s+/);
    const namePortionWords = words.filter((w) => !/^\d/.test(w) && !/^[x×]$/i.test(w));
    if (namePortionWords.length > 0) {
      search(namePortionWords.join(' '));
    } else {
      search('');
    }
  }

  const handleSelectTemplate = useCallback(
    (template: ExerciseTemplate) => {
      const currentParsed = parsed;
      updateInput(template.name + (currentParsed?.weight ? ` ${currentParsed.weight}${currentParsed.unit || defaultUnit}` : '') +
        (currentParsed?.reps ? ` ${currentParsed.reps} reps` : '') +
        (currentParsed?.sets ? ` ${currentParsed.sets} sets` : ''));
      search('');
      inputRef.current?.focus();
    },
    [parsed, updateInput, search, defaultUnit],
  );

  async function handleSubmit() {
    if (!parsed || !parsed.name) return;

    const entryId = await addExerciseEntry(workoutId, parsed.name);
    const numSets = parsed.sets ?? 1;
    const weight = parsed.weight ?? 0;
    const unit = parsed.unit ?? defaultUnit;
    const reps = parsed.reps ?? 0;

    for (let i = 0; i < numSets; i++) {
      await addSet(entryId, weight, unit, reps);
    }

    // Update user exercise stats
    await updateExerciseStats(parsed.name, weight, unit, reps);

    clear();
    search('');
  }

  return (
    <div className="relative px-4 pb-4">
      <AutocompleteDropdown suggestions={suggestions} onSelect={handleSelectTemplate} />

      {parsed && parsed.name && (
        <div className="text-xs text-notes-muted px-1 mb-1">
          {parsed.name}
          {parsed.weight != null && ` · ${parsed.weight}${parsed.unit ?? defaultUnit}`}
          {parsed.reps != null && ` · ${parsed.reps} reps`}
          {parsed.sets != null && ` · ${parsed.sets} sets`}
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g. bench press 135lbs 10 reps 3 sets"
          className="flex-1 px-4 py-2.5 bg-notes-card border border-notes-divider rounded-full text-sm placeholder:text-notes-muted focus:outline-none focus:ring-2 focus:ring-notes-accent/30 focus:border-notes-accent"
        />
        <button
          onClick={handleSubmit}
          disabled={!parsed?.name}
          className="px-4 py-2.5 bg-notes-accent text-white rounded-full text-sm font-medium disabled:opacity-40 active:scale-95 transition-transform"
        >
          Add
        </button>
      </div>
    </div>
  );
}

async function updateExerciseStats(name: string, weight: number, unit: 'lbs' | 'kg', reps: number) {
  const normalized = name.toLowerCase();
  const existing = await db.userExerciseStats.where('exerciseName').equals(normalized).first();
  const today = new Date().toISOString().slice(0, 10);

  if (existing) {
    const updates: Record<string, unknown> = {
      lastUsedAt: Date.now(),
      useCount: existing.useCount + 1,
    };
    if (weight > 0 && (!existing.personalBest || weight > existing.personalBest.weight)) {
      updates.personalBest = { weight, unit, reps, date: today };
    }
    await db.userExerciseStats.update(existing.id!, updates);
  } else {
    await db.userExerciseStats.add({
      exerciseName: normalized,
      lastUsedAt: Date.now(),
      useCount: 1,
      personalBest: weight > 0 ? { weight, unit, reps, date: today } : null,
    });
  }
}
