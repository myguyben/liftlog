import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  right?: ReactNode;
}

export function PageHeader({ title, right }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between px-5 pt-8 pb-2"
      style={{ paddingTop: 'max(2rem, env(safe-area-inset-top, 2rem))' }}
    >
      <h1 className="text-[34px] font-bold tracking-[0.01em] text-notes-text leading-tight">{title}</h1>
      {right && <div className="pb-1">{right}</div>}
    </div>
  );
}
