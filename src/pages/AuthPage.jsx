import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Mail, Lock, User, Eye, EyeOff,
  ArrowLeft, LogIn, UserPlus, ChevronRight, ShieldCheck,
} from 'lucide-react';

const ROLES = ['Prospect', 'Student', 'Admin'];

const roleDescriptions = {
  Prospect: 'Search and compare colleges before you enroll.',
  Student:  'Rate and review your own institution.',
  Admin:    'Manage colleges, reviews, and platform analytics.',
};

/* ─── Reusable form field ─── */
function Field({ id, label, type = 'text', placeholder, value, onChange, icon: Icon, rightSlot }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-slate-300 mb-1.5 font-medium">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${rightSlot ? 'pr-10' : 'pr-4'} py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Login form ─── */
function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Phase 1: demo only — no real auth
    console.log('[UniMetric] Login attempt (mock):', { email });
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        id="login-email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={setEmail}
        icon={Mail}
      />
      <Field
        id="login-password"
        label="Password"
        type={showPw ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
        icon={Lock}
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

      <div className="flex items-center justify-end">
        <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
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

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[UniMetric] Sign-up attempt (mock):', { name, email, role: selectedRole });
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        id="signup-name"
        label="Full name"
        placeholder="Jane Doe"
        value={name}
        onChange={setName}
        icon={User}
      />
      <Field
        id="signup-email"
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={setEmail}
        icon={Mail}
      />
      <Field
        id="signup-password"
        label="Password"
        type={showPw ? 'text' : 'password'}
        placeholder="Min. 8 characters"
        value={password}
        onChange={setPassword}
        icon={Lock}
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
      />

      {/* Role picker */}
      <div>
        <label className="block text-sm text-slate-300 mb-2 font-medium">
          I am a…
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRole(r)}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-xs font-medium transition-all duration-200 ${
                selectedRole === r
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              {r === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : r === 'Student' ? <User className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              {r}
            </button>
          ))}
        </div>
        {selectedRole && (
          <p className="mt-2 text-xs text-slate-500 animate-fade-in">{roleDescriptions[selectedRole]}</p>
        )}
      </div>

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

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

/* ─── Page ─── */
export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

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
            <p className="text-slate-400 text-sm leading-relaxed">
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
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                <ChevronRight className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-slate-600 text-xs">© 2025 UniMetric — Phase 1 Demo</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 relative">
        {/* Back to home */}
        <div className="absolute top-6 left-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors"
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
              <h1 className="text-xl font-bold text-white mb-1">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-slate-400 text-sm">
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

          {/* Phase 1 disclaimer */}
          <p className="mt-5 text-center text-xs text-slate-600">
            Phase 1 demo — authentication is UI-only. No credentials are stored or verified.
          </p>
        </div>
      </div>
    </div>
  );
}
