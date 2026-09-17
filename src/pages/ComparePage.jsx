import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeftRight, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { getColleges, compareColleges } from '../services/mockDataService';
import CollegeSelector from '../components/compare/CollegeSelector';
import ComparisonTable from '../components/compare/ComparisonTable';
import ComparisonBarChart from '../components/compare/ComparisonBarChart';
import DataDrivenInsightsSection from '../components/insights/DataDrivenInsightsSection';
import { useRole } from '../context/RoleContext';

export default function ComparePage() {
  const { isAuthenticated } = useRole();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  
  // Basic objects for dropdowns
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);
  
  // Detailed objects for charts
  const [detailA, setDetailA] = useState(null);
  const [detailB, setDetailB] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getColleges()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : (data?.results || []);
        setColleges(list);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('API Error [ComparePage]: Failed to fetch colleges on mount:', err);
        setColleges([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (selectedA && selectedB) {
      compareColleges(selectedA.id, selectedB.id)
        .then((data) => {
          if (!isMounted) return;
          const list = Array.isArray(data) ? data : (data?.results || []);
          // DRF endpoint returns a list of two college summaries
          setDetailA(list.find((c) => c.id === selectedA.id) || null);
          setDetailB(list.find((c) => c.id === selectedB.id) || null);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('API Error [ComparePage]: Failed to compare colleges:', err);
          setDetailA(null);
          setDetailB(null);
        });
    } else {
      setDetailA(null);
      setDetailB(null);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedA, selectedB]);

  const hasBoth = detailA && detailB;

  // ── Auth Guard ────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="glass-card p-10 max-w-md w-full flex flex-col items-center gap-6">
          {/* Lock icon */}
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Registered Users Only</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Comparing colleges side-by-side is a feature reserved for registered users.
              Log in with a Prospect or Student account to access this tool.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Page header */}
      <div className="text-center max-w-2xl mx-auto animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-4">
          <BarChart3 className="w-3.5 h-3.5" />
          Side-by-Side Comparison
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Compare Colleges</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Select two colleges to compare their ratings, infrastructure, and career outcomes side-by-side.
        </p>
      </div>

      {/* Selectors */}
      <div className="glass-card p-6 animate-fade-in-up delay-100 relative z-30">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <CollegeSelector
            colleges={colleges}
            selected={selectedA}
            onChange={setSelectedA}
            label="College A"
            excludeId={selectedB?.id}
          />

          <div className="hidden sm:flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <CollegeSelector
            colleges={colleges}
            selected={selectedB}
            onChange={setSelectedB}
            label="College B"
            excludeId={selectedA?.id}
          />
        </div>
      </div>

      {/* Empty state */}
      {!hasBoth && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center mb-5">
            <BarChart3 className="w-10 h-10 text-slate-700" />
          </div>
          <p className="text-slate-400 font-medium">
            {!selectedA && !selectedB
              ? 'Select two colleges to start comparing.'
              : `Select ${!selectedA ? 'College A' : 'College B'} to continue.`}
          </p>
          <p className="text-slate-600 text-sm mt-1">
            Metrics, charts, and delta indicators will appear here.
          </p>
        </div>
      )}

      {/* Comparison content */}
      {hasBoth && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Grouped bar chart */}
          <ComparisonBarChart collegeA={detailA} collegeB={detailB} />

          {/* Side-by-side table */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Detailed Metrics</h2>
            <ComparisonTable collegeA={detailA} collegeB={detailB} />
          </div>

          {/* ML Insights side-by-side */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Data-Driven Insights Comparison</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-400 border-b border-slate-800 pb-2">
                  {detailA.name}
                </p>
                <DataDrivenInsightsSection collegeId={detailA.id} collegeName={detailA.name} />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-400 border-b border-slate-800 pb-2">
                  {detailB.name}
                </p>
                <DataDrivenInsightsSection collegeId={detailB.id} collegeName={detailB.name} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
