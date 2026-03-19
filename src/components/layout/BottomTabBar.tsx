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
      className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/85 backdrop-blur-2xl border-t border-white/[0.08]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex justify-around items-center h-[50px] max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-[1px] text-[10px] font-medium transition-all duration-200 ${
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#FFD60A' : 'none'} stroke={active ? '#FFD60A' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" fill={active ? 'rgba(255,214,10,0.15)' : 'none'} stroke={active ? '#FFD60A' : '#8E8E93'} />
      <path d="M7 8h10M7 12h10M7 16h6" stroke={active ? '#FFD60A' : '#8E8E93'} />
    </svg>
  );
}

function TabIconExercises({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFD60A' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5v11M17.5 6.5v11M6.5 12h11M4 9v6M20 9v6" />
    </svg>
  );
}

function TabIconStats({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFD60A' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function TabIconSettings({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFD60A' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
