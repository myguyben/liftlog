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

  useEffect(() => {
    if (workout) {
      setTitle(workout.title);
      setNotes(workout.notes);
    }
  }, [workout]);

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-notes-muted">Workout not found</p>
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

  return (
    <div className="flex flex-col min-h-full">
      {/* Nav bar */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-1 sticky top-0 z-10 bg-notes-bg/90 backdrop-blur-xl">
        <button
          onClick={() => navigate('/')}
          className="text-notes-accent text-[15px] font-medium flex items-center gap-0.5 active:opacity-60 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Workouts
        </button>
        <div className="flex-1" />
        <span className="text-[11px] text-notes-muted">{formatDate(workout.date)}</span>
        <button onClick={handleDelete} className="text-notes-danger text-[11px] font-medium ml-2 active:opacity-60 transition-opacity">
          Delete
        </button>
      </div>

      {/* Note body — the whole thing is the editor */}
      <div className="flex-1 px-5 pb-32">
        {/* Title — large, bold, like Apple Notes */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Title"
          className="text-[28px] font-bold text-notes-text bg-transparent w-full focus:outline-none placeholder:text-notes-muted/25 tracking-tight mt-2 mb-1"
        />

        {/* Date subtitle */}
        <p className="text-[13px] text-notes-muted mb-4">
          {new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Notes field — freeform text like Apple Notes body */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Notes..."
          rows={1}
          className="w-full text-[15px] text-notes-text-secondary bg-transparent resize-none focus:outline-none placeholder:text-notes-muted/25 leading-relaxed mb-4"
          style={{ minHeight: notes ? undefined : '0px' }}
        />

        {/* Exercises — rendered inline like note content */}
        {exercises.map((e) => (
          <InlineExercise key={e.id} entry={e} />
        ))}

        {/* Inline typing area — always at the end, like the next line in a note */}
        <InlineInput
          workoutId={workout.id!}
          defaultUnit={prefs?.defaultUnit ?? 'lbs'}
          onAdded={scrollToBottom}
        />

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
