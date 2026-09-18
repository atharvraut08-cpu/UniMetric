import { Link, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export default function Footer() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useRole();

  // Only visible on the home page for logged-out visitors
  if (pathname !== '/' || isAuthenticated) return null;

  return (
    <footer className="border-t border-brand-charcoal/10 bg-brand-paper mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-2xl bg-brand-coral text-white flex items-center justify-center shadow-soft">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-brand-charcoal">
                Uni<span className="text-brand-coral">Metric</span>
              </span>
            </div>
            <p className="text-brand-charcoal/60 text-sm leading-relaxed max-w-xs font-medium">
              Transforming scattered student opinions into structured, data-driven insights for smarter college decisions.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-brand-charcoal font-bold text-sm mb-3">Navigation</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/compare', label: 'Compare Colleges' },
                { to: '/submit-feedback', label: 'Submit Feedback' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-brand-charcoal/70 hover:text-brand-coral text-sm font-medium transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-brand-charcoal font-bold text-sm mb-3">Platform</h3>
            <ul className="space-y-2">
              {[
                { label: 'About Us',        href: '/' },
                { label: 'Privacy Policy',  href: '/' },
                { label: 'Terms of Service',href: '/' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-brand-charcoal/70 hover:text-brand-coral text-sm font-medium transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-charcoal/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-charcoal/50 text-xs font-medium">
            © 2025 UniMetric College Review & Analytics System
          </p>
          <p className="text-brand-charcoal/50 text-xs font-medium">
            Built with React · Vite · Recharts · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
