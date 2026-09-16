/**
 * KeyDriversChart.jsx
 * Horizontal bar chart showing Ridge regression impact scores per category.
 * Uses Recharts (already in project — no new library added).
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

const COLORS_POS = '#6366f1';  // indigo (positive impact)
const COLORS_NEG = '#f43f5e';  // rose (negative impact)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/95 text-sm">
        <p className="text-slate-400">{label}</p>
        <p className={`font-semibold ${val >= 0 ? 'text-indigo-300' : 'text-rose-300'}`}>
          Impact: {val.toFixed(3)}
        </p>
      </div>
    );
  }
  return null;
};

export default function KeyDriversChart({ keyDrivers }) {
  if (!keyDrivers || keyDrivers.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        Not enough data for driver analysis.
      </div>
    );
  }

  const data = [...keyDrivers].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <div>
      <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">
        Regression Coefficients — sorted by influence
      </h4>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={130}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="rgba(148,163,184,0.2)" />
          <Bar dataKey="impact" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.impact >= 0 ? COLORS_POS : COLORS_NEG}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
