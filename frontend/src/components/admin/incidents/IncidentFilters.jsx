import React, { useState, useEffect } from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Dismissed', label: 'Dismissed' }
];

const ASSIGNED_OPTIONS = [
  { value: 'all', label: 'All Assignments' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'Unassigned' }
];

export default function IncidentFilters({
  filters,
  categories = [],
  counties = [],
  onFilterChange,
  onReset
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounce search input: 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        onFilterChange('search', searchTerm);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, onFilterChange]);

  const activeFiltersCount = [
    filters.status,
    filters.category_id,
    filters.county,
    filters.assigned !== 'all' ? filters.assigned : '',
    filters.date_from,
    filters.date_to,
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-3">
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference (CWK-...), title, or keywords..."
            className="w-full pl-9 pr-9 py-2 text-xs text-navy-950 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onFilterChange('search', '');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onReset();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-navy-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Reset ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-stone-100 text-xs">
        {/* Status */}
        <div>
          <label htmlFor="filter-status" className="block text-[11px] font-semibold text-stone-500 mb-1">
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full py-1.5 px-2 bg-stone-50 border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="filter-category" className="block text-[11px] font-semibold text-stone-500 mb-1">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category_id || ''}
            onChange={(e) => onFilterChange('category_id', e.target.value)}
            className="w-full py-1.5 px-2 bg-stone-50 border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* County */}
        <div>
          <label htmlFor="filter-county" className="block text-[11px] font-semibold text-stone-500 mb-1">
            County
          </label>
          <select
            id="filter-county"
            value={filters.county || ''}
            onChange={(e) => onFilterChange('county', e.target.value)}
            className="w-full py-1.5 px-2 bg-stone-50 border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            <option value="">All Counties</option>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Assignment */}
        <div>
          <label htmlFor="filter-assigned" className="block text-[11px] font-semibold text-stone-500 mb-1">
            Assignment
          </label>
          <select
            id="filter-assigned"
            value={filters.assigned || 'all'}
            onChange={(e) => onFilterChange('assigned', e.target.value)}
            className="w-full py-1.5 px-2 bg-stone-50 border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            {ASSIGNED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="filter-date-from" className="block text-[11px] font-semibold text-stone-500 mb-1">
            From Date
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => onFilterChange('date_from', e.target.value)}
            className="w-full py-1.5 px-2 bg-stone-50 border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="filter-date-to" className="block text-[11px] font-semibold text-stone-500 mb-1">
            To Date
          </label>
          <input
            id="filter-date-to"
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => onFilterChange('date_to', e.target.value)}
            className="w-full py-1.5 px-2 bg-stone-50 border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
      </div>
    </div>
  );
}
