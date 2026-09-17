import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap, BarChart3, PlusCircle,
  Menu, X, LogIn, LogOut, UserCircle2,
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export default function Navbar() {
  const { role, user, isAuthenticated, logout } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Build centre nav links based on auth state
  const navLinks = isAuthenticated
    ? [
        { to: '/',        label: 'Home',            icon: BarChart3   },
        { to: '/compare', label: 'Compare',          icon: BarChart3   },
        ...(role === 'Student'
          ? [{ to: '/submit-feedback', label: 'Submit Feedback', icon: PlusCircle }]
          : []),
      ]
    : [
        { to: '/',     label: 'Home',        icon: BarChart3 },
        { to: '/auth', label: 'Try UniMetric', icon: LogIn    },
      ];

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

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

          {/* Desktop Centre Nav */}
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

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* User Name Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60">
                  <UserCircle2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-slate-200">
                    {user?.name || 'User'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-rose-500/15 hover:border-rose-500/40 hover:text-rose-300 transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Sign Up */}
                <Link
                  to="/auth?mode=signup"
                  className="px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 text-sm font-medium hover:border-indigo-500/50 hover:text-white transition-all duration-200"
                >
                  Sign Up
                </Link>

                {/* Log In */}
                <Link
                  to="/auth"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-indigo-500/20"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Log In
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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

            {/* Mobile Auth Actions */}
            <div className="mt-2 pt-2 border-t border-slate-800">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300">
                    <UserCircle2 className="w-4 h-4 text-indigo-400" />
                    {user?.name || 'User'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-indigo-300 hover:text-white hover:bg-indigo-500/10 rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
