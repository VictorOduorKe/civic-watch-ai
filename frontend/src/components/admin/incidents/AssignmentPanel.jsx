import React, { useState } from 'react';
import { UserCheck, UserMinus, UserPlus, Clock, History, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

export default function AssignmentPanel({
  activeAssignment,
  assignmentHistory = [],
  assignees = [],
  userRole,
  onAssign,
  onUnassign,
  isSubmitting = false
}) {
  const isAnalyst = userRole === 'Analyst';
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [updateStatus, setUpdateStatus] = useState(true);

  // Unassign confirmation modal
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const success = await onAssign({
      assigned_to_user_id: parseInt(selectedUserId, 10),
      assignment_note: assignmentNote,
      update_status_to_assigned: updateStatus
    });

    if (success) {
      setSelectedUserId('');
      setAssignmentNote('');
      setShowAssignForm(false);
    }
  };

  const handleConfirmUnassign = async () => {
    setIsUnassignModalOpen(false);
    await onUnassign();
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Case Assignment
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Internal operational staff lead
          </p>
        </div>

        {!isAnalyst && (
          <div className="flex items-center gap-1.5">
            {activeAssignment ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowAssignForm(!showAssignForm)}
                  className="px-2.5 py-1 text-xs font-semibold text-gold-700 bg-gold-50 hover:bg-gold-100 rounded-md border border-gold-300 transition-colors"
                >
                  {showAssignForm ? 'Cancel' : 'Reassign'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnassignModalOpen(true)}
                  disabled={isSubmitting}
                  className="px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                  aria-label="Unassign incident"
                >
                  Unassign
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowAssignForm(!showAssignForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-950 rounded-lg transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showAssignForm ? 'Cancel' : 'Assign Staff'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Current Active Assignment Card */}
      {activeAssignment ? (
        <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-navy-900 text-gold-400 font-bold text-xs flex items-center justify-center shrink-0">
              {activeAssignment.assigned_to.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-navy-950 truncate">
                {activeAssignment.assigned_to.name}
              </h4>
              <p className="text-xs text-stone-500 font-medium">
                {activeAssignment.assigned_to.role}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 space-y-1 pt-2 border-t border-stone-200/60">
            <div className="flex items-center justify-between">
              <span>Assigned by: <strong>{activeAssignment.assigned_by?.name || 'Administrator'}</strong></span>
              <span>{formatDate(activeAssignment.assigned_at)}</span>
            </div>
            {activeAssignment.assignment_note && (
              <p className="text-stone-700 italic bg-white p-2 rounded border border-stone-200 mt-1">
                "{activeAssignment.assignment_note}"
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-stone-50 rounded-lg border border-dashed border-stone-300 text-center">
          <UserMinus className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-stone-700">No staff member currently assigned</p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            This incident report is currently in the unassigned queue.
          </p>
        </div>
      )}

      {/* Assign / Reassign Form */}
      {showAssignForm && !isAnalyst && (
        <form onSubmit={handleAssignSubmit} className="p-3.5 bg-gold-50/40 rounded-lg border border-gold-200 space-y-3 animate-in fade-in duration-150">
          <h4 className="text-xs font-bold text-navy-950">
            {activeAssignment ? 'Reassign Incident' : 'Assign Incident to Staff'}
          </h4>

          <div>
            <label htmlFor="assignee-select" className="block text-xs font-semibold text-stone-700 mb-1">
              Select Assignee
            </label>
            <select
              id="assignee-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full py-2 px-3 bg-white border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">-- Choose authorized staff --</option>
              {assignees.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role}) — {u.county}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assignment-note" className="block text-xs font-semibold text-stone-700 mb-1">
              Assignment Note (Optional)
            </label>
            <textarea
              id="assignment-note"
              rows={2}
              value={assignmentNote}
              onChange={(e) => setAssignmentNote(e.target.value)}
              placeholder="Instructions or triage context for the assignee..."
              className="w-full py-2 px-3 bg-white border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
            <input
              type="checkbox"
              checked={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.checked)}
              className="w-4 h-4 text-gold-600 border-stone-300 rounded focus:ring-gold-500"
            />
            <span>Update report status to "Assigned" automatically</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAssignForm(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200/60 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedUserId || isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-950 rounded-md shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      )}

      {/* Assignment History Drawer */}
      {assignmentHistory.length > 0 && (
        <div className="pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-xs font-semibold text-stone-500 hover:text-navy-950 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-stone-400" />
              <span>Assignment History ({assignmentHistory.length})</span>
            </span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
              {assignmentHistory.map((hist) => (
                <div
                  key={hist.id}
                  className="p-2.5 bg-stone-50 rounded-md border border-stone-200 text-[11px] text-stone-600 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-950">{hist.assigned_to.name}</span>
                    <span className="text-[10px] text-stone-400">
                      {formatDate(hist.assigned_at)}
                    </span>
                  </div>
                  {hist.unassigned_at && (
                    <p className="text-[10px] text-stone-500">
                      Unassigned: {formatDate(hist.unassigned_at)}
                    </p>
                  )}
                  {hist.assignment_note && (
                    <p className="italic text-stone-700">"{hist.assignment_note}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Unassign Confirmation Modal */}
      <ConfirmationModal
        isOpen={isUnassignModalOpen}
        title="Remove Staff Assignment"
        message="Are you sure you want to unassign this report? The historical assignment record will be preserved with a conclusion timestamp."
        isDestructive={false}
        confirmLabel="Confirm Unassign"
        onConfirm={handleConfirmUnassign}
        onCancel={() => setIsUnassignModalOpen(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
}
