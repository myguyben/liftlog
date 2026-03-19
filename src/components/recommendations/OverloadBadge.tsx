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
      className={`inline-flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[12px] font-semibold mt-2 active:scale-95 transition-all duration-150 ${
        isDeload
          ? 'bg-notes-orange/12 text-notes-orange border border-notes-orange/20'
          : 'bg-notes-accent/10 text-notes-accent border border-notes-accent/20'
      }`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={isDeload ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M5 10l7-7m0 0l7 7m-7-7v18"} />
      </svg>
      {recommendation.message}
    </button>
  );
}
