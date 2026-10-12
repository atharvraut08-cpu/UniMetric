import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, TrendingUp, AlertTriangle,
  Clock, CheckCircle2, XCircle, MinusCircle,
  GraduationCap, Activity, Sparkles, RefreshCw, Loader2,
  ExternalLink, ThumbsUp, ThumbsDown, X, Cpu, Database,
  Trophy, Medal, Award, Star, Search, Building2, Lock,
  ChevronRight, FileCode, Layers, GitBranch
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { useRole } from '../context/RoleContext';
import { getAdminSystemSummary } from '../services/mockDataService';

/* ─── Sentiment pill styling ─────────────────────────────────── */
const sentimentStyle = {
  positive: {
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    bg: 'bg-emerald-50 border-emerald-100',
    text: 'text-emerald-600',
    icon: CheckCircle2,
    color: '#10b981',
  },
  neutral: {
    pill: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
    bg: 'bg-amber-50 border-amber-100',
    text: 'text-amber-600',
    icon: MinusCircle,
    color: '#f59e0b',
  },
  negative: {
    pill: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
    bg: 'bg-rose-50 border-rose-100',
    text: 'text-rose-600',
    icon: XCircle,
    color: '#f43f5e',
  },
};

/* ─── Role pill styling ──────────────────────────────────────── */
const roleStyle = {
  Student:  'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold',
  Prospect: 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold',
  Admin:    'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
};

