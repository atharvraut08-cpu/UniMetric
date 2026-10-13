/**
 * AssociationRuleChips.jsx
 * Renders Apriori association rules with high-contrast Soft Neo-Brutalism styling:
 * Solid White/Cream backgrounds, thick Charcoal borders, dark text, and solid Coral warning icons.
 */
import { useState } from 'react';
import { AlertTriangle, ArrowRight, HelpCircle, Layers, Sparkles } from 'lucide-react';

function RuleChip({ rule, index = 0 }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isFirst = index === 0;

  // Parse rule: e.g. "Low Canteen & Food Quality + No Recommend → Low Hostel & Accommodation"
  const arrow = rule.rule.includes('→') ? '→' : (rule.rule.includes('->') ? '->' : null);
  let antecedents = [];
  let consequents = [];

  if (arrow) {
    const [ifPart, thenPart] = rule.rule.split(arrow).map((s) => s.trim());
    antecedents = ifPart ? ifPart.split('+').map((s) => s.trim()) : [];
    consequents = thenPart ? thenPart.split('+').map((s) => s.trim()) : [];
  }

  const confidencePct = rule.confidence != null ? Math.round(rule.confidence * 100) : null;
  const liftVal = rule.lift != null ? rule.lift.toFixed(2) : null;
  const supportPct = rule.support != null ? (rule.support * 100).toFixed(1) : null;

  return (
    <div className="relative">
      <div
        className="bg-brand-paper border-2 border-brand-charcoal rounded-2xl p-3.5 md:p-4 shadow-[3px_3px_0px_#191919] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#191919] transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        tabIndex={0}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        role="article"
        aria-label={`Rule: ${rule.rule}, Confidence: ${confidencePct}%, Lift: ${liftVal}x`}
      >
        {/* Left: Warning Icon & Rule Expression */}
        <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
          {/* Solid Coral Warning Badge */}
          <div className="w-8 h-8 rounded-xl bg-brand-coral border-2 border-brand-charcoal flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#191919]">
            <AlertTriangle className="w-4 h-4 text-brand-paper stroke-[2.5]" />
          </div>

          {/* Rule Statement */}
          <div className="flex-1 min-w-0">
            {arrow && antecedents.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm">
                {/* Antecedent conditions */}
                <div className="flex flex-wrap items-center gap-1">
                  {antecedents.map((cond, idx) => (
                    <span
                      key={idx}
                      className="bg-brand-cream border-2 border-brand-charcoal/30 px-2 py-0.5 rounded-lg font-bold text-brand-charcoal shadow-xs"
                    >
                      {cond}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <span className="inline-flex items-center text-brand-coral font-black px-0.5">
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </span>

                {/* Consequent outcome */}
                <div className="flex flex-wrap items-center gap-1">
                  {consequents.map((out, idx) => (
                    <span
                      key={idx}
                      className="bg-brand-coral/15 border-2 border-brand-charcoal text-brand-charcoal px-2 py-0.5 rounded-lg font-black shadow-xs"
                    >
                      {out}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <span className="font-bold text-brand-charcoal text-xs md:text-sm">
                {rule.rule}
              </span>
            )}
          </div>
        </div>

        {/* Right: Solid Metrics Badges */}
        <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0 border-t border-brand-charcoal/10 md:border-t-0">
          {/* Confidence Badge (Yellow) */}
          {confidencePct != null && (
            <div
              className="bg-brand-yellow text-brand-charcoal border-2 border-brand-charcoal px-2.5 py-1 rounded-xl text-xs font-black shadow-[1.5px_1.5px_0px_#191919] flex items-center gap-1"
              title="Confidence: Conditional probability of the consequence"
            >
              <span className="text-[10px] uppercase font-bold text-brand-charcoal/70">Conf</span>
              <span>{confidencePct}%</span>
            </div>
          )}

          {/* Lift Badge (Purple) */}
          {liftVal != null && (
            <div
              className="bg-brand-purple text-brand-charcoal border-2 border-brand-charcoal px-2.5 py-1 rounded-xl text-xs font-black shadow-[1.5px_1.5px_0px_#191919] flex items-center gap-1"
              title="Lift: Association strength vs. random baseline"
            >
              <span className="text-[10px] uppercase font-bold text-brand-charcoal/70">Lift</span>
              <span>{liftVal}x</span>
            </div>
          )}

          {/* Support Badge (Blue) */}
          {supportPct != null && (
            <div
              className="bg-brand-blue text-brand-charcoal border-2 border-brand-charcoal px-2 py-1 rounded-xl text-[11px] font-bold shadow-[1.5px_1.5px_0px_#191919] hidden sm:flex items-center gap-1"
              title="Support: Overall frequency across all reviews"
            >
              <span className="text-[9px] uppercase font-bold text-brand-charcoal/70">Supp</span>
              <span>{supportPct}%</span>
            </div>
          )}
        </div>
      </div>

      {/* High-Contrast Floating Tooltip Popover */}
      {showTooltip && (
        <div
          className={`absolute z-30 left-2 ${
            isFirst ? 'top-full mt-2' : 'bottom-full mb-2'
          } max-w-sm px-3.5 py-2.5 rounded-xl border-2 border-brand-charcoal bg-brand-charcoal text-brand-paper text-xs shadow-[4px_4px_0px_#F4633E] pointer-events-none animate-fade-in`}
        >
          <div className="font-bold text-brand-yellow mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Association Rule Insight</span>
          </div>
          <p className="text-brand-paper/90 leading-relaxed">
            When students report <strong className="text-brand-blue">{antecedents.join(' + ') || 'antecedent factors'}</strong>, there is a{' '}
            <strong className="text-brand-yellow">{confidencePct}% chance</strong> they also report{' '}
            <strong className="text-brand-coral">{consequents.join(' + ') || 'consequent factors'}</strong>.
          </p>
          <div className="mt-2 pt-1.5 border-t border-brand-paper/20 flex items-center justify-between text-[10px] text-brand-paper/70 font-semibold">
            <span>Lift: {liftVal}x baseline likelihood</span>
            {supportPct && <span>Support: {supportPct}% total dataset</span>}
          </div>
          {isFirst ? (
            <div className="absolute left-6 bottom-full border-4 border-transparent border-b-brand-charcoal" />
          ) : (
            <div className="absolute left-6 top-full border-4 border-transparent border-t-brand-charcoal" />
          )}
        </div>
      )}
    </div>
  );
}

export default function AssociationRuleChips({ associationRules }) {
  if (!associationRules || associationRules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-brand-cream border-2 border-dashed border-brand-charcoal/30 rounded-2xl shadow-soft">
        <div className="w-10 h-10 rounded-2xl bg-brand-coral/20 border-2 border-brand-coral flex items-center justify-center mb-2">
          <AlertTriangle className="w-5 h-5 text-brand-coral" />
        </div>
        <p className="text-brand-charcoal font-bold text-sm">
          No strong co-occurrence patterns found yet.
        </p>
        <p className="text-brand-charcoal/60 text-xs mt-1 max-w-md font-medium">
          Ratings for this college do not currently exhibit compound dissatisfaction combinations exceeding the minimum support threshold (5%).
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Rule List */}
      <div className="space-y-2.5">
        {associationRules.map((rule, i) => (
          <RuleChip key={i} index={i} rule={rule} />
        ))}
      </div>

      {/* Helper Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-charcoal/10 text-[11px] font-semibold text-brand-charcoal/70">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-brand-coral border border-brand-charcoal" />
            <span>Coral: Warning Consequence</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-brand-yellow border border-brand-charcoal" />
            <span>Yellow: Confidence (%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-brand-purple border border-brand-charcoal" />
            <span>Purple: Lift Multiplier</span>
          </span>
        </div>
        <span className="text-[10px] text-brand-charcoal/50 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" />
          Hover over each rule card to inspect probability metrics
        </span>
      </div>
    </div>
  );
}
