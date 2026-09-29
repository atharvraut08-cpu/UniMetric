import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getColleges, getPrograms, registerStudent } from '../services/mockDataService';
import {
  GraduationCap, Mail, Lock, User, Eye, EyeOff,
  ArrowLeft, LogIn, UserPlus, ChevronRight, ShieldCheck,
  AlertCircle, CheckCircle2, Building2, Calendar, BookOpen, Clock,
  Users, MapPin,
} from 'lucide-react';

const ROLES = ['Prospect', 'Student', 'Admin'];

const roleDescriptions = {
  Prospect: 'Search and compare colleges before you enroll.',
  Student:  'Rate and review your own institution.',
  Admin:    'Manage colleges, reviews, and platform analytics.',
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry', 'Other'
];

const formatAuthError = (err) => {
  if (!err) return 'An unexpected error occurred.';
  const msg = err.message || String(err);
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Unable to reach authentication service. Please check your internet connection or DNS.';
  }
  return msg;
};


/* ─── Reusable form field ─── */
function Field({ id, label, type = 'text', placeholder, value, onChange, icon: Icon, rightSlot, required = false }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-brand-charcoal mb-1.5 font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/60 text-brand-paper placeholder-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
            Icon ? 'pl-10' : ''
          } ${rightSlot ? 'pr-10' : ''}`}
        />
        {rightSlot && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Login form ─── */
function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const { signIn, isSupabaseConfigured } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password });
      navigate('/');
    } catch (err) {
      console.error('Supabase Login Error:', err);
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Field
        id="login-email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={setEmail}
        icon={Mail}
        required
      />
      <Field
        id="login-password"
        label="Password"
        type={showPw ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
        icon={Lock}
        required
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      <div className="flex items-center justify-between text-xs text-brand-charcoal/70">
        <span>{isSupabaseConfigured ? 'Secured by Supabase' : 'Local Auth Mode'}</span>
        <button type="button" className="text-brand-charcoal font-medium hover:underline transition-colors">
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-500/20"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <LogIn className="w-4 h-4" />
        )}
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-brand-charcoal">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-brand-charcoal font-bold underline hover:opacity-80 transition-opacity"
        >
          Create one
        </button>
      </p>
    </form>
  );
}

/* ─── Sign-up form ─── */
function SignUpForm({ onSwitch }) {
  const navigate = useNavigate();
  const { signUp, isSupabaseConfigured } = useRole();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Student');
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [admissionDate, setAdmissionDate] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [stateOfDomicile, setStateOfDomicile] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getColleges()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.results || []);
        setColleges(list);
      })
      .catch((err) => {
        console.error('Failed to load colleges in SignUpForm:', err);
      });
  }, []);

  // Fetch programs when college selection changes
  useEffect(() => {
    if (!selectedCollegeId) {
      setPrograms([]);
      setSelectedProgramId('');
      return;
    }
    setLoadingPrograms(true);
    getPrograms(selectedCollegeId)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.results || []);
        setPrograms(list);
      })
      .catch((err) => {
        console.error('Failed to load programs for college:', err);
        setPrograms([]);
      })
      .finally(() => {
        setLoadingPrograms(false);
      });
  }, [selectedCollegeId]);

  // Handle admission date change and auto-calculate current year of study
  const handleAdmissionDateChange = (val) => {
    setAdmissionDate(val);
    if (val) {
      const [yearStr, monthStr] = val.split('-');
      const admYear = parseInt(yearStr, 10);
      const admMonth = parseInt(monthStr, 10);
      if (!isNaN(admYear) && !isNaN(admMonth)) {
        const now = new Date();
        const months = (now.getFullYear() - admYear) * 12 + ((now.getMonth() + 1) - admMonth);
        let calcYear = '1';
        if (months >= 36) calcYear = '4';
        else if (months >= 24) calcYear = '3';
        else if (months >= 12) calcYear = '2';
        setSelectedYear(calcYear);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) return setErrorMsg('Full Name is required.');
    if (!email.trim()) return setErrorMsg('Email address is required.');
    if (!password) return setErrorMsg('Password is required.');
    if (password.length < 6) return setErrorMsg('Password must be at least 6 characters.');
    if (password !== confirmPw) return setErrorMsg('Passwords do not match.');
    if (!selectedRole) return setErrorMsg('Please select a role.');

    if (selectedRole === 'Student') {
      if (!selectedCollegeId) return setErrorMsg('Please select your college.');
      if (!selectedProgramId) return setErrorMsg('Please select your program / department.');
      if (!admissionDate) return setErrorMsg('Please provide your admission month & year.');
      if (!selectedYear) return setErrorMsg('Please select your year of study.');
      if (!gender) return setErrorMsg('Please select your gender.');
      if (!ageGroup) return setErrorMsg('Please select your age group.');
      if (!stateOfDomicile) return setErrorMsg('Please select your state of domicile.');
    }

    setLoading(true);
    try {
      const data = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        college_id: selectedRole === 'Student' ? selectedCollegeId : undefined,
        program_id: selectedRole === 'Student' ? selectedProgramId : undefined,
        admission_date: selectedRole === 'Student' ? admissionDate : undefined,
        year_of_study: selectedRole === 'Student' ? selectedYear : undefined,
        gender: selectedRole === 'Student' ? gender : undefined,
        ageGroup: selectedRole === 'Student' ? ageGroup : undefined,
        age_group: selectedRole === 'Student' ? ageGroup : undefined,
        stateOfDomicile: selectedRole === 'Student' ? stateOfDomicile : undefined,
        state_of_domicile: selectedRole === 'Student' ? stateOfDomicile : undefined,
      });

      // Synchronize student profile directly with backend Postgres database
      if (selectedRole === 'Student') {
        const studentUserId = data?.user?.id || 'student-' + Date.now();
        try {
          await registerStudent({
            user_id: studentUserId,
            program_id: selectedProgramId ? parseInt(selectedProgramId, 10) : null,
            admission_date: admissionDate || null,
            year_of_study: selectedYear || null,
            gender: gender || '',
            age_group: ageGroup || '',
            state_of_domicile: stateOfDomicile || '',
          }, data?.session?.access_token);
        } catch (regErr) {
          console.warn('Backend student profile sync notice:', regErr);
        }
      }

      // If Supabase has email confirmation enabled
      if (data?.user && !data?.session && isSupabaseConfigured) {
        setSuccessMsg('Account created successfully! Please check your email to verify your address before signing in.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <Field
        id="signup-name"
        label="Full name"
        placeholder="Jane Doe"
        value={name}
        onChange={setName}
        icon={User}
        required
      />
      <Field
        id="signup-email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={setEmail}
        icon={Mail}
        required
      />
      <Field
        id="signup-password"
        label="Password"
        type={showPw ? 'text' : 'password'}
        placeholder="Min. 6 characters"
        value={password}
        onChange={setPassword}
        icon={Lock}
        required
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <Field
        id="signup-confirm"
        label="Confirm password"
        type="password"
        placeholder="Repeat password"
        value={confirmPw}
        onChange={setConfirmPw}
        icon={Lock}
        required
      />

      {/* Role picker */}
      <div>
        <label className="block text-sm text-brand-charcoal mb-2 font-medium">
          I am a… <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRole(r)}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-xs font-medium transition-all duration-200 ${
                selectedRole === r
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-md shadow-indigo-500/10'
                  : 'border-slate-700 bg-slate-800/60 text-brand-paper hover:border-slate-600 hover:text-white'
              }`}
            >
              {r === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : r === 'Student' ? <User className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              {r}
            </button>
          ))}
        </div>
        {selectedRole && (
          <p className="mt-2 text-xs text-brand-charcoal/70 animate-fade-in">{roleDescriptions[selectedRole]}</p>
        )}
      </div>

      {/* Student-specific fields: College, Program, Admission Date & Year of Study */}
      {selectedRole === 'Student' && (
        <div className="space-y-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            Student Academic Profile
          </div>

          {/* Select Your College */}
          <div>
            <label htmlFor="signup-college" className="block text-sm text-brand-charcoal mb-1.5 font-medium">
              Select Your College <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                id="signup-college"
                value={selectedCollegeId}
                onChange={(e) => {
                  setSelectedCollegeId(e.target.value);
                  setSelectedProgramId('');
                }}
                required
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-brand-paper placeholder-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">— Select Your College —</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.location})
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Select Your Program (Dependent on College) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="signup-program" className="block text-sm text-brand-charcoal font-medium">
                Select Your Program <span className="text-red-400">*</span>
              </label>
              {loadingPrograms && (
                <span className="text-xs text-indigo-400 animate-pulse">Loading programs…</span>
              )}
            </div>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                id="signup-program"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                disabled={!selectedCollegeId || loadingPrograms}
                required
                className={`w-full pl-10 pr-8 py-3 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none ${
                  !selectedCollegeId
                    ? 'border-slate-800 bg-slate-800/50 text-slate-500 cursor-not-allowed'
                    : 'border-slate-700 bg-slate-800/80 text-brand-paper cursor-pointer'
                }`}
              >
                <option value="">
                  {!selectedCollegeId
                    ? '— Select college first —'
                    : loadingPrograms
                    ? '— Loading programs… —'
                    : '— Select Your Program —'}
                </option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.program_name} {p.degree_type ? `(${p.degree_type})` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Admission Month & Year */}
          <div>
            <label htmlFor="signup-admission-date" className="block text-sm text-brand-charcoal mb-1.5 font-medium">
              Admission Month & Year <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="signup-admission-date"
                type="month"
                value={admissionDate}
                onChange={(e) => handleAdmissionDateChange(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-brand-paper placeholder-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer [color-scheme:dark]"
              />
            </div>
            <p className="mt-1 text-[11px] text-brand-charcoal/60">
              Used to calculate your current academic year of study.
            </p>
          </div>

          {/* Year of Study */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="signup-year" className="block text-sm text-brand-charcoal font-medium">
                Year of Study <span className="text-red-400">*</span>
              </label>
              {selectedYear && admissionDate && (
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  Auto-calculated
                </span>
              )}
            </div>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                id="signup-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                required
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-brand-paper placeholder-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">— Select Year of Study —</option>
                <option value="1">1st Year (Freshman)</option>
                <option value="2">2nd Year (Sophomore)</option>
                <option value="3">3rd Year (Junior)</option>
                <option value="4">4th Year (Senior)</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Demographic Profile: Gender & Age Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label htmlFor="signup-gender" className="block text-sm text-brand-charcoal mb-1.5 font-medium">
                Gender <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  id="signup-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-brand-paper placeholder-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">— Select Gender —</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Age Group */}
            <div>
              <label htmlFor="signup-age-group" className="block text-sm text-brand-charcoal mb-1.5 font-medium">
                Age Group <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  id="signup-age-group"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  required
                  className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-brand-paper placeholder-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">— Select Age Group —</option>
                  <option value="Under 18">Under 18</option>
                  <option value="18-21">18-21</option>
                  <option value="22-25">22-25</option>
                  <option value="26+">26+</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* State of Domicile */}
          <div>
            <label htmlFor="signup-state" className="block text-sm text-brand-charcoal mb-1.5 font-medium">
              State of Domicile <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                id="signup-state"
                value={stateOfDomicile}
                onChange={(e) => setStateOfDomicile(e.target.value)}
                required
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-brand-paper placeholder-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">— Select State of Domicile —</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-500/20"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-brand-charcoal">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-brand-charcoal font-bold underline hover:opacity-80 transition-opacity"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

/* ─── Main Auth Page ─── */
export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  ); // 'login' | 'signup'

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-r border-slate-800 p-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white">
            Uni<span className="text-indigo-400">Metric</span>
          </span>
        </div>

        {/* Middle content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Data-driven decisions<br />
              <span className="gradient-text">start here.</span>
            </h2>
            <p className="text-brand-cream text-sm leading-relaxed">
              Join thousands of students who use UniMetric to discover, compare,
              and choose the right college with confidence.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              'Authentic reviews from enrolled students',
              'Category-wise rating analytics & charts',
              'Side-by-side college comparison tool',
              'Sentiment-driven feedback insights',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-brand-cream">
                <ChevronRight className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-brand-cream/60 text-xs">© 2025 UniMetric — College Review & Analytics System</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 relative">
        {/* Back to home */}
        <div className="absolute top-6 left-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-brand-charcoal/70 hover:text-brand-charcoal text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">
              Uni<span className="text-indigo-400">Metric</span>
            </span>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl border border-slate-700 bg-slate-800/60 p-1 mb-8">
            {[
              { key: 'login',  label: 'Sign In',      icon: LogIn    },
              { key: 'signup', label: 'Create Account', icon: UserPlus },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === key
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="glass-card p-7">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-brand-charcoal mb-1">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-brand-charcoal/70 text-sm">
                {mode === 'login'
                  ? 'Sign in to access your personalized dashboard.'
                  : 'Get started — it only takes a minute.'}
              </p>
            </div>

            {mode === 'login' ? (
              <LoginForm onSwitch={() => setMode('signup')} />
            ) : (
              <SignUpForm onSwitch={() => setMode('login')} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
