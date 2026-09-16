/**
 * AssociationRuleChips.jsx
 * Renders Apriori association rules as pill/chip components with
 * confidence and lift shown on hover.
 */
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

function RuleChip({ rule }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-300 text-xs font-medium cursor-pointer hover:border-rose-500/50 hover:bg-rose-500/20 transition-all duration-150 select-none"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AlertTriangle className="w-3 h-3 flex-shrink-0 text-rose-400" />
        <span>{rule.rule}</span>
      </div>
      {showTooltip && (
        <div className="absolute z-20 left-0 bottom-full mb-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300 whitespace-nowrap shadow-xl">
          <div className="flex gap-4">
            <span>Confidence: <span className="text-amber-300 font-semibold">{(rule.confidence * 100).toFixed(0)}%</span></span>
            <span>Lift: <span className="text-indigo-300 font-semibold">{rule.lift.toFixed(2)}x</span></span>
          </div>
          <div className="absolute left-4 top-full border-4 border-transparent border-t-slate-700" />
        </div>
      )}
    </div>
  );
}

export default function AssociationRuleChips({ associationRules }) {
  if (!associationRules || associationRules.length === 0) {
    return (
      <div className="flex items-center justify-center h-16 text-slate-500 text-sm">
        No strong co-occurrence patterns found yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {associationRules.map((rule, i) => (
        <RuleChip key={i} rule={rule} />
      ))}
      <p className="text-xs text-slate-600 mt-1">
        Hover over each rule to see confidence and lift metrics.
      </p>
    </div>
  );
}
