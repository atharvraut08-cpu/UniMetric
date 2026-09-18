import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, PolarRadiusAxis,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3.5 py-2 rounded-2xl border border-brand-charcoal/15 bg-brand-paper shadow-soft text-sm">
        <p className="text-brand-charcoal/70 font-medium">{payload[0].payload.subject}</p>
        <p className="font-bold text-brand-charcoal">{payload[0].value?.toFixed(1)} / 5</p>
      </div>
    );
  }
  return null;
};

/**
 * Radar chart for Teaching Quality, Infrastructure, Career/Placements.
 * Styled with pastel background (bg-brand-purple) and rounded-3xl.
 */
export default function CategoryPerformanceChart({ ratings }) {
  const infraAvg = ratings?.infrastructure?.overall ?? 0;

  const data = [
    { subject: 'Teaching Quality', score: ratings?.teachingQuality ?? 0, fullMark: 5 },
    { subject: 'Infrastructure',   score: parseFloat(infraAvg.toFixed(2)),  fullMark: 5 },
    { subject: 'Career & Placements', score: ratings?.careerPlacements ?? 0, fullMark: 5 },
  ];

  return (
    <div className="bg-brand-purple rounded-3xl p-6 border border-brand-charcoal/10 shadow-soft h-full flex flex-col justify-between">
      <h3 className="text-brand-charcoal text-sm font-bold uppercase tracking-wider mb-2">Category Performance</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(25, 25, 25, 0.15)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#191919', fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 5]}
            tick={{ fill: '#191919', fontSize: 10, opacity: 0.6 }}
            tickCount={6}
          />
          <Radar
            name="Rating"
            dataKey="score"
            stroke="#191919"
            fill="#191919"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ r: 4, fill: '#191919', strokeWidth: 0 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
