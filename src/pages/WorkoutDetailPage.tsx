import { useParams, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { useWorkout, useWorkoutExercises, updateWorkout, deleteWorkout } from '../hooks/useWorkouts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { InlineExercise } from '../components/workout/InlineExercise';
import { InlineInput } from '../components/input/InlineInput';
import { formatDate } from '../utils/formatting';

export function WorkoutDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workoutId = id ? parseInt(id, 10) : undefined;
  const workout = useWorkout(workoutId);
  const exercises = useWorkoutExercises(workoutId);
  const prefs = useLiveQuery(() => db.userPreferences.get(1));
  const bottomRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (workout) {
      setTitle(workout.title);
      setNotes(workout.notes);
    }
  }, [workout]);

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in">
        <p className="text-notes-muted text-[15px]">Workout not found</p>
      </div>
    );
  }

  async function handleTitleBlur() {
    if (workout && title !== workout.title) {
      await updateWorkout(workout.id!, { title });
    }
  }

  async function handleNotesBlur() {
    if (workout && notes !== workout.notes) {
      await updateWorkout(workout.id!, { notes });
    }
  }

  async function handleDelete() {
    await deleteWorkout(workout!.id!);
    navigate('/');
  }

  function scrollToBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  const fullDate = new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col min-h-full animate-fade-in">
      {/* Nav bar */}
      <div
        className="flex items-center gap-3 px-3 pt-3 pb-2 sticky top-0 z-10 bg-notes-bg/80 backdrop-blur-2xl"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-notes-accent text-[17px] flex items-center gap-0 active:opacity-50 transition-opacity -ml-1"
        >
          <svg className="w-[28px] h-[28px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="-ml-1">Workouts</span>
        </button>
        <div className="flex-1" />
        {showDeleteConfirm ? (
          <div className="flex items-center gap-2 animate-scale-in">
            <span className="text-[13px] text-notes-muted">Delete?</span>
            <button onClick={handleDelete} className="text-[13px] text-notes-danger font-semibold active:opacity-50">Yes</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="text-[13px] text-notes-muted font-medium active:opacity-50">No</button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 active:opacity-50 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF453A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            </svg>
          </button>
        )}
      </div>

      {/* Note body */}
      <div className="flex-1 px-5 pb-32">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Title"
          className="text-[28px] font-bold text-notes-text bg-transparent w-full placeholder:text-notes-muted/20 tracking-[0.01em] mt-1 mb-0.5 leading-tight"
        />

        {/* Date */}
        <p className="text-[13px] text-notes-muted/70 mb-5 tracking-wide">
          {fullDate}
        </p>

        {/* Divider */}
        {(exercises.length > 0 || notes) && (
          <div className="h-px bg-notes-divider/40 mb-5" />
        )}

        {/* Notes */}
        {(notes || exercises.length === 0) && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder={exercises.length === 0 ? "Start typing or add an exercise below..." : "Notes..."}
            className="w-full text-[16px] text-notes-text-secondary bg-transparent resize-none placeholder:text-notes-muted/20 leading-[1.6] mb-5 min-h-0"
          />
        )}

        {/* Exercises */}
        <div className="stagger-children">
          {exercises.map((e) => (
            <InlineExercise key={e.id} entry={e} />
          ))}
        </div>

        {/* Inline input */}
        <InlineInput
          workoutId={workout.id!}
          defaultUnit={prefs?.defaultUnit ?? 'lbs'}
          onAdded={scrollToBottom}
        />

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
