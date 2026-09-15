import { useNavigate } from 'react-router-dom';
import { MapPin, Users, ArrowRight, Building2 } from 'lucide-react';
import RatingBadge from './RatingBadge';

const typeColors = {
  Private:    'bg-violet-500/15 text-violet-300 border border-violet-500/20',
  Government: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
  Autonomous: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  Deemed:     'bg-rose-500/15 text-rose-300 border border-rose-500/20',
};

export default function CollegeCard({ college }) {
  const navigate = useNavigate();

  const recPercent = college.recommendationPercent;

  return (
    <div
      onClick={() => navigate(`/college/${college.id}`)}
      className="glass-card hover-lift cursor-pointer p-5 flex flex-col gap-4 group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base leading-tight group-hover:text-indigo-300 transition-colors line-clamp-2">
            {college.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{college.location}</span>
          </div>
        </div>
        <RatingBadge rating={college.overallRating} size="md" />
      </div>

      {/* Type + Reviews */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${typeColors[college.type] || typeColors.Private}`}>
          {college.type}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Users className="w-3 h-3" />
          {college.totalReviews} reviews
        </span>
      </div>

      {/* Programs */}
      <div className="flex flex-wrap gap-1">
        {college.programs.slice(0, 3).map((p) => (
          <span key={p} className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
            {p}
          </span>
        ))}
        {college.programs.length > 3 && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-500">
            +{college.programs.length - 3}
          </span>
        )}
      </div>

      {/* Recommendation bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Would Recommend
          </span>
          <span className="font-semibold text-white">{recPercent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
            style={{ width: `${recPercent}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-end text-indigo-400 text-xs font-medium group-hover:text-indigo-300 transition-colors">
        View Dashboard
        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
