import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search
} from 'lucide-react';
import { adminIncidentApi, reportApi } from '../../services/api';
import IncidentFilters from '../../components/admin/incidents/IncidentFilters';
import IncidentTable from '../../components/admin/incidents/IncidentTable';
import IncidentCard from '../../components/admin/incidents/IncidentCard';

export default function IncidentListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial filter values from URL params
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialLimit = parseInt(searchParams.get('limit') || '20', 10);
  const initialStatus = searchParams.get('status') || '';
  const initialCategoryId = searchParams.get('category_id') || '';
  const initialCounty = searchParams.get('county') || '';
  const initialAssigned = searchParams.get('assigned') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialDateFrom = searchParams.get('date_from') || '';
  const initialDateTo = searchParams.get('date_to') || '';

  const [filters, setFilters] = useState({
    status: initialStatus,
    category_id: initialCategoryId,
    county: initialCounty,
    assigned: initialAssigned,
    search: initialSearch,
    date_from: initialDateFrom,
    date_to: initialDateTo
  });

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [counties, setCounties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state to URL params
  const updateUrlParams = useCallback((newFilters, newPage, newLimit) => {
    const params = new URLSearchParams();
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.category_id) params.set('category_id', newFilters.category_id);
    if (newFilters.county) params.set('county', newFilters.county);
    if (newFilters.assigned && newFilters.assigned !== 'all') params.set('assigned', newFilters.assigned);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.date_from) params.set('date_from', newFilters.date_from);
    if (newFilters.date_to) params.set('date_to', newFilters.date_to);
    if (newPage > 1) params.set('page', String(newPage));
    if (newLimit !== 20) params.set('limit', String(newLimit));
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Load Categories & Kenya Counties on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const catRes = await reportApi.getCategories();
        if (catRes.success) {
          setCategories(catRes.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadMeta();

    // Standard Kenya Counties
    setCounties([
      'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa', 'Homa Bay',
      'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
      'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
      'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
      'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River',
      'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
    ]);
  }, []);

  // Fetch Incidents
  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = {
        page,
        limit,
        status: filters.status || undefined,
        category_id: filters.category_id || undefined,
        county: filters.county || undefined,
        assigned: filters.assigned || undefined,
        search: filters.search || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined
      };

      const res = await adminIncidentApi.listIncidents(queryParams);
      if (res.success) {
        setIncidents(res.incidents || []);
        setPagination(res.pagination || { page, limit, total: 0, totalPages: 1 });
      } else {
        setError(res.message || 'Failed to retrieve incidents.');
      }
    } catch (err) {
      setError(err.message || 'Network error fetching incidents.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchIncidents();
    updateUrlParams(filters, page, limit);
  }, [fetchIncidents, filters, page, limit, updateUrlParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });
    setPage(1); // Reset to page 1 on filter modification
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      category_id: '',
      county: '',
      assigned: 'all',
      search: '',
      date_from: '',
      date_to: ''
    });
    setPage(1);
  };

  const handleSelectIncident = (ref) => {
    navigate(`/admin/incidents/${encodeURIComponent(ref)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-navy-950 tracking-tight">
              Incident Management
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-navy-900 text-white">
              Triage Workspace
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Review, assign, and manage citizen-submitted incident reports across Kenyan counties.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchIncidents()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-navy-950 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Component */}
      <IncidentFilters
        filters={filters}
        categories={categories}
        counties={counties}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchIncidents()}
            className="font-bold underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-gold-500" />
            <p className="text-xs font-medium">Loading incident registry...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-navy-950">No matching incidents found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search criteria, clearing active filters, or changing date ranges.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-navy-950 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <IncidentTable
                incidents={incidents}
                onSelectIncident={handleSelectIncident}
              />
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-3">
              {incidents.map((incident) => (
                <IncidentCard key={incident.reference} incident={incident} />
              ))}
            </div>

            {/* Pagination Bar */}
            <div className="px-4 py-3 border-t border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong>{incidents.length > 0 ? (page - 1) * limit + 1 : 0}</strong> to{' '}
                  <strong>{Math.min(page * limit, pagination.total)}</strong> of{' '}
                  <strong>{pagination.total}</strong> incidents
                </span>
                <span className="text-stone-300">|</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  className="py-1 px-2 bg-white border border-stone-300 rounded text-xs focus:ring-1 focus:ring-gold-500"
                  aria-label="Items per page"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <span className="px-2 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
