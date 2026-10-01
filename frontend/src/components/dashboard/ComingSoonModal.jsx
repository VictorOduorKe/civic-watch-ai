import React from 'react';
import { X, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

/**
 * Reusable modal for upcoming milestone actions.
 * Transparently explains what will be implemented and why fake functionality is disallowed.
 */
export default function ComingSoonModal({ isOpen, onClose, feature }) {
  if (!isOpen || !feature) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-stone-200 p-6 z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            {feature.icon && (
              <div className="w-10 h-10 rounded-md bg-stone-100 text-emerald-900 flex items-center justify-center">
                {feature.icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-title" className="text-lg font-bold text-neutral-900">
                  {feature.title}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {feature.milestone || 'Upcoming'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                CivicWatch AI Kenya Roadmap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-md hover:bg-stone-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3">
          <p className="text-sm text-stone-700 leading-relaxed">
            {feature.description}
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-md p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>Production Integrity Principle</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              CivicWatch AI adheres to strict milestone boundaries. Rather than displaying simulated or fake data, this capability will connect directly to the verified backend service upon completion of {feature.milestone || 'its designated milestone'}.
            </p>
          </div>

          {feature.plannedCapabilities && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Planned Functionality:
              </h4>
              <ul className="text-xs text-stone-600 space-y-1.5">
                {feature.plannedCapabilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Target: {feature.milestone || 'Subsequent Milestone'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-900 text-white text-xs font-semibold rounded hover:bg-emerald-950 transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