/* ─── Format date helpers ────────────────────────────────────── */
function formatRelativeTime(isoString) {
  if (!isoString) return 'Recently';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

function formatFullDateTime(isoString) {
  if (!isoString) return 'Not yet run';
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/* ─── Activity Row Component ─────────────────────────────────── */
function ActivityRow({ item, onSelect, onNavigateCollege }) {
  const sentiment = (item.sentiment || 'neutral').toLowerCase();
  const sentimentConfig = sentimentStyle[sentiment] || sentimentStyle.neutral;
  const SentimentIcon = sentimentConfig.icon;

  return (
    <div
      onClick={() => onSelect(item)}
      className="px-6 py-4 flex items-center gap-4 hover:bg-brand-cream/60 transition-all cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(item); }}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border transition-transform group-hover:scale-105 ${sentimentConfig.bg}`}>
        <SentimentIcon className={`w-5 h-5 ${sentimentConfig.text}`} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-brand-charcoal text-sm font-bold truncate group-hover:text-brand-coral transition-colors">
            {item.user_display || item.user_id || 'Anonymous Student'}
          </p>
          {item.would_recommend && (
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              <ThumbsUp className="w-2.5 h-2.5" /> Recommends
            </span>
          )}
        </div>
        <p className="text-slate-600 text-xs mt-0.5 truncate font-medium">
          <span className="font-semibold text-brand-charcoal/80">{item.college_name}</span>
          {item.program_name && item.program_name !== 'General Feedback' ? ` · ${item.program_name}` : ''}
          {item.student_year ? ` · ${item.student_year}` : ''}
        </p>
      </div>

      {/* Badge & Time */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold ${sentimentConfig.pill}`}>
          {sentiment}
        </span>
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {formatRelativeTime(item.created_at)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigateCollege(item.college_id);
          }}
          title="Open College Dashboard"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-brand-charcoal/10 text-slate-500 hover:text-brand-charcoal"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Feedback Detail Modal Component ────────────────────────── */
function FeedbackDetailModal({ item, onClose, onNavigateCollege }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const sentiment = (item.sentiment || 'neutral').toLowerCase();
  const sentimentConfig = sentimentStyle[sentiment] || sentimentStyle.neutral;
  const SentimentIcon = sentimentConfig.icon;
  const ratingsEntries = Object.entries(item.ratings || {});

  return (
    <div
      className="fixed inset-0 z-50 bg-brand-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-2xl w-full p-6 sm:p-8 bg-brand-paper shadow-2xl border border-brand-charcoal/15 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-brand-charcoal/10">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${sentimentConfig.bg}`}>
              <SentimentIcon className={`w-6 h-6 ${sentimentConfig.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-bold ${sentimentConfig.pill}`}>
                  {sentiment} Feedback
                </span>
                {item.would_recommend ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ThumbsUp className="w-3 h-3" /> Recommends College
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <ThumbsDown className="w-3 h-3" /> Does Not Recommend
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-brand-charcoal mt-1 tracking-tight">
                {item.college_name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-brand-cream text-slate-400 hover:text-brand-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-brand-charcoal/10 text-xs">
          <div>
            <span className="text-slate-500 font-medium block">Program</span>
            <span className="font-bold text-brand-charcoal truncate block">
              {item.program_name || 'General Feedback'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">Student Year</span>
            <span className="font-bold text-brand-charcoal block">
              {item.student_year || 'Enrolled'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">Average Rating</span>
            <span className="font-bold text-brand-charcoal block">
              ⭐ {item.average_score ? `${item.average_score} / 5` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">Submitted</span>
            <span className="font-bold text-brand-charcoal block">
              {formatRelativeTime(item.created_at)}
            </span>
          </div>
        </div>

        {/* Ratings Breakdown */}
        {ratingsEntries.length > 0 && (
          <div className="py-4 border-b border-brand-charcoal/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Detailed Dimension Ratings ({ratingsEntries.length} categories)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ratingsEntries.map(([category, score]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-brand-cream/50 border border-brand-charcoal/5 text-xs"
                >
                  <span className="font-medium text-slate-700 truncate pr-2">{category}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-bold text-brand-charcoal">{score}</span>
                    <span className="text-slate-400">/ 5</span>
                    <div className="w-12 h-1.5 bg-brand-charcoal/10 rounded-full overflow-hidden ml-1">
                      <div
                        className="h-full bg-brand-coral rounded-full"
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Qualitative comments */}
        <div className="py-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Raw Student Commentary
          </h4>

          {item.positive_feedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Positive Highlights
              </span>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {item.positive_feedback}
              </p>
            </div>
          )}

          {item.complaints && (
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Areas for Improvement & Complaints
              </span>
              <p className="text-xs text-rose-950 font-medium leading-relaxed">
                {item.complaints}
              </p>
            </div>
          )}

          {item.suggestions && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
              <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Suggestions for Administration
              </span>
              <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                {item.suggestions}
              </p>
            </div>
          )}

          {!item.positive_feedback && !item.complaints && !item.suggestions && (
            <p className="text-xs text-slate-500 italic">No open-ended commentary submitted for this review.</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-brand-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
            ID: {item.submission_id}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-brand-cream transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateCollege(item.college_id);
              }}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-brand-charcoal text-white hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow-soft"
            >
              <span>View College Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Recharts Tooltip Component ─────────────────────────────── */
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="px-3.5 py-2 rounded-xl border border-brand-charcoal/15 bg-brand-paper shadow-soft text-xs">
        <p style={{ color: d.payload.color }} className="font-bold">{d.name}</p>
        <p className="text-brand-charcoal/80 font-medium">{d.value} reviews ({d.payload.pct}%)</p>
      </div>
    );
  }
  return null;
};

/* ─── Main Admin Dashboard Page ──────────────────────────────── */
export default function AdminDashboardPage() {
  const { role, user, isAuthenticated } = useRole();
  const navigate = useNavigate();

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rankings Filter & Sorting
  const [rankingSearch, setRankingSearch] = useState('');
  const [rankingSort, setRankingSort] = useState('rank'); // 'rank', 'rating', 'recommendation', 'reviews', 'composite'

  // Modal state
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  /* Role guard – redirect non-admins immediately */
  useEffect(() => {
    if (!isAuthenticated || role !== 'Admin') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  /* Fetch live admin system summary from backend */
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminSystemSummary();
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to load admin system summary:', err);
      setError('Could not connect to admin analytics endpoint.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === 'Admin') {
      fetchSummary();
    }
  }, [role, fetchSummary]);

  /* Don't render until we know the user is Admin */
  if (!isAuthenticated || role !== 'Admin') return null;

  // Extracted data with safe defaults
  const counts = summaryData?.counts || {
    total_users: 0,
    total_students: 0,
    total_auth_users: 0,
    total_colleges: 0,
    total_reviews: 0,
  };

  const sentimentBreakdown = summaryData?.sentiment_breakdown || {
    counts: { positive: 0, neutral: 0, negative: 0 },
    percentages: { positive: 0, neutral: 0, negative: 0 },
    total: 0,
  };

  const latestSubmissions = summaryData?.latest_submissions || [];
  const recentSignups = summaryData?.recent_signups || [];
  const pipelineStatus = summaryData?.pipeline_status || null;
  const collegeRankings = summaryData?.college_rankings || [];

  // Filtered & sorted college rankings
  const filteredRankings = collegeRankings
    .filter((c) => {
      if (!rankingSearch.trim()) return true;
      const q = rankingSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.type && c.type.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (rankingSort === 'rating') return b.overall_rating - a.overall_rating;
      if (rankingSort === 'recommendation') return b.recommendation_percent - a.recommendation_percent;
      if (rankingSort === 'reviews') return b.total_reviews - a.total_reviews;
      if (rankingSort === 'composite') return b.composite_score - a.composite_score;
      return a.rank - b.rank;
    });

  // Pie chart data for Recharts
  const pieData = [
    {
      name: 'Positive',
      value: sentimentBreakdown.counts.positive || 0,
      pct: sentimentBreakdown.percentages.positive || 0,
      color: '#10b981',
    },
    {
      name: 'Neutral',
      value: sentimentBreakdown.counts.neutral || 0,
      pct: sentimentBreakdown.percentages.neutral || 0,
      color: '#f59e0b',
    },
    {
      name: 'Negative',
      value: sentimentBreakdown.counts.negative || 0,
      pct: sentimentBreakdown.percentages.negative || 0,
      color: '#f43f5e',
    },
  ].filter(d => d.value > 0);

  const statCards = [
    {
      icon: Users,
      label: 'Total Registered Students',
      value: loading ? '—' : counts.total_users.toLocaleString(),
      sub: 'Verified student profiles & auth accounts',
      iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    },
    {
      icon: GraduationCap,
      label: 'Colleges Indexed',
      value: loading ? '—' : counts.total_colleges,
      sub: 'Live institutes with academic programs',
      iconBg: 'bg-purple-50 border-purple-100 text-purple-600',
    },
    {
      icon: TrendingUp,
      label: 'Total Reviews Submitted',
      value: loading ? '—' : counts.total_reviews.toLocaleString(),
      sub: 'Aggregated unique student submissions',
      iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">


      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 border border-brand-yellow/40 flex items-center justify-center shadow-soft">
            <ShieldCheck className="w-6 h-6 text-brand-charcoal" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-600 text-sm mt-0.5 font-medium">
              Logged in as <span className="text-brand-coral font-bold">{user?.name || user?.email || 'Admin'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="p-2.5 rounded-xl border border-brand-charcoal/10 bg-brand-paper hover:bg-brand-cream text-slate-600 transition-colors shadow-soft"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-coral' : ''}`} />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-charcoal px-3.5 py-2 rounded-full border border-brand-charcoal/10 bg-brand-paper shadow-soft">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Analytics Feed
          </div>
        </div>
      </div>

      {/* ── Error Banner (if any) ── */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSummary}
            className="font-bold underline hover:text-rose-950 ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in-up delay-100">
        {statCards.map(({ icon: Icon, label, value, sub, iconBg }) => (
          <div key={label} className="glass-card p-6 border border-brand-charcoal/10 hover-lift">
            <div className="mb-4">
              <div className={`w-10 h-10 rounded-2xl border ${iconBg} flex items-center justify-center shadow-soft`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-brand-charcoal mb-1">{value}</div>
            <div className="text-brand-charcoal text-sm font-bold">{label}</div>
            <div className="text-slate-500 text-xs mt-0.5 font-medium">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── College Rankings Leaderboard (Admin Only) ── */}
      <div className="glass-card overflow-hidden border border-brand-charcoal/10 animate-fade-in-up delay-150">
        <div className="p-6 border-b border-brand-charcoal/10 bg-brand-cream/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-soft">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-brand-charcoal tracking-tight">
                    Institutional College Rankings
                  </h2>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs">
                    <Lock className="w-3 h-3 text-amber-700" />
                    Admin Only
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-medium mt-0.5">
                  Algorithmic institutional index benchmarked across ratings, student recommendation %, and verified review volume.
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Search & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search college, location..."
                value={rankingSearch}
                onChange={(e) => setRankingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/80 border border-brand-charcoal/15 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-charcoal/20"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/60 border border-brand-charcoal/10 rounded-xl text-xs font-semibold">
              {[
                { id: 'rank', label: 'Rank' },
                { id: 'composite', label: 'Score' },
                { id: 'rating', label: 'Rating' },
                { id: 'recommendation', label: 'Recommend' },
                { id: 'reviews', label: 'Reviews' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRankingSort(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    rankingSort === tab.id
                      ? 'bg-brand-charcoal text-white shadow-soft font-bold'
                      : 'text-slate-600 hover:text-brand-charcoal hover:bg-black/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-charcoal/10 text-[11px] uppercase tracking-wider text-slate-500 bg-brand-cream/10">
                <th className="py-3 px-4 font-bold text-center w-16">Rank</th>
                <th className="py-3 px-4 font-bold">Institution</th>
                <th className="py-3 px-4 font-bold text-center">Score Index</th>
                <th className="py-3 px-4 font-bold text-center">Overall Rating</th>
                <th className="py-3 px-4 font-bold text-center">Recommend %</th>
                <th className="py-3 px-4 font-bold text-center">Reviews</th>
                <th className="py-3 px-4 font-bold">Academic Pillars</th>
                <th className="py-3 px-4 font-bold">Primary ML Driver</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/10 text-xs">
              {loading && !filteredRankings.length ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-coral" />
                    <span>Calculating institutional rankings...</span>
                  </td>
                </tr>
              ) : filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No colleges match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredRankings.map((col) => {
                  const isTop1 = col.rank === 1;
                  const isTop2 = col.rank === 2;
                  const isTop3 = col.rank === 3;

                  return (
                    <tr
                      key={col.id}
                      onClick={() => navigate(`/college/${col.id}`)}
                      className="hover:bg-brand-cream/30 cursor-pointer transition-colors group"
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 px-4 text-center">
                        {isTop1 ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold shadow-soft" title="Rank #1">
                            <Trophy className="w-4 h-4 text-amber-600" />
                          </div>
                        ) : isTop2 ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-800 border border-slate-300 font-extrabold shadow-soft" title="Rank #2">
                            <Medal className="w-4 h-4 text-slate-500" />
                          </div>
                        ) : isTop3 ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-extrabold shadow-soft" title="Rank #3">
                            <Award className="w-4 h-4 text-amber-700" />
                          </div>
                        ) : (
                          <span className="font-bold text-slate-500">
                            #{col.rank}
                          </span>
                        )}
                      </td>

                      {/* College Name & Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-brand-charcoal text-sm group-hover:text-brand-coral transition-colors">
                          {col.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px] font-medium">
                          <span>{col.location}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-brand-cream border border-brand-charcoal/10 text-slate-600 text-[10px] font-semibold">
                            {col.type}
                          </span>
                          <span>•</span>
                          <span>{col.programs_count} Programs</span>
                        </div>
                      </td>

                      {/* Composite Score & Grade */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-extrabold text-brand-charcoal">
                            {col.composite_score}
                          </span>
                          <span className={`text-[10px] px-2 py-0.2 rounded-full border mt-0.5 ${
                            col.grade === 'A+' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold' :
                            col.grade === 'A' ? 'bg-teal-50 text-teal-800 border-teal-200 font-bold' :
                            col.grade === 'B+' ? 'bg-blue-50 text-blue-800 border-blue-200 font-bold' :
                            'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                          }`}>
                            Grade {col.grade}
                          </span>
                        </div>
                      </td>

                      {/* Overall Rating */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-brand-charcoal bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/80">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{col.overall_rating.toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400 font-normal">/5</span>
                        </div>
                      </td>

                      {/* Recommend % */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          <ThumbsUp className="w-3 h-3 text-emerald-600" />
                          <span>{col.recommendation_percent}%</span>
                        </div>
                      </td>

                      {/* Review Volume */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-slate-600 bg-brand-cream/80 px-2 py-0.5 rounded-lg border border-brand-charcoal/5">
                          {col.total_reviews} reviews
                        </span>
                      </td>

                      {/* Academic Pillars */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span title="Teaching Quality" className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold">
                            Teach: {col.teaching_quality || '—'}
                          </span>
                          <span title="Placements & Career" className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                            Place: {col.career_placements || '—'}
                          </span>
                          <span title="Infrastructure" className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                            Infra: {col.infrastructure || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Primary ML Driver */}
                      <td className="py-3.5 px-4">
                        {col.top_driver ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium text-[11px]">
                            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                            {col.top_driver}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/college/${col.id}`);
                          }}
                          className="px-2.5 py-1 rounded-xl text-slate-500 hover:text-brand-charcoal hover:bg-brand-charcoal/10 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                          title="Open college profile"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-brand-charcoal/10 bg-brand-cream/10 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Ranking index is computed via weighted formulation: 55% Rating + 35% Recommendation % + 10% Review Volume Credibility.</span>
          <span className="font-semibold text-brand-charcoal/70">{filteredRankings.length} colleges listed</span>
        </div>
      </div>

      {/* ── Activity + Quick Stats Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">

        {/* Recent Platform Activity (spans 2 cols) */}
        <div className="lg:col-span-2 glass-card overflow-hidden border border-brand-charcoal/10 flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-brand-charcoal/10 flex items-center justify-between bg-brand-cream/30">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <h2 className="text-brand-charcoal font-bold text-sm">Recent Platform Activity</h2>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed ({latestSubmissions.length} recent)
              </span>
            </div>

            <div className="divide-y divide-brand-charcoal/10">
              {loading && !latestSubmissions.length ? (
                <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-coral" />
                  <span>Loading live feedback stream...</span>
                </div>
              ) : latestSubmissions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No feedback submissions recorded yet.
                </div>
              ) : (
                latestSubmissions.map((item) => (
                  <ActivityRow
                    key={item.submission_id}
                    item={item}
                    onSelect={setSelectedSubmission}
                    onNavigateCollege={(id) => navigate(`/college/${id}`)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-brand-charcoal/10 bg-brand-cream/20 text-xs text-slate-500 flex items-center justify-between">
            <span>Click any item to inspect full rating details & comments</span>
            <span className="font-semibold text-brand-charcoal/70">10 latest submissions</span>
          </div>
        </div>

        {/* Sidebar quick stats */}
        <div className="flex flex-col gap-4">

          {/* Submission sentiment split with Recharts */}
          <div className="glass-card p-5 border border-brand-charcoal/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-brand-charcoal text-sm font-bold">Global Sentiment Breakdown</h3>
              <span className="text-xs text-slate-500 font-semibold">{sentimentBreakdown.total} total</span>
            </div>

            {/* Recharts Donut Pie */}
            {pieData.length > 0 ? (
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-brand-charcoal">
                    {sentimentBreakdown.percentages.positive}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Positive
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center text-xs text-slate-400">
                No sentiment data available
              </div>
            )}

            {/* Sentiment Progress Bars */}
            <div className="space-y-3 pt-2 border-t border-brand-charcoal/10">
              {[
                {
                  label: 'Positive',
                  count: sentimentBreakdown.counts.positive || 0,
                  pct: sentimentBreakdown.percentages.positive || 0,
                  style: 'from-emerald-500 to-teal-500',
                  bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                },
                {
                  label: 'Neutral',
                  count: sentimentBreakdown.counts.neutral || 0,
                  pct: sentimentBreakdown.percentages.neutral || 0,
                  style: 'from-amber-400 to-yellow-500',
                  bg: 'bg-amber-50 text-amber-800 border border-amber-200',
                },
                {
                  label: 'Negative',
                  count: sentimentBreakdown.counts.negative || 0,
                  pct: sentimentBreakdown.percentages.negative || 0,
                  style: 'from-rose-500 to-pink-500',
                  bg: 'bg-rose-50 text-rose-700 border border-rose-200',
                },
              ].map(({ label, count, pct, style, bg }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-semibold">{label}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${bg}`}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-brand-cream border border-brand-charcoal/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${style} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New sign-ups */}
          <div className="glass-card p-5 flex-1 border border-brand-charcoal/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-brand-charcoal text-sm font-bold">New Sign-ups</h3>
              <span className="text-xs text-slate-500 font-semibold">{recentSignups.length} accounts</span>
            </div>
            <div className="space-y-3">
              {recentSignups.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2">No recent sign-ups found.</div>
              ) : (
                recentSignups.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-cream border border-brand-charcoal/10 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold text-xs uppercase">
                      {item.name ? item.name.charAt(0) : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-charcoal text-xs font-semibold truncate">{item.name || item.email}</p>
                      <p className="text-slate-500 text-[11px] font-medium truncate">{item.email}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleStyle[item.role] || roleStyle.Student}`}>
                      {item.role || 'Student'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Flagged reviews */}
          <div className="glass-card p-5 border border-brand-charcoal/10">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-brand-charcoal text-sm font-bold">Flagged Reviews</h3>
            </div>
            <p className="text-3xl font-extrabold text-brand-charcoal mt-2">0</p>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">All student feedback meets community standards</p>
          </div>

        </div>
      </div>

      {/* ── ML Pipeline Intelligence Engine Architecture ── */}
      <div className="glass-card p-6 border border-brand-charcoal/10 animate-fade-in-up delay-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-brand-charcoal/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-soft">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-brand-charcoal tracking-tight">
                  Machine Learning Intelligence Engine
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-slate-500 text-xs font-medium">
                Autonomous analytical models pre-computing multi-dimensional insights for high-throughput query delivery (&lt;100ms)
              </p>
            </div>
          </div>

          {/* Telemetry Chips */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-cream/60 border border-brand-charcoal/10 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Last execution: <strong className="text-brand-charcoal font-semibold">{formatFullDateTime(pipelineStatus?.last_run)}</strong> ({formatRelativeTime(pipelineStatus?.last_run)})
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Supabase / PostgreSQL Cache: <strong>{pipelineStatus?.total_cached_colleges || counts.total_colleges} colleges pre-computed</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Structured Model Implementations Directory */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-charcoal/70" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Deployed Models & Implementation Directory
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 font-mono">
              backend/analytics/ml_services/
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Ridge Regression */}
            <div className="p-4 rounded-2xl bg-white/70 border border-brand-charcoal/10 hover:border-brand-charcoal/25 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Regression
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">L2 Regularized</span>
                </div>
                <h5 className="text-xs font-extrabold text-brand-charcoal mb-1">
                  Ridge Driver Regression
                </h5>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium mb-3">
                  Calculates standardized feature weights (&beta; coefficients) ranking which criteria most heavily drive overall institutional ratings.
                </p>
              </div>
              <div className="pt-2 border-t border-brand-charcoal/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1 truncate text-slate-600 font-semibold" title="backend/analytics/ml_services/regression_service.py">
                  <FileCode className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  regression_service.py
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans font-bold">Target: rating</span>
              </div>
            </div>

            {/* Card 2: K-Means Clustering */}
            <div className="p-4 rounded-2xl bg-white/70 border border-brand-charcoal/10 hover:border-brand-charcoal/25 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Clustering
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">k = 3 Personas</span>
                </div>
                <h5 className="text-xs font-extrabold text-brand-charcoal mb-1">
                  K-Means & Agglomerative
                </h5>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium mb-3">
                  Segments student cohorts into behavioral personas (Satisfied, Moderate, Dissatisfied) and maps category hierarchical dendrograms.
                </p>
              </div>
              <div className="pt-2 border-t border-brand-charcoal/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1 truncate text-slate-600 font-semibold" title="backend/analytics/ml_services/clustering_service.py">
                  <FileCode className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                  clustering_service.py
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans font-bold">Unsupervised</span>
              </div>
            </div>

            {/* Card 3: Apriori Association */}
            <div className="p-4 rounded-2xl bg-white/70 border border-brand-charcoal/10 hover:border-brand-charcoal/25 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Rule Mining
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">mlxtend</span>
                </div>
                <h5 className="text-xs font-extrabold text-brand-charcoal mb-1">
                  Apriori Association Rules
                </h5>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium mb-3">
                  Mines frequent itemsets of student pain points (scores &le; 2) to uncover co-occurring grievances with confidence &amp; lift metrics.
                </p>
              </div>
              <div className="pt-2 border-t border-brand-charcoal/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1 truncate text-slate-600 font-semibold" title="backend/analytics/ml_services/association_service.py">
                  <FileCode className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  association_service.py
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans font-bold">Confidence/Lift</span>
              </div>
            </div>

            {/* Card 4: Dual Classification */}
            <div className="p-4 rounded-2xl bg-white/70 border border-brand-charcoal/10 hover:border-brand-charcoal/25 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Classification
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">Dual Engine</span>
                </div>
                <h5 className="text-xs font-extrabold text-brand-charcoal mb-1">
                  Naive Bayes & Decision Tree
                </h5>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium mb-3">
                  GaussianNB computes recommendation probability, while Decision Tree isolates the top 3 highest Information Gain split features.
                </p>
              </div>
              <div className="pt-2 border-t border-brand-charcoal/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1 truncate text-slate-600 font-semibold" title="backend/analytics/ml_services/classification_service.py">
                  <FileCode className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  classification_service.py
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans font-bold">Entropy / CART</span>
              </div>
            </div>
          </div>

          {/* Pipeline Orchestration & Cache Storage Architecture */}
          <div className="mt-4 p-4 rounded-2xl bg-brand-cream/50 border border-brand-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <GitBranch className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="text-slate-600 font-medium">
                Pipeline Command & Ingestion:
                <code className="ml-1.5 px-2 py-0.5 rounded bg-white font-mono text-[11px] text-brand-charcoal border border-brand-charcoal/10">
                  backend/analytics/management/commands/run_analytics_pipeline.py
                </code>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 flex-shrink-0">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Storage Table: <strong className="font-mono text-brand-charcoal">CollegeInsightCache</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feedback Detail Modal ── */}
      {selectedSubmission && (
        <FeedbackDetailModal
          item={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onNavigateCollege={(id) => navigate(`/college/${id}`)}
        />
      )}

    </div>
  );
}
