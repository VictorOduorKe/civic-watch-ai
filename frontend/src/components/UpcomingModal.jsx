import React, { useEffect } from 'react';
import { X, Clock, Info } from 'lucide-react';

/**
 * Accessible Modal displaying upcoming roadmap milestones for actions
 * that are intentionally not yet implemented (e.g. Auth, Incident Reporting).
 */
export default function UpcomingModal({ isOpen, onClose, title, milestone, description }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-stone-300 rounded-lg p-6 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 text-stone-500 hover:text-stone-900 rounded focus:outline-none focus:ring-2 focus:ring-navy-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-navy-50 text-navy-900 rounded-md border border-gold-200">
            <Clock className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-stone-100 text-stone-700 rounded mb-1">
              {milestone || 'Upcoming Feature'}
            </span>
            <h2 id="modal-title" className="text-lg font-bold text-neutral-900">
              {title || 'Upcoming Module'}
            </h2>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed mb-5">
          {description ||
            'This feature is scheduled for implementation in a future milestone. CivicWatch AI Kenya is currently in Milestone 1 (Public Presentation Layer).'}
        </p>

        <div className="p-3 bg-stone-50 border border-stone-200 rounded-md flex items-start gap-2.5 text-xs text-stone-700 mb-6">
          <Info className="w-4 h-4 text-navy-800 shrink-0 mt-0.5" />
          <span>
            Milestone 0 (Technical Foundation) is fully operational. Full authentication and submission capabilities will roll out in their respective milestones.
          </span>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded hover:bg-navy-950 border-b-2 border-gold-500 focus:outline-none focus:ring-2 focus:ring-navy-800 shadow-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
