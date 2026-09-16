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
  Private:    'bg-violet-500/15 text-violet-300 border border-violet-500/20',
  Government: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
  Autonomous: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  Deemed:     'bg-rose-500/15 text-rose-300 border border-rose-500/20',
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
        <p className="text-indigo-400 text-lg font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
        <p className="text-slate-400 text-lg font-medium">College not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* ── College Header ── */}
      <div className="glass-card p-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[college.type] || typeColors.Private}`}>
                {college.type}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{college.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {college.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                {college.type} Institution
              </span>
            </div>

            {/* Programs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {college.programs.map((p) => (
                <span key={p} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                  <BookOpen className="w-3 h-3" />
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
      {/* Row 1: Overall stat + Category Radar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-100">
        <div className="md:col-span-1">
          <OverallRatingStat
            rating={college.overallRating}
            totalReviews={college.totalReviews}
            recommendationPercent={college.recommendationPercent}
          />
        </div>
        <div className="md:col-span-2">
          <CategoryPerformanceChart ratings={college.ratings} />
        </div>
      </div>

      {/* Row 2: Infrastructure + Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-200">
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
