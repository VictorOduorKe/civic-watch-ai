import React, { useState } from 'react';
import { Send, Plus, Users, Globe, Eye } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

export default function CitizenUpdatesPanel({
  updates = [],
  userRole,
  onPublishUpdate,
  isSubmitting = false
}) {
  const isAnalyst = userRole === 'Analyst';
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmPublish = async () => {
    setIsConfirmOpen(false);
    const success = await onPublishUpdate(message);
    if (success) {
      setMessage('');
      setShowForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gold-50 text-gold-700 flex items-center justify-center">
            <Globe className="w-4 h-4 text-gold-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
                Citizen-Facing Updates
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-100 text-gold-900 border border-gold-200">
                Visible to Submitter
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Messages published here are immediately visible in the citizen's report tracker.
            </p>
          </div>
        </div>

        {!isAnalyst && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gold-800 bg-gold-50 hover:bg-gold-100 rounded-lg border border-gold-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showForm ? 'Cancel' : 'Publish Update'}</span>
          </button>
        )}
      </div>

      {/* Publish Form */}
      {showForm && !isAnalyst && (
        <form onSubmit={handleInitialSubmit} className="p-3.5 bg-gold-50/40 rounded-lg border border-gold-200 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <label htmlFor="citizen-update-message" className="block text-xs font-bold text-navy-950">
              New Citizen Message
            </label>
            <span className="text-[11px] font-semibold text-gold-700 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Public to Submitter</span>
            </span>
          </div>

          <textarea
            id="citizen-update-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide factual progress on this case to the reporting citizen..."
            required
            maxLength={5000}
            className="w-full py-2 px-3 bg-white border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-stone-400">
              {message.length}/5000 characters
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1 text-xs text-stone-600 hover:bg-stone-200/60 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!message.trim() || isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-gold-600 hover:bg-gold-700 rounded-md shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish Update'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Updates List */}
      {updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-gold-200/80 bg-gold-50/20 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gold-500 text-navy-950 font-bold text-[10px] flex items-center justify-center">
                    {item.author?.name ? item.author.name.charAt(0) : 'O'}
                  </div>
                  <span className="font-bold text-navy-950">{item.author?.name || 'OCL Desk'}</span>
                  <span className="text-[10px] text-stone-500">Official Notice</span>
                </div>
                <span className="text-[10px] text-stone-400">{formatDate(item.created_at)}</span>
              </div>

              {/* Secure Text Display: No raw HTML rendering */}
              <p className="text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-stone-400">
          <Globe className="w-6 h-6 mx-auto mb-1 text-stone-300" />
          <p className="text-xs">No citizen updates published yet.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Publish Update to Citizen"
        message="«This message will be visible to the citizen who submitted the report.» Please verify that the statement is neutral and contains no internal confidential notes."
        isDestructive={false}
        confirmLabel="Publish to Citizen"
        onConfirm={handleConfirmPublish}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
}
