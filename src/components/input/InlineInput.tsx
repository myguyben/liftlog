import { useRef, useCallback } from 'react';
import { useNaturalLanguage } from '../../hooks/useNaturalLanguage';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { addExerciseEntry, addSet } from '../../hooks/useWorkouts';
import { db } from '../../db/database';
import type { ExerciseTemplate } from '../../db/models';

interface InlineInputProps {
  workoutId: number;
  defaultUnit: 'lbs' | 'kg';
  onAdded?: () => void;
}

export function InlineInput({ workoutId, defaultUnit, onAdded }: InlineInputProps) {
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
      updateInput(
        template.name +
          (currentParsed?.weight ? ` ${currentParsed.weight}${currentParsed.unit || defaultUnit}` : '') +
          (currentParsed?.reps ? ` ${currentParsed.reps} reps` : '') +
          (currentParsed?.sets ? ` ${currentParsed.sets} sets` : ''),
      );
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

    await updateExerciseStats(parsed.name, weight, unit, reps);

    clear();
    search('');
    onAdded?.();
    inputRef.current?.focus();
  }

  const showSuggestions = suggestions.length > 0 && input.trim().length > 0;

  return (
    <div className="relative">
      {/* Autocomplete — floating above the input line */}
      {showSuggestions && (
        <div className="mb-2 bg-notes-card rounded-[var(--radius-card)] border border-notes-divider/50 overflow-hidden">
          {suggestions.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t)}
              className="w-full text-left px-4 py-2.5 active:bg-notes-fill transition-colors border-b border-notes-divider/30 last:border-b-0"
            >
              <span className="text-[14px] text-notes-text">{t.name}</span>
              <span className="text-[11px] text-notes-muted ml-2">{t.equipment}</span>
            </button>
          ))}
        </div>
      )}

      {/* Parse preview — subtle hint below suggestions */}
      {parsed && parsed.name && !showSuggestions && (
        <div className="text-[12px] text-notes-muted/60 mb-1 flex items-center gap-1.5">
          <span className="text-notes-accent/70">{parsed.name}</span>
          {parsed.weight != null && <span>· {parsed.weight}{parsed.unit ?? defaultUnit}</span>}
          {parsed.reps != null && <span>· {parsed.reps}r</span>}
          {parsed.sets != null && <span>· {parsed.sets}s</span>}
          <span className="text-notes-muted/40 ml-1">↵ to add</span>
        </div>
      )}

      {/* The input line — looks like the next line of the note */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Add exercise..."
        className="w-full text-[15px] text-notes-text bg-transparent focus:outline-none placeholder:text-notes-muted/25 leading-relaxed py-1 caret-notes-accent"
      />
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
