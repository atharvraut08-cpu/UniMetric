import { Star } from 'lucide-react';

/**
 * RatingBadge — displays a rating value (1–5) with a star icon and colour coding.
 * @param {number} rating   - The rating value (float or int)
 * @param {string} size     - 'sm' | 'md' | 'lg'
 */
export default function RatingBadge({ rating, size = 'md' }) {
  const getColor = (r) => {
    if (r >= 4.5) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (r >= 3.5) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  };

  const sizes = {
    sm: { wrapper: 'px-2 py-0.5 text-xs gap-1', icon: 'w-3 h-3' },
    md: { wrapper: 'px-2.5 py-1 text-sm gap-1.5', icon: 'w-3.5 h-3.5' },
    lg: { wrapper: 'px-3 py-1.5 text-base gap-2', icon: 'w-4 h-4' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center font-semibold rounded-lg border ${getColor(rating)} ${s.wrapper}`}>
      <Star className={`${s.icon} fill-current`} />
      {rating?.toFixed(1)}
    </span>
  );
}
