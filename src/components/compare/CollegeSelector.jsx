import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, MapPin, X } from 'lucide-react';
import RatingBadge from '../common/RatingBadge';

/**
 * Searchable college selector dropdown.
 *
 * Click-outside strategy:
 *   We use a ref-based flag `isInsideClick` to mark when a mousedown originates
 *   inside the container. The blur/focusout handler only closes if the new
 *   focus target is outside the container AND no inside mousedown is pending.
 *   This cleanly handles autoFocus, keyboard navigation, and touch events.
 */
export default function CollegeSelector({ colleges, selected, onChange, label, excludeId }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // When we open the panel, focus the search input
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Close on click outside
  const handleOutsideClick = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [open, handleOutsideClick]);

  const collegeList = Array.isArray(colleges) ? colleges : (colleges?.results || []);
  const filtered = collegeList.filter((c) => {
    if (!c) return false;
    if (excludeId && c.id === excludeId) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q))
    );
  });

  const toggleOpen = () => setOpen((prev) => !prev);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setOpen(false);
    setQuery('');
  };

  const handleSelect = (college) => {
    onChange(college);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${open ? 'z-50' : 'z-10'}`}>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1.5">{label}</p>

      {/* Trigger — <div role="button"> avoids nested-button invalid HTML */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggleOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); } }}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/60 cursor-pointer hover:border-indigo-500/50 transition-all duration-200 select-none"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selected ? (
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{selected.name}</p>
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {selected.location}
            </p>
          </div>
        ) : (
          <span className="text-slate-500 text-sm">Select a college…</span>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {selected && <RatingBadge rating={selected.avgScore || selected.overallRating} size="sm" />}
          {selected ? (
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleClear}
              className="p-0.5 rounded text-slate-500 hover:text-white transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className="absolute z-50 top-full mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/98 backdrop-blur shadow-2xl overflow-hidden animate-fade-in"
          onMouseDown={(e) => e.stopPropagation()}   /* prevent outside-click handler firing */
        >
          {/* Search */}
          <div className="p-2 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filtered.length > 0) {
                    e.preventDefault();
                    handleSelect(filtered[0]);
                  }
                }}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-60 overflow-y-auto divide-y divide-slate-800/50 overscroll-contain">
            {filtered.length === 0 ? (
              <li className="p-4 text-sm text-slate-500 text-center">No colleges found.</li>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(c);
                    }}
                    onClick={() => handleSelect(c)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-800 active:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{c.name}</p>
                        <p className="text-slate-500 text-xs">{c.location}</p>
                      </div>
                      <RatingBadge rating={c.avgScore || c.overallRating} size="sm" />
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
