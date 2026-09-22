import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSentimentPieData } from '../../utils/computeSentimentDistribution';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="px-3.5 py-2 rounded-2xl border border-brand-charcoal/15 bg-brand-paper shadow-soft text-sm">
        <p style={{ color: d.payload.color }} className="font-bold">{d.name}</p>
        <p className="text-brand-charcoal/70 font-medium">{d.value} reviews</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div className="flex justify-center gap-4 mt-2">
    {payload.map((entry) => (
      <div key={entry.value} className="flex items-center gap-1.5 text-xs font-semibold text-brand-charcoal/70">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
        {entry.value}
      </div>
    ))}
  </div>
);

/**
 * Donut / Pie chart showing sentiment distribution derived from reviews array.
 * Styled with light Soft Neo-Brutalism theme and rounded-3xl.
 */
export default function SentimentPieChart({ reviews, showDWM = false }) {
  const data = getSentimentPieData(reviews);

  if (!data.length) {
    return (
      <div className="bg-brand-paper rounded-3xl p-6 flex items-center justify-center text-brand-charcoal/60 text-sm h-64 border border-brand-charcoal/10 shadow-soft">
        No review data available.
      </div>
    );
  }

  return (
    <div className="bg-brand-paper rounded-3xl p-6 border border-brand-charcoal/10 shadow-soft flex flex-col justify-between">
      <h3 className="text-brand-charcoal text-sm font-bold uppercase tracking-wider mb-2">Feedback Sentiment</h3>
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
      <div className="flex justify-around pt-4 border-t border-brand-charcoal/10">
        {data.map((d) => (
          <div key={d.name} className="text-center">
            <div className="text-xl font-black" style={{ color: d.color }}>{d.value}</div>
            <div className="text-xs font-semibold text-brand-charcoal/60">{d.name}</div>
          </div>
        ))}
      </div>

      {showDWM && (
        <p className="text-[10px] uppercase font-bold text-brand-charcoal/50 mt-2">
          Powered by: OLAP & Star Schema Rollups
        </p>
      )}
    </div>
  );
}
