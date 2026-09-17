import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, BarChart3, TrendingUp, AlertTriangle,
  ArrowRight, Clock, CheckCircle2, XCircle, MinusCircle,
  GraduationCap, Activity,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { getColleges } from '../services/mockDataService';

/* ─── Mock recent activity data ──────────────────────────────── */
const recentActivity = [
  {
    type: 'review',
    user: 'rahul.sharma@mit.ac.in',
    college: 'Mumbai Institute of Technology',
    program: 'Computer Engineering',
    sentiment: 'positive',
    time: 'Today, 2:14 PM',
  },
  {
    type: 'signup',
    user: 'priya.mehta@student.in',
    college: null,
    program: null,
    role: 'Student',
    time: 'Today, 11:47 AM',
  },
  {
    type: 'review',
    user: 'ankit.jain@dce.edu',
    college: 'Delhi College of Engineering',
    program: 'Computer Science',
    sentiment: 'positive',
    time: 'Today, 11:09 AM',
  },
  {
    type: 'signup',
    user: 'kavita.rao@gmail.com',
    college: null,
    program: null,
    role: 'Prospect',
    time: 'Yesterday, 9:30 PM',
  },
  {
    type: 'review',
    user: 'siddharth.k@bits.ac.in',
    college: 'Bengaluru Inst. of Sci. & Tech',
    program: 'Biotechnology',
    sentiment: 'negative',
    time: 'Yesterday, 6:18 PM',
  },
  {
    type: 'review',
    user: 'meena.v@pune.edu',
    college: 'Pune Vishwavidyalaya',
    program: 'Arts & Humanities',
    sentiment: 'neutral',
    time: 'Yesterday, 2:00 PM',
  },
  {
    type: 'signup',
    user: 'arjun.nair@gmail.com',
    college: null,
    program: null,
    role: 'Student',
    time: '2 days ago',
  },
  {
    type: 'review',
    user: 'deepak.roy@hyd.edu',
    college: 'Hyderabad Inst. of Management',
    program: 'MBA',
    sentiment: 'positive',
    time: '2 days ago',
  },
];

/* ─── Sentiment pill styling ─────────────────────────────────── */
const sentimentStyle = {
  positive: {
    pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    icon: CheckCircle2,
  },
  neutral: {
    pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    icon: MinusCircle,
  },
  negative: {
    pill: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
    icon: XCircle,
  },
};

/* ─── Role pill styling ──────────────────────────────────────── */
const roleStyle = {
  Student:  'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
  Prospect: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
  Admin:    'bg-amber-500/15  text-amber-400  border border-amber-500/20',
};

