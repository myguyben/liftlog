import type { ExerciseTemplate } from '../../db/models';

interface AutocompleteDropdownProps {
  suggestions: ExerciseTemplate[];
  onSelect: (template: ExerciseTemplate) => void;
}

export function AutocompleteDropdown({ suggestions, onSelect }: AutocompleteDropdownProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-notes-card rounded-[var(--radius-card)] shadow-lg border border-notes-divider overflow-hidden z-50 max-h-64 overflow-y-auto">
      {suggestions.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className="w-full text-left px-4 py-2.5 hover:bg-notes-bg active:bg-notes-bg transition-colors border-b border-notes-divider last:border-b-0"
        >
          <span className="font-medium text-sm text-gray-900">{t.name}</span>
          <div className="flex gap-1.5 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">{t.equipment}</span>
            {t.primaryMuscles.slice(0, 2).map((m) => (
              <span key={m} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">{m}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
