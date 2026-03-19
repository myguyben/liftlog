import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  right?: ReactNode;
}

export function PageHeader({ title, right }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-1">
      <h1 className="text-[34px] font-bold tracking-tight text-notes-text">{title}</h1>
      {right && <div>{right}</div>}
    </div>
  );
}
