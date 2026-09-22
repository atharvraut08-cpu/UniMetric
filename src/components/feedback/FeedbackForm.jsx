import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Loader2, Lock, ThumbsUp, ThumbsDown,
  BookOpen, Building2, Bed, Briefcase, MessageSquare, Check, X, Sparkles
} from 'lucide-react';
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

// 11 Granular Feedback Categories
const INITIAL_RATINGS = {
  // Part 1: Academics
  'Teaching Quality': 0,
  'Curriculum Relevance': 0,
  'Library & Resources': 0,
  // Part 2: Infrastructure
  'Infra — Quality of Equipment': 0,
  'Infra — Cleanliness': 0,
  'Infra — Basic Amenities': 0,
  'Wi-Fi & Connectivity': 0,
  'Canteen & Food Quality': 0,
  // Part 3: Hostel (conditional)
  'Hostel & Accommodation': 0,
  // Part 4: Career & Campus Life
  'Placements & Opportunities': 0,
  'Extracurriculars & Culture': 0,
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

const ACADEMIC_FIELDS = [
  { key: 'Teaching Quality', label: 'Teaching Quality', subtitle: 'Faculty depth, clarity, and instructional engagement' },
  { key: 'Curriculum Relevance', label: 'Curriculum Relevance', subtitle: 'Modern syllabus, practical depth, and industry alignment' },
  { key: 'Library & Resources', label: 'Library & Resources', subtitle: 'Academic research databases, quiet zones, and book inventory' },
];

const INFRASTRUCTURE_FIELDS = [
  { key: 'Infra — Quality of Equipment', label: 'Infra — Quality of Equipment', subtitle: 'Laboratory instruments, software workstations, hardware' },
  { key: 'Infra — Cleanliness', label: 'Infra — Cleanliness', subtitle: 'Lecture halls, shared labs, and campus sanitation' },
  { key: 'Infra — Basic Amenities', label: 'Infra — Basic Amenities', subtitle: 'Drinking water, electricity, ventilation, washrooms' },
  { key: 'Wi-Fi & Connectivity', label: 'Wi-Fi & Connectivity', subtitle: 'Speed, coverage consistency, and campus bandwidth' },
  { key: 'Canteen & Food Quality', label: 'Canteen & Food Quality', subtitle: 'Nutritional balance, hygiene standards, and variety' },
];

const CAREER_FIELDS = [
  { key: 'Placements & Opportunities', label: 'Placements & Opportunities', subtitle: 'Recruitment drives, internship cells, and career fairs' },
  { key: 'Extracurriculars & Culture', label: 'Extracurriculars & Culture', subtitle: 'Student clubs, cultural events, sports facilities, arts' },
];

export default function FeedbackForm({
  lockedCollegeId: propCollegeId,
  lockedYear: propYear,
  lockedProgramId: propProgramId,
  lockedAdmissionDate: propAdmissionDate,
  onSubmitted,
}) {
  const navigate = useNavigate();
  const { session, user } = useRole();
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [usedHostel, setUsedHostel] = useState(null); // null = unselected, true = yes, false = no
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read metadata from props, user, or session
  const collegeIdFromAuth = propCollegeId || user?.college_id || user?.user_metadata?.college_id || session?.user?.user_metadata?.college_id || '';
  const yearFromAuth = propYear || user?.year_of_study || user?.user_metadata?.year_of_study || session?.user?.user_metadata?.year_of_study || '';
  const programIdFromAuth = propProgramId || user?.program_id || user?.user_metadata?.program_id || session?.user?.user_metadata?.program_id || '';
  const admissionDateFromAuth = propAdmissionDate || user?.admission_date || user?.user_metadata?.admission_date || session?.user?.user_metadata?.admission_date || '';
  const genderFromAuth = user?.gender || user?.user_metadata?.gender || session?.user?.user_metadata?.gender || '';
  const ageGroupFromAuth = user?.age_group || user?.user_metadata?.age_group || session?.user?.user_metadata?.age_group || '';
  const stateOfDomicileFromAuth = user?.state_of_domicile || user?.user_metadata?.state_of_domicile || session?.user?.user_metadata?.state_of_domicile || '';

  const isCollegeLocked = Boolean(collegeIdFromAuth);
  const isYearLocked = Boolean(yearFromAuth);
  const isProgramLocked = Boolean(programIdFromAuth);

  useEffect(() => {
    getColleges().then(setColleges);
    getPrograms().then(setPrograms);
  }, []);

  // Pre-fill locked values from authenticated profile
  useEffect(() => {
    if (collegeIdFromAuth || yearFromAuth || programIdFromAuth) {
      setForm((prev) => ({
        ...prev,
        collegeId: collegeIdFromAuth ? String(collegeIdFromAuth) : prev.collegeId,
        studentYear: yearFromAuth ? String(yearFromAuth) : prev.studentYear,
        programId: programIdFromAuth ? String(programIdFromAuth) : prev.programId,
      }));
    }
  }, [collegeIdFromAuth, yearFromAuth, programIdFromAuth]);

  useEffect(() => {
    // Reset program when college changes (unless locked by user profile)
    if (!programIdFromAuth) {
      setForm((prev) => ({ ...prev, programId: '' }));
    }
  }, [form.collegeId, programIdFromAuth]);

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
    setErrors((prev) => ({ ...prev, ratings: undefined, hostelRating: undefined }));
  };

  const handleHostelToggle = (utilized) => {
    setUsedHostel(utilized);
    setErrors((prev) => ({ ...prev, hostelGateway: undefined, hostelRating: undefined }));
    if (!utilized) {
      // Clear hostel score when toggled to No
      setForm((prev) => ({
        ...prev,
        ratings: { ...prev.ratings, 'Hostel & Accommodation': 0 },
      }));
    }
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
    if (!form.studentYear) e.studentYear = 'Please select your academic year.';
    if (!form.programId) e.programId = 'Please select your enrolled program.';
    if (form.wouldRecommend === null || form.wouldRecommend === undefined) {
      e.wouldRecommend = 'Please indicate whether you would recommend this college.';
    }

    // Part 1: Academics
    const unratedAcademics = ACADEMIC_FIELDS.filter((f) => form.ratings[f.key] === 0);
    if (unratedAcademics.length > 0) {
      e.academics = `Please rate all academic categories (${unratedAcademics.map((f) => f.label).join(', ')}).`;
    }

    // Part 2: Infrastructure
    const unratedInfra = INFRASTRUCTURE_FIELDS.filter((f) => form.ratings[f.key] === 0);
    if (unratedInfra.length > 0) {
      e.infrastructure = `Please rate all infrastructure categories (${unratedInfra.map((f) => f.label).join(', ')}).`;
    }

    // Part 3: Hostel Gateway
    if (usedHostel === null) {
      e.hostelGateway = 'Please indicate whether you utilized the college hostel facilities.';
    } else if (usedHostel === true && form.ratings['Hostel & Accommodation'] === 0) {
      e.hostelRating = 'Please provide a rating for Hostel & Accommodation, or select "No" above.';
    }

    // Part 4: Career & Campus Life
    const unratedCareer = CAREER_FIELDS.filter((f) => form.ratings[f.key] === 0);
    if (unratedCareer.length > 0) {
      e.career = `Please rate all career and campus life categories (${unratedCareer.map((f) => f.label).join(', ')}).`;
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to the first error
      const firstErrorKey = Object.keys(errs)[0];
      const el = document.getElementById(`form-section-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    const isRecommended = Boolean(form.wouldRecommend);
    const currentUserId = user?.id || session?.user?.id;

    // Construct the granular 11-category ratings payload
    // Conditionally EXCLUDE "Hostel & Accommodation" if usedHostel is false or null
    const ratingsPayload = {
      'Teaching Quality': form.ratings['Teaching Quality'],
      'Curriculum Relevance': form.ratings['Curriculum Relevance'],
      'Library & Resources': form.ratings['Library & Resources'],
      'Infra — Quality of Equipment': form.ratings['Infra — Quality of Equipment'],
      'Infra — Cleanliness': form.ratings['Infra — Cleanliness'],
      'Infra — Basic Amenities': form.ratings['Infra — Basic Amenities'],
      'Wi-Fi & Connectivity': form.ratings['Wi-Fi & Connectivity'],
      'Canteen & Food Quality': form.ratings['Canteen & Food Quality'],
      'Placements & Opportunities': form.ratings['Placements & Opportunities'],
      'Extracurriculars & Culture': form.ratings['Extracurriculars & Culture'],
    };

    if (usedHostel === true) {
      ratingsPayload['Hostel & Accommodation'] = form.ratings['Hostel & Accommodation'];
    }

    try {
      await submitReview({
        userId: currentUserId,
        user_id: currentUserId,
        collegeId: form.collegeId,
        studentYear: form.studentYear,
        programId: parseInt(form.programId, 10),
        admissionDate: admissionDateFromAuth || undefined,
        admission_date: admissionDateFromAuth || undefined,
        gender: genderFromAuth || undefined,
        ageGroup: ageGroupFromAuth || undefined,
        age_group: ageGroupFromAuth || undefined,
        stateOfDomicile: stateOfDomicileFromAuth || undefined,
        state_of_domicile: stateOfDomicileFromAuth || undefined,
        ratings: ratingsPayload,
        wouldRecommend: isRecommended,
        would_recommend: isRecommended ? 'Y' : 'N',
        positiveFeedback: form.text.positive,
        complaints: form.text.complaints,
        suggestions: form.text.suggestions,
      }, session?.access_token);

      onSubmitted?.();

      const submittedCollegeId = form.collegeId;
      setForm(INITIAL_FORM);
      setUsedHostel(null);
      setErrors({});
      setShowConfirm(true);

      setTimeout(() => {
        navigate(`/college/${submittedCollegeId}`);
      }, 2000);

    } catch (err) {
      console.error('Full Submission Error:', err);
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

        {/* Section 0 — Academic Enrollment Profile */}
        <div id="form-section-collegeId" className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-charcoal/10 shadow-soft space-y-5">
          <div className="border-b border-brand-charcoal/10 pb-3 flex items-center justify-between">
            <h3 className="text-brand-charcoal font-black text-lg">
              Student Enrollment Details
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cream border border-brand-charcoal/10 text-brand-charcoal">
              Required
            </span>
          </div>

          {/* College Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-brand-charcoal">College / University</label>
              {isCollegeLocked && (
                <span className="inline-flex items-center gap-1 text-xs text-brand-charcoal bg-brand-cream px-2 py-0.5 rounded-md border border-brand-charcoal/10 font-medium">
                  <Lock className="w-3 h-3 text-brand-coral" /> Profile Locked
                </span>
              )}
            </div>
            <select
              value={form.collegeId}
              onChange={(e) => setField('collegeId', e.target.value)}
              disabled={isCollegeLocked}
              className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-all ${
                isCollegeLocked
                  ? 'border-brand-charcoal/10 bg-brand-cream/60 text-brand-charcoal/70 cursor-not-allowed'
                  : 'border-brand-charcoal/15 bg-brand-cream/20 text-brand-charcoal focus:outline-none focus:border-brand-charcoal focus:ring-2 focus:ring-brand-charcoal/10'
              }`}
            >
              <option value="">— Select College —</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.collegeId && <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.collegeId}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Year of Study */}
            <div id="form-section-studentYear">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-brand-charcoal">
                  Year of Study
                </label>
                {isYearLocked && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-charcoal bg-brand-cream px-2 py-0.5 rounded-md border border-brand-charcoal/10 font-medium">
                    <Lock className="w-3 h-3 text-brand-coral" /> Profile Locked
                  </span>
                )}
              </div>
              <select
                value={form.studentYear}
                onChange={(e) => setField('studentYear', e.target.value)}
                disabled={isYearLocked || !form.collegeId}
                className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-all ${
                  isYearLocked || !form.collegeId
                    ? 'border-brand-charcoal/10 bg-brand-cream/60 text-brand-charcoal/70 cursor-not-allowed'
                    : 'border-brand-charcoal/15 bg-brand-cream/20 text-brand-charcoal focus:outline-none focus:border-brand-charcoal focus:ring-2 focus:ring-brand-charcoal/10'
                }`}
              >
                <option value="">— Select Year —</option>
                {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
              {errors.studentYear && <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.studentYear}</p>}
            </div>

            {/* Program */}
            <div id="form-section-programId">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-brand-charcoal">
                  Program / Degree
                </label>
                {isProgramLocked && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-charcoal bg-brand-cream px-2 py-0.5 rounded-md border border-brand-charcoal/10 font-medium">
                    <Lock className="w-3 h-3 text-brand-coral" /> Profile Locked
                  </span>
                )}
              </div>
              <select
                value={form.programId}
                onChange={(e) => setField('programId', e.target.value)}
                disabled={isProgramLocked || !form.collegeId}
                className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-all ${
                  isProgramLocked || !form.collegeId
                    ? 'border-brand-charcoal/10 bg-brand-cream/60 text-brand-charcoal/70 cursor-not-allowed'
                    : 'border-brand-charcoal/15 bg-brand-cream/20 text-brand-charcoal focus:outline-none focus:border-brand-charcoal focus:ring-2 focus:ring-brand-charcoal/10 cursor-pointer'
                }`}
              >
                <option value="">— Select Program —</option>
                {filteredPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.program_name} {p.degree_type ? `(${p.degree_type})` : ''}
                  </option>
                ))}
              </select>
              {errors.programId && <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.programId}</p>}
            </div>
          </div>
        </div>

        {/* Part 1: Academics */}
        <div id="form-section-academics" className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-charcoal/10 shadow-soft space-y-5">
          <div className="border-b border-brand-charcoal/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-cream flex items-center justify-center border border-brand-charcoal/10 text-brand-coral">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-brand-charcoal font-black text-lg">
                  Part 1: Academics
                </h3>
                <p className="text-xs text-brand-charcoal/60">Faculty proficiency, pedagogy, and curriculum modernization</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-yellow/30 border border-brand-charcoal/10 text-brand-charcoal">
              3 Categories
            </span>
          </div>

          {errors.academics && (
            <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {errors.academics}
            </p>
          )}

          <div className="divide-y divide-brand-charcoal/5">
            {ACADEMIC_FIELDS.map(({ key, label, subtitle }) => (
              <RatingInput
                key={key}
                label={label}
                subtitle={subtitle}
                value={form.ratings[key]}
                onChange={(v) => setRating(key, v)}
              />
            ))}
          </div>
        </div>

        {/* Part 2: Infrastructure */}
        <div id="form-section-infrastructure" className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-charcoal/10 shadow-soft space-y-5">
          <div className="border-b border-brand-charcoal/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-cream flex items-center justify-center border border-brand-charcoal/10 text-brand-coral">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-brand-charcoal font-black text-lg">
                  Part 2: Infrastructure
                </h3>
                <p className="text-xs text-brand-charcoal/60">Laboratories, cleanliness, connectivity, and food amenities</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-yellow/30 border border-brand-charcoal/10 text-brand-charcoal">
              5 Categories
            </span>
          </div>

          {errors.infrastructure && (
            <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {errors.infrastructure}
            </p>
          )}

          <div className="divide-y divide-brand-charcoal/5">
            {INFRASTRUCTURE_FIELDS.map(({ key, label, subtitle }) => (
              <RatingInput
                key={key}
                label={label}
                subtitle={subtitle}
                value={form.ratings[key]}
                onChange={(v) => setRating(key, v)}
              />
            ))}
          </div>
        </div>

        {/* Part 3: Hostel Gateway (Conditional Logic) */}
        <div id="form-section-hostelGateway" className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-charcoal/10 shadow-soft space-y-5">
          <div className="border-b border-brand-charcoal/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-cream flex items-center justify-center border border-brand-charcoal/10 text-brand-coral">
                <Bed className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-brand-charcoal font-black text-lg">
                  Part 3: Hostel Gateway
                </h3>
                <p className="text-xs text-brand-charcoal/60">Residential facilities, maintenance, and accommodation</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cream border border-brand-charcoal/10 text-brand-charcoal">
              Conditional
            </span>
          </div>

          {/* Question / Toggle */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-sm font-semibold text-brand-charcoal">
                  Did you utilize the college hostel facilities? <span className="text-brand-coral">*</span>
                </label>
                <p className="text-xs text-brand-charcoal/65 mt-0.5">
                  Day scholars select &quot;No&quot; to keep hostel ratings decoupled from your satisfaction profile.
                </p>
              </div>

              {/* Neo-brutalist Yes / No pills */}
              <div className="flex items-center gap-2 self-start sm:self-auto select-none">
                <button
                  type="button"
                  onClick={() => handleHostelToggle(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    usedHostel === true
                      ? 'border-brand-charcoal bg-brand-charcoal text-white shadow-soft'
                      : 'border-brand-charcoal/15 bg-brand-cream/40 text-brand-charcoal hover:bg-brand-cream'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  Yes, I stayed in Hostel
                </button>

                <button
                  type="button"
                  onClick={() => handleHostelToggle(false)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    usedHostel === false
                      ? 'border-brand-charcoal bg-brand-charcoal text-white shadow-soft'
                      : 'border-brand-charcoal/15 bg-brand-cream/40 text-brand-charcoal hover:bg-brand-cream'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  No (Day Scholar)
                </button>
              </div>
            </div>

            {errors.hostelGateway && (
              <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errors.hostelGateway}
              </p>
            )}
          </div>

          {/* Conditional Hostel Rating Component */}
          {usedHostel === true && (
            <div id="form-section-hostelRating" className="pt-4 border-t border-brand-charcoal/10 animate-fade-in space-y-2">
              <div className="bg-brand-cream/40 p-4 rounded-2xl border border-brand-charcoal/10">
                <RatingInput
                  label="Hostel & Accommodation"
                  subtitle="Room maintenance, mess hygiene, security, and residential amenities"
                  value={form.ratings['Hostel & Accommodation']}
                  onChange={(v) => setRating('Hostel & Accommodation', v)}
                />
              </div>
              {errors.hostelRating && (
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {errors.hostelRating}
                </p>
              )}
            </div>
          )}

          {usedHostel === false && (
            <div className="pt-3 border-t border-brand-charcoal/5 flex items-center gap-2 text-xs text-brand-charcoal/60 bg-brand-cream/30 px-3.5 py-2.5 rounded-2xl">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Day scholar profile selected: <strong>Hostel &amp; Accommodation</strong> is safely omitted from your ML evaluation matrix.</span>
            </div>
          )}
        </div>

        {/* Part 4: Career & Campus Life */}
        <div id="form-section-career" className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-charcoal/10 shadow-soft space-y-5">
          <div className="border-b border-brand-charcoal/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-cream flex items-center justify-center border border-brand-charcoal/10 text-brand-coral">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-brand-charcoal font-black text-lg">
                  Part 4: Career &amp; Campus Life
                </h3>
                <p className="text-xs text-brand-charcoal/60">Recruitment drive execution, corporate partnerships, festivals &amp; clubs</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-yellow/30 border border-brand-charcoal/10 text-brand-charcoal">
              2 Categories
            </span>
          </div>

          {errors.career && (
            <p className="text-xs text-rose-500 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {errors.career}
            </p>
          )}

          <div className="divide-y divide-brand-charcoal/5">
            {CAREER_FIELDS.map(({ key, label, subtitle }) => (
              <RatingInput
                key={key}
                label={label}
                subtitle={subtitle}
                value={form.ratings[key]}
                onChange={(v) => setRating(key, v)}
              />
            ))}
          </div>
        </div>

        {/* Part 5: Qualitative Insights */}
        <div className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-charcoal/10 shadow-soft space-y-5">
          <div className="border-b border-brand-charcoal/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-cream flex items-center justify-center border border-brand-charcoal/10 text-brand-coral">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-brand-charcoal font-black text-lg">
                  Part 5: Qualitative Insights
                </h3>
                <p className="text-xs text-brand-charcoal/60">Contextual feedback for sentiment analysis and NLP processing</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cream border border-brand-charcoal/10 text-brand-charcoal">
              Optional
            </span>
          </div>

          {[
            { key: 'positive', label: 'What did you love?', placeholder: 'Share highlights about professors, labs, campus culture, or standout experiences…' },
            { key: 'complaints', label: 'What needs improvement?', placeholder: 'Describe critical areas such as administrative delays, broken equipment, or Wi-Fi drops…' },
            { key: 'suggestions', label: 'Constructive suggestions', placeholder: 'Recommend specific solutions, new electives, or amenities for the management to consider…' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-brand-charcoal mb-1.5">{label}</label>
              <textarea
                value={form.text[key]}
                onChange={(e) => setText(key, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full px-4 py-2.5 rounded-2xl border border-brand-charcoal/15 bg-brand-cream/20 text-brand-charcoal placeholder-brand-charcoal/40 text-sm focus:outline-none focus:border-brand-charcoal focus:ring-2 focus:ring-brand-charcoal/10 transition-all resize-none font-medium"
              />
            </div>
          ))}
        </div>

        {/* Part 6: Recommendation */}
        <div id="form-section-wouldRecommend" className="bg-brand-paper rounded-3xl p-6 sm:p-8 border border-brand-charcoal/10 shadow-soft space-y-5">
          <div className="border-b border-brand-charcoal/10 pb-3 flex items-center justify-between">
            <h3 className="text-brand-charcoal font-black text-lg">
              Part 6: Recommendation Decision
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-yellow/30 border border-brand-charcoal/10 text-brand-charcoal">
              Required
            </span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">
              Would you recommend this college to an incoming peer? <span className="text-brand-coral">*</span>
            </label>
            <p className="text-xs text-brand-charcoal/65">
              Your direct recommendation anchors institutional Net Promoter benchmarking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Would you recommend this college to a friend?">
            <label
              className={`flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl border cursor-pointer select-none text-sm font-bold transition-all ${
                form.wouldRecommend === true
                  ? 'border-emerald-600 bg-emerald-500/15 text-emerald-800 shadow-soft ring-2 ring-emerald-500/20'
                  : 'border-brand-charcoal/15 bg-brand-cream/30 text-brand-charcoal/70 hover:border-brand-charcoal/30 hover:text-brand-charcoal'
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
              <ThumbsUp className={`w-4 h-4 ${form.wouldRecommend === true ? 'text-emerald-700' : 'text-brand-charcoal/40'}`} />
              <span>Yes, I recommend</span>
            </label>

            <label
              className={`flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl border cursor-pointer select-none text-sm font-bold transition-all ${
                form.wouldRecommend === false
                  ? 'border-rose-500 bg-rose-500/15 text-rose-800 shadow-soft ring-2 ring-rose-500/20'
                  : 'border-brand-charcoal/15 bg-brand-cream/30 text-brand-charcoal/70 hover:border-brand-charcoal/30 hover:text-brand-charcoal'
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
              <ThumbsDown className={`w-4 h-4 ${form.wouldRecommend === false ? 'text-rose-600' : 'text-brand-charcoal/40'}`} />
              <span>No, I don&apos;t recommend</span>
            </label>
          </div>

          {errors.wouldRecommend && (
            <p className="text-xs text-rose-500 font-semibold">{errors.wouldRecommend}</p>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-coral text-white font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all duration-200 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {isSubmitting ? 'Submitting Feedback...' : 'Submit Authentic Review'}
        </button>
      </form>

      {showConfirm && (
        <SubmitConfirmation onDismiss={() => setShowConfirm(false)} />
      )}
    </>
  );
}
