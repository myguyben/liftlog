import { useNavigate } from 'react-router';
import { useWorkouts, createWorkout } from '../hooks/useWorkouts';
import { PageHeader } from '../components/layout/PageHeader';
import { WorkoutList } from '../components/workout/WorkoutList';

export function WorkoutsPage() {
  const workouts = useWorkouts();
  const navigate = useNavigate();

  async function handleNew() {
    const id = await createWorkout();
    navigate(`/workout/${id}`);
  }

  return (
    <div className="relative min-h-full">
      <PageHeader title="Workouts" />
      <WorkoutList workouts={workouts} />

      <button
        onClick={handleNew}
        className="fixed right-5 bottom-20 w-14 h-14 bg-notes-accent text-black rounded-full shadow-lg shadow-notes-accent/20 flex items-center justify-center text-2xl font-light active:scale-90 transition-transform z-40"
        aria-label="New workout"
      >
        +
      </button>
    </div>
  );
}
