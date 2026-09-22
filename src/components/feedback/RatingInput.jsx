import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Interactive star rating input (1–5).
 * @param {string}   label     - Label above the stars
 * @param {number}   value     - Current rating value (0 = none)
 * @param {Function} onChange  - Called with the new rating value
 */
export default function RatingInput({ label, value, onChange, subtitle }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-2 border-b border-brand-charcoal/5 last:border-b-0">
      <div className="min-w-[160px]">
        <span className="text-sm font-semibold text-brand-charcoal block">{label}</span>
        {subtitle && <span className="text-[11px] text-brand-charcoal/60 block">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-1.5 self-start sm:self-auto">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-1 transition-transform hover:scale-115 active:scale-95 focus:outline-none"
            aria-label={`${label} ${star} stars`}
          >
            <Star
              className={`w-6 h-6 transition-colors duration-150 ${
                star <= (hovered || value)
                  ? 'text-amber-500 fill-amber-400 drop-shadow-sm'
                  : 'text-brand-charcoal/20 fill-brand-charcoal/5'
              }`}
            />
          </button>
        ))}
        <span className={`ml-2 text-sm font-bold min-w-[32px] text-right ${value > 0 ? 'text-amber-600' : 'text-brand-charcoal/30'}`}>
          {value > 0 ? `${value}.0` : '—'}
        </span>
      </div>
    </div>
  );
}
