import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, Send, Lock, RotateCcw } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfirmationModal from './ConfirmationModal';

const ALLOWED_TRANSITIONS = {
  'Submitted': ['Under Review', 'Rejected', 'Dismissed'],
  'Under Review': ['Verified', 'Assigned', 'In Progress', 'Rejected', 'Dismissed', 'Submitted'],
  'Verified': ['Assigned', 'In Progress', 'Under Review', 'Rejected', 'Dismissed'],
  'Assigned': ['In Progress', 'Under Review', 'Verified', 'Rejected', 'Dismissed'],
  'In Progress': ['Resolved', 'Under Review', 'Assigned', 'Rejected', 'Dismissed'],
  'Resolved': ['Closed', 'In Progress', 'Under Review'],
  'Closed': ['Under Review', 'In Progress'],
  'Rejected': ['Under Review', 'Submitted'],
  'Dismissed': ['Under Review', 'Submitted']
};

export default function IncidentStatusPanel({
  currentStatus,
  userRole,
  onUpdateStatus,
  isSubmitting = false
}) {
  const isAnalyst = userRole === 'Analyst';
  const isClosed = currentStatus === 'Closed';

  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');
  const [publishCitizenUpdate, setPublishCitizenUpdate] = useState(false);
  const [citizenMessage, setCitizenMessage] = useState('');
  const [reopenMode, setReopenMode] = useState(false);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    onConfirm: null
  });

  const availableStatuses = isClosed
    ? reopenMode ? ALLOWED_TRANSITIONS['Closed'] : []
    : ALLOWED_TRANSITIONS[currentStatus] || [];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    // Consequential actions requiring explicit confirmation
    if (selectedStatus === 'Rejected') {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Incident Rejection',
        message: 'Are you sure you want to mark this report as Rejected? The explanation provided will be recorded in the official audit record.',
        isDestructive: true,
        onConfirm: () => executeStatusChange()
      });
      return;
    }

    if (selectedStatus === 'Closed') {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Closing Incident',
        message: 'Closing an incident finalizes the investigation lifecycle. Reopening will require deliberate administrative override. Proceed with closing?',
        isDestructive: false,
        onConfirm: () => executeStatusChange()
      });
      return;
    }

    if (publishCitizenUpdate) {
      setConfirmModal({
        isOpen: true,
        title: 'Publish Citizen Status Notice',
        message: 'This message will be made visible immediately to the citizen who submitted the report. Ensure that no internal investigative reasoning or sensitive data is included.',
        isDestructive: false,
        onConfirm: () => executeStatusChange()
      });
      return;
    }

    executeStatusChange();
  };

  const executeStatusChange = async () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    const success = await onUpdateStatus({
      status: selectedStatus,
      note,
      reopen: isClosed ? true : false,
      publish_citizen_update: publishCitizenUpdate,
      citizen_message: publishCitizenUpdate ? citizenMessage : ''
    });

    if (success) {
      setSelectedStatus('');
      setNote('');
      setPublishCitizenUpdate(false);
      setCitizenMessage('');
      setReopenMode(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Lifecycle & Status Control
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs font-medium text-stone-600">Current:</span>
            <StatusBadge status={currentStatus} size="md" />
          </div>
        </div>

        {isClosed && !isAnalyst && !reopenMode && (
          <button
            type="button"
            onClick={() => setReopenMode(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gold-700 bg-gold-50 hover:bg-gold-100 rounded-lg border border-gold-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gold-600" />
            <span>Reopen Incident</span>
          </button>
        )}
      </div>

      {isAnalyst ? (
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p>
            <strong>Read-only access:</strong> Analysts have oversight and reporting privileges. Operational status changes require an Administrator or Moderator account.
          </p>
        </div>
      ) : isClosed && !reopenMode ? (
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-navy-950">Incident is Closed & Finalized</p>
            <p className="mt-0.5 text-stone-500">
              No further operational editing controls are active. To resume workflow, select "Reopen Incident" above.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          {reopenMode && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Reopening closed report</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setReopenMode(false);
                  setSelectedStatus('');
                }}
                className="text-amber-700 underline font-semibold hover:text-amber-900"
              >
                Cancel Reopen
              </button>
            </div>
          )}

          {/* New Status Select */}
          <div>
            <label htmlFor="new-status-select" className="block text-xs font-semibold text-stone-700 mb-1">
              Select Next Status
            </label>
            <select
              id="new-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              required
              className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white"
            >
              <option value="">-- Choose status transition --</option>
              {availableStatuses.map((st) => (
                <option key={st} value={st}>
                  Transition to: {st}
                </option>
              ))}
            </select>
          </div>

          {/* Status Note */}
          <div>
            <label htmlFor="status-note-input" className="block text-xs font-semibold text-stone-700 mb-1">
              Status Change Note{' '}
              {['Rejected', 'Resolved'].includes(selectedStatus) && (
                <span className="text-rose-600 font-bold">* Required for {selectedStatus}</span>
              )}
            </label>
            <textarea
              id="status-note-input"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Operational reasoning for this status transition..."
              required={['Rejected', 'Resolved'].includes(selectedStatus)}
              className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white"
            />
          </div>

          {/* Publish citizen-visible update toggle */}
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={publishCitizenUpdate}
                onChange={(e) => setPublishCitizenUpdate(e.target.checked)}
                className="w-4 h-4 text-gold-600 border-stone-300 rounded focus:ring-gold-500"
              />
              <span className="text-xs font-medium text-stone-700">
                Publish a status update to the citizen
              </span>
            </label>

            {publishCitizenUpdate && (
              <div className="mt-2.5 p-3 bg-gold-50/50 border border-gold-200 rounded-lg space-y-1.5 animate-in fade-in duration-150">
                <p className="text-[11px] text-stone-600 font-medium">
                  «This message will be visible to the citizen who submitted the report.»
                </p>
                <textarea
                  rows={2}
                  value={citizenMessage}
                  onChange={(e) => setCitizenMessage(e.target.value)}
                  placeholder="Enter citizen-facing update message..."
                  required={publishCitizenUpdate}
                  className="w-full py-2 px-3 bg-white border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedStatus || isSubmitting}
            className="w-full py-2 px-4 bg-navy-900 hover:bg-navy-950 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Updating...' : 'Apply Status Transition'}</span>
          </button>
        </form>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        confirmLabel="Confirm Action"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isLoading={isSubmitting}
      />
    </div>
  );
}
