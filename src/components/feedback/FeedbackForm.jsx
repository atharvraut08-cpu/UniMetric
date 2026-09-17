import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, Lock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getColleges, getPrograms, submitReview } from '../../services/mockDataService';
import RatingInput from './RatingInput';
import SubmitConfirmation from './SubmitConfirmation';
import { useRole } from '../../context/RoleContext';

const YEARS = [
  { label: '1st Year', value: '1' },
  { label: '2nd Year', value: '2' },
  { label: '3rd Year', value: '3' },
  { label: '4th Year', value: '4' },
];

const INITIAL_RATINGS = {
  teachingQuality: 0,
  labs: 0,
  wifi: 0,
  hostel: 0,
  careerPlacements: 0,
};

const INITIAL_TEXT = {
  positive: '',
  complaints: '',
  suggestions: '',
};

const INITIAL_FORM = {
  collegeId: '',
  studentYear: '',
  programId: '',
  ratings: INITIAL_RATINGS,
  wouldRecommend: true,
  text: INITIAL_TEXT,
};

const ratingFields = [
  { key: 'teachingQuality', label: 'Teaching Quality' },
  { key: 'labs',            label: 'Labs & Equipment'  },
  { key: 'wifi',            label: 'Wi-Fi Connectivity' },
  { key: 'hostel',          label: 'Hostel Facilities'  },
  { key: 'careerPlacements', label: 'Career Placements' },
];

