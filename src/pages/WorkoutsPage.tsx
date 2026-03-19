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
        className="fixed right-5 bottom-[76px] w-[56px] h-[56px] bg-notes-accent text-black rounded-2xl shadow-[0_4px_24px_rgba(255,214,10,0.3)] flex items-center justify-center active:scale-90 active:shadow-[0_2px_12px_rgba(255,214,10,0.2)] transition-all duration-150 z-40"
        aria-label="New workout"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
