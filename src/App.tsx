import { HashRouter, Routes, Route } from 'react-router';
import { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { WorkoutDetailPage } from './pages/WorkoutDetailPage';
import { ExerciseLibraryPage } from './pages/ExerciseLibraryPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { seedDatabase } from './db/seed';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-notes-muted text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<WorkoutsPage />} />
          <Route path="/workout/:id" element={<WorkoutDetailPage />} />
          <Route path="/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
