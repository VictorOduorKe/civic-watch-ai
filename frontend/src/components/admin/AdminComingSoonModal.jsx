import React from 'react';
import { X, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export default function AdminComingSoonModal({ isOpen, onClose, feature }) {
  if (!isOpen || !feature) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center shrink-0 shadow-sm text-gold-600">
            {feature.icon || <Sparkles className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-navy-800 border border-stone-300">
                {feature.milestone || 'Upcoming Release'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                <Clock className="w-3 h-3" /> In Roadmap
              </span>
            </div>
            <h3 id="modal-title" className="text-xl font-bold text-navy-900 font-serif mt-1">
              {feature.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-600 leading-relaxed mb-5">
          {feature.description}
        </p>

        {/* Planned Capabilities */}
        {feature.plannedCapabilities && feature.plannedCapabilities.length > 0 && (
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 mb-6">
            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2.5">
              Scheduled Capabilities
            </h4>
            <ul className="space-y-2">
              {feature.plannedCapabilities.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-navy-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
