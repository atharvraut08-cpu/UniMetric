import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import {
  getCollegeDashboardBundle,
  getSessionDashboardData,
  getSessionActiveCollegeId
} from '../services/mockDataService';
import { useRole } from '../context/RoleContext';
import RatingBadge from '../components/common/RatingBadge';
import OverallRatingStat from '../components/dashboard/OverallRatingStat';
import CategoryPerformanceChart from '../components/dashboard/CategoryPerformanceChart';
import InfrastructureBreakdownChart from '../components/dashboard/InfrastructureBreakdownChart';
import SentimentPieChart from '../components/dashboard/SentimentPieChart';
import FeedbackLists from '../components/dashboard/FeedbackLists';
// Heavy ML-insights charts load after the main dashboard has rendered.
const DataDrivenInsightsSection = lazy(() => import('../components/insights/DataDrivenInsightsSection'));

const typeColors = {
  Private:    'bg-brand-purple/40 text-brand-charcoal border border-brand-charcoal/15',
  Government: 'bg-brand-blue/50 text-brand-charcoal border border-brand-charcoal/15',
  Autonomous: 'bg-brand-yellow/50 text-brand-charcoal border border-brand-charcoal/15',
  Deemed:     'bg-brand-coral/20 text-brand-charcoal border border-brand-charcoal/15',
};

export default function CollegeDashboardPage() {
  const { id } = useParams();
  const { user } = useRole();
  const navigate = useNavigate();

  // Resolve effective college ID from URL parameter, session storage, or user profile
  const effectiveId = id || getSessionActiveCollegeId() || user?.college_id || '1';

  // Synchronously hydrate from sessionStorage if available (instant 0ms render without loading flash)
  const initialCached = getSessionDashboardData(effectiveId);
  const [college, setCollege] = useState(initialCached?.college || null);
  const [reviews, setReviews] = useState(initialCached?.reviews || []);
  const [insights, setInsights] = useState(initialCached?.insights || null);
  const [loading, setLoading] = useState(!initialCached?.college);
  const [error, setError] = useState(null);
  const [showDWM, setShowDWM] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!effectiveId) return;

      // Only show full loading screen if we have no session-cached data
      if (!college) {
        setLoading(true);
      } else {
        setIsRevalidating(true);
      }
      setError(null);

      try {
        const bundle = await getCollegeDashboardBundle(effectiveId);

        if (!isMounted) return;

        if (!bundle || !bundle.college) {
          if (!college) {
            setError('College not found.');
          }
        } else {
          setCollege(bundle.college);
          setReviews(bundle.reviews || []);
          setInsights(bundle.insights || null);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load college analytics dashboard:', err);
        if (!college) {
          setError('Failed to load college analytics. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsRevalidating(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [effectiveId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center px-4 animate-fade-in">
        <div className="w-10 h-10 border-4 border-brand-charcoal/20 border-t-brand-charcoal rounded-full animate-spin mb-4" />
        <p className="text-brand-charcoal text-lg font-bold">Loading dashboard...</p>
        <p className="text-brand-charcoal/60 text-xs mt-1">Retrieving institutional metrics and reviews</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center px-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-brand-charcoal text-lg font-bold mb-1">
          {error}
        </p>
        <p className="text-brand-charcoal/60 text-xs font-medium max-w-md mb-4">
          There was an issue communicating with the analytics server. Check your connection or verify that the backend is running.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-2xl bg-brand-coral text-white font-semibold text-sm flex items-center gap-1.5 shadow-soft hover:opacity-90 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-2xl border border-brand-charcoal/20 bg-brand-paper text-brand-charcoal font-semibold text-sm hover:bg-brand-cream transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
        <p className="text-brand-charcoal text-lg font-bold">College not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2.5 rounded-2xl bg-brand-coral text-white font-semibold text-sm flex items-center gap-1.5 shadow-soft hover:opacity-90 transition-all cursor-pointer"
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
              <button
                onClick={() => setShowDWM(!showDWM)}
                className="text-xs px-3 py-1 bg-brand-charcoal text-brand-paper rounded-full hover:opacity-90 transition-opacity"
              >
                {showDWM ? 'Hide' : 'Show'} DWM Concepts
              </button>
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
            showDWM={showDWM}
          />
        </div>
        <div className="md:col-span-2 flex flex-col">
          <CategoryPerformanceChart ratings={college.ratings} showDWM={showDWM} />
        </div>
      </div>

      {/* Row 2: Infrastructure (bg-brand-blue) + Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-200 items-stretch">
        <InfrastructureBreakdownChart infrastructure={college.ratings.infrastructure} showDWM={showDWM} />
        <SentimentPieChart reviews={reviews} showDWM={showDWM} />
      </div>

      {/* Row 3: Feedback Lists */}
      <div className="animate-fade-in-up delay-300">
        <FeedbackLists feedback={college.feedback} />
      </div>

      {/* ── Row 4: Data-Driven ML Insights ── */}
      <div className="animate-fade-in-up delay-400">
        <Suspense fallback={<div className="h-64 rounded-3xl bg-brand-charcoal/5 animate-pulse" />}>
          <DataDrivenInsightsSection
            collegeId={effectiveId}
            collegeName={college.name}
            initialInsights={insights}
            showDWM={showDWM}
          />
        </Suspense>
      </div>
    </div>
  );
}
