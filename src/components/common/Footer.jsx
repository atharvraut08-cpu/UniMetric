import { Link, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export default function Footer() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useRole();

  // Only visible on the home page for logged-out visitors
  if (pathname !== '/' || isAuthenticated) return null;

  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Uni<span className="text-indigo-400">Metric</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Transforming scattered student opinions into structured, data-driven insights for smarter college decisions.
            </p>

          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Navigation</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/compare', label: 'Compare Colleges' },
                { to: '/submit-feedback', label: 'Submit Feedback' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-slate-400 hover:text-indigo-400 text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Platform</h3>
            <ul className="space-y-2">
              {[
                { label: 'About Us',        href: '/' },
                { label: 'Privacy Policy',  href: '/' },
                { label: 'Terms of Service',href: '/' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-slate-400 hover:text-indigo-400 text-sm transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © 2025 UniMetric College Review & Analytics System
          </p>
          <p className="text-slate-600 text-xs">
            Built with React · Vite · Recharts · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
