import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  ShieldCheck,
  PlusCircle,
  Calendar,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileSearch,
  ExternalLink
} from 'lucide-react';
import CitizenLayout from '../../layouts/CitizenLayout';
import VerificationStatusBadge from '../../components/verification/VerificationStatusBadge';
import verificationService from '../../services/verificationService';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'EVIDENCE_SUPPORTS_CLAIM', label: 'Evidence Supports Claim' },
  { value: 'EVIDENCE_CONFLICTS_WITH_CLAIM', label: 'Evidence Conflicts With Claim' },
  { value: 'MISSING_CONTEXT', label: 'Missing Context' },
  { value: 'INSUFFICIENT_EVIDENCE', label: 'Insufficient Evidence' },
  { value: 'REQUIRES_VERIFICATION', label: 'Requires Verification' }
];

export default function VerificationHistoryPage() {
  const navigate = useNavigate();

  const [verifications, setVerifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async (page = 1, status = selectedStatus) => {
    try {
      setLoading(true);
      setError('');
      const response = await verificationService.getVerifications({
        page,
        limit: 10,
        status: status || null
      });

      if (response.success) {
        setVerifications(response.data || []);
        setPagination(response.pagination || { page, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load verification history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1, selectedStatus);
  }, [selectedStatus]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchHistory(newPage, selectedStatus);
    }
  };

  return (
    <CitizenLayout>
      {() => (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
          {/* Header Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-navy-900 text-gold-400 border border-gold-500/30 flex items-center justify-center shrink-0 shadow-xs">
                <History className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight">
                  Verification History
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  Review your past submitted claims, statement evaluations, and AI evidence analyses.
                </p>
              </div>
            </div>

            <Link
              to="/verify"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 text-white text-xs font-bold rounded-lg hover:bg-navy-950 transition-colors shadow-xs border-b-2 border-gold-500 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-gold-400" />
              <span>Verify New Claim</span>
            </Link>
          </div>

          {/* Controls: Filter by Status */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
              <Filter className="w-4 h-4 text-stone-500" />
              <span>Filter by Status:</span>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy-900 text-stone-800"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* List or Loading or Empty State */}
          {loading ? (
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center shadow-xs flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-navy-900 mb-3" />
              <p className="text-xs font-semibold text-stone-600">
                Loading verification history...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white border border-rose-200 rounded-xl p-6 text-center text-xs text-rose-700 shadow-xs">
              {error}
            </div>
          ) : verifications.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-stone-200 rounded-xl p-10 text-center shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <FileSearch className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900">
                  No verification history yet
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {selectedStatus
                    ? 'No verification records match the selected status filter.'
                    : 'Submit news statements, rumors, social media claims, or screenshots to receive structured evidence assessments.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/verify')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-lg hover:bg-navy-950 transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>Verify Information Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {verifications.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-navy-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <VerificationStatusBadge status={item.status} size="sm" />
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {item.hasImage && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                          Screenshot
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm font-bold text-navy-950 line-clamp-2">
                      {item.mainClaim || item.claimText || 'Submitted Claim'}
                    </h2>

                    {item.summary && (
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    )}

                    {item.sourceUrl && (
                      <p className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span>{item.sourceTitle || item.sourceUrl}</span>
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/verify/${item.id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-navy-900 bg-stone-50 hover:bg-navy-900 hover:text-white border border-stone-200 transition-all shrink-0 self-start sm:self-center"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-xs flex items-center justify-between text-xs text-stone-600">
                  <span>
                    Showing Page <strong>{pagination.page}</strong> of{' '}
                    <strong>{pagination.totalPages}</strong> ({pagination.total} total verifications)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className="p-1.5 rounded border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className="p-1.5 rounded border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </CitizenLayout>
  );
}
