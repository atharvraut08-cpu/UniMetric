import React from 'react';
import { GitFork, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import PredictiveRecommendGauge from './PredictiveRecommendGauge';

export default function ClassificationComparisonCard({
  predictiveRecommendScore,
  classifierAccuracy,
  decisionTreeAccuracy,
  decisionTreeTopFeatures = [],
  showDWM = false,
}) {
  const gnbAcc = classifierAccuracy != null ? Math.round(classifierAccuracy * 100) : null;
  const dtAcc = decisionTreeAccuracy != null ? Math.round(decisionTreeAccuracy * 100) : null;

  return (
    <div className="bg-brand-paper rounded-3xl border border-brand-charcoal/10 shadow-soft p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-brand-coral" />
              Classification Comparison
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-yellow/30 text-brand-charcoal border border-brand-charcoal/10">
              Dual Model
            </span>
          </div>
          <p className="text-xs text-brand-charcoal/60 mt-0.5 font-medium">
            Recommendation classification: Naive Bayes vs. Decision Tree
          </p>
        </div>

        {/* Side-by-Side Model Accuracy Badges */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Gaussian Naive Bayes */}
          <div className="bg-brand-cream/60 rounded-2xl p-3 border border-brand-charcoal/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-brand-charcoal/70 mb-1">
              <span>Naive Bayes</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-paper border border-brand-charcoal/10 font-bold">
                Probabilistic
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-brand-charcoal">
                {gnbAcc != null ? `${gnbAcc}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-brand-charcoal/50 font-medium">accuracy</span>
            </div>
            <div className="w-full bg-brand-paper rounded-full h-1.5 mt-2 overflow-hidden border border-brand-charcoal/10">
              <div
                className="bg-brand-coral h-full rounded-full transition-all duration-500"
                style={{ width: `${gnbAcc || 0}%` }}
              />
            </div>
          </div>

          {/* Decision Tree */}
          <div className="bg-brand-cream/60 rounded-2xl p-3 border border-brand-charcoal/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-brand-charcoal/70 mb-1">
              <span>Decision Tree</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-yellow/40 border border-brand-charcoal/10 font-bold text-brand-charcoal">
                ID3 / CART
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-brand-charcoal">
                {dtAcc != null ? `${dtAcc}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-brand-charcoal/50 font-medium">accuracy</span>
            </div>
            <div className="w-full bg-brand-paper rounded-full h-1.5 mt-2 overflow-hidden border border-brand-charcoal/10">
              <div
                className="bg-brand-yellow h-full rounded-full transition-all duration-500"
                style={{ width: `${dtAcc || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gauge & Top Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1 border-t border-brand-charcoal/10">
          {/* Left: Likelihood Gauge */}
          <div className="flex flex-col items-center">
            <PredictiveRecommendGauge
              score={predictiveRecommendScore}
              accuracy={null}
            />
          </div>

          {/* Right: Decision Tree Top Attributes */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-charcoal uppercase tracking-wide">
              <Sparkles className="w-3 h-3 text-brand-coral" />
              <span>Tree Top Attributes</span>
            </div>
            <p className="text-[10px] text-brand-charcoal/60 leading-tight">
              Top features driving the decision tree splits:
            </p>

            <div className="space-y-1.5 pt-0.5">
              {decisionTreeTopFeatures && decisionTreeTopFeatures.length > 0 ? (
                decisionTreeTopFeatures.slice(0, 3).map((feat, index) => {
                  const pct = feat.percentage || Math.round((feat.importance || 0) * 100);
                  return (
                    <div
                      key={index}
                      className="bg-brand-cream/80 rounded-xl px-2.5 py-1.5 border border-brand-charcoal/10 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                        <span className="w-4 h-4 rounded-full bg-brand-charcoal text-brand-paper text-[10px] font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-brand-charcoal text-[11px] truncate">
                          {feat.feature}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-coral px-1.5 py-0.5 rounded bg-brand-paper border border-brand-charcoal/10 shrink-0">
                        {pct}%
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-[11px] text-brand-charcoal/50 italic">
                  Run pipeline to extract attribute relevance.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2.5 border-t border-brand-charcoal/10 flex items-center justify-between text-[10px] text-brand-charcoal/60 font-semibold">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Held-out test split validated
        </span>
        {showDWM && (
          <span className="uppercase tracking-wider text-brand-coral">
            Naive Bayes + Decision Tree
          </span>
        )}
      </div>
    </div>
  );
}
