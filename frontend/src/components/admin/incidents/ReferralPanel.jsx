import React, { useState } from 'react';
import { ExternalLink, Plus, Share2, Building2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const REFERRAL_TYPES = [
  'Public Service Authority',
  'Civil Society Organization',
  'Human Rights Organization',
  'Emergency Organization',
  'Police Administration',
  'Authorized Advocate',
  'OCL Review',
  'Other Approved Referral'
];

const REFERRAL_STATUS_CONFIG = {
  'Pending': { classes: 'bg-stone-100 text-stone-700 border-stone-300' },
  'Sent': { classes: 'bg-blue-50 text-blue-800 border-blue-300' },
  'Accepted': { classes: 'bg-gold-50 text-gold-900 border-gold-300' },
  'Declined': { classes: 'bg-rose-50 text-rose-800 border-rose-300' },
  'Completed': { classes: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  'Cancelled': { classes: 'bg-stone-100 text-stone-500 border-stone-300' }
};

export default function ReferralPanel({
  referrals = [],
  userRole,
  onCreateReferral,
  onUpdateReferralStatus,
  isSubmitting = false
}) {
  const isAnalyst = userRole === 'Analyst';
  const [showForm, setShowForm] = useState(false);
  const [referralType, setReferralType] = useState('Public Service Authority');
  const [organizationName, setOrganizationName] = useState('');
  const [reason, setReason] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!organizationName.trim() || !reason.trim()) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = async () => {
    setIsConfirmOpen(false);
    const success = await onCreateReferral({
      referral_type: referralType,
      organization_name: organizationName,
      reason
    });

    if (success) {
      setOrganizationName('');
      setReason('');
      setShowForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-navy-700" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Agency & Stakeholder Referrals
            </h3>
            <p className="text-[11px] text-stone-500">
              Routing concerns to external jurisdictions for assessment.
            </p>
          </div>
        </div>

        {!isAnalyst && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-navy-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showForm ? 'Cancel' : 'New Referral'}</span>
          </button>
        )}
      </div>

      {/* Neutral Legal Note */}
      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-600 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <p>
          <strong>Routing Safeguard:</strong> A referral represents administrative transmission for specialist assessment. It does not constitute a legal determination or factual conclusion of wrongdoing.
        </p>
      </div>

      {/* New Referral Form */}
      {showForm && !isAnalyst && (
        <form onSubmit={handleInitialSubmit} className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-3 animate-in fade-in duration-150">
          <h4 className="text-xs font-bold text-navy-950">Create Case Referral</h4>

          <div>
            <label htmlFor="referral-type" className="block text-xs font-semibold text-stone-700 mb-1">
              Referral Category
            </label>
            <select
              id="referral-type"
              value={referralType}
              onChange={(e) => setReferralType(e.target.value)}
              required
              className="w-full py-2 px-3 bg-white border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              {REFERRAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="org-name" className="block text-xs font-semibold text-stone-700 mb-1">
              Recipient Organization Name
            </label>
            <input
              id="org-name"
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="e.g. Kenya National Highways Authority, IPOA, KMPDC..."
              required
              className="w-full py-2 px-3 bg-white border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label htmlFor="referral-reason" className="block text-xs font-semibold text-stone-700 mb-1">
              Referral Justification & Scope
            </label>
            <textarea
              id="referral-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the jurisdiction and scope of information transmitted for review..."
              required
              className="w-full py-2 px-3 bg-white border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200/60 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!organizationName.trim() || !reason.trim() || isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-950 rounded-md shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Submit Referral'}
            </button>
          </div>
        </form>
      )}

      {/* Referrals List */}
      {referrals.length > 0 ? (
        <div className="space-y-3">
          {referrals.map((ref) => {
            const statusStyle = REFERRAL_STATUS_CONFIG[ref.status] || {
              classes: 'bg-stone-100 text-stone-700 border-stone-300'
            };

            return (
              <div
                key={ref.id}
                className="p-3.5 rounded-lg border border-stone-200 bg-white space-y-2 hover:border-gold-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-stone-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-navy-950">{ref.organization_name}</h4>
                      <span className="text-[10px] text-stone-500 font-medium">{ref.referral_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle.classes}`}>
                      {ref.status}
                    </span>

                    {!isAnalyst && (
                      <select
                        value={ref.status}
                        onChange={(e) => onUpdateReferralStatus(ref.id, e.target.value)}
                        className="py-0.5 px-2 bg-stone-50 border border-stone-300 rounded text-[10px] text-stone-700 font-semibold focus:outline-none focus:ring-1 focus:ring-gold-500"
                        aria-label={`Change status for referral to ${ref.organization_name}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Declined">Declined</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>

                <p className="text-xs text-stone-700 italic bg-stone-50/70 p-2 rounded border border-stone-100">
                  "{ref.reason}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                  <span>Referred by: {ref.referred_by?.name || 'Staff Member'}</span>
                  <span>{formatDate(ref.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-stone-400">
          <Share2 className="w-6 h-6 mx-auto mb-1 text-stone-300" />
          <p className="text-xs">No administrative referrals on record.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Create Case Referral"
        message={`Transmit this incident record to ${organizationName} under the category "${referralType}"? This referral will be logged in the permanent case file.`}
        isDestructive={false}
        confirmLabel="Confirm Referral"
        onConfirm={handleConfirmCreate}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
}
