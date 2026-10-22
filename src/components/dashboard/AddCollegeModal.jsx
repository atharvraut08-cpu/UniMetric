import { useState, useEffect } from 'react';
import {
  Building2, MapPin, ShieldCheck, X, Loader2, Plus, AlertCircle,
  GraduationCap, Trash2, Layers
} from 'lucide-react';
import { createCollege } from '../../services/mockDataService';

const COLLEGE_TYPES = [
  { value: 'PRIVATE', label: 'Private Institution' },
  { value: 'GOVERNMENT', label: 'Government / State University' },
  { value: 'AUTONOMOUS', label: 'Autonomous Institute' },
  { value: 'DEEMED', label: 'Deemed University' },
];

const INITIAL_PROGRAM = {
  program_name: '',
  degree_type: '',
  subject_area: '',
};

export default function AddCollegeModal({ isOpen, onClose, onCollegeAdded, authToken }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    college_type: 'PRIVATE',
    programs: [{ ...INITIAL_PROGRAM }],
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Reset error when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleProgramChange = (index, field, value) => {
    setFormData((prev) => {
      const nextPrograms = [...prev.programs];
      nextPrograms[index] = { ...nextPrograms[index], [field]: value };
      return { ...prev, programs: nextPrograms };
    });
    if (errorMsg) setErrorMsg('');
  };

  const handleAddProgram = () => {
    setFormData((prev) => ({
      ...prev,
      programs: [...prev.programs, { ...INITIAL_PROGRAM }],
    }));
  };

  const handleRemoveProgram = (index) => {
    if (formData.programs.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      programs: prev.programs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = formData.name.trim();
    const trimmedLocation = formData.location.trim();

    if (!trimmedName) {
      setErrorMsg('Please provide a college or institution name.');
      return;
    }
    if (!trimmedLocation) {
      setErrorMsg('Please specify the campus location (e.g., Pune, Maharashtra).');
      return;
    }

    // Validate programs array
    if (!formData.programs || formData.programs.length === 0) {
      setErrorMsg('At least one academic program must be defined for this institution.');
      return;
    }

    const cleanedPrograms = [];
    for (let i = 0; i < formData.programs.length; i++) {
      const prog = formData.programs[i];
      const pName = prog.program_name.trim();
      const dType = prog.degree_type.trim();
      const sArea = prog.subject_area.trim();

      if (!pName || !dType || !sArea) {
        setErrorMsg(`Please complete all fields for Program #${i + 1} (Program Name, Degree Type, and Subject Area).`);
        return;
      }

      cleanedPrograms.push({
        program_name: pName,
        degree_type: dType,
        subject_area: sArea,
      });
    }

    setLoading(true);
    try {
      const payload = {
        name: trimmedName,
        location: trimmedLocation,
        college_type: formData.college_type,
        programs: cleanedPrograms,
      };

      const newCollege = await createCollege(payload, authToken);

      // Reset form
      setFormData({
        name: '',
        location: '',
        college_type: 'PRIVATE',
        programs: [{ ...INITIAL_PROGRAM }],
      });

      if (onCollegeAdded) {
        onCollegeAdded(newCollege);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create college with programs:', err);
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'string') {
          setErrorMsg(data);
        } else if (data.name) {
          setErrorMsg(Array.isArray(data.name) ? data.name[0] : data.name);
        } else if (data.location) {
          setErrorMsg(Array.isArray(data.location) ? data.location[0] : data.location);
        } else if (data.college_type) {
          setErrorMsg(Array.isArray(data.college_type) ? data.college_type[0] : data.college_type);
        } else if (data.programs) {
          if (typeof data.programs === 'string') {
            setErrorMsg(data.programs);
          } else if (Array.isArray(data.programs)) {
            // Find the first error in nested array
            const firstErr = data.programs.find((p) => p && typeof p === 'object');
            if (firstErr) {
              const errKey = Object.keys(firstErr)[0];
              const msg = Array.isArray(firstErr[errKey]) ? firstErr[errKey][0] : firstErr[errKey];
              setErrorMsg(`Program error: ${errKey.replace('_', ' ')} - ${msg}`);
            } else {
              setErrorMsg(JSON.stringify(data.programs));
            }
          } else {
            setErrorMsg(JSON.stringify(data.programs));
          }
        } else if (data.detail) {
          setErrorMsg(data.detail);
        } else {
          setErrorMsg('Failed to create college. Please verify all required fields.');
        }
      } else {
        setErrorMsg('Unable to connect to the server. Please check your backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-brand-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="glass-card bg-brand-paper max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-brand-charcoal/15 shadow-2xl relative my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-brand-charcoal/10 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-yellow/30 border border-brand-yellow/50 flex items-center justify-center text-brand-charcoal shadow-soft">
              <Building2 className="w-6 h-6 text-brand-charcoal" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-brand-coral/10 text-brand-coral border border-brand-coral/20">
                  Admin Action
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Atomic Transaction
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-brand-charcoal tracking-tight mt-0.5">
                Add New College & Programs
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-brand-cream text-slate-400 hover:text-brand-charcoal transition-colors disabled:opacity-40"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 pr-1 -mr-1 mt-4">
          <p className="text-slate-600 text-xs font-medium mb-5 leading-relaxed">
            Register a new institution along with its foundational academic programs in an atomic transaction. This guarantees instant student review eligibility without foreign key integrity errors.
          </p>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form id="add-college-form" onSubmit={handleSubmit} className="space-y-6">
            {/* ── College Info Section ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Institutional Details
              </h3>

              {/* College Name */}
              <div>
                <label htmlFor="college-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Institution Name <span className="text-brand-coral">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="college-name"
                    type="text"
                    placeholder="e.g., City Engineering College"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    disabled={loading}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-charcoal/20 bg-brand-cream/30 text-brand-charcoal placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-brand-charcoal focus:ring-2 focus:ring-brand-coral/20 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Location & Type (2-col grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label htmlFor="college-location" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Campus Location <span className="text-brand-coral">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="college-location"
                      type="text"
                      placeholder="e.g., Pune, Maharashtra"
                      value={formData.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      disabled={loading}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-charcoal/20 bg-brand-cream/30 text-brand-charcoal placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-brand-charcoal focus:ring-2 focus:ring-brand-coral/20 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* College Type Dropdown */}
                <div>
                  <label htmlFor="college-type" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Classification <span className="text-brand-coral">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      id="college-type"
                      value={formData.college_type}
                      onChange={(e) => handleFieldChange('college_type', e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-brand-charcoal/20 bg-brand-cream/30 text-brand-charcoal text-sm font-medium focus:outline-none focus:border-brand-charcoal focus:ring-2 focus:ring-brand-coral/20 transition-all appearance-none cursor-pointer disabled:opacity-60"
                    >
                      {COLLEGE_TYPES.map((type) => (
                        <option key={type.value} value={type.value} className="bg-brand-paper text-brand-charcoal">
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Programs Section ── */}
            <div className="space-y-4 pt-4 border-t border-brand-charcoal/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-brand-coral" />
                    Academic Programs <span className="text-brand-coral">*</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    At least one program is required for Star Schema fact linking.
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-charcoal/5 border border-brand-charcoal/10 text-brand-charcoal">
                  {formData.programs.length} {formData.programs.length === 1 ? 'Program' : 'Programs'}
                </span>
              </div>

              {/* Dynamic Program Rows */}
              <div className="space-y-3">
                {formData.programs.map((program, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-brand-cream/35 border border-brand-charcoal/15 transition-all hover:border-brand-charcoal/30 relative group"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-charcoal text-white font-mono text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-brand-charcoal">
                          Program Specification
                        </span>
                      </div>

                      {formData.programs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProgram(index)}
                          disabled={loading}
                          className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                          title="Remove this program"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Program Name */}
                      <div className="sm:col-span-1">
                        <label
                          htmlFor={`program-name-${index}`}
                          className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1"
                        >
                          Program Name <span className="text-brand-coral">*</span>
                        </label>
                        <input
                          id={`program-name-${index}`}
                          type="text"
                          placeholder="e.g., Information Technology"
                          value={program.program_name}
                          onChange={(e) => handleProgramChange(index, 'program_name', e.target.value)}
                          disabled={loading}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-brand-charcoal/20 bg-white text-brand-charcoal placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-brand-charcoal focus:ring-1 focus:ring-brand-coral/30 transition-all disabled:opacity-60"
                        />
                      </div>

                      {/* Degree Type */}
                      <div>
                        <label
                          htmlFor={`degree-type-${index}`}
                          className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1"
                        >
                          Degree Type <span className="text-brand-coral">*</span>
                        </label>
                        <input
                          id={`degree-type-${index}`}
                          type="text"
                          placeholder="e.g., B.Tech / B.Sc / MBA"
                          list="degree-options"
                          value={program.degree_type}
                          onChange={(e) => handleProgramChange(index, 'degree_type', e.target.value)}
                          disabled={loading}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-brand-charcoal/20 bg-white text-brand-charcoal placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-brand-charcoal focus:ring-1 focus:ring-brand-coral/30 transition-all disabled:opacity-60"
                        />
                      </div>

                      {/* Subject Area */}
                      <div>
                        <label
                          htmlFor={`subject-area-${index}`}
                          className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1"
                        >
                          Subject Area <span className="text-brand-coral">*</span>
                        </label>
                        <input
                          id={`subject-area-${index}`}
                          type="text"
                          placeholder="e.g., Engineering / Science"
                          list="subject-options"
                          value={program.subject_area}
                          onChange={(e) => handleProgramChange(index, 'subject_area', e.target.value)}
                          disabled={loading}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-brand-charcoal/20 bg-white text-brand-charcoal placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-brand-charcoal focus:ring-1 focus:ring-brand-coral/30 transition-all disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Datalist presets for convenience */}
              <datalist id="degree-options">
                <option value="B.Tech" />
                <option value="B.E." />
                <option value="M.Tech" />
                <option value="B.Sc" />
                <option value="M.Sc" />
                <option value="BCA" />
                <option value="MCA" />
                <option value="MBA" />
              </datalist>

              <datalist id="subject-options">
                <option value="Engineering" />
                <option value="Computer Applications" />
                <option value="Management" />
                <option value="Sciences" />
                <option value="Commerce" />
                <option value="Arts & Humanities" />
              </datalist>

              {/* Add Program Button (Charcoal Outlined) */}
              <button
                id="add-program-row-btn"
                type="button"
                onClick={handleAddProgram}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-brand-charcoal/30 hover:border-brand-charcoal bg-white/80 hover:bg-white text-brand-charcoal font-bold text-xs shadow-2xs hover-lift flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-brand-charcoal" />
                <span>Add Another Program</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-4 mt-4 border-t border-brand-charcoal/10 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-brand-charcoal/20 text-brand-charcoal font-semibold text-xs hover:bg-brand-cream transition-all disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            id="submit-add-college-btn"
            type="submit"
            form="add-college-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand-coral hover:bg-brand-coral/90 text-white font-bold text-xs shadow-soft hover-lift flex items-center justify-center gap-2 border border-brand-charcoal active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Institution & Programs...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Submit College</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