/* ─── Activity row ───────────────────────────────────────────── */
function ActivityRow({ item }) {
  const isReview = item.type === 'review';
  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
        isReview ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
      }`}>
        {isReview
          ? <BarChart3 className="w-4 h-4 text-indigo-400" />
          : <Users className="w-4 h-4 text-emerald-400" />}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{item.user}</p>
        <p className="text-slate-500 text-xs mt-0.5 truncate">
          {isReview
            ? `${item.college} · ${item.program}`
            : `New ${item.role} registration`}
        </p>
      </div>

      {/* Badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {isReview ? (
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${sentimentStyle[item.sentiment].pill}`}>
            {item.sentiment}
          </span>
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full ${roleStyle[item.role]}`}>
            {item.role}
          </span>
        )}
        <span className="text-xs text-slate-600 whitespace-nowrap">{item.time}</span>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const { role, user, isAuthenticated } = useRole();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  /* Role guard – redirect non-admins immediately */
  useEffect(() => {
    if (!isAuthenticated || role !== 'Admin') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  /* Fetch live stats from /api/colleges/ */
  useEffect(() => {
    if (role === 'Admin') {
      getColleges()
        .then(setColleges)
        .catch(console.error)
        .finally(() => setLoadingStats(false));
    }
  }, [role]);

  /* Don't render until we know the user is Admin */
  if (!isAuthenticated || role !== 'Admin') return null;

  const totalColleges  = colleges.length;
  const totalReviews   = colleges.reduce((sum, c) => sum + (c.unique_reviews || c.totalReviews || 0), 0);

  const statCards = [
    {
      icon: Users,
      label: 'Total Registered Students',
      value: '1,247',
      sub: 'Mock — no user endpoint yet',
      color: 'text-indigo-400',
      glow: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: GraduationCap,
      label: 'Colleges Indexed',
      value: loadingStats ? '—' : totalColleges,
      sub: 'Live from /api/colleges/',
      color: 'text-violet-400',
      glow: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Total Reviews Submitted',
      value: loadingStats ? '—' : totalReviews,
      sub: 'Aggregated across all colleges',
      color: 'text-emerald-400',
      glow: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const reviewActivity = recentActivity.filter(a => a.type === 'review');
  const signupActivity = recentActivity.filter(a => a.type === 'signup');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Logged in as <span className="text-amber-400 font-medium">{user?.name || user?.email || 'Admin'}</span>
            </p>
          </div>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Platform Active
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in-up delay-100">
        {statCards.map(({ icon: Icon, label, value, sub, color, glow }) => (
          <div key={label} className={`glass-card p-6 border ${glow}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl border ${glow} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-700" />
            </div>
            <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-white text-sm font-medium">{label}</div>
            <div className="text-slate-600 text-xs mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Activity + Quick Stats Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">

        {/* Recent Platform Activity (spans 2 cols) */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h2 className="text-white font-semibold text-sm">Recent Platform Activity</h2>
            </div>
            <span className="text-xs text-slate-600 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
              Mock data
            </span>
          </div>
          <div className="divide-y divide-slate-800/70">
            {recentActivity.map((item, i) => (
              <ActivityRow key={i} item={item} />
            ))}
          </div>
        </div>

        {/* Sidebar quick stats */}
        <div className="flex flex-col gap-4">

          {/* Submission sentiment split */}
          <div className="glass-card p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Sentiment Breakdown</h3>
            {[
              { label: 'Positive', count: reviewActivity.filter(r => r.sentiment === 'positive').length, style: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10 text-emerald-400' },
              { label: 'Neutral',  count: reviewActivity.filter(r => r.sentiment === 'neutral').length,  style: 'from-amber-500 to-yellow-500',  bg: 'bg-amber-500/10 text-amber-400'  },
              { label: 'Negative', count: reviewActivity.filter(r => r.sentiment === 'negative').length, style: 'from-rose-500 to-pink-500',       bg: 'bg-rose-500/10 text-rose-400'   },
            ].map(({ label, count, style, bg }) => (
              <div key={label} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{label}</span>
                  <span className={`font-semibold px-1.5 py-0.5 rounded ${bg}`}>{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${style} transition-all duration-700`}
                    style={{ width: `${Math.round((count / reviewActivity.length) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* New sign-ups */}
          <div className="glass-card p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm font-semibold">New Sign-ups</h3>
              <span className="text-xs text-slate-500">{signupActivity.length} recent</span>
            </div>
            <div className="space-y-3">
              {signupActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-xs font-medium truncate">{item.user}</p>
                    <p className="text-slate-600 text-xs">{item.time}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${roleStyle[item.role]}`}>
                    {item.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Flagged reviews */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-white text-sm font-semibold">Flagged Reviews</h3>
            </div>
            <p className="text-3xl font-bold text-amber-400 mt-2">0</p>
            <p className="text-slate-600 text-xs mt-0.5">No reviews pending moderation</p>
          </div>

        </div>
      </div>

      {/* ── Platform Info Bar ── */}
      <div className="glass-card px-6 py-4 flex flex-wrap items-center justify-between gap-4 animate-fade-in-up delay-300">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Clock className="w-3.5 h-3.5" />
          Last pipeline run: <span className="text-slate-300 ml-1">Check Django: <code className="text-indigo-400 font-mono">python manage.py run_analytics_pipeline</code></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Django API connected · PostgreSQL (Supabase)
        </div>
      </div>

    </div>
  );
}
