import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function ReportSuccess({ reportResult, onReset }) {
  const [copied, setCopied] = useState(false);

  const reference = reportResult?.reference || 'CWK-2026-000000';

  const handleCopy = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs animate-fadeIn text-center">
      {/* Success Badge */}
      <div className="w-14 h-14 bg-green-100 text-green-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
        <CheckCircle2 className="w-8 h-8 text-green-700" />
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
        Incident Report Submitted
      </h2>
      <p className="mt-1.5 text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
        Your concern has been securely received and recorded in the verified CivicWatch AI Kenya database.
      </p>

      {/* Report Reference Box */}
      <div className="my-6 p-4 sm:p-5 bg-stone-50 border border-stone-300 rounded-lg max-w-md mx-auto">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest block mb-1">
          Official Report Reference
        </span>
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xl sm:text-2xl font-black text-navy-950 tracking-wider">
            {reference}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-stone-500 hover:text-navy-900 hover:bg-stone-200 rounded transition-colors"
            title="Copy reference code"
            aria-label="Copy reference code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        {copied && (
          <p className="text-[10px] text-green-700 font-semibold mt-1">
            Reference copied to clipboard!
          </p>
        )}
      </div>

      {/* Summary Metadata */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left mb-6 text-xs bg-stone-50/60 p-3.5 rounded-lg border border-stone-200">
        <div>
          <span className="text-stone-500 block text-[11px]">Initial Status:</span>
          <span className="font-semibold text-neutral-900 inline-flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-green-600"></span>
            {reportResult?.status || 'Submitted'}
          </span>
        </div>
        <div>
          <span className="text-stone-500 block text-[11px]">Category:</span>
          <span className="font-semibold text-neutral-900 block truncate mt-0.5">
            {reportResult?.category || 'Civic Concern'}
          </span>
        </div>
        <div>
          <span className="text-stone-500 block text-[11px]">County:</span>
          <span className="font-semibold text-neutral-900 block truncate mt-0.5">
            {reportResult?.county || 'Kenya'}
          </span>
        </div>
        <div>
          <span className="text-stone-500 block text-[11px]">Submission Mode:</span>
          <span className="font-semibold text-neutral-900 block mt-0.5">
            {reportResult?.isAnonymous ? 'Anonymous' : 'Standard'}
          </span>
        </div>
      </div>

      {/* Governance & Integrity Notice */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 max-w-md mx-auto text-left space-y-1.5 mb-6 text-xs text-stone-600">
        <div className="flex items-center gap-1.5 font-bold text-neutral-900">
          <ShieldCheck className="w-4 h-4 text-navy-900" />
          <span>Report Tracking & Platform Integrity</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Your report has been assigned reference code <strong>{reference}</strong>. You can follow its status progression, agency responses, and official timeline updates anytime under <strong>My Reports</strong>.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to={`/reports/${reference}`}
          className="w-full sm:w-auto px-5 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-950 border-b-2 border-gold-500 transition-colors shadow-xs inline-flex items-center justify-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-gold-400" />
          <span>Track This Report</span>
        </Link>
        <Link
          to="/reports"
          className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 border border-stone-300 text-navy-950 text-xs font-semibold rounded-lg hover:bg-stone-200 transition-colors inline-flex items-center justify-center"
        >
          View My Reports
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gold-500 text-navy-900 text-xs font-semibold rounded-lg hover:bg-gold-50 transition-colors"
        >
          Report Another Issue
        </button>
      </div>
    </div>
  );
}
