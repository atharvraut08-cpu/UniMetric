import { useState, useEffect } from 'react';
import { BarChart3, ArrowLeftRight } from 'lucide-react';
import { getColleges } from '../services/mockDataService';
import CollegeSelector from '../components/compare/CollegeSelector';
import ComparisonTable from '../components/compare/ComparisonTable';
import ComparisonBarChart from '../components/compare/ComparisonBarChart';
import DataDrivenInsightsSection from '../components/insights/DataDrivenInsightsSection';

export default function ComparePage() {
  const [colleges, setColleges] = useState([]);
  const [collegeA, setCollegeA] = useState(null);
  const [collegeB, setCollegeB] = useState(null);

  useEffect(() => {
    getColleges().then(setColleges);
  }, []);

  const hasBoth = collegeA && collegeB;

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
      <div className="glass-card p-6 animate-fade-in-up delay-100">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <CollegeSelector
            colleges={colleges}
            selected={collegeA}
            onChange={setCollegeA}
            label="College A"
            excludeId={collegeB?.id}
          />

          <div className="hidden sm:flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <CollegeSelector
            colleges={colleges}
            selected={collegeB}
            onChange={setCollegeB}
            label="College B"
            excludeId={collegeA?.id}
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
            {!collegeA && !collegeB
              ? 'Select two colleges to start comparing.'
              : `Select ${!collegeA ? 'College A' : 'College B'} to continue.`}
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
          <ComparisonBarChart collegeA={collegeA} collegeB={collegeB} />

          {/* Side-by-side table */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Detailed Metrics</h2>
            <ComparisonTable collegeA={collegeA} collegeB={collegeB} />
          </div>

          {/* ML Insights side-by-side */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Data-Driven Insights Comparison</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-400 border-b border-slate-800 pb-2">
                  {collegeA.name}
                </p>
                <DataDrivenInsightsSection collegeId={collegeA.id} collegeName={collegeA.name} />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-400 border-b border-slate-800 pb-2">
                  {collegeB.name}
                </p>
                <DataDrivenInsightsSection collegeId={collegeB.id} collegeName={collegeB.name} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
