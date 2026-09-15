import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import RatingBadge from '../common/RatingBadge';

const metrics = [
  {
    label: 'Overall Rating',
    getValue: (c) => c.overallRating,
    format: (v) => v?.toFixed(1),
    isBig: true,
  },
  {
    label: 'Teaching Quality',
    getValue: (c) => c.ratings?.teachingQuality,
    format: (v) => v?.toFixed(1),
  },
  {
    label: 'Labs',
    getValue: (c) => c.ratings?.infrastructure?.labs,
    format: (v) => v?.toFixed(1),
  },
  {
    label: 'Wi-Fi',
    getValue: (c) => c.ratings?.infrastructure?.wifi,
    format: (v) => v?.toFixed(1),
  },
  {
    label: 'Hostel',
    getValue: (c) => c.ratings?.infrastructure?.hostel,
    format: (v) => v?.toFixed(1),
  },
  {
    label: 'Career & Placements',
    getValue: (c) => c.ratings?.careerPlacements,
    format: (v) => v?.toFixed(1),
  },
  {
    label: 'Would Recommend',
    getValue: (c) => c.recommendationPercent,
    format: (v) => `${v}%`,
  },
];

function Delta({ a, b }) {
  if (a == null || b == null) return null;
  const diff = (a - b).toFixed(1);
  if (Math.abs(diff) < 0.05) return <Minus className="w-3.5 h-3.5 text-slate-500" />;
  if (diff > 0) return (
    <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-medium">
      <TrendingUp className="w-3 h-3" /> +{diff}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-rose-400 text-xs font-medium">
      <TrendingDown className="w-3 h-3" /> {diff}
    </span>
  );
}

/**
 * Side-by-side metric comparison table.
 */
export default function ComparisonTable({ collegeA, collegeB }) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_1fr] bg-slate-800/50 border-b border-slate-700">
        <div className="p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">College A</p>
          <p className="font-semibold text-white text-sm line-clamp-2">{collegeA?.name ?? '—'}</p>
        </div>
        <div className="flex items-center justify-center px-4 text-slate-600 text-xs font-medium">VS</div>
        <div className="p-4 text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">College B</p>
          <p className="font-semibold text-white text-sm line-clamp-2">{collegeB?.name ?? '—'}</p>
        </div>
      </div>

      {/* Rows */}
      {metrics.map(({ label, getValue, format, isBig }) => {
        const vA = collegeA ? getValue(collegeA) : null;
        const vB = collegeB ? getValue(collegeB) : null;
        const aWins = vA != null && vB != null && vA > vB;
        const bWins = vA != null && vB != null && vB > vA;

        return (
          <div
            key={label}
            className="grid grid-cols-[1fr_auto_1fr] border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors"
          >
            {/* A value */}
            <div className={`p-4 flex items-center gap-2 ${aWins ? 'bg-emerald-500/5' : ''}`}>
              {isBig && vA != null ? (
                <RatingBadge rating={vA} size="md" />
              ) : (
                <span className={`text-sm font-semibold ${aWins ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {vA != null ? format(vA) : '—'}
                </span>
              )}
              {aWins && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
            </div>

            {/* Metric label + delta */}
            <div className="px-3 py-4 flex flex-col items-center justify-center gap-1 text-center border-x border-slate-800 min-w-[100px]">
              <span className="text-xs text-slate-500 font-medium">{label}</span>
              {vA != null && vB != null && <Delta a={vA} b={vB} />}
            </div>

            {/* B value */}
            <div className={`p-4 flex items-center justify-end gap-2 ${bWins ? 'bg-emerald-500/5' : ''}`}>
              {bWins && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
              {isBig && vB != null ? (
                <RatingBadge rating={vB} size="md" />
              ) : (
                <span className={`text-sm font-semibold ${bWins ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {vB != null ? format(vB) : '—'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
