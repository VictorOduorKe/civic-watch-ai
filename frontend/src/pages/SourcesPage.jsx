import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Globe,
  Info
} from 'lucide-react';
import { trustApi } from '../services/api';
import TrustBadge from '../components/trust/TrustBadge';
import ProvenanceModal from '../components/trust/ProvenanceModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SOURCE_TYPE_OPTIONS = [
  { label: 'All Sources', value: '' },
  { label: 'County Governments', value: 'COUNTY' },
  { label: 'Public Utilities', value: 'PUBLIC_UTILITY' },
  { label: 'National Government', value: 'GOVERNMENT' },
  { label: 'Civil Society', value: 'CIVIL_SOCIETY' },
  { label: 'Community Networks', value: 'COMMUNITY' }
];

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [selectedEntityForModal, setSelectedEntityForModal] = useState(null);

  const fetchSources = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await trustApi.getSources({
        page,
        limit: 20,
        source_type: selectedType || undefined,
        status: selectedStatus || undefined,
        search: search.trim() || undefined
      });
      setSources(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load civic sources directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources(1);
  }, [selectedType, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSources(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B4F72] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-[#D99A00]" />
                Civic Trust & Provenance Directory
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2137]">
                Recognized Civic Sources
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Explore recognized public authorities, essential utilities, civil society watchdogs, and community networks contributing to CivicWatch alerts and incident verification across Kenya.
              </p>
            </div>
            <div className="shrink-0 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-600 max-w-xs">
              <span className="font-semibold text-slate-800 block mb-1">Trust Transparency</span>
              Sources undergo formal review before receiving official status. Historical verification logs are publicly audited.
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sources by name, agency, or mandate..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4F72] focus:border-transparent bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1B4F72] text-white text-sm font-semibold rounded hover:bg-[#153e5b] transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4F72]"
                aria-label="Filter by source type"
              >
                {SOURCE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4F72]"
                aria-label="Filter by verification status"
              >
                <option value="">All Statuses</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="DISPUTED">Disputed</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>

              <button
                onClick={() => fetchSources(1)}
                className="p-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition-colors"
                title="Refresh sources"
                aria-label="Refresh sources"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Sources Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
            <div className="animate-spin w-8 h-8 border-4 border-[#1B4F72] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm font-medium">Loading civic sources directory...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-white rounded-lg border border-rose-200 text-center space-y-2">
            <p className="text-rose-700 font-semibold">{error}</p>
            <button
              onClick={() => fetchSources(1)}
              className="text-xs text-[#1B4F72] underline font-medium"
            >
              Try again
            </button>
          </div>
        ) : sources.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-lg border border-slate-200 p-6 space-y-2">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No sources found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No civic sources match your current filter criteria. Try clearing search terms or selecting another type.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((src) => (
              <div
                key={src.id}
                className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        {src.sourceType.replace('_', ' ')}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {src.name}
                      </h3>
                      {src.organization && (
                        <p className="text-xs text-slate-600 font-medium">
                          {src.organization}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrustBadge
                      status={src.verificationStatus}
                      isOfficial={src.isOfficial}
                      size="sm"
                    />
                  </div>

                  {src.description && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {src.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {src.website ? (
                    <a
                      href={src.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[#1B4F72] hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Site</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  ) : (
                    <span className="text-slate-400">No public site</span>
                  )}

                  <button
                    onClick={() => setSelectedEntityForModal({ type: 'SOURCE', id: src.id })}
                    className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-[#1B4F72] transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Provenance</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-white rounded border border-slate-200 text-xs text-slate-600">
            <span>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total sources)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchSources(pagination.page - 1)}
                className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSources(pagination.page + 1)}
                className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Provenance Details Modal */}
      {selectedEntityForModal && (
        <ProvenanceModal
          isOpen={Boolean(selectedEntityForModal)}
          onClose={() => setSelectedEntityForModal(null)}
          entityType={selectedEntityForModal.type}
          entityId={selectedEntityForModal.id}
        />
      )}
    </div>
  );
}
