import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/95 text-sm min-w-[140px]">
        <p className="text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span style={{ color: p.fill }} className="text-xs">{p.name}</span>
            <span className="text-white font-semibold">{p.value?.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Grouped bar chart comparing two colleges across all scoring categories.
 */
export default function ComparisonBarChart({ collegeA, collegeB }) {
  const nameA = collegeA?.name?.split(' ').slice(0, 2).join(' ') ?? 'College A';
  const nameB = collegeB?.name?.split(' ').slice(0, 2).join(' ') ?? 'College B';

  const data = [
    {
      metric: 'Teaching',
      [nameA]: collegeA?.ratings?.teachingQuality ?? 0,
      [nameB]: collegeB?.ratings?.teachingQuality ?? 0,
    },
    {
      metric: 'Labs',
      [nameA]: collegeA?.ratings?.infrastructure?.labs ?? 0,
      [nameB]: collegeB?.ratings?.infrastructure?.labs ?? 0,
    },
    {
      metric: 'Wi-Fi',
      [nameA]: collegeA?.ratings?.infrastructure?.wifi ?? 0,
      [nameB]: collegeB?.ratings?.infrastructure?.wifi ?? 0,
    },
    {
      metric: 'Hostel',
      [nameA]: collegeA?.ratings?.infrastructure?.hostel ?? 0,
      [nameB]: collegeB?.ratings?.infrastructure?.hostel ?? 0,
    },
    {
      metric: 'Careers',
      [nameA]: collegeA?.ratings?.careerPlacements ?? 0,
      [nameB]: collegeB?.ratings?.careerPlacements ?? 0,
    },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-6">Side-by-Side Category Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="25%" barGap={4} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis
            dataKey="metric"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            tick={{ fill: '#475569', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
          <Legend
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#94a3b8' }}
          />
          <Bar dataKey={nameA} fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey={nameB} fill="#a78bfa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
