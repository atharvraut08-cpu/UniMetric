import { useState, useEffect } from 'react';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import { getCollegeInsights } from '../../services/mockDataService';
import KeyDriversChart from './KeyDriversChart';
import SegmentBadgeList from './SegmentBadgeList';
import AssociationRuleChips from './AssociationRuleChips';
import ClassificationComparisonCard from './ClassificationComparisonCard';
import HierarchicalGroupingsCard from './HierarchicalGroupingsCard';

// Skeleton loading card
function SkeletonCard({ height = 'h-32' }) {
  return (
    <div className={`bg-brand-paper rounded-3xl border border-brand-charcoal/10 p-5 ${height} animate-pulse shadow-soft`}>
      <div className="h-3 w-1/3 bg-brand-cream rounded-xl mb-3" />
      <div className="h-2 w-full bg-brand-cream rounded-xl mb-2" />
      <div className="h-2 w-4/5 bg-brand-cream rounded-xl mb-2" />
      <div className="h-2 w-2/3 bg-brand-cream rounded-xl" />
    </div>
  );
}

export default function DataDrivenInsightsSection({ collegeId, collegeName, initialInsights = null, showDWM = false }) {
  const [insights, setInsights] = useState(initialInsights);
  const [loading, setLoading] = useState(!initialInsights);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialInsights) {
      setInsights(initialInsights);
      setLoading(false);
      return;
    }

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
  }, [collegeId, initialInsights]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-brand-cream rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard height="h-52" />
          <SkeletonCard height="h-52" />
          <SkeletonCard height="h-52" />
          <SkeletonCard height="h-52" />
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-brand-paper rounded-3xl border border-brand-charcoal/10 shadow-soft p-6 flex flex-col items-center justify-center text-center gap-3">
        <BrainCircuit className="w-8 h-8 text-brand-charcoal/40" />
        <p className="text-brand-charcoal text-sm font-bold">
          Analytics not yet computed for this college.
        </p>
        <p className="text-brand-charcoal/60 text-xs font-medium">
          Run <code className="text-brand-coral font-semibold">python manage.py run_analytics_pipeline</code> to generate insights.
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
    decisionTreeAccuracy,
    decisionTreeTopFeatures,
    hierarchicalGroupings,
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
          <div className="w-9 h-9 rounded-2xl bg-brand-charcoal text-brand-paper flex items-center justify-center shadow-soft">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-charcoal">Data-Driven Insights</h2>
            <p className="text-xs text-brand-charcoal/60 font-medium">
              ML-powered analytics · Ridge, Naive Bayes &amp; Decision Tree, K-Means &amp; Agglomerative, Apriori
            </p>
          </div>
        </div>
        {computedDate && (
          <div className="flex items-center gap-1 text-xs text-brand-charcoal/50 font-medium">
            <RefreshCw className="w-3 h-3" />
            Updated {computedDate}
          </div>
        )}
      </div>

      {/* Grid of ML widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Widget 1: Key Drivers (Ridge Regression) */}
        <div className="bg-brand-paper rounded-3xl border border-brand-charcoal/10 shadow-soft p-6 flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Key Rating Drivers
              </span>
              <p className="text-xs text-brand-charcoal/60 mt-0.5 font-medium">
                Which categories most influence overall satisfaction (Ridge Regression)
              </p>
            </div>
            <KeyDriversChart keyDrivers={keyDrivers} />
          </div>
          {showDWM && (
            <p className="text-[10px] uppercase font-bold text-brand-charcoal/50 mt-2">
              Powered by: Ridge Regression
            </p>
          )}
        </div>

        {/* Widget 2: Classification Comparison (Naive Bayes vs. Decision Tree) */}
        <ClassificationComparisonCard
          predictiveRecommendScore={predictiveRecommendScore}
          classifierAccuracy={classifierAccuracy}
          decisionTreeAccuracy={decisionTreeAccuracy}
          decisionTreeTopFeatures={decisionTreeTopFeatures}
          showDWM={showDWM}
        />

        {/* Widget 3: Student Segments (K-Means) */}
        <div className="bg-brand-paper rounded-3xl border border-brand-charcoal/10 shadow-soft p-6 flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Student Segments (K-Means)
              </span>
              <p className="text-xs text-brand-charcoal/60 mt-0.5 font-medium">
                Review clusters by satisfaction profile (K-Means, k=3)
              </p>
            </div>
            <SegmentBadgeList clusterSummary={clusterSummary} />
          </div>
          {showDWM && (
            <p className="text-[10px] uppercase font-bold text-brand-charcoal/50 mt-2">
              Powered by: K-Means Clustering (k=3)
            </p>
          )}
        </div>

        {/* Widget 4: Hierarchical Groupings (Agglomerative) */}
        <HierarchicalGroupingsCard
          hierarchicalGroupings={hierarchicalGroupings}
          showDWM={showDWM}
        />

        {/* Widget 5: Association Rules (Apriori) */}
        <div className="bg-brand-paper rounded-3xl border border-brand-charcoal/10 shadow-soft p-6 flex flex-col justify-between md:col-span-2">
          <div>
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Co-Occurring Weaknesses (Apriori Rules)
              </span>
              <p className="text-xs text-brand-charcoal/60 mt-0.5 font-medium">
                Frequently associated low-rating patterns discovered via association rule mining
              </p>
            </div>
            <AssociationRuleChips associationRules={associationRules} />
          </div>
          {showDWM && (
            <p className="text-[10px] uppercase font-bold text-brand-charcoal/50 mt-2">
              Powered by: Apriori Association Rule Mining
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
