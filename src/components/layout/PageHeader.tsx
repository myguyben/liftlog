import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  right?: ReactNode;
}

export function PageHeader({ title, right }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {right && <div>{right}</div>}
    </div>
  );
}
