import { useState } from 'react';
import { ThumbsUp, AlertTriangle, Lightbulb } from 'lucide-react';

const TABS = [
  { key: 'positive',    label: 'Positive',    icon: ThumbsUp,      color: 'emerald' },
  { key: 'complaints',  label: 'Complaints',  icon: AlertTriangle, color: 'rose'    },
  { key: 'suggestions', label: 'Suggestions', icon: Lightbulb,     color: 'amber'   },
];

const dotColors = {
  emerald: 'bg-emerald-500',
  rose:    'bg-rose-500',
  amber:   'bg-amber-500',
};

const activeTab = {
  emerald: 'border-emerald-500/60 text-emerald-900 bg-emerald-100/70 shadow-soft',
  rose:    'border-rose-500/60 text-rose-900 bg-rose-100/70 shadow-soft',
  amber:   'border-amber-500/60 text-amber-900 bg-amber-100/70 shadow-soft',
};

const itemBorderColor = {
  emerald: 'border-l-emerald-500',
  rose:    'border-l-rose-500',
  amber:   'border-l-amber-500',
};

/**
 * Tabbed list of Positive feedback, Complaints, and Suggestions.
 * Styled with light Soft Neo-Brutalism theme and rounded-3xl.
 */
export default function FeedbackLists({ feedback }) {
  const [activeKey, setActiveKey] = useState('positive');

  const activeTabConfig = TABS.find((t) => t.key === activeKey);
  const items = feedback?.[activeKey] ?? [];

  return (
    <div className="bg-brand-paper rounded-3xl p-6 border border-brand-charcoal/10 shadow-soft">
      <h3 className="text-brand-charcoal text-sm font-bold uppercase tracking-wider mb-4">Student Feedback</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setActiveKey(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
              activeKey === key
                ? activeTab[color]
                : 'border-brand-charcoal/15 text-brand-charcoal/70 hover:border-brand-charcoal/30 hover:text-brand-charcoal hover:bg-brand-cream/80 bg-brand-cream/30'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span className="ml-1 text-xs opacity-75 font-normal">({feedback?.[key]?.length ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Items */}
      <ul className="space-y-3">
        {items.length === 0 && (
          <li className="text-brand-charcoal/60 text-sm py-4 text-center font-medium">No entries in this category.</li>
        )}
        {items.map((item, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-3 pl-3 border-l-3 py-1.5 animate-fade-in ${itemBorderColor[activeTabConfig?.color]}`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[activeTabConfig?.color]}`} />
            <p className="text-brand-charcoal text-sm leading-relaxed font-medium">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
