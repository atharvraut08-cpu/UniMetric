import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, PolarRadiusAxis,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/95 text-sm">
        <p className="text-slate-400">{payload[0].payload.subject}</p>
        <p className="font-semibold text-indigo-300">{payload[0].value?.toFixed(1)} / 5</p>
      </div>
    );
  }
  return null;
};

/**
 * Radar chart for Teaching Quality, Infrastructure, Career/Placements.
 */
export default function CategoryPerformanceChart({ ratings }) {
  const infraAvg = ratings?.infrastructure?.overall ?? 0;

  const data = [
    { subject: 'Teaching Quality', score: ratings?.teachingQuality ?? 0, fullMark: 5 },
    { subject: 'Infrastructure',   score: parseFloat(infraAvg.toFixed(2)),  fullMark: 5 },
    { subject: 'Career & Placements', score: ratings?.careerPlacements ?? 0, fullMark: 5 },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4">Category Performance</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(148,163,184,0.1)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 5]}
            tick={{ fill: '#475569', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Rating"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
