import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/95 text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-semibold text-violet-300">{payload[0].value?.toFixed(1)} / 5</p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa'];

/**
 * Bar chart breaking down infrastructure sub-scores: Labs, Wi-Fi, Hostel.
 */
export default function InfrastructureBreakdownChart({ infrastructure }) {
  const data = [
    { name: 'Labs',   score: infrastructure?.labs   ?? 0 },
    { name: 'Wi-Fi',  score: infrastructure?.wifi   ?? 0 },
    { name: 'Hostel', score: infrastructure?.hostel ?? 0 },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4">Infrastructure Breakdown</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="35%" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis
            dataKey="name"
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
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary row */}
      <div className="flex justify-around mt-4 pt-4 border-t border-slate-800">
        {data.map((d, i) => (
          <div key={d.name} className="text-center">
            <div className="text-lg font-bold" style={{ color: COLORS[i] }}>{d.score.toFixed(1)}</div>
            <div className="text-xs text-slate-500">{d.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
