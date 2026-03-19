import { useState } from 'react';
import type { SetEntry } from '../../db/models';
import { updateSet, deleteSet } from '../../hooks/useWorkouts';

export function InlineSetRow({ set }: { set: SetEntry }) {
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
      <div className="flex items-center gap-2 py-1 ml-1">
        <button onClick={handleToggleComplete} className="flex-shrink-0">
          <CheckCircle checked={set.completed} />
        </button>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="w-14 px-1.5 py-1 text-[15px] rounded-md text-center bg-notes-fill text-notes-text border border-notes-divider"
          inputMode="decimal"
          autoFocus
        />
        <span className="text-[13px] text-notes-muted">{set.unit} ×</span>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="w-12 px-1.5 py-1 text-[15px] rounded-md text-center bg-notes-fill text-notes-text border border-notes-divider"
          inputMode="numeric"
        />
        <button onClick={handleSave} className="text-[13px] text-notes-accent font-medium">done</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-0.5 ml-1 group">
      <button onClick={handleToggleComplete} className="flex-shrink-0">
        <CheckCircle checked={set.completed} />
      </button>
      <button
        onClick={() => setEditing(true)}
        className="text-[15px] text-notes-text-secondary leading-relaxed active:text-notes-accent transition-colors"
      >
        {set.weight} {set.unit} × {set.reps}
      </button>
      <button
        onClick={() => deleteSet(set.id!)}
        className="ml-auto opacity-0 group-hover:opacity-40 active:opacity-100 text-notes-danger text-[11px] transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}

function CheckCircle({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#30D158" />
        <path d="M6 10.5l2.5 2.5L14 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#48484A" strokeWidth="1.5" />
    </svg>
  );
}
