import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  GraduationCap, BarChart3, PlusCircle,
  ChevronDown, Menu, X, LogIn, ShieldCheck,
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';

const roles = ['Prospect', 'Student', 'Admin'];

const roleHints = {
  Prospect: 'Browsing & comparing colleges',
  Student:  'View your college insights',
  Admin:    'Manage platform data',
};

const roleDotColor = {
  Prospect: 'bg-indigo-400',
  Student:  'bg-emerald-400',
  Admin:    'bg-amber-400',
};

export default function Navbar() {
  const { role, setRole } = useRole();
  const [roleOpen, setRoleOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // "Submit Feedback" is only visible to Students
  const baseNavLinks = [
    { to: '/',        label: 'Home',    icon: BarChart3  },
    { to: '/compare', label: 'Compare', icon: BarChart3  },
  ];

  const studentLink = { to: '/submit-feedback', label: 'Submit Feedback', icon: PlusCircle };
  const navLinks = role === 'Student'
    ? [...baseNavLinks, studentLink]
    : baseNavLinks;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-shadow">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Uni<span className="text-indigo-400">Metric</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side: Role Switcher + Login + Mobile toggle */}
          <div className="flex items-center gap-2">

            {/* Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-sm text-slate-300 hover:border-indigo-500/50 hover:text-white transition-all duration-200"
              >
                <span className={`w-2 h-2 rounded-full animate-pulse ${roleDotColor[role]}`} />
                <span className="hidden sm:inline text-slate-400">Viewing as:</span>
                <span className="font-semibold text-white">{role}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${roleOpen ? 'rotate-180' : ''}`} />
              </button>

              {roleOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900/98 backdrop-blur shadow-2xl overflow-hidden z-50 animate-fade-in">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setRoleOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        role === r
                          ? 'bg-indigo-500/15 text-indigo-300'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {r === 'Admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="font-medium">{r}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 ml-5">{roleHints[r]}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login button */}
            <Link
              to="/auth"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-sm font-medium hover:bg-indigo-500/20 hover:text-white transition-all duration-200"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 animate-fade-in">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-colors ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-indigo-300 hover:text-white"
            >
              <LogIn className="w-4 h-4" />
              Login / Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
