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
      <div className="flex items-center gap-2 py-1.5 animate-scale-in">
        <button onClick={handleToggleComplete} className="flex-shrink-0">
          <CheckCircle checked={set.completed} />
        </button>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="w-[56px] px-2 py-1.5 text-[15px] rounded-lg text-center bg-notes-fill text-notes-text border border-notes-divider/60 focus:border-notes-accent/50"
          inputMode="decimal"
          autoFocus
        />
        <span className="text-[13px] text-notes-muted/70">{set.unit} ×</span>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="w-[48px] px-2 py-1.5 text-[15px] rounded-lg text-center bg-notes-fill text-notes-text border border-notes-divider/60 focus:border-notes-accent/50"
          inputMode="numeric"
        />
        <button onClick={handleSave} className="text-[14px] text-notes-accent font-medium ml-auto active:opacity-50">Done</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 py-[5px] group">
      <button onClick={handleToggleComplete} className="flex-shrink-0 active:scale-90 transition-transform">
        <CheckCircle checked={set.completed} />
      </button>
      <button
        onClick={() => {
          setWeight(String(set.weight));
          setReps(String(set.reps));
          setEditing(true);
        }}
        className={`text-[16px] leading-snug transition-colors ${
          set.completed
            ? 'text-notes-muted line-through decoration-notes-muted/30'
            : 'text-notes-text-secondary active:text-notes-accent'
        }`}
      >
        <span className="tabular-nums">{set.weight}</span>
        <span className="text-notes-muted/60 text-[13px] ml-0.5">{set.unit}</span>
        <span className="text-notes-muted/40 mx-1.5">×</span>
        <span className="tabular-nums">{set.reps}</span>
      </button>
      <button
        onClick={() => deleteSet(set.id!)}
        className="ml-auto opacity-0 group-hover:opacity-100 active:opacity-100 text-notes-danger/60 text-[12px] transition-opacity duration-200 px-1"
      >
        ✕
      </button>
    </div>
  );
}

function CheckCircle({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="10" fill="#30D158" />
        <path d="M6.5 11.5l2.5 2.5L15.5 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" stroke="#48484A" strokeWidth="1.5" />
    </svg>
  );
}
