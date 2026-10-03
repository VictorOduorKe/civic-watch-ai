import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Clock,
  Plus,
  ExternalLink,
  Search,
  Filter,
  Eye,
  FileCheck,
  Building2
} from 'lucide-react';
import { trustApi } from '../../services/api';
import TrustBadge from '../../components/trust/TrustBadge';
import ProvenanceModal from '../../components/trust/ProvenanceModal';
import { useAuth } from '../../context/AuthContext';

export default function AdminVerificationPage() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'Analyst';

  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'sources'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Queue state
  const [queueItems, setQueueItems] = useState([]);
  const [queueFilterType, setQueueFilterType] = useState('');
  const [queueFilterStatus, setQueueFilterStatus] = useState('');
  const [queueSearch, setQueueSearch] = useState('');

  // Sources state
  const [sourcesList, setSourcesList] = useState([]);
  const [sourceSearch, setSourceSearch] = useState('');

  // Modals state
  const [selectedEntityForDossier, setSelectedEntityForDossier] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { isOpen, entityType, entityId, action, title }
  const [newSourceModal, setNewSourceModal] = useState(false);

  // Form states
  const [actionReason, setActionReason] = useState('');
  const [actionEvidence, setActionEvidence] = useState('');
  const [actionRefTitle, setActionRefTitle] = useState('');
  const [actionRefUrl, setActionRefUrl] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState(null);

  // New source form state
  const [newSourceForm, setNewSourceForm] = useState({
    name: '',
    organization: '',
    source_type: 'COUNTY',
    website: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    is_official: true
  });
  const [sourceSubmitting, setSourceSubmitting] = useState(false);
  const [sourceError, setSourceError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, queueRes, sourcesRes] = await Promise.all([
        trustApi.getVerificationStats(),
        trustApi.getVerificationQueue({
          entity_type: queueFilterType || undefined,
          status: queueFilterStatus || undefined,
          search: queueSearch || undefined
        }),
        trustApi.getSources({ search: sourceSearch || undefined, limit: 50 })
      ]);

      setStats(statsRes.data);
      setQueueItems(queueRes.data || []);
      setSourcesList(sourcesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load verification management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queueFilterType, queueFilterStatus]);

  const handleOpenActionModal = (entityType, entityId, action, title) => {
    setActionReason('');
    setActionEvidence('');
    setActionRefTitle('');
    setActionRefUrl('');
    setActionError(null);
    setActionModal({ isOpen: true, entityType, entityId, action, title });
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!actionModal) return;

    if (['DISPUTED', 'CORRECTED', 'WITHDRAWN'].includes(actionModal.action) && actionReason.trim().length < 5) {
      setActionError('A detailed reason (at least 5 characters) is required for this action.');
      return;
    }

    setSubmittingAction(true);
    setActionError(null);

    const payload = {
      action: actionModal.action,
      reason: actionReason.trim() || undefined,
      evidence_summary: actionEvidence.trim() || undefined
    };

    if (actionRefTitle.trim() && actionRefUrl.trim()) {
      payload.references = [{
        title: actionRefTitle.trim(),
        reference_url: actionRefUrl.trim()
      }];
    }

    try {
      await trustApi.executeVerificationAction(actionModal.entityType, actionModal.entityId, payload);
      setActionModal(null);
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to execute verification action');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCreateSource = async (e) => {
    e.preventDefault();
    if (!newSourceForm.name.trim()) {
      setSourceError('Source name is required.');
      return;
    }

    setSourceSubmitting(true);
    setSourceError(null);
    try {
      await trustApi.createSource(newSourceForm);
      setNewSourceModal(false);
      setNewSourceForm({
        name: '',
        organization: '',
        source_type: 'COUNTY',
        website: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        is_official: true
      });
      await loadData();
    } catch (err) {
      setSourceError(err.response?.data?.message || err.message || 'Failed to register source');
    } finally {
      setSourceSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4F72] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-[#D99A00]" />
              Milestone 14 — Trust Architecture
            </div>
            <h1 className="text-2xl font-bold text-[#0D2137]">
              Verification & Trust Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify civic sources, audit report evidence, resolve community disputes, and maintain provenance history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                onClick={() => setNewSourceModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1B4F72] text-white text-xs font-semibold rounded hover:bg-[#153e5b] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Register Source</span>
              </button>
            )}
            <button
              onClick={loadData}
              className="p-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh verification data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Verified</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats.counts?.VERIFIED || 0}</span>
              <span className="text-[11px] text-slate-400">Official / Verified</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Under Review</span>
              <span className="text-2xl font-black text-purple-700 mt-1 block">{stats.counts?.UNDER_REVIEW || 0}</span>
              <span className="text-[11px] text-slate-400">Queue pending</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Disputed</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{stats.counts?.DISPUTED || 0}</span>
              <span className="text-[11px] text-slate-400">Flagged for review</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Corrected</span>
              <span className="text-2xl font-black text-blue-700 mt-1 block">{stats.counts?.CORRECTED || 0}</span>
              <span className="text-[11px] text-slate-400">Notices updated</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Withdrawn</span>
              <span className="text-2xl font-black text-rose-700 mt-1 block">{stats.counts?.WITHDRAWN || 0}</span>
              <span className="text-[11px] text-slate-400">Decommissioned</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Unverified</span>
              <span className="text-2xl font-black text-slate-600 mt-1 block">{stats.counts?.UNVERIFIED || 0}</span>
              <span className="text-[11px] text-slate-400">Community submissions</span>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-lg">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'border-[#1B4F72] text-[#1B4F72]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Verification Queue ({queueItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sources'
                ? 'border-[#1B4F72] text-[#1B4F72]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Sources Directory ({sourcesList.length})</span>
          </button>
        </div>

        {/* Tab 1: Verification Queue */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-b-lg border border-t-0 border-slate-200 shadow-sm p-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={queueFilterType}
                  onChange={(e) => setQueueFilterType(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1B4F72]"
                  aria-label="Filter queue by entity type"
                >
                  <option value="">All Entities (Source, Alert, Report)</option>
                  <option value="SOURCE">Sources Only</option>
                  <option value="ALERT">Alerts Only</option>
                  <option value="REPORT">Reports Only</option>
                </select>

                <select
                  value={queueFilterStatus}
                  onChange={(e) => setQueueFilterStatus(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1B4F72]"
                  aria-label="Filter queue by status"
                >
                  <option value="">All Review Statuses</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="DISPUTED">Disputed</option>
                  <option value="UNVERIFIED">Unverified</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading queue items...</div>
            ) : queueItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No items currently awaiting verification or dispute review.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Item / Subject</th>
                      <th className="py-2.5 px-3">Source Category</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Registered</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queueItems.map((item) => (
                      <tr key={`${item.entityType}-${item.entityId}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                            {item.entityType} #{item.entityId}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900 max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {item.sourceType || 'Community'}
                        </td>
                        <td className="py-3 px-3">
                          <TrustBadge status={item.verificationStatus} isOfficial={item.isOfficial} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {new Date(item.createdAt).toLocaleDateString('en-KE')}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedEntityForDossier({ type: item.entityType, id: item.entityId })}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
                          >
                            Inspect
                          </button>
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => handleOpenActionModal(item.entityType, item.entityId, 'VERIFIED', item.title)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(item.entityType, item.entityId, 'DISPUTED', item.title)}
                                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition-colors"
                              >
                                Dispute
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(item.entityType, item.entityId, 'CORRECTED', item.title)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
                              >
                                Correct
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sources Management */}
        {activeTab === 'sources' && (
          <div className="bg-white rounded-b-lg border border-t-0 border-slate-200 shadow-sm p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Name & Organization</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Official</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sourcesList.map((src) => (
                    <tr key={src.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{src.name}</span>
                        {src.organization && (
                          <span className="text-[11px] text-slate-500 block">{src.organization}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {src.sourceType}
                      </td>
                      <td className="py-3 px-3">
                        <TrustBadge status={src.verificationStatus} isOfficial={src.isOfficial} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        {src.isOfficial ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">Yes</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {src.contactEmail || src.contactPhone || 'None'}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedEntityForDossier({ type: 'SOURCE', id: src.id })}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                        >
                          Dossier
                        </button>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleOpenActionModal('SOURCE', src.id, 'VERIFIED', src.name)}
                            className="px-2 py-1 bg-[#1B4F72] hover:bg-[#153e5b] text-white rounded text-[11px] font-semibold"
                          >
                            Update Status
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Verification Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {actionModal.entityType} #{actionModal.entityId}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Execute Action: {actionModal.action}
                </h3>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
                {actionError}
              </div>
            )}

            <form onSubmit={handleExecuteAction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Action Reason {['DISPUTED', 'CORRECTED', 'WITHDRAWN'].includes(actionModal.action) && <span className="text-rose-600">*</span>}
                </label>
                <textarea
                  rows={2}
                  required={['DISPUTED', 'CORRECTED', 'WITHDRAWN'].includes(actionModal.action)}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Explain why this action is taken (required for disputes/corrections)..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#1B4F72]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evidence / Verification Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={actionEvidence}
                  onChange={(e) => setActionEvidence(e.target.value)}
                  placeholder="Summary of examined references, gazette circulars, or agency correspondence..."
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#1B4F72]"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <span className="font-semibold text-slate-700 block">Attach Public Evidence URL (Optional)</span>
                <input
                  type="text"
                  placeholder="Reference Title (e.g. Official Gazette Notice)"
                  value={actionRefTitle}
                  onChange={(e) => setActionRefTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                />
                <input
                  type="url"
                  placeholder="Reference URL (https://...)"
                  value={actionRefUrl}
                  onChange={(e) => setActionRefUrl(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-1.5 rounded bg-[#1B4F72] text-white font-semibold hover:bg-[#153e5b] disabled:opacity-50"
                >
                  {submittingAction ? 'Processing...' : `Confirm ${actionModal.action}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Source Modal */}
      {newSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Register New Civic Source</h3>
              <button onClick={() => setNewSourceModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {sourceError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
                {sourceError}
              </div>
            )}

            <form onSubmit={handleCreateSource} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kenya Railways Corporation"
                  value={newSourceForm.name}
                  onChange={(e) => setNewSourceForm({ ...newSourceForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#1B4F72]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Roads and Transport"
                  value={newSourceForm.organization}
                  onChange={(e) => setNewSourceForm({ ...newSourceForm, organization: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Type</label>
                  <select
                    value={newSourceForm.source_type}
                    onChange={(e) => setNewSourceForm({ ...newSourceForm, source_type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="COUNTY">County Government</option>
                    <option value="PUBLIC_UTILITY">Public Utility</option>
                    <option value="GOVERNMENT">National Government</option>
                    <option value="CIVIL_SOCIETY">Civil Society</option>
                    <option value="COMMUNITY">Community</option>
                    <option value="OFFICIAL_ORGANIZATION">Official Org</option>
                    <option value="MEDIA">Media</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSourceForm.is_official}
                      onChange={(e) => setNewSourceForm({ ...newSourceForm, is_official: e.target.checked })}
                      className="rounded text-[#1B4F72]"
                    />
                    <span className="font-semibold text-slate-700">Official Authority</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Website</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newSourceForm.website}
                  onChange={(e) => setNewSourceForm({ ...newSourceForm, website: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="contact@agency.go.ke"
                    value={newSourceForm.contact_email}
                    onChange={(e) => setNewSourceForm({ ...newSourceForm, contact_email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+254..."
                    value={newSourceForm.contact_phone}
                    onChange={(e) => setNewSourceForm({ ...newSourceForm, contact_phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewSourceModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sourceSubmitting}
                  className="px-4 py-1.5 rounded bg-[#1B4F72] text-white font-semibold hover:bg-[#153e5b] disabled:opacity-50"
                >
                  {sourceSubmitting ? 'Registering...' : 'Register Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provenance Dossier Inspection Modal */}
      {selectedEntityForDossier && (
        <ProvenanceModal
          isOpen={Boolean(selectedEntityForDossier)}
          onClose={() => setSelectedEntityForDossier(null)}
          entityType={selectedEntityForDossier.type}
          entityId={selectedEntityForDossier.id}
        />
      )}
    </div>
  );
}
