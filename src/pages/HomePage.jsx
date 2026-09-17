import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight, Star, TrendingUp, Users } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import CollegeCard from '../components/common/CollegeCard';
import { searchColleges, getColleges } from '../services/mockDataService';
import { useRole } from '../context/RoleContext';

const stats = [
  { icon: Users,     value: '10,000+', label: 'Student Reviews'    },
  { icon: BarChart3, value: '500+',    label: 'Colleges Indexed'   },
  { icon: Star,      value: '4.3',     label: 'Avg Platform Rating' },
  { icon: TrendingUp,value: '98%',     label: 'Data Accuracy'      },
];

export default function HomePage() {
  const { role } = useRole();
  const [allColleges, setAllColleges] = useState([]);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getColleges().then(data => {
      setAllColleges(data);
      setResults(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    searchColleges(q).then(setResults);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Data-Driven College Analytics
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 animate-fade-in-up">
            Find Your{' '}
            <span className="gradient-text">Perfect College</span>
            <br />
            with Real Insights
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
            Stop relying on word-of-mouth. UniMetric converts thousands of authentic student reviews into structured analytics —
            ratings, sentiment trends, and category-wise performance — so you can choose confidently.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto animate-fade-in-up delay-200">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 mt-6 animate-fade-in-up delay-300">
            {role === 'Admin' ? (
              <Link
                to="/submit-feedback"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium hover:from-amber-500 hover:to-orange-500 transition-all duration-200 shadow-lg shadow-amber-500/20"
              >
                View Platform Analytics
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/compare"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 text-sm font-medium hover:border-indigo-500/50 hover:text-white transition-all duration-200 ${role === 'Prospect' ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' : ''}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Compare Colleges
                </Link>
                {role === 'Student' && (
                  <Link
                    to="/submit-feedback"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-indigo-500/20"
                  >
                    Submit Your Review
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up delay-400">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="glass-card px-4 py-5 text-center">
              <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Results ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {query ? `Results for "${query}"` : 'All Colleges'}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {results.length} college{results.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-indigo-400">Loading colleges...</div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No colleges match your search.</p>
            <p className="text-slate-600 text-sm mt-1">Try a different name, location, or program.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((college, i) => (
              <div
                key={college.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <CollegeCard college={college} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
