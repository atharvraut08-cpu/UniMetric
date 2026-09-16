/**
 * PredictiveRecommendGauge.jsx
 * Displays the Naive Bayes predicted recommendation probability as a
 * Recharts RadialBarChart gauge. Labeled "Predicted" with a disclaimer caption.
 */
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

function getColor(score) {
  if (score >= 0.75) return '#10b981'; // emerald
  if (score >= 0.5) return '#f59e0b';  // amber
  return '#f43f5e';                     // rose
}

export default function PredictiveRecommendGauge({ score, accuracy }) {
  if (score === null || score === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
        Insufficient data for prediction.
      </div>
    );
  }

  const percent = Math.round(score * 100);
  const color = getColor(score);

  const data = [
    { value: percent, fill: color },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: 'rgba(148,163,184,0.1)' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-2xl font-bold text-white">{percent}%</span>
          <span className="text-xs text-slate-500">Predicted</span>
        </div>
      </div>
      <p className="text-xs text-slate-600 mt-2 text-center max-w-[160px]">
        Based on historical rating patterns
      </p>
      {accuracy !== null && accuracy !== undefined && (
        <span className="mt-1 text-xs text-slate-500">
          Model accuracy: <span className="text-indigo-400">{(accuracy * 100).toFixed(0)}%</span>
        </span>
      )}
    </div>
  );
}
