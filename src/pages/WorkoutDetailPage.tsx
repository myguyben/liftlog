import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useWorkout, useWorkoutExercises, updateWorkout, deleteWorkout } from '../hooks/useWorkouts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { ExerciseEntryCard } from '../components/workout/ExerciseEntryCard';
import { NaturalLanguageInput } from '../components/input/NaturalLanguageInput';
import { formatDate } from '../utils/formatting';

export function WorkoutDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workoutId = id ? parseInt(id, 10) : undefined;
  const workout = useWorkout(workoutId);
  const exercises = useWorkoutExercises(workoutId);
  const prefs = useLiveQuery(() => db.userPreferences.get(1));

  const [title, setTitle] = useState('');

  useEffect(() => {
    if (workout) setTitle(workout.title);
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

  async function handleDelete() {
    await deleteWorkout(workout!.id!);
    navigate('/');
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button
          onClick={() => navigate('/')}
          className="text-notes-accent text-sm font-medium flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <div className="flex-1" />
        <span className="text-xs text-notes-muted">{formatDate(workout.date)}</span>
        <button onClick={handleDelete} className="text-notes-danger text-xs font-medium ml-2">
          Delete
        </button>
      </div>

      {/* Title */}
      <div className="px-4 pb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Workout Title"
          className="text-xl font-bold text-gray-900 bg-transparent w-full focus:outline-none placeholder:text-notes-muted/50"
        />
      </div>

      {/* Exercises */}
      <div className="flex-1 px-4 pb-4 flex flex-col gap-3">
        {exercises.length === 0 && (
          <div className="text-center py-12 text-notes-muted text-sm">
            Type below to add your first exercise
          </div>
        )}
        {exercises.map((e) => (
          <ExerciseEntryCard key={e.id} entry={e} />
        ))}
      </div>

      {/* NLP Input */}
      <div className="sticky bottom-16 bg-notes-bg/80 backdrop-blur-sm pt-2">
        <NaturalLanguageInput workoutId={workout.id!} defaultUnit={prefs?.defaultUnit ?? 'lbs'} />
      </div>
    </div>
  );
}
