import { Star, TrendingUp } from 'lucide-react';

/**
 * Large overall rating stat card with animated circular ring.
 * Styled with pastel background (bg-brand-yellow) and rounded-3xl.
 */
export default function OverallRatingStat({ rating, totalReviews, recommendationPercent }) {
  const pct = ((rating - 1) / 4) * 100;   // 1–5 scale to 0–100%
  const circumference = 2 * Math.PI * 54;  // radius = 54
  const offset = circumference - (pct / 100) * circumference;

  const getRingColor = (r) => {
    if (r >= 4.5) return '#10b981';
    if (r >= 3.5) return '#191919';
    return '#F4633E';
  };

  return (
    <div className="bg-brand-yellow rounded-3xl p-6 border border-brand-charcoal/10 shadow-soft flex flex-col items-center gap-4 h-full justify-between">
      <h3 className="text-brand-charcoal/80 text-xs font-bold uppercase tracking-wider">Overall Rating</h3>

      {/* Ring */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(25, 25, 25, 0.12)" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={getRingColor(rating)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-brand-charcoal">{rating?.toFixed(1)}</span>
          <span className="text-xs font-medium text-brand-charcoal/60">out of 5</span>
        </div>
      </div>

      {/* Stars row */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-5 h-5 ${s <= Math.round(rating) ? 'text-brand-charcoal fill-brand-charcoal' : 'text-brand-charcoal/20'}`}
          />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 text-center w-full justify-center pt-2 border-t border-brand-charcoal/10">
        <div>
          <div className="text-xl font-black text-brand-charcoal">{totalReviews}</div>
          <div className="text-xs font-semibold text-brand-charcoal/60">Reviews</div>
        </div>
        <div className="w-px h-8 bg-brand-charcoal/15" />
        <div>
          <div className="flex items-center justify-center gap-1 text-xl font-black text-brand-charcoal">
            <TrendingUp className="w-4 h-4 text-brand-charcoal" />
            {recommendationPercent}%
          </div>
          <div className="text-xs font-semibold text-brand-charcoal/60">Recommend</div>
        </div>
      </div>
    </div>
  );
}
