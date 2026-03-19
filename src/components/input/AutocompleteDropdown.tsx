import type { ExerciseTemplate } from '../../db/models';

interface AutocompleteDropdownProps {
  suggestions: ExerciseTemplate[];
  onSelect: (template: ExerciseTemplate) => void;
}

export function AutocompleteDropdown({ suggestions, onSelect }: AutocompleteDropdownProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-notes-card-elevated rounded-[var(--radius-card)] shadow-2xl border border-notes-divider overflow-hidden z-50 max-h-64 overflow-y-auto">
      {suggestions.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className="w-full text-left px-4 py-3 active:bg-notes-fill transition-colors border-b border-notes-divider/50 last:border-b-0"
        >
          <span className="font-medium text-sm text-notes-text">{t.name}</span>
          <div className="flex gap-1.5 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 bg-notes-blue/15 text-notes-blue rounded-full">{t.equipment}</span>
            {t.primaryMuscles.slice(0, 2).map((m) => (
              <span key={m} className="text-[10px] px-1.5 py-0.5 bg-notes-fill text-notes-muted rounded-full">{m}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
