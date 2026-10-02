import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function VerificationDisclaimer({ className = '' }) {
  return (
    <div
      role="note"
      aria-label="AI Verification Disclaimer"
      className={`bg-stone-50 border border-stone-200 rounded-lg p-3.5 flex items-start gap-3 text-stone-700 ${className}`}
    >
      <ShieldAlert className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-xs space-y-1 leading-relaxed">
        <p className="font-bold text-neutral-900">
          Open Civic Lab AI Verification Advisory
        </p>
        <p>
          AI-assisted verification is an informational tool designed to highlight available evidence, missing context, and potential contradictions. It is <strong>not an absolute truth authority</strong> nor a substitute for checking authoritative primary documents, gazetted records, or official state bodies.
        </p>
        <p className="text-[11px] text-stone-500">
          For emergency situations, immediately dial <strong>999 / 112</strong>. For legal or financial matters, consult certified professionals.
        </p>
      </div>
    </div>
  );
}
