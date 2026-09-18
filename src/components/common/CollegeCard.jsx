import { useNavigate } from 'react-router-dom';
import { MapPin, Users, ArrowRight, Building2 } from 'lucide-react';
import RatingBadge from './RatingBadge';
import { useRole } from '../../context/RoleContext';

const typeColors = {
  Private:    'bg-brand-purple/40 text-brand-charcoal border border-brand-charcoal/15',
  Government: 'bg-brand-blue/50 text-brand-charcoal border border-brand-charcoal/15',
  Autonomous: 'bg-brand-yellow/50 text-brand-charcoal border border-brand-charcoal/15',
  Deemed:     'bg-brand-coral/20 text-brand-charcoal border border-brand-charcoal/15',
};

export default function CollegeCard({ college }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useRole();

  const recPercent = college.recommendationPercent;

  const handleCardClick = () => {
    if (!isAuthenticated) {
      // Redirect unauthenticated users to the auth page
      navigate('/auth');
    } else {
      navigate(`/college/${college.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-brand-paper rounded-3xl p-6 flex flex-col gap-4 group border border-brand-charcoal/10 shadow-soft hover-lift cursor-pointer"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-brand-charcoal text-base leading-tight group-hover:text-brand-coral transition-colors line-clamp-2">
            {college.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-brand-charcoal/60 text-xs">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-brand-charcoal/60" />
            <span className="truncate">{college.location}</span>
          </div>
        </div>
        <RatingBadge rating={college.overallRating} size="md" />
      </div>

      {/* Type + Reviews */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-3 py-0.5 rounded-full font-semibold ${typeColors[college.type] || typeColors.Private}`}>
          {college.type}
        </span>
        <span className="flex items-center gap-1 text-xs text-brand-charcoal/60 font-medium">
          <Users className="w-3 h-3" />
          {college.totalReviews} reviews
        </span>
      </div>

      {/* Programs */}
      <div className="flex flex-wrap gap-1.5">
        {college.programs.slice(0, 3).map((p) => (
          <span key={p} className="text-xs px-2.5 py-1 rounded-xl bg-brand-cream text-brand-charcoal font-medium border border-brand-charcoal/10">
            {p}
          </span>
        ))}
        {college.programs.length > 3 && (
          <span className="text-xs px-2.5 py-1 rounded-xl bg-brand-cream text-brand-charcoal/70 font-medium border border-brand-charcoal/10">
            +{college.programs.length - 3}
          </span>
        )}
      </div>

      {/* Recommendation bar */}
      <div className="mt-auto pt-2">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-brand-charcoal/60 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-brand-charcoal/60" />
            Would Recommend
          </span>
          <span className="font-bold text-brand-charcoal">{recPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-brand-cream overflow-hidden border border-brand-charcoal/10">
          <div
            className="h-full rounded-full bg-brand-coral transition-all duration-700"
            style={{ width: `${recPercent}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-end gap-1 text-brand-coral text-xs font-bold group-hover:gap-1.5 transition-all">
        {isAuthenticated ? (
          <>
            View Dashboard
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </>
        ) : (
          <>
            Sign in to View
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </div>
    </div>
  );
}
