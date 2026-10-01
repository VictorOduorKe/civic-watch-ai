import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Calendar,
  Clock,
  User,
  Paperclip,
  Download,
  Share2,
  RefreshCw,
  Eye,
  CheckCircle2,
  Phone,
  Mail,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminIncidentApi } from '../../services/api';
import StatusBadge from '../../components/admin/incidents/StatusBadge';
import IncidentStatusPanel from '../../components/admin/incidents/IncidentStatusPanel';
import AssignmentPanel from '../../components/admin/incidents/AssignmentPanel';
import StatusTimeline from '../../components/admin/incidents/StatusTimeline';
import CitizenUpdatesPanel from '../../components/admin/incidents/CitizenUpdatesPanel';
import InternalNotesPanel from '../../components/admin/incidents/InternalNotesPanel';
import ReferralPanel from '../../components/admin/incidents/ReferralPanel';

const SENSITIVE_CATEGORIES = [
  'Corruption Concern',
  'Safety Concern',
  'Missing Person',
  'Drug Activity',
  'Public Health',
  'Human Rights Concern',
  'Emergency'
];

export default function IncidentDetailPage() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || 'Admin';

  const [incident, setIncident] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIncidentDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminIncidentApi.getIncidentDetail(reference);
      if (res.success && res.incident) {
        setIncident(res.incident);
      } else {
        setError('Incident details could not be found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve incident details.');
    } finally {
      setIsLoading(false);
    }
  }, [reference]);

  const fetchAssignees = useCallback(async () => {
    if (userRole === 'Analyst') return;
    try {
      const res = await adminIncidentApi.getAssignees();
      if (res.success) {
        setAssignees(res.assignees || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignees:', err);
    }
  }, [userRole]);

  useEffect(() => {
    fetchIncidentDetail();
    fetchAssignees();
  }, [fetchIncidentDetail, fetchAssignees]);

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setActionSuccess(null);
    } else {
      setActionSuccess(msg);
      setActionError(null);
    }
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 5000);
  };

  // Status Change Handler
  const handleUpdateStatus = async (statusPayload) => {
    setIsSubmitting(true);
    try {
      const res = await adminIncidentApi.updateStatus(reference, statusPayload);
      if (res.success) {
        showNotification(`Status updated to ${res.status} successfully.`);
        await fetchIncidentDetail();
        return true;
      }
      return false;
    } catch (err) {
      showNotification(err.message || 'Failed to update incident status.', true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign Handler
  const handleAssign = async (assignPayload) => {
    setIsSubmitting(true);
    try {
      const res = await adminIncidentApi.assignIncident(reference, assignPayload);
      if (res.success) {
        showNotification(`Incident assigned to ${res.assigned_to?.name}.`);
        await fetchIncidentDetail();
        return true;
      }
      return false;
    } catch (err) {
      showNotification(err.message || 'Failed to assign incident.', true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unassign Handler
  const handleUnassign = async () => {
    setIsSubmitting(true);
    try {
      const res = await adminIncidentApi.unassignIncident(reference);
      if (res.success) {
        showNotification('Incident unassigned successfully.');
        await fetchIncidentDetail();
        return true;
      }
      return false;
    } catch (err) {
      showNotification(err.message || 'Failed to unassign incident.', true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Internal Note Handler
  const handleAddNote = async (noteText) => {
    setIsSubmitting(true);
    try {
      const res = await adminIncidentApi.addInternalNote(reference, { note: noteText });
      if (res.success) {
        showNotification('Internal note recorded.');
        await fetchIncidentDetail();
        return true;
      }
      return false;
    } catch (err) {
      showNotification(err.message || 'Failed to add internal note.', true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish Citizen Update Handler
  const handlePublishUpdate = async (messageText) => {
    setIsSubmitting(true);
    try {
      const res = await adminIncidentApi.addCitizenUpdate(reference, { message: messageText });
      if (res.success) {
        showNotification('Citizen update published successfully.');
        await fetchIncidentDetail();
        return true;
      }
      return false;
    } catch (err) {
      showNotification(err.message || 'Failed to publish citizen update.', true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Referral Handler
  const handleCreateReferral = async (referralPayload) => {
    setIsSubmitting(true);
    try {
      const res = await adminIncidentApi.createReferral(reference, referralPayload);
      if (res.success) {
        showNotification(`Referral logged to ${res.referral?.organization_name}.`);
        await fetchIncidentDetail();
        return true;
      }
      return false;
    } catch (err) {
      showNotification(err.message || 'Failed to create referral.', true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Referral Status Handler
  const handleUpdateReferralStatus = async (referralId, status) => {
    try {
      const res = await adminIncidentApi.updateReferralStatus(reference, referralId, { status });
      if (res.success) {
        showNotification('Referral status updated.');
        await fetchIncidentDetail();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update referral status.', true);
    }
  };

  // Download Attachment Handler
  const handleDownloadAttachment = async (attachment) => {
    try {
      await adminIncidentApi.downloadAttachment(reference, attachment.id, attachment.original_name);
    } catch (err) {
      showNotification(err.message || 'Attachment file could not be retrieved.', true);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-stone-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-gold-500" />
        <p className="text-xs font-medium">Loading incident record...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-navy-950">Incident Not Found</h2>
        <p className="text-xs text-stone-600">
          {error || `No incident report with reference "${reference}" exists in the registry.`}
        </p>
        <Link
          to="/admin/incidents"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-navy-900 rounded-lg hover:bg-navy-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incident List</span>
        </Link>
      </div>
    );
  }

  const isEmergency = incident.category?.name === 'Emergency';
  const isSensitive = SENSITIVE_CATEGORIES.includes(incident.category?.name);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Navigation & Feedback Alerts */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-navy-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incidents</span>
        </button>

        <span className="font-mono text-xs font-bold text-stone-400">
          Ref: {incident.reference}
        </span>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-center gap-2 animate-in fade-in duration-150">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Warning Banners */}
      {isEmergency && (
        <div className="p-4 bg-rose-600 text-white rounded-xl shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold uppercase tracking-wide">Emergency Incident Notice</h4>
            <p className="leading-relaxed opacity-95">
              «If immediate danger remains, appropriate emergency services should be contacted. CivicWatch does not replace emergency response services.»
            </p>
          </div>
        </div>
      )}

      {isSensitive && !isEmergency && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Sensitive Category Protocol:</span>{' '}
            <span>Handle information according to applicable access and privacy rules. Do not publish unverified allegations publicly.</span>
          </div>
        </div>
      )}

      {/* Main Incident Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-5">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-navy-950 bg-stone-100 px-2.5 py-1 rounded">
                {incident.reference}
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-stone-100 text-stone-700">
                {incident.category?.name || 'General Category'}
              </span>
              <StatusBadge status={incident.status} size="sm" />
            </div>

            <h1 className="text-lg md:text-xl font-black text-navy-950 tracking-tight">
              {incident.title}
            </h1>
          </div>

          <div className="text-right text-xs text-stone-500 shrink-0">
            <p>Submitted: <strong>{formatDate(incident.created_at)}</strong></p>
            <p className="mt-0.5">Last update: <strong>{formatDate(incident.updated_at)}</strong></p>
          </div>
        </div>

        {/* Location & Metadata Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3.5 bg-stone-50 rounded-lg text-xs">
          <div>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">County</span>
            <span className="font-bold text-navy-950">{incident.county}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">Sub-County / Ward</span>
            <span className="font-bold text-navy-950">
              {incident.sub_county || '—'}{incident.ward ? ` / ${incident.ward}` : ''}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">Incident Date</span>
            <span className="font-bold text-navy-950">{formatDate(incident.incident_date)}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">Location Text</span>
            <span className="font-bold text-navy-950 truncate block" title={incident.location_text}>
              {incident.location_text || '—'}
            </span>
          </div>
        </div>

        {/* Citizen Privacy & Submitter Info */}
        <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-stone-500" />
            {incident.is_anonymous ? (
              <span className="font-semibold text-stone-700 bg-stone-200 px-2 py-0.5 rounded text-[11px]">
                Submitted anonymously — Citizen privacy protected
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-stone-700">
                <span>Citizen: <strong>{incident.submitter?.name}</strong></span>
                {incident.submitter?.email && (
                  <span className="text-stone-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{incident.submitter.email}</span>
                  </span>
                )}
                {incident.submitter?.phone && (
                  <span className="text-stone-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{incident.submitter.phone}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {incident.preferred_contact && incident.preferred_contact !== 'none' && (
            <span className="text-[11px] text-stone-500 font-medium">
              Preferred contact: {incident.preferred_contact}
            </span>
          )}
        </div>

        {/* Incident Description */}
        <div className="space-y-1.5 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Citizen Submitted Description
          </h3>
          <p className="text-xs md:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap bg-stone-50/50 p-4 rounded-lg border border-stone-100">
            {incident.description}
          </p>
        </div>

        {/* Attachments Section */}
        {incident.attachments && incident.attachments.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-stone-400" />
              <span>Evidence Attachments ({incident.attachments.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {incident.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-navy-950 truncate" title={att.original_name}>
                      {att.original_name}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {(att.size_bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadAttachment(att)}
                    className="p-1.5 text-stone-600 hover:text-navy-900 hover:bg-white rounded border border-stone-200 shadow-2xs"
                    title="Download attachment file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Operational 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Timeline, Citizen Updates, Internal Notes, Referrals */}
        <div className="lg:col-span-7 space-y-5">
          {/* Status Timeline */}
          <StatusTimeline statusHistory={incident.status_history} />

          {/* Citizen Updates Panel */}
          <CitizenUpdatesPanel
            updates={incident.citizen_updates}
            userRole={userRole}
            onPublishUpdate={handlePublishUpdate}
            isSubmitting={isSubmitting}
          />

          {/* Internal Notes Panel */}
          <InternalNotesPanel
            notes={incident.internal_notes}
            userRole={userRole}
            onAddNote={handleAddNote}
            isSubmitting={isSubmitting}
          />

          {/* Referral Panel */}
          <ReferralPanel
            referrals={incident.referrals}
            userRole={userRole}
            onCreateReferral={handleCreateReferral}
            onUpdateReferralStatus={handleUpdateReferralStatus}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Right Column: Status Actions & Assignment */}
        <div className="lg:col-span-5 space-y-5">
          {/* Status Transition Control Panel */}
          <IncidentStatusPanel
            currentStatus={incident.status}
            userRole={userRole}
            onUpdateStatus={handleUpdateStatus}
            isSubmitting={isSubmitting}
          />

          {/* Assignment Control Panel */}
          <AssignmentPanel
            activeAssignment={incident.active_assignment}
            assignmentHistory={incident.assignment_history}
            assignees={assignees}
            userRole={userRole}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
