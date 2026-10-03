import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Radio,
  Search,
  Filter,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alertApi } from '../../services/api';
import AlertCard from '../../components/alerts/AlertCard';
import { DemoNoticeBanner } from '../../components/alerts/AlertBadge';
import CommunityAdvisoryModal from '../../components/alerts/CommunityAdvisoryModal';
import CitizenLayout from '../../layouts/CitizenLayout';
import {
  KENYAN_COUNTIES,
  ALERT_CATEGORIES,
  SEVERITY_CONFIG
} from '../../constants/alertConstants';
import logo from '../../assets/logo.jpg';

export default function AlertsFeedPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'ALL'
  );
  const [selectedCounty, setSelectedCounty] = useState(
    searchParams.get('county') || (user?.county ? user.county : 'All')
  );
  const [selectedSeverity, setSelectedSeverity] = useState(
    searchParams.get('severity') || ''
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // 'ACTIVE' or 'EXPIRED'
  const [page, setPage] = useState(1);

  // Data state
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 12,
        status: statusFilter,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        county: selectedCounty !== 'All' ? selectedCounty : undefined,
        severity: selectedSeverity || undefined,
        search: searchQuery.trim() || undefined
      };

      const res = await alertApi.getPublicAlerts(params);
      if (res.success) {
        setAlerts(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      } else {
        throw new Error(res.message || 'Failed to load civic alerts');
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve alerts at this time.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, selectedCategory, selectedCounty, selectedSeverity, searchQuery]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Handle filter changes
  const handleCategoryChange = (catKey) => {
    setSelectedCategory(catKey);
    setPage(1);
  };

  const handleCountyChange = (e) => {
    setSelectedCounty(e.target.value);
    setPage(1);
  };

  const handleSeverityChange = (e) => {
    setSelectedSeverity(e.target.value);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAlerts();
  };

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedCounty('All');
    setSelectedSeverity('');
    setSearchQuery('');
    setStatusFilter('ACTIVE');
    setPage(1);
  };

  // Main Page Content
  const mainContent = (
    <div className="space-y-6">
      {/* Demo Notice Banner (Rule 35) */}
      <DemoNoticeBanner />

      {/* Header section with CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-navy-900 text-gold-400 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
              Civic Alerts & Advisories
            </h1>
          </div>
          <p className="text-sm text-stone-600 max-w-2xl">
            Verified official broadcasts, scheduled utility downtime, public safety alerts, and community-reported civic notices across Kenya.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 self-start md:self-center">
          {user ? (
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 text-sm font-semibold transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-gold-400" />
              <span>Submit Advisory</span>
            </button>
          ) : (
            <Link
              to="/login?redirect=/alerts"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 text-sm font-semibold transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-gold-400" />
              <span>Sign in to Submit Advisory</span>
            </Link>
          )}
        </div>
      </div>

      {/* Primary Category Tabs */}
      <div className="bg-white border border-stone-200 rounded-xl p-1.5 flex flex-wrap gap-1 shadow-2xs">
        {ALERT_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-navy-900 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Secondary Search & Refinement Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search keyword, location, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </form>

          {/* County Selector */}
          <div>
            <select
              value={selectedCounty}
              onChange={handleCountyChange}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
            >
              <option value="All">All Counties (National & Local)</option>
              {KENYAN_COUNTIES.filter(c => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Severity Selector */}
          <div>
            <select
              value={selectedSeverity}
              onChange={handleSeverityChange}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High Severity</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
              <option value="INFO">Informational</option>
            </select>
          </div>

          {/* Active / Expired Toggle */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => { setStatusFilter('ACTIVE'); setPage(1); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-stone-600 hover:text-navy-900'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('EXPIRED'); setPage(1); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'EXPIRED'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-stone-600 hover:text-navy-900'
              }`}
            >
              Expired Archive
            </button>
          </div>
        </div>

        {/* Filter Stats & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-stone-800">{pagination.total}</strong> {statusFilter.toLowerCase()} notice{pagination.total === 1 ? '' : 's'}
            </span>
            {(selectedCounty !== 'All' || selectedCategory !== 'ALL' || selectedSeverity || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 font-semibold underline ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-navy-900"></span> Official
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-400"></span> Community
            </span>
          </div>
        </div>
      </div>

      {/* Alert Feed List / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 bg-white border border-stone-200 rounded-2xl p-8">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-stone-600">
            Checking real-time alerts & broadcasts...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-sm font-bold text-red-900">Unable to load alerts</h3>
          <p className="text-xs text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchAlerts}
            className="px-4 py-1.5 mt-2 bg-white border border-red-300 rounded-lg text-xs font-semibold text-red-800 hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-stone-100 text-stone-500 rounded-2xl flex items-center justify-center mx-auto">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">No alerts found</h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto mt-1">
              There are currently no active alerts matching your filter criteria in{' '}
              {selectedCounty === 'All' ? 'any county' : selectedCounty}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-2xs">
          <span className="text-xs text-stone-500">
            Page <strong className="text-stone-800">{pagination.page}</strong> of{' '}
            <strong className="text-stone-800">{pagination.totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Community Advisory Submission Modal */}
      <CommunityAdvisoryModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {
          fetchAlerts();
        }}
        userCounty={user?.county}
      />
    </div>
  );

  // If citizen is logged in, wrap in citizen layout with navigation sidebar
  if (user) {
    return <CitizenLayout>{mainContent}</CitizenLayout>;
  }

  // Public visitor layout with simple branded topbar
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col antialiased text-neutral-900">
      <header className="sticky top-0 z-40 bg-navy-950 text-white border-b border-navy-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="CivicWatch AI" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <span className="font-bold text-base tracking-tight text-white block">
                CivicWatch AI
              </span>
              <span className="text-[10px] text-gold-400 font-mono tracking-widest block uppercase">
                Kenya Civic Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-200 hover:text-white hover:bg-navy-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors"
            >
              Join Platform
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {mainContent}
      </main>

      <footer className="px-4 sm:px-6 lg:px-8 py-4 border-t border-stone-200 bg-white text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 CivicWatch AI Kenya • Developed for Open Civic Lab (OCL)</span>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/status" className="hover:underline">System Status</Link>
        </div>
      </footer>
    </div>
  );
}
