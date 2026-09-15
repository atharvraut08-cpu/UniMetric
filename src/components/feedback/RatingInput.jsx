import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Interactive star rating input (1–5).
 * @param {string}   label     - Label above the stars
 * @param {number}   value     - Current rating value (0 = none)
 * @param {Function} onChange  - Called with the new rating value
 */
export default function RatingInput({ label, value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-300 min-w-[140px]">{label}</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors duration-150 ${
                star <= (hovered || value)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-700'
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm font-semibold text-amber-400">{value}.0</span>
        )}
      </div>
    </div>
  );
}
