import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Shield, Lock, ShieldCheck, CheckCircle2,
  ArrowRight, GraduationCap,
} from 'lucide-react';
import FeedbackForm from '../components/feedback/FeedbackForm';
import { useRole } from '../context/RoleContext';
import { checkUserReview } from '../services/mockDataService';

/* ─── Prospect view: locked state ─── */
function ProspectView() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center animate-fade-in-up">
      <div className="bg-brand-paper rounded-4xl p-8 sm:p-12 border border-brand-charcoal/10 shadow-soft space-y-6">
        <div className="inline-flex w-16 h-16 rounded-3xl items-center justify-center bg-brand-cream border border-brand-charcoal/10 mx-auto">
          <Lock className="w-8 h-8 text-brand-charcoal" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal">Student Access Only</h1>
          <p className="text-brand-charcoal/70 text-sm sm:text-base leading-relaxed max-w-sm mx-auto font-medium">
            Submitting feedback is reserved for verified enrolled students.
            Log in with a student account to share your feedback.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/auth"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-coral text-white text-sm font-semibold hover:opacity-90 transition-all shadow-soft"
          >
            Login as Student
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-brand-charcoal/15 bg-brand-cream text-brand-charcoal text-sm font-semibold hover:bg-brand-cream/80 transition-all shadow-soft"
          >
            Browse Colleges
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Student view: full form with duplicate submission guard ─── */
function StudentView() {
  const { user, session } = useRole();
  const collegeId = user?.college_id || user?.user_metadata?.college_id || session?.user?.user_metadata?.college_id;
  const yearOfStudy = user?.year_of_study || user?.user_metadata?.year_of_study || session?.user?.user_metadata?.year_of_study;
  const userId = user?.id || session?.user?.id;

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  const [submissionDetails, setSubmissionDetails] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!userId) {
      setCheckingSubmission(false);
      return;
    }

    // Check localStorage cache first for immediate responsiveness
    const localSubmitted = localStorage.getItem(`submitted_review_${userId}`);
    if (localSubmitted === 'true') {
      setHasSubmitted(true);
    }

    // Check backend API for authentic DB review record
    checkUserReview(userId, session?.access_token)
      .then((res) => {
        if (!isMounted) return;
        if (res.hasSubmitted) {
          setHasSubmitted(true);
          setSubmissionDetails(res);
          localStorage.setItem(`submitted_review_${userId}`, 'true');
        }
      })
      .catch((err) => {
        console.error('Error checking user review status:', err);
      })
      .finally(() => {
        if (isMounted) {
          setCheckingSubmission(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, session?.access_token]);

  // Loading state while verifying eligibility
  if (checkingSubmission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
        <div className="w-10 h-10 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-brand-charcoal text-base font-bold">Checking review eligibility...</p>
      </div>
    );
  }

  // Friendly Pastel "Already Submitted" Screen
  if (hasSubmitted) {
    const targetCollegeId = collegeId || submissionDetails?.college_id;

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center animate-fade-in-up">
        <div className="bg-brand-paper rounded-4xl p-8 sm:p-12 border border-brand-charcoal/10 shadow-soft space-y-6">
          {/* Friendly pastel icon badge */}
          <div className="w-20 h-20 rounded-3xl bg-brand-yellow flex items-center justify-center mx-auto border border-brand-charcoal/15 shadow-soft">
            <CheckCircle2 className="w-10 h-10 text-brand-charcoal" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cream border border-brand-charcoal/10 text-xs font-semibold text-brand-charcoal">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-coral" /> Verified Student Submission
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal">
              Review Already Submitted
            </h1>
            <p className="text-brand-charcoal/70 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-medium">
              Thank you! You have already submitted a review for your college. To maintain data integrity, students are limited to one review.
            </p>
          </div>

          {/* Action buttons with brand-coral accent */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {targetCollegeId ? (
              <Link
                to={`/college/${targetCollegeId}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-coral text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-soft"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : null}
            <Link
              to="/"
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl ${
                targetCollegeId
                  ? 'border border-brand-charcoal/15 bg-brand-cream text-brand-charcoal hover:bg-brand-cream/80'
                  : 'bg-brand-coral text-white hover:opacity-90'
              } text-sm font-semibold transition-all duration-200 shadow-soft`}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active form view
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-charcoal/15 bg-brand-paper text-brand-charcoal text-xs font-semibold mb-4 shadow-soft">
          <PlusCircle className="w-3.5 h-3.5 text-brand-coral" />
          Share Your Experience
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-charcoal mb-3">Submit Feedback</h1>
        <p className="text-brand-charcoal/70 text-sm sm:text-base leading-relaxed font-medium">
          Your authentic review helps future students make informed decisions. All submissions are anonymous.
        </p>
      </div>

      {/* Verified Profile Notice */}
      {collegeId && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-brand-charcoal/10 bg-brand-cream animate-fade-in-up delay-100">
          <Lock className="w-4 h-4 text-brand-coral flex-shrink-0" />
          <p className="text-brand-charcoal text-xs leading-relaxed font-medium">
            <span className="font-bold text-brand-charcoal">Profile Verified:</span> Your college and year of study are locked to your student profile to maintain review integrity.
          </p>
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-2xl border border-brand-charcoal/10 bg-brand-paper shadow-soft animate-fade-in-up delay-100">
        <Shield className="w-4 h-4 text-brand-coral flex-shrink-0 mt-0.5" />
        <p className="text-brand-charcoal/70 text-xs leading-relaxed font-medium">
          <span className="text-brand-charcoal font-bold">Privacy notice:</span>{' '}
          Your review data is securely stored. Personal details are decoupled from responses before analytical processing.
        </p>
      </div>

      {/* Form */}
      <div className="animate-fade-in-up delay-200">
        <FeedbackForm
          lockedCollegeId={collegeId}
          lockedYear={yearOfStudy}
          onSubmitted={() => setHasSubmitted(true)}
        />
      </div>
    </div>
  );
}

/* ─── Page entry — role router ─── */
export default function SubmitFeedbackPage() {
  const { role } = useRole();
  const userRole = (role || '').toLowerCase();

  // Strict guard: Only Students can access the form
  if (userRole === 'student') {
    return <StudentView />;
  }

  // Everyone else (Prospects, Admins, Unauthenticated) sees the locked state
  return <ProspectView />;
}
