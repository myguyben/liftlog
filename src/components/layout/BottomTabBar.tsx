import { NavLink } from 'react-router';

const tabs = [
  { to: '/', label: 'Workouts', icon: TabIconWorkouts },
  { to: '/exercises', label: 'Exercises', icon: TabIconExercises },
  { to: '/stats', label: 'Stats', icon: TabIconStats },
  { to: '/settings', label: 'Settings', icon: TabIconSettings },
] as const;

export function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-notes-card/90 backdrop-blur-lg border-t border-notes-divider"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex justify-around items-center h-12">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-notes-accent' : 'text-notes-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon active={isActive} />
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function TabIconWorkouts({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 10h16M4 14h10M4 18h8" />
    </svg>
  );
}

function TabIconExercises({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M6 12h12M3 8v8M21 8v8" />
    </svg>
  );
}

function TabIconStats({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function TabIconSettings({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
