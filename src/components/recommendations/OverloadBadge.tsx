import type { OverloadRecommendation } from '../../utils/overload';

interface OverloadBadgeProps {
  recommendation: OverloadRecommendation;
  onApply: () => void;
}

export function OverloadBadge({ recommendation, onApply }: OverloadBadgeProps) {
  if (!recommendation.type) return null;

  const isDeload = recommendation.type === 'deload';

  return (
    <button
      onClick={onApply}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold mt-1.5 active:scale-95 transition-transform ${
        isDeload
          ? 'bg-notes-orange/15 text-notes-orange'
          : 'bg-notes-accent-dim text-notes-accent'
      }`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={isDeload ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M5 10l7-7m0 0l7 7m-7-7v18"} />
      </svg>
      {recommendation.message}
    </button>
  );
}
