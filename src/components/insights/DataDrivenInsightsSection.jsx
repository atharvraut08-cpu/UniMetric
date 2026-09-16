/**
 * DataDrivenInsightsSection.jsx
 * Container component — fetches ML insights from the analytics API and
 * lays out the 4 insight widgets: KeyDrivers, Segments, Rules, Gauge.
 *
 * Placed BELOW existing Phase 1/2 charts on CollegeDashboardPage and ComparePage.
 * Does NOT modify any existing components.
 */
import { useState, useEffect } from 'react';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import { getCollegeInsights } from '../../services/mockDataService';
import KeyDriversChart from './KeyDriversChart';
import SegmentBadgeList from './SegmentBadgeList';
import AssociationRuleChips from './AssociationRuleChips';
import PredictiveRecommendGauge from './PredictiveRecommendGauge';

// Skeleton loading card
function SkeletonCard({ height = 'h-32' }) {
  return (
    <div className={`glass-card p-5 ${height} animate-pulse`}>
      <div className="h-3 w-1/3 bg-slate-700 rounded mb-3" />
      <div className="h-2 w-full bg-slate-800 rounded mb-2" />
      <div className="h-2 w-4/5 bg-slate-800 rounded mb-2" />
      <div className="h-2 w-2/3 bg-slate-800 rounded" />
    </div>
  );
}

export default function DataDrivenInsightsSection({ collegeId, collegeName }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collegeId) return;
    setLoading(true);
    setError(null);
    getCollegeInsights(collegeId)
      .then((data) => {
        setInsights(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Could not load analytics data.');
        setLoading(false);
      });
  }, [collegeId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard height="h-52" />
          <SkeletonCard height="h-52" />
          <SkeletonCard height="h-40" />
          <SkeletonCard height="h-40" />
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3">
        <BrainCircuit className="w-8 h-8 text-slate-600" />
        <p className="text-slate-400 text-sm font-medium">
          Analytics not yet computed for this college.
        </p>
        <p className="text-slate-600 text-xs">
          Run <code className="text-indigo-400">python manage.py run_analytics_pipeline</code> to generate insights.
        </p>
      </div>
    );
  }

  const {
    keyDrivers,
    clusterSummary,
    associationRules,
    predictiveRecommendScore,
    classifierAccuracy,
    computedAt,
  } = insights;

  const computedDate = computedAt
    ? new Date(computedAt).toLocaleString()
    : null;

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Data-Driven Insights</h2>
            <p className="text-xs text-slate-500">ML-powered analytics · Ridge, Naive Bayes, K-Means, Apriori</p>
          </div>
        </div>
        {computedDate && (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <RefreshCw className="w-3 h-3" />
            Updated {computedDate}
          </div>
        )}
      </div>

      {/* Grid of 4 widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Widget 1: Key Drivers (Ridge Regression) */}
        <div className="glass-card p-5">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Key Rating Drivers
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Which categories most influence overall satisfaction (Ridge Regression)
            </p>
          </div>
          <KeyDriversChart keyDrivers={keyDrivers} />
        </div>

        {/* Widget 2: Predictive Recommend Score (Naive Bayes) + Segment Distribution */}
        <div className="glass-card p-5">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              Predictive Recommend Score
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Probability of recommendation (Gaussian Naive Bayes)
            </p>
          </div>
          <PredictiveRecommendGauge
            score={predictiveRecommendScore}
            accuracy={classifierAccuracy}
          />
        </div>

        {/* Widget 3: Student Segments (K-Means) */}
        <div className="glass-card p-5">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Student Segments
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Review clusters by satisfaction profile (K-Means, k=3)
            </p>
          </div>
          <SegmentBadgeList clusterSummary={clusterSummary} />
        </div>

        {/* Widget 4: Association Rules (Apriori) */}
        <div className="glass-card p-5">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Co-Occurring Weaknesses
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Frequently associated low-rating patterns (Apriori rules)
            </p>
          </div>
          <AssociationRuleChips associationRules={associationRules} />
        </div>

      </div>
    </div>
  );
}
