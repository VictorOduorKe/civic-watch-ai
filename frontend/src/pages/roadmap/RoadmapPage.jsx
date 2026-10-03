import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Milestone,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  User,
  FileCheck,
  CheckSquare,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  X
} from 'lucide-react';
import { milestoneApi, adminMilestoneApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import CitizenLayout from '../../layouts/CitizenLayout';

export default function RoadmapPage({ isAdminWorkspace = false }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'Admin' || user?.role === 'super_admin';
  const showAdminControls = isAdminWorkspace || isAdmin;

  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState({ M11: true, M12: true });

  // Modal states for Human Approval Gate
  const [activeModal, setActiveModal] = useState(null); // 'APPROVE' | 'REJECT' | 'REGRESSION' | null
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedMilestoneDetails, setSelectedMilestoneDetails] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  async function fetchRoadmap() {
    setLoading(true);
    setError(null);
    try {
      const response = await milestoneApi.getRoadmap();
      if (response.success && response.data) {
        setRoadmapData(response.data);
        // Expand the current milestone by default
        if (response.data.currentMilestoneId) {
          setExpandedMilestones((prev) => ({
            ...prev,
            [response.data.currentMilestoneId]: true
          }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load platform roadmap.');
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id) {
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  async function openApprovalModal(milestone) {
    setSelectedMilestone(milestone);
    setActionError(null);
    setActionSuccess(null);
    setActionComment('Approved after human review and verification sign-off.');
    setActiveModal('APPROVE');

    try {
      const res = await milestoneApi.getMilestoneDetails(milestone.id);
      if (res.success) {
        setSelectedMilestoneDetails(res.data);
      }
    } catch {
      // Fallback
    }
  }

  async function openRejectModal(milestone) {
    setSelectedMilestone(milestone);
    setActionError(null);
    setActionSuccess(null);
    setActionComment('');
    setActiveModal('REJECT');
  }

  async function openRegressionModal(milestone) {
    setSelectedMilestone(milestone);
    setActionError(null);
    setActionSuccess(null);
    setActionComment('');
    setActiveModal('REGRESSION');
  }

  async function handleApproveSubmit() {
    if (!selectedMilestone) return;
    setSubmittingAction(true);
    setActionError(null);
    try {
      const res = await adminMilestoneApi.approveMilestone(selectedMilestone.id, {
        comment: actionComment
      });
      if (res.success) {
        setActionSuccess(`Milestone ${selectedMilestone.id} approved! Next milestone unlocked.`);
        setTimeout(() => {
          setActiveModal(null);
          fetchRoadmap();
        }, 1200);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to approve milestone.');
    } finally {
      setSubmittingAction(false);
    }
  }

  async function handleRejectSubmit() {
    if (!selectedMilestone) return;
    if (!actionComment.trim()) {
      setActionError('A reason is mandatory when rejecting progression.');
      return;
    }
    setSubmittingAction(true);
    setActionError(null);
    try {
      const res = await adminMilestoneApi.rejectMilestone(selectedMilestone.id, {
        reason: actionComment
      });
      if (res.success) {
        setActionSuccess(`Milestone ${selectedMilestone.id} progression rejected.`);
        setTimeout(() => {
          setActiveModal(null);
          fetchRoadmap();
        }, 1200);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to reject milestone progression.');
    } finally {
      setSubmittingAction(false);
    }
  }

  async function handleRegressionSubmit() {
    if (!selectedMilestone) return;
    if (!actionComment.trim()) {
      setActionError('A description is required when reporting a regression.');
      return;
    }
    setSubmittingAction(true);
    setActionError(null);
    try {
      const res = await adminMilestoneApi.reportRegression(selectedMilestone.id, {
        reason: actionComment
      });
      if (res.success) {
        setActionSuccess(`Regression reported for ${selectedMilestone.id}. Subsequent milestones locked.`);
        setTimeout(() => {
          setActiveModal(null);
          fetchRoadmap();
        }, 1200);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to report regression.');
    } finally {
      setSubmittingAction(false);
    }
  }

  function getStatusBadge(m) {
    if (m.status === 'REGRESSION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          <RotateCcw className="w-3.5 h-3.5" />
          ↻ REGRESSION
        </span>
      );
    }
    if (m.human_approval_status === 'APPROVED' || m.status === 'HUMAN_APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ✓ HUMAN APPROVED
        </span>
      );
    }
    if (m.human_approval_status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          ✕ APPROVAL REJECTED
        </span>
      );
    }
    if (m.status === 'VERIFIED') {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            ✓ VERIFIED
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            ⏳ WAITING FOR HUMAN APPROVAL
          </span>
        </div>
      );
    }
    if (m.status === 'IMPLEMENTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <Clock className="w-3.5 h-3.5" />
          ◐ IMPLEMENTED — Waiting for verification
        </span>
      );
    }
    if (m.is_current) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          ● CURRENT MILESTONE
        </span>
      );
    }
    if (m.is_locked) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
          <Lock className="w-3.5 h-3.5 text-stone-400" />
          🔒 LOCKED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
        {m.status}
      </span>
    );
  }

  const content = (
    <div className={`space-y-6 sm:space-y-8 ${isAdminWorkspace ? 'w-full' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'}`}>
      {/* Header section */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" /> Single Source of Truth & Human Gate
            </div>
            {isAdmin && !showAdminControls && (
              <Link
                to="/admin/roadmap"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Switch to Admin Approval View <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              CivicWatch AI Kenya — Milestone Roadmap
            </h1>
            <p className="mt-2 text-stone-300 max-w-3xl text-sm sm:text-base leading-relaxed">
              Official 17-milestone architectural roadmap and human approval gate tracking. Every
              phase must be implemented, verified, and explicitly approved by project administration
              before subsequent stages can unlock.
            </p>
          </div>

          {/* Hard Stop / Human Gate Notice */}
          <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Hard Stop & Human Approval Rule:</span>{' '}
              Milestones never advance automatically. Verification alone does not trigger progression.
              Progression requires human project-owner approval.
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Metrics (Section 16: Separate Progress Metrics) */}
      {roadmapData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* 1. Implementation Progress */}
          <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <span>Implementation</span>
                <span className="text-indigo-600 font-bold">
                  {roadmapData.progress.implementation.percentage}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900">
                  {roadmapData.progress.implementation.count}
                </span>
                <span className="text-stone-500 text-sm">/ {roadmapData.progress.total} Milestones</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${roadmapData.progress.implementation.percentage}%` }}
              />
            </div>
          </div>

          {/* 2. Verification Progress */}
          <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <span>Verification</span>
                <span className="text-blue-600 font-bold">
                  {roadmapData.progress.verification.percentage}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900">
                  {roadmapData.progress.verification.count}
                </span>
                <span className="text-stone-500 text-sm">/ {roadmapData.progress.total} Milestones</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${roadmapData.progress.verification.percentage}%` }}
              />
            </div>
          </div>

          {/* 3. Human Approval Progress */}
          <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <span>Human Approval</span>
                <span className="text-emerald-600 font-bold">
                  {roadmapData.progress.humanApproval.percentage}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900">
                  {roadmapData.progress.humanApproval.count}
                </span>
                <span className="text-stone-500 text-sm">/ {roadmapData.progress.total} Milestones</span>
              </div>
            </div>
            <div className="mt-4 w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${roadmapData.progress.humanApproval.percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-white rounded-xl p-12 text-center border border-stone-200 shadow-xs">
          <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-stone-600 font-medium">Loading roadmap and human approval gate status...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to load roadmap</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Milestones Timeline */}
      {roadmapData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Milestone className="w-5 h-5 text-emerald-600" />
              Sequential Milestones (M1 – M17)
            </h2>
            <div className="text-xs text-stone-500 font-medium">
              Click a milestone card to view tasks, acceptance criteria & verification requirements.
            </div>
          </div>

          <div className="space-y-4">
            {roadmapData.milestones.map((m) => {
              const isExpanded = !!expandedMilestones[m.id];
              const isWaitingApproval = m.status === 'VERIFIED' && m.human_approval_status === 'PENDING';
              const canAdminAct = showAdminControls && isAdmin && isWaitingApproval;

              return (
                <div
                  key={m.id}
                  id={`milestone-${m.id}`}
                  className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    m.is_current
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : m.is_locked
                      ? 'border-stone-200 bg-stone-50/60 opacity-90'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(m.id)}
                    className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Milestone Number Badge */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                          m.human_approval_status === 'APPROVED' || m.status === 'HUMAN_APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isWaitingApproval
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : m.is_locked
                            ? 'bg-stone-100 text-stone-500 border border-stone-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {m.id}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-stone-900">
                            {m.title}
                          </h3>
                          {m.dependencies && (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                              Requires {m.dependencies}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-600 mt-1 line-clamp-2">
                          {m.objective}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Status and expansion toggle */}
                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center shrink-0">
                      {getStatusBadge(m)}
                      <button
                        type="button"
                        aria-label="Toggle details"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors ml-auto sm:ml-0"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Human Approval Gate Action Banner (Admin view on waiting milestones) */}
                  {isWaitingApproval && (
                    <div className="px-4 sm:px-6 py-4 bg-amber-50 border-t border-b border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-bold text-amber-900">
                            Milestone {m.id} Verification Complete — Human Approval Gate Active
                          </div>
                          <div className="text-xs text-amber-700 mt-0.5">
                            Automated and manual tests passed. Next milestone remains locked until explicit human approval.
                          </div>
                        </div>
                      </div>

                      {canAdminAct ? (
                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openRejectModal(m);
                            }}
                            className="px-3.5 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openApprovalModal(m);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Approve Milestone & Unlock Next
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-200">
                          Waiting for Administrator Sign-off
                        </div>
                      )}
                    </div>
                  )}

                  {/* Locked Milestone Notice */}
                  {m.is_locked && (
                    <div className="px-5 sm:px-6 py-2.5 bg-stone-50 border-t border-stone-200 text-stone-500 text-xs flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        Waiting for human approval of predecessor milestone ({m.dependencies || 'predecessor'}).
                      </span>
                    </div>
                  )}

                  {/* Expanded Details Body */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-stone-100 space-y-6 bg-stone-50/30">
                      {/* Tasks List */}
                      <div>
                        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                          <CheckSquare className="w-4 h-4 text-stone-500" />
                          Tasks to be performed ({m.tasks.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {m.tasks.map((task, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200 flex items-start gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Acceptance Criteria & Verification */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Acceptance Criteria */}
                        <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-indigo-600" />
                            Acceptance Criteria
                          </h4>
                          <ul className="space-y-1.5">
                            {m.acceptance_criteria.map((crit, idx) => (
                              <li key={idx} className="text-xs text-stone-700 flex items-start gap-2">
                                <span className="text-indigo-500 font-bold shrink-0">•</span>
                                <span>{crit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Verification Requirements */}
                        <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Verification Requirements
                          </h4>
                          <ul className="space-y-1.5">
                            {m.verification_requirements.map((req, idx) => (
                              <li key={idx} className="text-xs text-stone-700 flex items-start gap-2">
                                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Administrative action bar if milestone is approved (for reporting regression) */}
                      {showAdminControls && isAdmin && m.status === 'HUMAN_APPROVED' && (
                        <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
                          <span className="text-stone-500">
                            Milestone approved and verified. If a regression occurs, administrators can re-open it.
                          </span>
                          <button
                            type="button"
                            onClick={() => openRegressionModal(m)}
                            className="px-3 py-1 rounded text-red-600 hover:bg-red-50 font-medium transition-colors border border-red-200"
                          >
                            Flag Regression
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Human Approval Review Modal (Section 4 & 12) */}
      {activeModal === 'APPROVE' && selectedMilestone && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-stone-900">
                  Human Review & Approval Gate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist per Section 12 of ROADMAP 1.md */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2.5 text-xs text-stone-700">
              <div className="font-bold text-stone-900 pb-1.5 border-b border-stone-200 flex items-center justify-between">
                <span>Milestone: {selectedMilestone.id} — {selectedMilestone.title}</span>
                <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                  VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-stone-500">Implementation:</span>{' '}
                  <span className="font-semibold text-emerald-700">✓ Complete</span>
                </div>
                <div>
                  <span className="text-stone-500">Automated verification:</span>{' '}
                  <span className="font-semibold text-emerald-700">✓ Passed</span>
                </div>
                <div>
                  <span className="text-stone-500">Manual verification:</span>{' '}
                  <span className="font-semibold text-emerald-700">✓ Passed</span>
                </div>
                <div>
                  <span className="text-stone-500">Known issues:</span>{' '}
                  <span className="font-semibold text-stone-800">None</span>
                </div>
                <div>
                  <span className="text-stone-500">Security impact:</span>{' '}
                  <span className="font-semibold text-stone-800">Reviewed</span>
                </div>
                <div>
                  <span className="text-stone-500">Regression impact:</span>{' '}
                  <span className="font-semibold text-stone-800">Reviewed</span>
                </div>
              </div>

              {selectedMilestoneDetails?.nextMilestone && (
                <div className="pt-2 border-t border-stone-200 text-stone-800">
                  <span className="text-stone-500">Next milestone to unlock:</span>{' '}
                  <span className="font-bold text-indigo-700">
                    {selectedMilestoneDetails.nextMilestone.id} — {selectedMilestoneDetails.nextMilestone.title}
                  </span>
                </div>
              )}
            </div>

            {/* Advisory note */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs leading-relaxed">
              <p className="font-semibold">Human Review Notice:</p>
              <p className="mt-0.5">
                Approving this milestone will permanently register your administrative signature in the audit trail
                and unlock strictly the immediate next milestone. This action should only be performed after human review.
              </p>
            </div>

            {/* Optional Approval Comment */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Approval Comment / Sign-off Notes:
              </label>
              <textarea
                rows={2}
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Verified and reviewed all acceptance criteria..."
                className="w-full text-xs rounded-lg border-stone-300 focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {actionSuccess}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveSubmit}
                disabled={submittingAction}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                {submittingAction ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Recording Approval...
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Approve & Unlock Next
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {activeModal === 'REJECT' && selectedMilestone && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold">Reject Milestone Progression</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Rejecting progression will keep subsequent milestones locked. A mandatory reason must be recorded in the audit trail.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Rejection Reason (Required):
              </label>
              <textarea
                rows={3}
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Describe reason for rejecting progression (e.g. Review authentication regression before proceeding)..."
                className="w-full text-xs rounded-lg border-stone-300 focus:border-rose-500 focus:ring-rose-500 p-2.5 border"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {actionSuccess}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                {submittingAction ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regression Modal */}
      {activeModal === 'REGRESSION' && selectedMilestone && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-amber-800">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold">Report Milestone Regression</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Flagging a regression on {selectedMilestone.id} will set its status to REGRESSION and automatically lock subsequent milestones until resolved.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Regression Description (Required):
              </label>
              <textarea
                rows={3}
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Describe the regression discovered..."
                className="w-full text-xs rounded-lg border-stone-300 focus:border-amber-500 focus:ring-amber-500 p-2.5 border"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {actionSuccess}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegressionSubmit}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
              >
                {submittingAction ? 'Reporting...' : 'Flag Regression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If viewed inside Admin Workspace, return content directly (AdminLayout handles the frame)
  if (showAdminControls && isAdminWorkspace) {
    return content;
  }

  // If authenticated citizen, wrap in CitizenLayout
  if (isAuthenticated && !showAdminControls) {
    return <CitizenLayout>{content}</CitizenLayout>;
  }

  // Otherwise, wrap in standard public view with Navbar
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar onOpenUpcoming={() => {}} />
      <main className="flex-1">{content}</main>
    </div>
  );
}
