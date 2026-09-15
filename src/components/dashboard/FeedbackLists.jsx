import { useState } from 'react';
import { ThumbsUp, AlertTriangle, Lightbulb } from 'lucide-react';

const TABS = [
  { key: 'positive',    label: 'Positive',    icon: ThumbsUp,      color: 'emerald' },
  { key: 'complaints',  label: 'Complaints',  icon: AlertTriangle, color: 'rose'    },
  { key: 'suggestions', label: 'Suggestions', icon: Lightbulb,     color: 'amber'   },
];

const dotColors = {
  emerald: 'bg-emerald-400',
  rose:    'bg-rose-400',
  amber:   'bg-amber-400',
};

const activeTab = {
  emerald: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
  rose:    'border-rose-500/50 text-rose-400 bg-rose-500/10',
  amber:   'border-amber-500/50 text-amber-400 bg-amber-500/10',
};

const itemBorderColor = {
  emerald: 'border-l-emerald-500/40',
  rose:    'border-l-rose-500/40',
  amber:   'border-l-amber-500/40',
};

/**
 * Tabbed list of Positive feedback, Complaints, and Suggestions.
 */
export default function FeedbackLists({ feedback }) {
  const [activeKey, setActiveKey] = useState('positive');

  const activeTabConfig = TABS.find((t) => t.key === activeKey);
  const items = feedback?.[activeKey] ?? [];

  return (
    <div className="glass-card p-6">
      <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4">Student Feedback</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setActiveKey(key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
              activeKey === key
                ? activeTab[color]
                : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300 bg-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span className="ml-1 text-xs opacity-70">({feedback?.[key]?.length ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Items */}
      <ul className="space-y-3">
        {items.length === 0 && (
          <li className="text-slate-500 text-sm py-4 text-center">No entries in this category.</li>
        )}
        {items.map((item, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-3 pl-3 border-l-2 py-1 animate-fade-in ${itemBorderColor[activeTabConfig?.color]}`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[activeTabConfig?.color]}`} />
            <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
