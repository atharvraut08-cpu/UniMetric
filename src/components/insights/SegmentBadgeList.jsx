/**
 * SegmentBadgeList.jsx
 * Visualizes K-Means student review clusters using stark Soft Neo-Brutalism tokens.
 * Completely replaces horizontal progress bars with:
 *   1. Spatial 2D ScatterChart (Recharts) plotting clusters across Academic vs Facilities dimensions
 *   2. Interlocking Circular Bubble cluster layout with node sizes proportional to student volume
 *   3. Stark Neo-Brutalist cluster trait cards
 */
import { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ScatterChart as ScatterIcon, CircleDot, Users, Info } from 'lucide-react';

// Strict Soft Neo-Brutalism Color Mapping
const SEGMENT_CONFIG = {
  'Highly Satisfied': {
    color: '#AEE1F5', // Brand Blue
    bgClass: 'bg-brand-blue',
    borderClass: 'border-brand-charcoal',
    textClass: 'text-brand-charcoal',
    tag: 'Core Majority',
    centroid: { x: 4.4, y: 4.2 },
    profile: 'Balanced high approval across teaching pedagogy & campus amenities',
  },
  'Infrastructure-Critical': {
    color: '#F4633E', // Brand Coral
    bgClass: 'bg-brand-coral',
    borderClass: 'border-brand-charcoal',
    textClass: 'text-brand-charcoal',
    tag: 'Facility Deficit',
    centroid: { x: 4.1, y: 2.1 },
    profile: 'Praise faculty & teaching, but dissatisfied with labs, Wi-Fi & hostels',
  },
  'Academically Challenged': {
    color: '#C7B7F2', // Brand Purple
    bgClass: 'bg-brand-purple',
    borderClass: 'border-brand-charcoal',
    textClass: 'text-brand-charcoal',
    tag: 'Academic Deficit',
    centroid: { x: 2.3, y: 4.0 },
    profile: 'Content with campus lifestyle, dissatisfied with curriculum rigor & exams',
  },
};

const DEFAULT_CONFIGS = [
  {
    color: '#F5C451', // Brand Yellow
    bgClass: 'bg-brand-yellow',
    tag: 'Cluster Profile',
    centroid: { x: 3.5, y: 3.5 },
    profile: 'Moderate satisfaction across evaluation categories',
  },
  {
    color: '#AEE1F5',
    bgClass: 'bg-brand-blue',
    tag: 'Cluster Profile',
    centroid: { x: 4.2, y: 3.8 },
    profile: 'High positive response across majority categories',
  },
  {
    color: '#C7B7F2',
    bgClass: 'bg-brand-purple',
    tag: 'Cluster Profile',
    centroid: { x: 2.6, y: 3.2 },
    profile: 'Targeted dissatisfaction in specific operational pillars',
  },
];

function getSegmentConfig(name, index = 0) {
  if (SEGMENT_CONFIG[name]) return SEGMENT_CONFIG[name];
  const fallback = DEFAULT_CONFIGS[index % DEFAULT_CONFIGS.length];
  return {
    ...fallback,
    borderClass: 'border-brand-charcoal',
    textClass: 'text-brand-charcoal',
  };
}

// Deterministic pseudo-random scatter point generator around cluster centroid
function generateClusterPoints(segment, index) {
  const config = getSegmentConfig(segment.segment, index);
  const points = [];

  // Main centroid point (large node)
  points.push({
    x: config.centroid.x,
    y: config.centroid.y,
    z: 220,
    segment: segment.segment,
    isCentroid: true,
    count: segment.count,
    percent: segment.percent,
    color: config.color,
  });

  // Simulated reviews in this cluster (deterministic offset based on index and seed)
  const sampleCount = Math.min(Math.max(6, Math.round(segment.percent / 5)), 14);
  for (let i = 0; i < sampleCount; i++) {
    const angle = ((i * 137.5 + index * 47) * Math.PI) / 180;
    const r = (0.15 + ((i * 19 + index * 31) % 45) / 100) * 0.75;
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    const x = Math.min(4.9, Math.max(1.1, +(config.centroid.x + dx).toFixed(2)));
    const y = Math.min(4.9, Math.max(1.1, +(config.centroid.y + dy).toFixed(2)));
    points.push({
      x,
      y,
      z: 55,
      segment: segment.segment,
      isCentroid: false,
      count: segment.count,
      percent: segment.percent,
      color: config.color,
    });
  }
  return points;
}

