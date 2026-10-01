import React from 'react';
import { Network, Layers, Sparkles, Star } from 'lucide-react';

export default function HierarchicalGroupingsCard({
  hierarchicalGroupings = [],
  showDWM = false,
}) {
  const hasGroupings = Array.isArray(hierarchicalGroupings) && hierarchicalGroupings.length > 0;

  return (
    <div className="bg-brand-paper rounded-3xl border border-brand-charcoal/10 shadow-soft p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-brand-purple" />
              Hierarchical Groupings
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-charcoal border border-brand-charcoal/10">
              Agglomerative
            </span>
          </div>
          <p className="text-xs text-brand-charcoal/60 mt-0.5 font-medium">
            High-level cluster splits grouping campus evaluation dimensions (Ward&apos;s Linkage)
          </p>
        </div>

        {/* Splits List */}
        {!hasGroupings ? (
          <div className="py-6 text-center text-xs text-brand-charcoal/50 italic bg-brand-cream/40 rounded-2xl border border-brand-charcoal/10">
            No hierarchical splits computed yet. Run the analytics pipeline.
          </div>
        ) : (
          <div className="space-y-3">
            {hierarchicalGroupings.map((split, idx) => {
              const borderColors = [
                'border-l-brand-coral',
                'border-l-brand-yellow',
                'border-l-brand-blue',
                'border-l-brand-purple',
              ];
              const badgeColors = [
                'bg-brand-coral/10 text-brand-charcoal',
                'bg-brand-yellow/20 text-brand-charcoal',
                'bg-brand-blue/20 text-brand-charcoal',
                'bg-brand-purple/20 text-brand-charcoal',
              ];
              const borderColor = borderColors[idx % borderColors.length];
              const badgeColor = badgeColors[idx % badgeColors.length];

              return (
                <div
                  key={idx}
                  className={`bg-brand-cream/60 rounded-2xl p-3 border border-brand-charcoal/10 border-l-4 ${borderColor} space-y-2`}
                >
                  {/* Split title & meta */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-brand-charcoal truncate">
                      {split.split_name || `Cluster Split ${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {split.average_score != null && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-paper border border-brand-charcoal/10 text-brand-charcoal">
                          <Star className="w-2.5 h-2.5 fill-brand-yellow text-brand-yellow" />
                          {split.average_score}
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor} border border-brand-charcoal/10`}>
                        {split.category_count || split.categories?.length || 0} factors
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  {split.summary && (
                    <p className="text-[10px] text-brand-charcoal/70 leading-snug">
                      {split.summary}
                    </p>
                  )}

                  {/* Category Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(split.categories || []).map((cat, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-brand-paper border border-brand-charcoal/10 text-brand-charcoal font-medium shadow-xs"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2.5 border-t border-brand-charcoal/10 flex items-center justify-between text-[10px] text-brand-charcoal/60 font-semibold">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-brand-purple" />
          Bottom-up hierarchical merging
        </span>
        {showDWM && (
          <span className="uppercase tracking-wider text-brand-purple">
            Agglomerative Clustering
          </span>
        )}
      </div>
    </div>
  );
}
