/**
 * SegmentBadgeList.jsx
 * Displays K-Means cluster distribution as segment badges/cards.
 */

const SEGMENT_STYLES = {
  'Highly Satisfied': {
    bg: 'bg-emerald-500/15 border-emerald-500/25',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    bar: 'bg-emerald-500',
  },
  'Infrastructure-Critical': {
    bg: 'bg-amber-500/15 border-amber-500/25',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    bar: 'bg-amber-500',
  },
  'Academically Challenged': {
    bg: 'bg-rose-500/15 border-rose-500/25',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
    bar: 'bg-rose-500',
  },
};

const DEFAULT_STYLE = {
  bg: 'bg-indigo-500/15 border-indigo-500/25',
  text: 'text-indigo-300',
  dot: 'bg-indigo-400',
  bar: 'bg-indigo-500',
};

export default function SegmentBadgeList({ clusterSummary }) {
  if (!clusterSummary || clusterSummary.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-slate-500 text-sm">
        Not enough data for segmentation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clusterSummary.map((segment) => {
        const style = SEGMENT_STYLES[segment.segment] || DEFAULT_STYLE;
        return (
          <div
            key={segment.segment}
            className={`rounded-xl border p-3.5 ${style.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className={`text-sm font-medium ${style.text}`}>
                  {segment.segment}
                </span>
              </div>
              <span className={`text-xs font-semibold ${style.text}`}>
                {segment.count} reviews · {segment.percent}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                style={{ width: `${segment.percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
