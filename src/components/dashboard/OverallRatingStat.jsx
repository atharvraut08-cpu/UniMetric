import { Star, TrendingUp } from 'lucide-react';

/**
 * Large overall rating stat card with animated circular ring.
 */
export default function OverallRatingStat({ rating, totalReviews, recommendationPercent }) {
  const pct = ((rating - 1) / 4) * 100;   // 1–5 scale to 0–100%
  const circumference = 2 * Math.PI * 54;  // radius = 54
  const offset = circumference - (pct / 100) * circumference;

  const getRingColor = (r) => {
    if (r >= 4.5) return '#34d399';
    if (r >= 3.5) return '#fbbf24';
    return '#fb7185';
  };

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4">
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Overall Rating</h3>

      {/* Ring */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
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
          <span className="text-3xl font-bold text-white">{rating?.toFixed(1)}</span>
          <span className="text-xs text-slate-500">out of 5</span>
        </div>
      </div>

      {/* Stars row */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-5 h-5 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
          />
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 text-center">
        <div>
          <div className="text-xl font-bold text-white">{totalReviews}</div>
          <div className="text-xs text-slate-500">Reviews</div>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div>
          <div className="flex items-center gap-1 text-xl font-bold text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            {recommendationPercent}%
          </div>
          <div className="text-xs text-slate-500">Recommend</div>
        </div>
      </div>
    </div>
  );
}
