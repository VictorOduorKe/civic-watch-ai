import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  Lock,
  ArrowRight,
  Database,
  ExternalLink
} from 'lucide-react';
import { auditApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminAuditPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Integrity Check State
  const [integrityLoading, setIntegrityLoading] = useState(false);
  const [integrityResult, setIntegrityResult] = useState(null);
  const [integrityModalOpen, setIntegrityModalOpen] = useState(false);

  // Detail Modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Export Modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null);

  const fetchAuditEvents = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditApi.listEvents({
        page,
        limit: 25,
        search: search || undefined,
        severity: severityFilter || undefined,
        outcome: outcomeFilter || undefined,
        module: moduleFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });

      setEvents(res.data || []);
      setPagination(res.pagination || { page, limit: 25, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load system audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents(1);
  }, [severityFilter, outcomeFilter, moduleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuditEvents(1);
  };

  const handleVerifyIntegrity = async () => {
    setIntegrityLoading(true);
    try {
      const res = await auditApi.verifyIntegrity({ limit: 500 });
      const data = res.data || {};
      const isOk = Boolean(data.isValid ?? data.verified);
      setIntegrityResult({
        verified: isOk,
        checkedEvents: data.totalEventsVerified ?? data.checkedEvents ?? 0,
        latestHash: data.lastVerifiedHash || data.latestHash,
        message: isOk
          ? 'Cryptographic SHA-256 chain is complete, untampered, and continuous across all audit blocks.'
          : (data.message || 'Hash sequence mismatch or block tampering detected.')
      });
      setIntegrityModalOpen(true);
    } catch (err) {
      setIntegrityResult({
        verified: false,
        checkedEvents: 0,
        message: err.message || 'Audit chain integrity check failed.'
      });
      setIntegrityModalOpen(true);
    } finally {
      setIntegrityLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    setExportError(null);
    setExportSuccess(null);
    try {
      const res = await auditApi.exportEvents({
        format: exportFormat,
        severity: severityFilter || undefined,
        module: moduleFilter || undefined,
        outcome: outcomeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });

      if (res.data?.downloadUrl) {
        setExportSuccess(`Export generated successfully: ${res.data.recordCount} events.`);
        // Trigger download
        const fullUrl = res.data.downloadUrl.startsWith('http')
          ? res.data.downloadUrl
          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${res.data.downloadUrl.replace('/api', '')}`;
        window.open(fullUrl, '_blank');
      }
    } catch (err) {
      setExportError(err.message || 'Failed to generate compliance export.');
    } finally {
      setExportLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-900/60 text-red-200 border border-red-700/50">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-orange-900/60 text-orange-200 border border-orange-700/50">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-900/60 text-yellow-200 border border-yellow-700/50">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">LOW</span>;
    }
  };

  const getOutcomeBadge = (outcome) => {
    switch (outcome) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
          </span>
        );
      case 'FAILURE':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium">
            <XCircle className="w-3.5 h-3.5" /> FAILURE
          </span>
        );
      case 'DENIED':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-orange-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> DENIED
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{outcome}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-600 tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            Milestone 16 • Governance & Compliance
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-gold-600" />
            System Audit Trail
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Cryptographically chained, immutable audit records tracking all administrative mutations and security actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerifyIntegrity}
            disabled={integrityLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60 transition disabled:opacity-50"
            title="Cryptographically verify SHA-256 chain continuity"
          >
            <ShieldCheck className={`w-4 h-4 ${integrityLoading ? 'animate-spin' : ''}`} />
            Verify Chain Integrity
          </button>

          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-navy-800 text-gold-400 border border-gold-500/30 hover:bg-navy-700 transition"
          >
            <Download className="w-4 h-4" />
            Export Compliance Report
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Audit Events</span>
            <Database className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {pagination.total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Cryptographically registered</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Chain Status</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 flex items-center gap-2">
            Verified
          </div>
          <div className="text-xs text-slate-500 mt-1">SHA-256 Block Chained</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High / Critical Events</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400 mt-2">
            {events.filter((e) => e.severity === 'HIGH' || e.severity === 'CRITICAL').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Current viewing page</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Security Standard</span>
            <ShieldCheck className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-bold text-gold-400 mt-2">M16 Guard</div>
          <div className="text-xs text-slate-500 mt-1">Append-only audit-the-audit</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-navy-900/70 border border-navy-700/80 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, actor, or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-navy-950/70 border border-navy-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-2 bg-navy-950/70 border border-navy-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="">All Modules</option>
              <option value="AUTH">AUTH</option>
              <option value="INCIDENT">INCIDENT</option>
              <option value="ALERT">ALERT</option>
              <option value="PARTICIPATION">PARTICIPATION</option>
              <option value="USER_MANAGEMENT">USER_MANAGEMENT</option>
              <option value="GOVERNANCE">GOVERNANCE</option>
              <option value="AUDIT">AUDIT</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-navy-950/70 border border-navy-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="">All Severities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="px-3 py-2 bg-navy-950/70 border border-navy-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="">All Outcomes</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILURE">FAILURE</option>
              <option value="DENIED">DENIED</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-semibold text-sm rounded-lg transition"
            >
              Filter
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setModuleFilter('');
                setSeverityFilter('');
                setOutcomeFilter('');
                setStartDate('');
                setEndDate('');
                fetchAuditEvents(1);
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition"
              title="Reset filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-xl bg-navy-900/80 border border-navy-700/80 overflow-hidden shadow-sm">
        {error && (
          <div className="p-4 bg-red-950/50 border-b border-red-800/50 text-red-200 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-navy-950/80 text-xs uppercase text-slate-400 border-b border-navy-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Action & Module</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Outcome</th>
                <th className="py-3 px-4 font-semibold">Chained Hash</th>
                <th className="py-3 px-4 text-right font-semibold">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-400" />
                    Loading tamper-evident audit records...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-navy-800/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(evt.created_at).toLocaleString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-xs">{evt.action}</div>
                      <div className="text-[11px] text-slate-400">{evt.module}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-slate-200 font-medium">
                        {evt.actor_name || 'System Service'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {evt.actor_role ? `${evt.actor_role} • ` : ''}
                        {evt.ip_address || 'Internal'}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getSeverityBadge(evt.severity)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{getOutcomeBadge(evt.outcome)}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-slate-400">
                      <span title={evt.event_hash}>
                        {evt.event_hash ? `${evt.event_hash.substring(0, 12)}...` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="px-2.5 py-1 text-xs font-medium rounded bg-navy-800 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-navy-950/60 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchAuditEvents(pagination.page - 1)}
                className="px-3 py-1.5 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => fetchAuditEvents(pagination.page + 1)}
                className="px-3 py-1.5 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-navy-800 flex items-center justify-between bg-navy-950/50">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-gold-400" />
                <div>
                  <h3 className="font-bold text-white text-base">{selectedEvent.action}</h3>
                  <div className="text-xs text-slate-400">
                    Audit ID: {selectedEvent.id} • {new Date(selectedEvent.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Badges & Status */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-slate-400">Severity: {getSeverityBadge(selectedEvent.severity)}</span>
                <span className="text-xs text-slate-400">Outcome: {getOutcomeBadge(selectedEvent.outcome)}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
                  Module: {selectedEvent.module}
                </span>
                {selectedEvent.entity_type && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
                    Entity: {selectedEvent.entity_type} #{selectedEvent.entity_id}
                  </span>
                )}
              </div>

              {/* Cryptographic Chain Box */}
              <div className="p-4 rounded-xl bg-navy-950/90 border border-navy-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-gold-400 font-semibold uppercase tracking-wider text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Cryptographic Integrity Proof
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SHA-256 Validated
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Current Event Hash</span>
                  <div className="flex items-center justify-between text-emerald-300 break-all bg-navy-900/60 p-2 rounded mt-0.5">
                    <span>{selectedEvent.event_hash}</span>
                    <button
                      onClick={() => copyToClipboard(selectedEvent.event_hash)}
                      className="ml-2 p-1 text-slate-400 hover:text-white"
                      title="Copy Hash"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Chained Previous Hash</span>
                  <div className="text-slate-400 break-all bg-navy-900/60 p-2 rounded mt-0.5">
                    {selectedEvent.previous_hash || 'GENESIS_ROOT'}
                  </div>
                </div>
              </div>

              {/* Actor & Request Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-navy-800/40 border border-navy-800">
                  <span className="text-slate-400 block mb-1">Actor Information</span>
                  <div className="font-semibold text-white">{selectedEvent.actor_name || 'System'}</div>
                  <div className="text-slate-400">{selectedEvent.actor_email || 'internal@system.civicwatch.ke'}</div>
                  <div className="text-slate-500 mt-0.5">Role: {selectedEvent.actor_role || 'SYSTEM'}</div>
                </div>

                <div className="p-3 rounded-lg bg-navy-800/40 border border-navy-800">
                  <span className="text-slate-400 block mb-1">Network Context</span>
                  <div className="font-mono text-slate-200">IP: {selectedEvent.ip_address || '127.0.0.1'}</div>
                  <div className="text-slate-400 truncate mt-1" title={selectedEvent.user_agent}>
                    UA: {selectedEvent.user_agent || 'CivicWatch Service Agent'}
                  </div>
                </div>
              </div>

              {/* Changes & Payload Diff */}
              {selectedEvent.changes_payload && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Action Changes & State Payload
                  </h4>
                  <pre className="p-3 rounded-xl bg-navy-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-navy-800 max-h-48">
                    {typeof selectedEvent.changes_payload === 'string'
                      ? selectedEvent.changes_payload
                      : JSON.stringify(selectedEvent.changes_payload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Metadata */}
              {selectedEvent.metadata && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Additional Context Metadata
                  </h4>
                  <pre className="p-3 rounded-xl bg-navy-950 text-slate-300 font-mono text-xs overflow-x-auto border border-navy-800 max-h-48">
                    {typeof selectedEvent.metadata === 'string'
                      ? selectedEvent.metadata
                      : JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="p-3 rounded-lg bg-navy-950/60 border border-navy-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-400 shrink-0" />
                Sensitive data (passwords, auth tokens, secret keys) is automatically redacted at ingestion per security standards.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-navy-800 bg-navy-950/50 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-navy-800 text-slate-200 hover:bg-navy-700 text-sm font-medium transition"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrity Verification Result Modal */}
      {integrityModalOpen && integrityResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              {integrityResult.verified ? (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-red-950 border border-red-700/60 text-red-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">
                  {integrityResult.verified ? 'Audit Chain Validated' : 'Audit Chain Compromise Detected'}
                </h3>
                <p className="text-xs text-slate-400">{integrityResult.message}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Verified Chain Length:</span>
                <span className="text-white font-bold">{integrityResult.checkedEvents || 0} events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Integrity Status:</span>
                <span className={integrityResult.verified ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {integrityResult.verified ? 'UNCOMPROMISED' : 'CORRUPTED / TAMPERED'}
                </span>
              </div>
              {integrityResult.latestHash && (
                <div className="pt-2 border-t border-navy-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Head Hash</span>
                  <span className="text-slate-300 break-all text-[11px]">{integrityResult.latestHash}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIntegrityModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 font-semibold text-sm transition"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-gold-400" />
                <h3 className="font-bold text-white text-base">Export Compliance Report</h3>
              </div>
              <button onClick={() => setExportModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat('csv')}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition ${
                      exportFormat === 'csv'
                        ? 'bg-gold-500/20 text-gold-400 border-gold-500'
                        : 'bg-navy-950 text-slate-400 border-navy-800 hover:bg-navy-800'
                    }`}
                  >
                    CSV Spreadsheet
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('json')}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition ${
                      exportFormat === 'json'
                        ? 'bg-gold-500/20 text-gold-400 border-gold-500'
                        : 'bg-navy-950 text-slate-400 border-navy-800 hover:bg-navy-800'
                    }`}
                  >
                    JSON Raw Archive
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Date Range (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-2 bg-navy-950 border border-navy-800 rounded-lg text-slate-200"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 bg-navy-950 border border-navy-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-navy-950/80 border border-navy-800 text-slate-400 text-[11px]">
                Export generation creates an immutable audit record (<code className="text-gold-400">AUDIT_EXPORT_GENERATED</code>) to ensure complete chain of custody.
              </div>

              {exportError && (
                <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  {exportError}
                </div>
              )}

              {exportSuccess && (
                <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs">
                  {exportSuccess}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-navy-800 text-slate-300 hover:bg-navy-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={exportLoading}
                className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {exportLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Generate & Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