export default function FeedbackForm({ lockedCollegeId: propCollegeId, lockedYear: propYear }) {
  const navigate = useNavigate();
  const { session, user } = useRole();
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read metadata from props, user, or session
  const collegeIdFromAuth = propCollegeId || user?.college_id || user?.user_metadata?.college_id || session?.user?.user_metadata?.college_id || '';
  const yearFromAuth = propYear || user?.year_of_study || user?.user_metadata?.year_of_study || session?.user?.user_metadata?.year_of_study || '';

  const isCollegeLocked = Boolean(collegeIdFromAuth);
  const isYearLocked = Boolean(yearFromAuth);

  useEffect(() => {
    getColleges().then(setColleges);
    getPrograms().then(setPrograms);
  }, []);

  // Pre-fill locked values from authenticated profile
  useEffect(() => {
    if (collegeIdFromAuth || yearFromAuth) {
      setForm((prev) => ({
        ...prev,
        collegeId: collegeIdFromAuth ? String(collegeIdFromAuth) : prev.collegeId,
        studentYear: yearFromAuth ? String(yearFromAuth) : prev.studentYear,
      }));
    }
  }, [collegeIdFromAuth, yearFromAuth]);

  useEffect(() => {
    // Reset program when college changes
    setForm((prev) => ({ ...prev, programId: '' }));
  }, [form.collegeId]);

  const selectedCollege = colleges.find((c) => c.id == form.collegeId);
  const filteredPrograms = form.collegeId
    ? programs.filter((p) => p.college_id == form.collegeId)
    : [];

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setRating = (key, value) => {
    setForm((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [key]: value },
    }));
  };

  const setText = (key, value) => {
    setForm((prev) => ({
      ...prev,
      text: { ...prev.text, [key]: value },
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.collegeId) e.collegeId = 'Please select a college.';
    if (!form.studentYear) e.studentYear = 'Please select your year.';
    if (!form.programId) e.programId = 'Please select your program.';
    if (form.wouldRecommend === null || form.wouldRecommend === undefined) {
      e.wouldRecommend = 'Please indicate whether you would recommend this college.';
    }
    const unrated = ratingFields.filter((f) => form.ratings[f.key] === 0);
    if (unrated.length > 0) e.ratings = 'Please rate all categories.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    setIsSubmitting(true);
    const isRecommended = Boolean(form.wouldRecommend);

    try {
      await submitReview({
        collegeId: form.collegeId,
        studentYear: form.studentYear,
        programId: parseInt(form.programId, 10),
        ratings: form.ratings,
        wouldRecommend: isRecommended,
        would_recommend: isRecommended ? 'Y' : 'N',
        positiveFeedback: form.text.positive,
        complaints: form.text.complaints,
        suggestions: form.text.suggestions,
      }, session?.access_token);
      
      const submittedCollegeId = form.collegeId;
      setForm(INITIAL_FORM);
      setErrors({});
      setShowConfirm(true);
      
      setTimeout(() => {
        navigate(`/college/${submittedCollegeId}`);
      }, 2000);
      
    } catch (err) {
      console.error('Full Submission Error:', err);
      console.log('Payload Sent:', {
        collegeId: form.collegeId,
        studentYear: form.studentYear,
        programId: parseInt(form.programId, 10),
        ratings: form.ratings,
        wouldRecommend: isRecommended,
        would_recommend: isRecommended ? 'Y' : 'N',
        positiveFeedback: form.text.positive,
        complaints: form.text.complaints,
        suggestions: form.text.suggestions,
      });
      
      const backendError = err.response?.data;
      if (backendError) {
        console.error('Backend Error Payload:', backendError);
        alert(`Failed to submit review. Backend says:\n${JSON.stringify(backendError, null, 2)}`);
      } else {
        alert(`Failed to submit review: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>

        {/* Section 1 — College & Student Info */}
        <div className="glass-card p-6 space-y-5">
          <h3 className="text-white font-semibold text-base border-b border-slate-700 pb-3">
            1. Basic Information
          </h3>

          {/* College Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm text-slate-300 font-medium">College</label>
              {isCollegeLocked && (
                <span className="inline-flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  <Lock className="w-3 h-3" /> Profile Locked
                </span>
              )}
            </div>
            <select
              value={form.collegeId}
              onChange={(e) => setField('collegeId', e.target.value)}
              disabled={isCollegeLocked}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all ${
                isCollegeLocked
                  ? 'border-slate-800 bg-slate-900/80 text-slate-300 cursor-not-allowed opacity-80'
                  : 'border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            >
              <option value="">— Select College —</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.collegeId && <p className="mt-1 text-xs text-rose-400">{errors.collegeId}</p>}
          </div>

          {/* Year */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`block text-sm font-medium ${!form.collegeId ? 'text-slate-500' : 'text-slate-300'}`}>
                Student Year
              </label>
              {isYearLocked && (
                <span className="inline-flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  <Lock className="w-3 h-3" /> Profile Locked
                </span>
              )}
            </div>
            <select
              value={form.studentYear}
              onChange={(e) => setField('studentYear', e.target.value)}
              disabled={isYearLocked || !form.collegeId}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all ${
                isYearLocked || !form.collegeId
                  ? 'border-slate-800 bg-slate-900/80 text-slate-300 cursor-not-allowed opacity-80'
                  : 'border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            >
              <option value="">— Select Year —</option>
              {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
            {errors.studentYear && <p className="mt-1 text-xs text-rose-400">{errors.studentYear}</p>}
          </div>

          {/* Program Selector */}
          <div>
            <label className={`block text-sm mb-1.5 ${!form.collegeId ? 'text-slate-500' : 'text-slate-300'} font-medium`}>
              Program
            </label>
            <select
              value={form.programId}
              onChange={(e) => setField('programId', e.target.value)}
              disabled={!form.collegeId}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all ${
                !form.collegeId
                  ? 'border-slate-800 bg-slate-800/50 text-slate-500 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer'
              }`}
            >
              <option value="">— Select Program —</option>
              {filteredPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.program_name} {p.degree_type ? `(${p.degree_type})` : ''}
                </option>
              ))}
            </select>
            {errors.programId && <p className="mt-1 text-xs text-rose-400">{errors.programId}</p>}
          </div>
        </div>

        {/* Section 2 — Ratings */}
        <div className="glass-card p-6 space-y-5">
          <h3 className="text-white font-semibold text-base border-b border-slate-700 pb-3">
            2. Rate Your Experience
          </h3>
          {errors.ratings && (
            <p className="text-xs text-rose-400 -mt-2">{errors.ratings}</p>
          )}
          <div className="space-y-4">
            {ratingFields.map(({ key, label }) => (
              <RatingInput
                key={key}
                label={label}
                value={form.ratings[key]}
                onChange={(v) => setRating(key, v)}
              />
            ))}
          </div>

          {/* Recommendation Question */}
          <div className="pt-5 border-t border-slate-700/60 space-y-3">
            <div>
              <label className="block text-sm text-slate-200 font-medium mb-1">
                Would you recommend this college to a friend? <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-slate-400">
                Your recommendation directly informs prospective students looking for authentic peer advice.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Would you recommend this college to a friend?">
              <label
                className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer select-none text-sm font-medium transition-all ${
                  form.wouldRecommend === true
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="wouldRecommend"
                  value="yes"
                  checked={form.wouldRecommend === true}
                  onChange={() => setField('wouldRecommend', true)}
                  className="sr-only"
                />
                <ThumbsUp className={`w-4 h-4 ${form.wouldRecommend === true ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Yes, I recommend</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer select-none text-sm font-medium transition-all ${
                  form.wouldRecommend === false
                    ? 'border-rose-500 bg-rose-500/15 text-rose-300 shadow-md shadow-rose-500/10'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="wouldRecommend"
                  value="no"
                  checked={form.wouldRecommend === false}
                  onChange={() => setField('wouldRecommend', false)}
                  className="sr-only"
                />
                <ThumbsDown className={`w-4 h-4 ${form.wouldRecommend === false ? 'text-rose-400' : 'text-slate-500'}`} />
                <span>No, I don't recommend</span>
              </label>
            </div>

            {errors.wouldRecommend && (
              <p className="text-xs text-rose-400">{errors.wouldRecommend}</p>
            )}
          </div>
        </div>

        {/* Section 3 — Written Feedback */}
        <div className="glass-card p-6 space-y-5">
          <h3 className="text-white font-semibold text-base border-b border-slate-700 pb-3">
            3. Written Feedback <span className="text-slate-500 font-normal text-sm">(optional)</span>
          </h3>

          {[
            { key: 'positive',    label: 'What did you love?',       placeholder: 'Share what makes this college great…' },
            { key: 'complaints',  label: 'What needs improvement?',  placeholder: 'Describe any issues you faced…'       },
            { key: 'suggestions', label: 'Your suggestions',         placeholder: 'What would you change or add?'        },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
              <textarea
                value={form.text[key]}
                onChange={(e) => setText(key, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      {showConfirm && (
        <SubmitConfirmation onDismiss={() => setShowConfirm(false)} />
      )}
    </>
  );
}
