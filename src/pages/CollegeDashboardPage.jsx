import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, BookOpen } from 'lucide-react';
import { getCollegeById, getReviewsByCollegeId } from '../services/mockDataService';
import RatingBadge from '../components/common/RatingBadge';
import OverallRatingStat from '../components/dashboard/OverallRatingStat';
import CategoryPerformanceChart from '../components/dashboard/CategoryPerformanceChart';
import InfrastructureBreakdownChart from '../components/dashboard/InfrastructureBreakdownChart';
import SentimentPieChart from '../components/dashboard/SentimentPieChart';
import FeedbackLists from '../components/dashboard/FeedbackLists';
import DataDrivenInsightsSection from '../components/insights/DataDrivenInsightsSection';

const typeColors = {
  Private:    'bg-brand-purple/40 text-brand-charcoal border border-brand-charcoal/15',
  Government: 'bg-brand-blue/50 text-brand-charcoal border border-brand-charcoal/15',
  Autonomous: 'bg-brand-yellow/50 text-brand-charcoal border border-brand-charcoal/15',
  Deemed:     'bg-brand-coral/20 text-brand-charcoal border border-brand-charcoal/15',
};

export default function CollegeDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCollegeById(id),
      getReviewsByCollegeId(id)
    ]).then(([colData, revData]) => {
      setCollege(colData);
      setReviews(revData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
        <p className="text-brand-charcoal text-lg font-bold">Loading dashboard...</p>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
        <p className="text-brand-charcoal text-lg font-bold">College not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2.5 rounded-2xl bg-brand-coral text-white font-semibold text-sm flex items-center gap-1.5 shadow-soft hover:opacity-90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-8">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-brand-charcoal/70 hover:text-brand-charcoal font-semibold text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* ── College Header ── */}
      <div className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-charcoal/10 shadow-soft animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${typeColors[college.type] || typeColors.Private}`}>
                {college.type}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-brand-charcoal mb-2">{college.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-brand-charcoal/70 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-coral" />
                {college.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-coral" />
                {college.type} Institution
              </span>
            </div>

            {/* Programs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {college.programs.map((p) => (
                <span key={p} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-2xl bg-brand-cream text-brand-charcoal font-semibold border border-brand-charcoal/10">
                  <BookOpen className="w-3.5 h-3.5 text-brand-charcoal/60" />
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0">
            <RatingBadge rating={college.overallRating} size="lg" />
          </div>
        </div>
      </div>

      {/* ── Analytics Grid ── */}
      {/* Row 1: Overall stat (bg-brand-yellow) + Category Radar (bg-brand-purple) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-100 items-stretch">
        <div className="md:col-span-1 flex flex-col">
          <OverallRatingStat
            rating={college.overallRating}
            totalReviews={college.totalReviews}
            recommendationPercent={college.recommendationPercent}
          />
        </div>
        <div className="md:col-span-2 flex flex-col">
          <CategoryPerformanceChart ratings={college.ratings} />
        </div>
      </div>

      {/* Row 2: Infrastructure (bg-brand-blue) + Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-200 items-stretch">
        <InfrastructureBreakdownChart infrastructure={college.ratings.infrastructure} />
        <SentimentPieChart reviews={reviews} />
      </div>

      {/* Row 3: Feedback Lists */}
      <div className="animate-fade-in-up delay-300">
        <FeedbackLists feedback={college.feedback} />
      </div>

      {/* ── Row 4: Data-Driven ML Insights ── */}
      <div className="animate-fade-in-up delay-400">
        <DataDrivenInsightsSection collegeId={id} collegeName={college.name} />
      </div>
    </div>
  );
}
