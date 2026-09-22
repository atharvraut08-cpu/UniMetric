import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap, BarChart3, PlusCircle,
  Menu, X, LogIn, LogOut, UserCircle2, ShieldCheck,
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export default function Navbar() {
  const { role, user, isAuthenticated, logout } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Normalize role for robust RBAC checks
  const userRole = (role || '').toLowerCase();
  const isStudent = userRole === 'student';
  const isAdmin = userRole === 'admin';
  const isProspect = userRole === 'prospect' || !userRole;

  // Build centre nav links based on auth state & role
  const navLinks = isAuthenticated
    ? [
        { to: '/', label: 'Home', icon: BarChart3 },
        ...((isAdmin || isProspect)
          ? [{ to: '/compare', label: 'Compare Colleges', icon: BarChart3 }]
          : []),
        ...(isAdmin
          ? [{ to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck }]
          : []),
        ...(isStudent
          ? [{ to: '/submit-feedback', label: 'Submit Feedback', icon: PlusCircle }]
          : []),
      ]
    : [
        { to: '/', label: 'Home', icon: BarChart3 },
        { to: '/compare', label: 'Compare Colleges', icon: BarChart3 },
        { to: '/auth', label: 'Try UniMetric', icon: LogIn },
      ];

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-charcoal/10 bg-brand-paper/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-2xl bg-brand-coral text-white flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-brand-charcoal tracking-tight">
              Uni<span className="text-brand-coral">Metric</span>
            </span>
          </Link>

          {/* Desktop Centre Nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => {
                  const isAdmin = to === '/admin';
                  if (isAdmin) {
                    return `px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-brand-yellow text-brand-charcoal font-semibold shadow-soft'
                        : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-brand-cream'
                    }`;
                  }
                  return `px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-cream text-brand-charcoal font-semibold shadow-soft'
                      : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-brand-cream'
                  }`;
                }}
              >
                {to === '/admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                {label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                {/* User Name Badge */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-brand-charcoal/10 bg-brand-cream text-brand-charcoal">
                  <UserCircle2 className="w-4 h-4 text-brand-coral" />
                  <span className="text-sm font-medium">
                    {user?.name || 'User'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-brand-charcoal/15 bg-brand-paper text-brand-charcoal text-sm font-medium hover:bg-brand-cream transition-all duration-200"
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
                  className="px-4 py-2 rounded-2xl border border-brand-charcoal/15 bg-brand-paper text-brand-charcoal text-sm font-medium hover:bg-brand-cream transition-all duration-200"
                >
                  Sign Up
                </Link>

                {/* Log In */}
                <Link
                  to="/auth"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-coral text-white text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-soft"
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
            className="md:hidden p-2 rounded-2xl text-brand-charcoal hover:bg-brand-cream transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-brand-charcoal/10 py-3 animate-fade-in">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-2xl mb-1 transition-colors ${
                    isActive
                      ? 'bg-brand-cream text-brand-charcoal font-semibold'
                      : 'text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-brand-cream'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Mobile Auth Actions */}
            <div className="mt-2 pt-2 border-t border-brand-charcoal/10">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-brand-charcoal">
                    <UserCircle2 className="w-4 h-4 text-brand-coral" />
                    {user?.name || 'User'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-brand-charcoal hover:bg-brand-cream rounded-2xl transition-colors"
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
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-brand-charcoal hover:bg-brand-cream rounded-2xl transition-colors"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium bg-brand-coral text-white rounded-2xl shadow-soft transition-colors mt-1"
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
