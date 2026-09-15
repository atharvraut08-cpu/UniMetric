import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSentimentPieData } from '../../utils/computeSentimentDistribution';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/95 text-sm">
        <p style={{ color: d.payload.color }} className="font-semibold">{d.name}</p>
        <p className="text-slate-400">{d.value} reviews</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div className="flex justify-center gap-4 mt-2">
    {payload.map((entry) => (
      <div key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
        {entry.value}
      </div>
    ))}
  </div>
);

/**
 * Donut / Pie chart showing sentiment distribution derived from reviews array.
 */
export default function SentimentPieChart({ reviews }) {
  const data = getSentimentPieData(reviews);

  if (!data.length) {
    return (
      <div className="glass-card p-6 flex items-center justify-center text-slate-500 text-sm h-64">
        No review data available.
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4">Feedback Sentiment</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Count row */}
      <div className="flex justify-around pt-4 border-t border-slate-800">
        {data.map((d) => (
          <div key={d.name} className="text-center">
            <div className="text-xl font-bold" style={{ color: d.color }}>{d.value}</div>
            <div className="text-xs text-slate-500">{d.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
