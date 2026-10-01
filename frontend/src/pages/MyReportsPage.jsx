import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  Paperclip,
  ArrowRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import CitizenLayout from '../layouts/CitizenLayout';
import ReportStatusBadge from '../components/reports/ReportStatusBadge';
import { reportApi } from '../services/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Rejected', label: 'Rejected' }
];

export default function MyReportsPage() {
  const navigate = useNavigate();

  // Data state
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Status flags
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input by 300ms
  const debounceTimerRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val.trim());
      setCurrentPage(1);
    }, 300);
  };

  // Fetch categories once on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await reportApi.getCategories();
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.warn('[MyReports] Could not load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch summary counts
  const loadSummary = useCallback(async () => {
    try {
      const res = await reportApi.getMySummary();
      if (res.success && res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.warn('[MyReports] Could not load status summary:', err);
    }
  }, []);

  // Fetch reports list based on filters & pagination
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        sort: 'updated_at',
        order: 'DESC'
      };

      if (status) params.status = status;
      if (categoryId) params.category_id = categoryId;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await reportApi.getMyReports(params);

      if (res.success) {
        setReports(res.reports || []);
        setPagination(
          res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
        );
      } else {
        throw new Error(res.message || 'Failed to load reports.');
      }
    } catch (err) {
      console.error('[MyReports] Fetch error:', err);
      setError(err.message || 'We could not load your reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, status, categoryId, debouncedSearch]);

  useEffect(() => {
    fetchReports();
    loadSummary();
  }, [fetchReports, loadSummary]);

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setCategoryId('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(search || status || categoryId);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <CitizenLayout>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Page Header */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
                  Citizen Workspace
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs text-stone-500 font-medium">Report Tracking</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
                My Reports
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                View the reports you have submitted and check their current status.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/reports/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-950 transition-colors shadow-xs border-b-2 border-gold-500"
              >
                <PlusCircle className="w-4 h-4 text-gold-400" />
                <span>Report an Issue</span>
              </Link>
            </div>
          </div>

          {/* Quick Status Filter Pills from Real Summary */}
          {summary && (
            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatus('');
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  status === ''
                    ? 'bg-navy-900 text-white border-navy-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>All Reports</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    status === '' ? 'bg-gold-500 text-navy-950' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {summary.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('Submitted');
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  status === 'Submitted'
                    ? 'bg-navy-900 text-white border-navy-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>Submitted</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    status === 'Submitted'
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {summary.submitted}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('Under Review');
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  status === 'Under Review'
                    ? 'bg-navy-900 text-white border-navy-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>Under Review</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    status === 'Under Review'
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {summary.underReview}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('In Progress');
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  status === 'In Progress'
                    ? 'bg-navy-900 text-white border-navy-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>In Progress</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    status === 'In Progress'
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {summary.inProgress}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('Resolved');
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  status === 'Resolved'
                    ? 'bg-navy-900 text-white border-navy-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>Resolved</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    status === 'Resolved'
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {summary.resolved}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <label htmlFor="report-search" className="sr-only">
                Search your reports
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="report-search"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by reference, title, or keywords..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg text-neutral-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-navy-900 focus:border-navy-900 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setDebouncedSearch('');
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  aria-label="Clear search text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="sm:col-span-3">
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-filter"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-navy-900 focus:border-navy-900 transition-colors"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="sm:col-span-3">
              <label htmlFor="category-filter" className="sr-only">
                Filter by category
              </label>
              <select
                id="category-filter"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-navy-900 focus:border-navy-900 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Clear helper */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">
                Filtered view active{' '}
                {debouncedSearch && <span>• keyword: "{debouncedSearch}"</span>}
                {status && <span>• status: {status}</span>}
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area: Loading / Error / Empty / Data Table & Cards */}
        {loading ? (
          <div className="bg-white border border-stone-200 rounded-xl p-8 text-center space-y-4 shadow-xs">
            <div className="w-10 h-10 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-stone-700" role="status">
              Loading your submitted reports...
            </p>
            {/* Skeleton rows */}
            <div className="space-y-3 max-w-2xl mx-auto pt-2">
              <div className="h-10 bg-stone-100 rounded-md animate-pulse"></div>
              <div className="h-10 bg-stone-100 rounded-md animate-pulse"></div>
              <div className="h-10 bg-stone-100 rounded-md animate-pulse"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">
              We couldn't load your reports.
            </h2>
            <p className="text-xs text-stone-600 mt-1 mb-4 leading-relaxed">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchReports}
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-950 transition-colors border-b-2 border-gold-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : reports.length === 0 ? (
          /* Empty States */
          hasActiveFilters ? (
            <div className="bg-white border border-stone-200 rounded-xl p-8 sm:p-12 text-center shadow-xs">
              <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-stone-200">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                No matching reports found
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1 mb-5">
                We couldn't find any reports matching your current search query or filter settings.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-navy-950 text-xs font-semibold rounded-lg hover:bg-stone-200 border border-stone-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl p-8 sm:p-12 text-center shadow-xs">
              <div className="w-14 h-14 bg-navy-50 text-navy-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-navy-200">
                <FileText className="w-7 h-7 text-navy-900" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-950">
                No reports yet
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
                You haven't submitted any CivicWatch reports. When you report public infrastructure or service issues, they will appear here.
              </p>
              <Link
                to="/reports/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-950 transition-colors shadow-xs border-b-2 border-gold-500"
              >
                <PlusCircle className="w-4 h-4 text-gold-400" />
                <span>Report an Issue</span>
              </Link>
            </div>
          )
        ) : (
          /* Reports Present: Desktop Table + Mobile Cards */
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-stone-200 text-left">
                <thead className="bg-stone-50/80 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Reference
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Incident Title
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Category
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      County / Location
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Updated
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {reports.map((report) => (
                    <tr
                      key={report.reference}
                      onClick={() => navigate(`/reports/${report.reference}`)}
                      className="hover:bg-stone-50/90 transition-colors cursor-pointer group"
                    >
                      {/* Reference */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-navy-950 group-hover:text-gold-600 transition-colors">
                          {report.reference}
                        </span>
                        {report.is_anonymous && (
                          <span className="block text-[10px] text-stone-500 font-medium">
                            Anonymous
                          </span>
                        )}
                      </td>

                      {/* Title */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-neutral-900 group-hover:text-navy-950 line-clamp-1 max-w-xs">
                          {report.title}
                        </div>
                        {report.attachment_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-stone-500 mt-0.5">
                            <Paperclip className="w-3 h-3 text-stone-400" />
                            <span>
                              {report.attachment_count}{' '}
                              {report.attachment_count === 1 ? 'file' : 'files'}
                            </span>
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-medium border border-stone-200">
                          {report.category?.name || 'General'}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4 whitespace-nowrap text-stone-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {report.county}
                            {report.ward ? `, ${report.ward}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <ReportStatusBadge status={report.status} />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-stone-500 font-mono text-[11px]">
                        {formatDate(report.updated_at || report.created_at)}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/reports/${report.reference}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-gold-600 transition-colors"
                        >
                          <span>View Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {reports.map((report) => (
                <div
                  key={report.reference}
                  onClick={() => navigate(`/reports/${report.reference}`)}
                  className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs active:bg-stone-50 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-navy-950">
                      {report.reference}
                    </span>
                    <ReportStatusBadge status={report.status} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 line-clamp-2">
                      {report.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-1">
                    <span className="px-2 py-0.5 bg-stone-100 rounded text-[11px] font-medium border border-stone-200 text-stone-700">
                      {report.category?.name || 'General'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{report.county}</span>
                    </span>
                    {report.attachment_count > 0 && (
                      <span className="flex items-center gap-1 text-stone-500">
                        <Paperclip className="w-3 h-3" />
                        <span>{report.attachment_count}</span>
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-400 font-mono">
                      {formatDate(report.updated_at || report.created_at)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-navy-900 text-xs">
                      <span>View Report</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gold-600" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <span className="text-xs text-stone-600 font-medium">
                  Showing{' '}
                  <span className="font-bold text-navy-950">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-bold text-navy-950">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-bold text-navy-950">{pagination.total}</span> reports
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {/* Page Indicator */}
                  <span className="px-3 py-1 text-xs font-bold text-navy-950 bg-stone-100 rounded-md border border-stone-200">
                    {currentPage} / {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