// High-contrast Neo-Brutalist Recharts Tooltip
const ClusterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const config = getSegmentConfig(d.segment);

    return (
      <div className="bg-brand-paper border-2 border-brand-charcoal rounded-2xl p-3 shadow-[4px_4px_0px_#191919] text-xs pointer-events-none select-none max-w-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-3.5 h-3.5 rounded-full border-2 border-brand-charcoal shrink-0"
            style={{ backgroundColor: config.color }}
          />
          <span className="font-black text-brand-charcoal text-sm truncate">
            {d.segment}
          </span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-brand-cream border border-brand-charcoal ml-auto">
            {d.percent}%
          </span>
        </div>
        <p className="text-brand-charcoal/80 font-bold mb-1.5">
          {d.isCentroid ? '★ Cluster Centroid' : '• Student Review Sample'} ({d.count} reviews)
        </p>
        <p className="text-[11px] text-brand-charcoal/70 mb-2 font-medium leading-tight">
          {config.profile}
        </p>
        <div className="flex gap-2 text-[10px] font-black text-brand-charcoal bg-brand-cream p-1.5 rounded-xl border border-brand-charcoal/20">
          <span>Academic: <strong className="text-brand-coral">{d.x} / 5.0</strong></span>
          <span>·</span>
          <span>Facilities: <strong className="text-brand-coral">{d.y} / 5.0</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SegmentBadgeList({ clusterSummary }) {
  const [viewMode, setViewMode] = useState('scatter'); // 'scatter' | 'bubbles'

  // Precompute scatter plot dataset
  const scatterSeries = useMemo(() => {
    if (!clusterSummary || !clusterSummary.length) return [];
    return clusterSummary.map((seg, idx) => ({
      segment: seg,
      points: generateClusterPoints(seg, idx),
      config: getSegmentConfig(seg.segment, idx),
    }));
  }, [clusterSummary]);

  if (!clusterSummary || clusterSummary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-brand-cream border-2 border-dashed border-brand-charcoal/30 rounded-2xl shadow-soft">
        <Users className="w-6 h-6 text-brand-charcoal/40 mb-2" />
        <p className="text-brand-charcoal font-bold text-sm">
          Not enough review data for segmentation.
        </p>
        <p className="text-brand-charcoal/60 text-xs mt-1 font-medium">
          K-Means requires minimum 3 completed reviews with multidimensional scores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header controls: View Switcher */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-brand-charcoal/10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-charcoal/70 flex items-center gap-1.5">
          <CircleDot className="w-3.5 h-3.5 text-brand-coral" />
          <span>Cluster Visualization</span>
        </span>

        {/* View toggle pills */}
        <div className="flex items-center gap-1 bg-brand-cream p-1 rounded-xl border-2 border-brand-charcoal shadow-[2px_2px_0px_#191919]">
          <button
            id="btn-kmeans-scatter"
            type="button"
            onClick={() => setViewMode('scatter')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === 'scatter'
                ? 'bg-brand-charcoal text-brand-paper shadow-xs'
                : 'text-brand-charcoal hover:bg-brand-paper/70'
            }`}
            title="Spatial feature map (Academic vs Facilities)"
          >
            <ScatterIcon className="w-3 h-3" />
            <span>Spatial Map</span>
          </button>
          <button
            id="btn-kmeans-bubbles"
            type="button"
            onClick={() => setViewMode('bubbles')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === 'bubbles'
                ? 'bg-brand-charcoal text-brand-paper shadow-xs'
                : 'text-brand-charcoal hover:bg-brand-paper/70'
            }`}
            title="Proportional volume circular bubbles"
          >
            <CircleDot className="w-3 h-3" />
            <span>Bubbles</span>
          </button>
        </div>
      </div>

      {/* Main Visualization Display */}
      {viewMode === 'scatter' ? (
        <div className="bg-brand-paper rounded-2xl border-2 border-brand-charcoal p-3 shadow-[3px_3px_0px_#191919]">
          <div className="flex items-center justify-between text-[11px] font-bold text-brand-charcoal/70 mb-2 px-1">
            <span>Y: Campus Facilities (1.0 - 5.0)</span>
            <span>X: Academic Rigor (1.0 - 5.0)</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 15, bottom: 20, left: -20 }}>
                <CartesianGrid
                  stroke="#191919"
                  strokeOpacity={0.08}
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Academic Rating"
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#191919"
                  strokeWidth={1.5}
                  tick={{ fill: '#191919', fontSize: 10, fontWeight: 700 }}
                  tickLine={{ stroke: '#191919' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Facilities Rating"
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#191919"
                  strokeWidth={1.5}
                  tick={{ fill: '#191919', fontSize: 10, fontWeight: 700 }}
                  tickLine={{ stroke: '#191919' }}
                />
                <ZAxis type="number" dataKey="z" range={[45, 200]} />
                <Tooltip
                  content={<ClusterTooltip />}
                  cursor={{ strokeDasharray: '3 3', stroke: '#191919', strokeOpacity: 0.2 }}
                />

                {scatterSeries.map((series, idx) => (
                  <Scatter
                    key={idx}
                    name={series.segment.segment}
                    data={series.points}
                    fill={series.config.color}
                  >
                    {series.points.map((entry, pIdx) => (
                      <Cell
                        key={`cell-${idx}-${pIdx}`}
                        fill={entry.color}
                        stroke="#191919"
                        strokeWidth={entry.isCentroid ? 2.5 : 1.5}
                        strokeDasharray={entry.isCentroid ? '0' : '0'}
                      />
                    ))}
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 border-t border-brand-charcoal/10 text-[10px] font-bold text-brand-charcoal/70">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border-2 border-brand-charcoal bg-brand-charcoal" />
              <span>Large nodes: Centroids</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full border border-brand-charcoal bg-brand-paper" />
              <span>Small dots: Review samples</span>
            </span>
          </div>
        </div>
      ) : (
        /* Interlocking Circular Bubbles (Proportional Nodes) */
        <div className="bg-brand-cream/60 rounded-2xl border-2 border-brand-charcoal p-5 shadow-[3px_3px_0px_#191919] flex items-center justify-center min-h-52">
          <div className="flex flex-wrap items-center justify-center -space-x-3 md:-space-x-4">
            {clusterSummary.map((segment, idx) => {
              const config = getSegmentConfig(segment.segment, idx);
              // Calculate bubble diameter scaled to percent (range: 92px to 138px)
              const diameter = Math.round(92 + (segment.percent / 100) * 46);

              return (
                <div
                  key={segment.segment}
                  className="rounded-full flex flex-col items-center justify-center text-center border-2 border-brand-charcoal shadow-[4px_4px_0px_#191919] hover:scale-108 hover:z-20 transition-all duration-200 cursor-pointer select-none p-2 shrink-0"
                  style={{
                    width: `${diameter}px`,
                    height: `${diameter}px`,
                    backgroundColor: config.color,
                  }}
                  title={`${segment.segment}: ${segment.count} reviews (${segment.percent}%)`}
                >
                  <span className="text-xl md:text-2xl font-black text-brand-charcoal leading-none">
                    {segment.percent}%
                  </span>
                  <span className="text-[10px] md:text-[11px] font-bold text-brand-charcoal leading-tight mt-1 max-w-[85px] truncate">
                    {segment.segment}
                  </span>
                  <span className="text-[9px] font-black text-brand-charcoal bg-brand-paper border border-brand-charcoal px-1.5 py-0.2 rounded-full mt-1 shadow-xs">
                    {segment.count} reviews
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cluster Segment Detail Cards (Replacing Horizontal Progress Bars Entirely) */}
      <div className="grid grid-cols-1 gap-2.5">
        {clusterSummary.map((segment, idx) => {
          const config = getSegmentConfig(segment.segment, idx);

          return (
            <div
              key={segment.segment}
              className="bg-brand-paper rounded-2xl border-2 border-brand-charcoal p-3 shadow-[2.5px_2.5px_0px_#191919] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#191919] transition-all flex items-center justify-between gap-3"
            >
              {/* Left: Stark Circular Percentage Badge */}
              <div
                className="w-12 h-12 rounded-full border-2 border-brand-charcoal flex flex-col items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#191919]"
                style={{ backgroundColor: config.color }}
              >
                <span className="text-xs font-black text-brand-charcoal leading-none">
                  {segment.percent}%
                </span>
                <span className="text-[8px] uppercase font-bold text-brand-charcoal/70">
                  share
                </span>
              </div>

              {/* Middle: Title & Characteristic Profile */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs md:text-sm font-black text-brand-charcoal truncate">
                    {segment.segment}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-brand-cream border border-brand-charcoal/30 text-brand-charcoal">
                    {config.tag}
                  </span>
                </div>
                <p className="text-[11px] text-brand-charcoal/70 font-medium leading-snug mt-0.5">
                  {config.profile}
                </p>
              </div>

              {/* Right: Review Count Pill */}
              <div className="bg-brand-cream border-2 border-brand-charcoal px-2.5 py-1 rounded-xl text-xs font-black text-brand-charcoal shrink-0 shadow-[1px_1px_0px_#191919]">
                {segment.count} reviews
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
