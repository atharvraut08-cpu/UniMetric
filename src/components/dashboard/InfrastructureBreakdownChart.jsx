import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3.5 py-2 rounded-2xl border border-brand-charcoal/15 bg-brand-paper shadow-soft text-sm">
        <p className="text-brand-charcoal/70 font-medium mb-0.5">{label}</p>
        <p className="font-bold text-brand-charcoal">{payload[0].value?.toFixed(1)} / 5</p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#191919', '#F4633E', '#F5C451'];

/**
 * Bar chart breaking down infrastructure sub-scores: Labs, Wi-Fi, Hostel.
 * Styled with pastel background (bg-brand-blue) and rounded-3xl.
 */
export default function InfrastructureBreakdownChart({ infrastructure }) {
  const data = [
    { name: 'Labs',   score: infrastructure?.labs   ?? 0 },
    { name: 'Wi-Fi',  score: infrastructure?.wifi   ?? 0 },
    { name: 'Hostel', score: infrastructure?.hostel ?? 0 },
  ];

  return (
    <div className="bg-brand-blue rounded-3xl p-6 border border-brand-charcoal/10 shadow-soft flex flex-col justify-between">
      <h3 className="text-brand-charcoal text-sm font-bold uppercase tracking-wider mb-2">Infrastructure Breakdown</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="35%" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(25, 25, 25, 0.1)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#191919', fontSize: 12, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            tick={{ fill: '#191919', fontSize: 11, opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(25, 25, 25, 0.05)' }} />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary row */}
      <div className="flex justify-around mt-4 pt-4 border-t border-brand-charcoal/15">
        {data.map((d, i) => (
          <div key={d.name} className="text-center">
            <div className="text-xl font-black text-brand-charcoal">{d.score.toFixed(1)}</div>
            <div className="text-xs font-semibold text-brand-charcoal/70">{d.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
