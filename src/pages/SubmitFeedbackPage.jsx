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

/* ─── Student view: full form ─── */
function StudentView() {
  const { user, session } = useRole();
  const collegeId = user?.college_id || user?.user_metadata?.college_id || session?.user?.user_metadata?.college_id;
  const yearOfStudy = user?.year_of_study || user?.user_metadata?.year_of_study || session?.user?.user_metadata?.year_of_study;

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

      {/* Verified Profile Notice */}
      {collegeId && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 animate-fade-in-up delay-100">
          <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <p className="text-indigo-200 text-xs leading-relaxed">
            <span className="font-semibold text-white">Profile Verified:</span> Your college and year of study are locked to your student profile to maintain review integrity.
          </p>
        </div>
      )}

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
        <FeedbackForm lockedCollegeId={collegeId} lockedYear={yearOfStudy} />
      </div>
    </div>
  );
}

/* ─── Page entry — role router ─── */
export default function SubmitFeedbackPage() {
  const { role } = useRole();

  // Strict guard: Only Students can access the form
  if (role === 'Student') {
    return <StudentView />;
  }

  // Everyone else (Prospects, Admins, Unauthenticated) sees the locked state
  return <ProspectView />;
}
