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
    <div className="relative mt-2">
      {/* Autocomplete */}
      {showSuggestions && (
        <div className="mb-3 rounded-[var(--radius-card)] overflow-hidden border border-notes-divider/40 bg-notes-card animate-slide-down">
          {suggestions.map((t, i) => (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t)}
              className="w-full text-left px-4 py-3 active:bg-notes-fill transition-colors flex items-baseline gap-2"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className="text-[15px] text-notes-text font-medium">{t.name}</span>
              <span className="text-[12px] text-notes-muted/60 ml-auto flex-shrink-0">{t.equipment}</span>
            </button>
          ))}
        </div>
      )}

      {/* Parse preview */}
      {parsed && parsed.name && !showSuggestions && (
        <div className="text-[13px] mb-1.5 flex items-center gap-2 animate-fade-in">
          <span className="text-notes-accent font-medium">{parsed.name}</span>
          <span className="text-notes-muted/50">
            {[
              parsed.weight != null ? `${parsed.weight}${parsed.unit ?? defaultUnit}` : null,
              parsed.reps != null ? `${parsed.reps} reps` : null,
              parsed.sets != null ? `${parsed.sets} sets` : null,
            ]
              .filter(Boolean)
              .join(' \u00b7 ')}
          </span>
          <span className="text-notes-muted/30 text-[12px]">press enter</span>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2">
        <div className="w-[22px] h-[22px] rounded-full border border-dashed border-notes-muted/20 flex-shrink-0" />
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
          className="flex-1 text-[16px] text-notes-text bg-transparent placeholder:text-notes-muted/20 leading-snug py-1.5 caret-notes-accent"
        />
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
