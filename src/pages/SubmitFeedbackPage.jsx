import { PlusCircle, Shield, Lock, ShieldCheck, BarChart3, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeedbackForm from '../components/feedback/FeedbackForm';
import { useRole } from '../context/RoleContext';
import { useState, useEffect } from 'react';
import { getColleges } from '../services/mockDataService';

/* ─── Prospect view: locked state ─── */
function ProspectView() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="inline-flex w-20 h-20 rounded-full items-center justify-center bg-slate-800 border border-slate-700 mb-6">
        <Lock className="w-9 h-9 text-slate-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Student Access Only</h1>
      <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto mb-8">
        Submitting feedback is reserved for enrolled students.
        Switch to the <strong className="text-white">Student</strong> role in the navbar to access this page,
        or log in with a student account.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/auth"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/20"
        >
          Login as Student
        </Link>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 text-sm font-medium hover:border-indigo-500/40 hover:text-white transition-all"
        >
          Browse Colleges
        </Link>
      </div>
    </div>
  );
}

/* ─── Admin view: dashboard ─── */

const recentReviews = [
  { college: 'Mumbai Institute of Technology', sentiment: 'positive', program: 'Computer Engineering', date: 'Today, 2:14 PM' },
  { college: 'Delhi College of Engineering',   sentiment: 'positive', program: 'Computer Science',      date: 'Today, 11:09 AM' },
  { college: 'Bengaluru Inst. of Sci. & Tech', sentiment: 'negative', program: 'Biotechnology',        date: 'Yesterday' },
  { college: 'Pune Vishwavidyalaya',           sentiment: 'neutral',  program: 'Arts & Humanities',    date: 'Yesterday' },
  { college: 'Hyderabad Inst. of Management',  sentiment: 'positive', program: 'MBA',                  date: '2 days ago' },
];

const sentimentPill = {
  positive: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  neutral:  'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  negative: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
};

function AdminView() {
  const [colleges, setColleges] = useState([]);
  
  useEffect(() => {
    getColleges().then(setColleges).catch(console.error);
  }, []);

  const totalColleges = colleges.length;
  const totalSubmissions = colleges.reduce((sum, c) => sum + (c.unique_reviews || 0), 0);

  const adminStats = [
    { icon: Users,      label: 'Total Students',   value: '1,247',  color: 'text-indigo-400'  }, // Mock
    { icon: BarChart3,  label: 'Colleges Managed', value: totalColleges,  color: 'text-violet-400'  },
    { icon: TrendingUp, label: 'Total Submissions', value: totalSubmissions,  color: 'text-emerald-400' },
    { icon: AlertTriangle, label: 'Flagged Reviews', value: '0',   color: 'text-amber-400'   },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Platform overview</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
        {adminStats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card p-5 text-center">
            <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="glass-card overflow-hidden animate-fade-in-up delay-200">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Recent Submissions</h2>
          <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full bg-slate-800">Mock data</span>
        </div>
        <div className="divide-y divide-slate-800">
          {recentReviews.map((r, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{r.college}</p>
                <p className="text-slate-500 text-xs mt-0.5">{r.program}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${sentimentPill[r.sentiment]}`}>
                  {r.sentiment}
                </span>
                <span className="text-xs text-slate-600">{r.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ─── Student view: full form ─── */
function StudentView() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium mb-4">
          <PlusCircle className="w-3.5 h-3.5" />
          Share Your Experience
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Submit Feedback</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your authentic review helps future students make informed decisions. All submissions are anonymous.
        </p>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/40 animate-fade-in-up delay-100">
        <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-400 text-xs leading-relaxed">
          <span className="text-white font-medium">Privacy notice:</span>{' '}
          Your review data is securely stored. Personal details are decoupled from responses before analytical processing.
        </p>
      </div>

      {/* Form */}
      <div className="animate-fade-in-up delay-200">
        <FeedbackForm />
      </div>
    </div>
  );
}

/* ─── Page entry — role router ─── */
export default function SubmitFeedbackPage() {
  const { role } = useRole();

  if (role === 'Admin')    return <AdminView />;
  if (role === 'Student')  return <StudentView />;
  return <ProspectView />;
}
