import React, { useState, useEffect } from 'react';
import {
  Vote,
  FileText,
  Calendar,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  History,
  Building,
  MapPin,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { participationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const KENYA_COUNTIES = [
  'All Counties',
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export default function AdminParticipationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isLiaison = Boolean(user?.is_county_liaison);
  const liaisonCounty = user?.liaison_county;

  const [activeTab, setActiveTab] = useState('petitions'); // 'petitions' | 'hearings' | 'legislation' | 'audits'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Petitions state
  const [petitions, setPetitions] = useState([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Hearings state
  const [hearings, setHearings] = useState([]);

  // Legislation state
  const [legItems, setLegItems] = useState([]);
  const [selectedLegItem, setSelectedLegItem] = useState(null);
  const [feedbackQueue, setFeedbackQueue] = useState([]);
  const [createBillModalOpen, setCreateBillModalOpen] = useState(false);
  const [billForm, setBillForm] = useState({
    reference_code: '',
    title: '',
    summary: '',
    body_text: '',
    category: 'Healthcare',
    level: 'NATIONAL',
    sponsoring_body: '',
    feedback_deadline: ''
  });

  // Audits state
  const [auditList, setAuditList] = useState([]);
  const [auditEntityType, setAuditEntityType] = useState('PETITION');

  const fetchStats = async () => {
    try {
      const res = await participationApi.getParticipationStats();
      setStats(res.data);
    } catch {
      // ignore
    }
  };

  const fetchPetitions = async () => {
    try {
      setLoading(true);
      const res = await participationApi.listPetitions({ limit: 50 });
      setPetitions(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const res = await participationApi.listHearings({ limit: 50 });
      setHearings(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLegislation = async () => {
    try {
      setLoading(true);
      const [legRes] = await Promise.all([
        participationApi.listLegislativeItems({ limit: 50 })
      ]);
      const fetchedItems = legRes.data || [];
      setLegItems(fetchedItems);
      if (fetchedItems.length > 0) {
        setSelectedLegItem(fetchedItems[0]);
        const fbRes = await participationApi.listFeedback(fetchedItems[0].id, { limit: 50 });
        setFeedbackQueue(fbRes.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const res = await participationApi.getAudits(auditEntityType, 1);
      setAuditList(res.data || []);
    } catch {
      setAuditList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === 'petitions') fetchPetitions();
    if (activeTab === 'hearings') fetchHearings();
    if (activeTab === 'legislation') fetchLegislation();
    if (activeTab === 'audits') fetchAudits();
  }, [activeTab]);

  const handleModeratePetition = async (petitionId, newStatus, reason = null) => {
    try {
      setActionLoading(true);
      await participationApi.moderatePetition(petitionId, { status: newStatus, reason });
      fetchPetitions();
      fetchStats();
      if (rejectModalOpen) {
        setRejectModalOpen(false);
        setSelectedPetition(null);
        setRejectReason('');
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModerateFeedback = async (feedbackId, newStatus) => {
    try {
      setActionLoading(true);
      await participationApi.moderateFeedback(feedbackId, { status: newStatus });
      if (selectedLegItem) {
        const fbRes = await participationApi.listFeedback(selectedLegItem.id, { limit: 50 });
        setFeedbackQueue(fbRes.data || []);
      }
      fetchStats();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await participationApi.createLegislativeItem(billForm);
      setCreateBillModalOpen(false);
      setBillForm({
        reference_code: '',
        title: '',
        summary: '',
        body_text: '',
        category: 'Healthcare',
        level: 'NATIONAL',
        sponsoring_body: '',
        feedback_deadline: ''
      });
      fetchLegislation();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to create bill');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1.5">
            <Vote className="w-3.5 h-3.5" />
            <span>Milestone 15 — Civic Participation & Petitions</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Participation Administration & Oversight
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Manage citizen petitions, schedule county budget hearings, and moderate citizen legislative submissions.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-medium text-stone-500">Petitions Pending Review</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {stats.petitions?.pendingReview || 0}
            </div>
            <span className="text-[11px] text-stone-400">
              {stats.petitions?.published || 0} published • {stats.petitions?.quorumReached || 0} quorum reached
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-medium text-stone-500">Total Signatures Tracked</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              {stats.petitions?.totalSignatures || 0}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {stats.petitions?.verifiedSignatures || 0} verified quorums
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-medium text-stone-500">Scheduled Budget Hearings</span>
            <div className="text-2xl font-bold text-navy-800 mt-1">
              {stats.hearings?.total || 0}
            </div>
            <span className="text-[11px] text-stone-400">
              {stats.hearings?.upcoming || 0} upcoming across {stats.hearings?.countiesCovered || 0} counties
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-medium text-stone-500">Feedback Pending Moderation</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {stats.feedback?.pendingModeration || 0}
            </div>
            <span className="text-[11px] text-stone-400">
              {stats.feedback?.published || 0} published citizen inputs
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="border-b border-stone-200 px-6 pt-3 flex items-center gap-6 text-xs sm:text-sm overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('petitions')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'petitions'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Petitions Queue ({petitions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hearings')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'hearings'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Budget Hearings ({hearings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('legislation')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'legislation'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Legislative Feedback Moderation</span>
          </button>
        </div>

        {/* Tab 1: Petitions Queue */}
        {activeTab === 'petitions' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Review citizen submissions, verify target authorities, and publish to official ballot.</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 bg-stone-50/50">
                    <th className="py-2.5 px-3 font-semibold">Petition</th>
                    <th className="py-2.5 px-3 font-semibold">County & Target</th>
                    <th className="py-2.5 px-3 font-semibold">Quorum Progress</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {petitions.map((p) => {
                    const isDraft = p.status === 'DRAFT' || p.status === 'PENDING_REVIEW';
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-stone-900 line-clamp-1">{p.title}</div>
                          <div className="text-[11px] text-stone-500">By {p.creator_name || 'Citizen'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-stone-800">{p.county || 'National'}</div>
                          <div className="text-[11px] text-stone-500 truncate max-w-[180px]">{p.target_authority}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-stone-900">
                            {p.verified_signatures} / {p.quorum_requirement}
                          </div>
                          <div className="text-[11px] text-stone-400">{p.total_signatures} total signers</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              p.status === 'PUBLISHED'
                                ? 'bg-blue-100 text-blue-800'
                                : p.status === 'QUORUM_REACHED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isDraft && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => handleModeratePetition(p.id, 'PUBLISHED')}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium transition-colors"
                                >
                                  Publish
                                </button>
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => {
                                    setSelectedPetition(p);
                                    setRejectModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 border border-red-300 text-red-700 hover:bg-red-50 rounded font-medium transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <a
                              href={`/petitions/${p.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 text-stone-500 hover:text-stone-800 font-medium"
                            >
                              View
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Hearings */}
        {activeTab === 'hearings' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>All public budget hearings scheduled across Kenya.</span>
              <a
                href="/hearings"
                className="text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Go to Public Schedule &rarr;
              </a>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {hearings.map((h) => (
                <div key={h.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{h.title}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        {h.county}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {h.status}
                      </span>
                    </div>
                    <div className="text-stone-500">
                      {new Date(h.hearing_date).toLocaleDateString()} ({h.start_time?.slice(0, 5)} - {h.end_time?.slice(0, 5)}) • Venue: {h.venue}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-stone-400">
                    Created by {h.creator_name || 'Staff'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Legislation & Feedback */}
        {activeTab === 'legislation' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Legislative Items & Moderation</h3>
                <p className="text-xs text-stone-500">Review pending citizen memoranda submitted on active bills.</p>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setCreateBillModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Policy Bill</span>
                </button>
              )}
            </div>

            {/* Bill Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
              {legItems.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={async () => {
                    setSelectedLegItem(b);
                    const res = await participationApi.listFeedback(b.id, { limit: 50 });
                    setFeedbackQueue(res.data || []);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedLegItem?.id === b.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {b.reference_code}: {b.title.slice(0, 25)}...
                </button>
              ))}
            </div>

            {/* Feedback List for Selected Bill */}
            {selectedLegItem && (
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    Submissions on {selectedLegItem.reference_code} ({feedbackQueue.length})
                  </span>
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {feedbackQueue.map((fb) => (
                    <div key={fb.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{fb.title}</span>
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-stone-100 text-stone-700">
                            {fb.stance}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              fb.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {fb.status}
                          </span>
                        </div>
                        <p className="text-stone-600 line-clamp-2">{fb.feedback_text}</p>
                        <div className="text-[11px] text-stone-400">
                          By {fb.author_name || 'Citizen'} ({fb.author_county || 'Kenya'}) • {new Date(fb.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Moderate Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {fb.status !== 'PUBLISHED' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleModerateFeedback(fb.id, 'PUBLISHED')}
                            className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {fb.status !== 'REJECTED' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleModerateFeedback(fb.id, 'REJECTED')}
                            className="px-2.5 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50 font-medium transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Petition Modal */}
      {rejectModalOpen && selectedPetition && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900">Reject Petition Registration</h3>
            <p className="text-xs text-stone-600">
              Provide a mandatory reason for rejecting <strong>{selectedPetition.title}</strong>. This explanation is recorded in platform audits.
            </p>
            <textarea
              required
              rows={3}
              minLength={5}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Does not meet statutory threshold or authority out of jurisdiction..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || rejectReason.trim().length < 5}
                onClick={() => handleModeratePetition(selectedPetition.id, 'REJECTED', rejectReason)}
                className="px-4 py-1.5 text-xs font-medium bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Legislative Item Modal */}
      {createBillModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-xl w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-stone-900">Register Legislative Policy Bill</h3>
              <button
                type="button"
                onClick={() => setCreateBillModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 rounded p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Reference Code *</label>
                  <input
                    type="text"
                    required
                    value={billForm.reference_code}
                    onChange={(e) => setBillForm({ ...billForm, reference_code: e.target.value })}
                    placeholder="e.g., BILL-2026-08"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Jurisdiction Level</label>
                  <select
                    value={billForm.level}
                    onChange={(e) => setBillForm({ ...billForm, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="NATIONAL">NATIONAL (Parliament)</option>
                    <option value="COUNTY">COUNTY (Assembly)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Bill Title *</label>
                <input
                  type="text"
                  required
                  value={billForm.title}
                  onChange={(e) => setBillForm({ ...billForm, title: e.target.value })}
                  placeholder="e.g., Community Health Promoters Remuneration & Equipment Act 2026"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Sponsoring Body *</label>
                  <input
                    type="text"
                    required
                    value={billForm.sponsoring_body}
                    onChange={(e) => setBillForm({ ...billForm, sponsoring_body: e.target.value })}
                    placeholder="e.g., Departmental Committee on Health"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Feedback Deadline *</label>
                  <input
                    type="date"
                    required
                    value={billForm.feedback_deadline}
                    onChange={(e) => setBillForm({ ...billForm, feedback_deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Executive Summary *</label>
                <textarea
                  required
                  rows={2}
                  value={billForm.summary}
                  onChange={(e) => setBillForm({ ...billForm, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Full Bill Clauses (Optional)</label>
                <textarea
                  rows={3}
                  value={billForm.body_text}
                  onChange={(e) => setBillForm({ ...billForm, body_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCreateBillModalOpen(false)}
                  className="px-3 py-1.5 border border-stone-300 text-stone-700 rounded text-xs font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium"
                >
                  Register Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
