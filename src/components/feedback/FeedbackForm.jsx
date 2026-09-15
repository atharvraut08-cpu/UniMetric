import { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { getColleges, submitReview } from '../../services/mockDataService';
import RatingInput from './RatingInput';
import SubmitConfirmation from './SubmitConfirmation';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'];

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
  program: '',
  ratings: INITIAL_RATINGS,
  text: INITIAL_TEXT,
};

const ratingFields = [
  { key: 'teachingQuality', label: 'Teaching Quality' },
  { key: 'labs',            label: 'Labs & Equipment'  },
  { key: 'wifi',            label: 'Wi-Fi Connectivity' },
  { key: 'hostel',          label: 'Hostel Facilities'  },
  { key: 'careerPlacements', label: 'Career Placements' },
];

export default function FeedbackForm() {
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getColleges().then(setColleges);
  }, []);

  const selectedCollege = colleges.find((c) => c.id == form.collegeId);

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
    if (!form.program.trim()) e.program = 'Please enter your program.';
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
    try {
      await submitReview({
        collegeId: form.collegeId,
        studentYear: form.studentYear,
        program: form.program,
        ratings: form.ratings,
        wouldRecommend: form.ratings.overall >= 3, // Simplification
        ...form.text,
      });
      setForm(INITIAL_FORM);
      setErrors({});
      setShowConfirm(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
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
            <label className="block text-sm text-slate-300 mb-1.5">College</label>
            <select
              value={form.collegeId}
              onChange={(e) => setField('collegeId', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
            <label className="block text-sm text-slate-300 mb-1.5">Student Year</label>
            <select
              value={form.studentYear}
              onChange={(e) => setField('studentYear', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">— Select Year —</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {errors.studentYear && <p className="mt-1 text-xs text-rose-400">{errors.studentYear}</p>}
          </div>

          {/* Program */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">
              Program
              {selectedCollege && (
                <span className="ml-2 text-xs text-slate-500">(e.g. {selectedCollege.programs[0]})</span>
              )}
            </label>
            <input
              type="text"
              value={form.program}
              onChange={(e) => setField('program', e.target.value)}
              placeholder="e.g. Computer Engineering"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {errors.program && <p className="mt-1 text-xs text-rose-400">{errors.program}</p>}
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
