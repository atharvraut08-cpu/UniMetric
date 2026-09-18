import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, ArrowRight, Star, BookOpen, Users } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import CollegeCard from '../components/common/CollegeCard';
import { searchColleges, getColleges, getPrograms } from '../services/mockDataService';
import { useRole } from '../context/RoleContext';

export default function HomePage() {
  const { role, isAuthenticated } = useRole();
  const navigate = useNavigate();

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      navigate('/compare');
    }
  };

  const [allColleges, setAllColleges] = useState([]);
  const [results, setResults] = useState([]);
  const [programsCount, setProgramsCount] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setLoadingStats(true);

    Promise.all([
      getColleges(),
      getPrograms(),
    ])
      .then(([collegesData, programsData]) => {
        if (!isMounted) return;
        const colList = Array.isArray(collegesData) ? collegesData : (collegesData?.results || []);
        const progList = Array.isArray(programsData) ? programsData : (programsData?.results || []);

        setAllColleges(colList);
        setResults(colList);
        setProgramsCount(progList.length);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('API Error [HomePage]: Failed to fetch colleges and platform stats:', err);
        setAllColleges([]);
        setResults([]);
        setProgramsCount(0);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          setLoadingStats(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    searchColleges(q)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.results || []);
        setResults(list);
      })
      .catch((err) => {
        console.error('API Error [HomePage]: Failed to search colleges:', err);
        setResults([]);
      });
  }, []);

  // Compute live database aggregates for the 4 stat cards
  const totalReviews = allColleges.reduce(
    (sum, c) => sum + (c.totalReviews || c.unique_reviews || 0),
    0
  );
  const totalColleges = allColleges.length;
  const ratedColleges = allColleges.filter((c) => (c.overallRating || 0) > 0);
  const avgRating = ratedColleges.length > 0
    ? (ratedColleges.reduce((sum, c) => sum + c.overallRating, 0) / ratedColleges.length).toFixed(1)
    : '0.0';
  const totalPrograms = programsCount;

  const statCards = [
    {
      icon: Users,
      value: loadingStats ? '—' : totalReviews.toLocaleString(),
      label: 'Student Reviews',
      cardColor: 'bg-brand-yellow',
    },
    {
      icon: BarChart3,
      value: loadingStats ? '—' : totalColleges.toLocaleString(),
      label: 'Colleges Indexed',
      cardColor: 'bg-brand-purple',
    },
    {
      icon: Star,
      value: loadingStats ? '—' : avgRating,
      label: 'Avg Platform Rating',
      cardColor: 'bg-brand-blue',
    },
    {
      icon: BookOpen,
      value: loadingStats ? '—' : totalPrograms.toLocaleString(),
      label: 'Programs Indexed',
      cardColor: 'bg-brand-yellow',
    },
  ];

  return (
    <div className="min-h-full">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-8 pb-14 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-charcoal/15 bg-brand-paper text-brand-charcoal text-xs font-semibold mb-6 animate-fade-in shadow-soft">
            <span className="w-2 h-2 rounded-full bg-brand-coral animate-pulse" />
            Data-Driven College Analytics
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-brand-charcoal leading-tight tracking-tight mb-6 animate-fade-in-up">
            Find Your{' '}
            <span className="bg-brand-yellow px-3 py-0.5 rounded-3xl border border-brand-charcoal/15 inline-block shadow-soft">
              Perfect College
            </span>
            <br />
            with Real Insights
          </h1>

          <p className="text-brand-charcoal/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8 animate-fade-in-up delay-100 font-medium">
            Stop relying on word-of-mouth. UniMetric converts thousands of authentic student reviews into structured analytics —
            ratings, sentiment trends, and category-wise performance — so you can choose confidently.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto animate-fade-in-up delay-200">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 animate-fade-in-up delay-300">
            <a
              href="/compare"
              onClick={handleCompareClick}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-charcoal text-white text-sm font-semibold hover:bg-brand-charcoal/90 transition-all duration-200 shadow-soft"
            >
              <BarChart3 className="w-4 h-4" />
              Compare Colleges
            </a>
            {role === 'Student' && (
              <Link
                to="/submit-feedback"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-coral text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-soft"
              >
                Submit Your Review
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Stats row with authentic database metrics & rounded-3xl */}
        <div className="max-w-4xl mx-auto mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up delay-400">
          {statCards.map(({ icon: Icon, value, label, cardColor }) => (
            <div
              key={label}
              className={`${cardColor} rounded-3xl p-5 text-center border border-brand-charcoal/10 shadow-soft hover:-translate-y-1 transition-transform`}
            >
              <div className="w-10 h-10 rounded-2xl bg-brand-charcoal/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-brand-charcoal" />
              </div>
              <div className="text-2xl font-black text-brand-charcoal">{value}</div>
              <div className="text-xs font-semibold text-brand-charcoal/70 mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Results ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-charcoal">
              {query ? `Results for "${query}"` : 'All Colleges'}
            </h2>
            <p className="text-brand-charcoal/60 text-sm mt-0.5 font-medium">
              {results.length} college{results.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-brand-charcoal font-semibold text-lg">Loading colleges...</div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-brand-cream border border-brand-charcoal/10 flex items-center justify-center mb-4 text-brand-charcoal">
              <BarChart3 className="w-8 h-8 text-brand-charcoal/40" />
            </div>
            <p className="text-brand-charcoal font-bold text-lg">No colleges match your search.</p>
            <p className="text-brand-charcoal/60 text-sm mt-1 font-medium">Try a different name, location, or program.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
