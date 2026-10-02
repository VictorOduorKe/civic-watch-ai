import React from 'react';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRightCircle
} from 'lucide-react';

export default function EvidenceSection({
  supporting = [],
  contradictory = [],
  missingContext = [],
  recommended = []
}) {
  return (
    <div className="space-y-4">
      {/* 1. Supporting Information */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Supporting Information ({supporting.length})
          </h4>
        </div>
        {supporting.length === 0 ? (
          <p className="text-xs text-stone-500 italic">
            No specific documented evidence supporting this claim was identified in available records.
          </p>
        ) : (
          <ul className="space-y-2">
            {supporting.map((item, idx) => (
              <li key={idx} className="text-xs text-stone-800 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. Contradictory Information */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
            Information That Conflicts With Claim ({contradictory.length})
          </h4>
        </div>
        {contradictory.length === 0 ? (
          <p className="text-xs text-stone-500 italic">
            No documented statements or facts directly contradicting this claim were identified.
          </p>
        ) : (
          <ul className="space-y-2">
            {contradictory.map((item, idx) => (
              <li key={idx} className="text-xs text-stone-800 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3. Missing Context */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Missing Context & Background Nuance ({missingContext.length})
          </h4>
        </div>
        {missingContext.length === 0 ? (
          <p className="text-xs text-stone-500 italic">
            No critical contextual omissions noted.
          </p>
        ) : (
          <ul className="space-y-2">
            {missingContext.map((item, idx) => (
              <li key={idx} className="text-xs text-stone-800 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 4. Recommended Verification Next Steps */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
          <ArrowRightCircle className="w-4 h-4 text-navy-700 shrink-0" aria-hidden="true" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950">
            Recommended Verification Steps ({recommended.length})
          </h4>
        </div>
        {recommended.length === 0 ? (
          <p className="text-xs text-stone-500 italic">
            Check the official Kenya Gazette, reputable independent media, or relevant government agencies.
          </p>
        ) : (
          <ul className="space-y-2">
            {recommended.map((item, idx) => (
              <li key={idx} className="text-xs text-stone-800 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-navy-600 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
