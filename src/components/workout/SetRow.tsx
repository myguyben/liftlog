import { useState } from 'react';
import type { SetEntry } from '../../db/models';
import { updateSet, deleteSet } from '../../hooks/useWorkouts';

export function SetRow({ set }: { set: SetEntry }) {
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState(String(set.weight));
  const [reps, setReps] = useState(String(set.reps));

  async function handleToggleComplete() {
    await updateSet(set.id!, { completed: !set.completed });
  }

  async function handleSave() {
    await updateSet(set.id!, {
      weight: parseFloat(weight) || 0,
      reps: parseInt(reps, 10) || 0,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <span className="text-xs text-notes-muted w-6 text-right">{set.setNumber}</span>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-16 px-2 py-1 text-sm border border-notes-divider rounded-lg text-center bg-notes-bg"
          inputMode="decimal"
        />
        <span className="text-xs text-notes-muted">{set.unit}</span>
        <span className="text-xs text-notes-muted">×</span>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-14 px-2 py-1 text-sm border border-notes-divider rounded-lg text-center bg-notes-bg"
          inputMode="numeric"
        />
        <button onClick={handleSave} className="text-xs text-notes-accent font-medium">Save</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1.5 group">
      <span className="text-xs text-notes-muted w-6 text-right">{set.setNumber}</span>
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-gray-800 hover:text-notes-accent"
      >
        {set.weight}{set.unit} × {set.reps}
      </button>
      <button
        onClick={handleToggleComplete}
        className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          set.completed
            ? 'bg-notes-success border-notes-success'
            : 'border-notes-divider'
        }`}
      >
        {set.completed && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <button
        onClick={() => deleteSet(set.id!)}
        className="opacity-0 group-hover:opacity-100 text-notes-danger text-xs transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
