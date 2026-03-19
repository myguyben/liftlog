import type { ReactNode } from 'react';
import { BottomTabBar } from './BottomTabBar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
