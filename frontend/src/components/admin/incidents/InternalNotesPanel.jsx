import React, { useState } from 'react';
import { Lock, Plus, MessageSquare, ShieldAlert } from 'lucide-react';

export default function InternalNotesPanel({
  notes = [],
  userRole,
  onAddNote,
  isSubmitting = false
}) {
  const isAnalyst = userRole === 'Analyst';
  const [noteContent, setNoteContent] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const success = await onAddNote(noteContent);
    if (success) {
      setNoteContent('');
      setShowForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
            <Lock className="w-4 h-4 text-navy-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
                Internal Case Notes
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-100 text-navy-900 border border-navy-200">
                Staff Only
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Confidential internal analysis. Never returned to citizen.
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
            <span>{showForm ? 'Cancel' : 'Add Note'}</span>
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {showForm && !isAnalyst && (
        <form onSubmit={handleSubmit} className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2.5 animate-in fade-in duration-150">
          <label htmlFor="internal-note-content" className="block text-xs font-bold text-navy-950">
            New Internal Note
          </label>
          <textarea
            id="internal-note-content"
            rows={3}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Record investigative steps, verification evidence, or liaison findings..."
            required
            maxLength={5000}
            className="w-full py-2 px-3 bg-white border border-stone-300 rounded-md text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-stone-400">
              {noteContent.length}/5000 characters
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
                disabled={!noteContent.trim() || isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-950 rounded-md shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-stone-200/80 bg-stone-50/50 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-navy-900 text-gold-400 font-bold text-[10px] flex items-center justify-center">
                    {item.author?.name ? item.author.name.charAt(0) : 'U'}
                  </div>
                  <span className="font-bold text-navy-950">{item.author?.name || 'Staff Member'}</span>
                  <span className="text-[10px] text-stone-400 font-medium px-1.5 py-0.2 bg-stone-100 rounded">
                    {item.author?.role || 'Staff'}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">{formatDate(item.created_at)}</span>
              </div>

              {/* Secure Text Display: No raw HTML rendering */}
              <p className="text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
                {item.note}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-stone-400">
          <MessageSquare className="w-6 h-6 mx-auto mb-1 text-stone-300" />
          <p className="text-xs">No internal notes recorded yet.</p>
        </div>
      )}
    </div>
  );
}
