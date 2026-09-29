import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  GraduationCap,
  Settings,
  Building2,
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export default function Sidebar() {
  const { role, user, logout, isAuthenticated } = useRole();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userRole = (role || user?.role || '').toLowerCase();
  const isStudent = userRole === 'student';
  const isAdmin = userRole === 'admin';

  const navItems = isAdmin
    ? [
        { to: '/', label: 'Home', icon: LayoutDashboard },
        { to: '/admin', label: 'Admin Dashboard', icon: BarChart3 },
      ]
    : [
        { to: '/', label: 'Home', icon: LayoutDashboard },
        { to: '/dashboard', label: 'College Dashboard', icon: Building2 },
        { to: '/compare', label: 'Compare Colleges', icon: BarChart3 },
        ...(isStudent
          ? [{ to: '/submit-feedback', label: 'Submit Feedback', icon: PlusCircle }]
          : []),
      ];

  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      {/* Top Logo Mark */}
      <Link
        to="/"
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-coral text-white shadow-soft transition-transform hover:scale-105"
        title="UniMetric Home"
      >
        <GraduationCap className="h-6 w-6" />
      </Link>

      {/* Navigation Icons */}
      <nav className="flex flex-col items-center gap-3">
        {navItems.map(({ to, label, icon: Icon }, index) => (
          <NavLink
            key={`${to}-${index}`}
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) =>
              `group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand-paper text-brand-charcoal shadow-soft scale-105'
                  : 'text-brand-cream/60 hover:bg-white/10 hover:text-brand-cream'
              }`
            }
          >
            <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
            {/* Tooltip on hover */}
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-xl bg-brand-charcoal px-3 py-1.5 text-xs font-medium text-brand-cream opacity-0 shadow-soft transition-opacity group-hover:opacity-100 border border-white/10">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Settings / Secondary Log Out Button */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleLogout}
          title={isAuthenticated ? "Log Out" : "Log Out / Reset"}
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-brand-cream/60 transition-colors hover:bg-white/10 hover:text-brand-cream cursor-pointer"
        >
          <Settings className="h-5 w-5 transition-transform group-hover:rotate-45" />
          <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-xl bg-brand-charcoal px-3 py-1.5 text-xs font-medium text-brand-cream opacity-0 shadow-soft transition-opacity group-hover:opacity-100 border border-white/10">
            Log Out
          </span>
        </button>
      </div>
    </div>
  );
}
