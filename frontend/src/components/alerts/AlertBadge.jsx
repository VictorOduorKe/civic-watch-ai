import React from 'react';
import { ShieldCheck, Users, AlertTriangle, Info, Clock, CheckCircle } from 'lucide-react';
import { SEVERITY_CONFIG, DOWNTIME_STATUS_CONFIG } from '../../constants/alertConstants';

export function SeverityBadge({ severity }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badge}`}
      aria-label={`Severity: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export function SourceBadge({ isOfficial, sourceType, sourceName }) {
  if (isOfficial) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-navy-900 text-gold-400 border border-navy-800 shadow-2xs">
        <ShieldCheck className="w-3.5 h-3.5 text-gold-400" aria-hidden="true" />
        <span>Verified Official</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
      <Users className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
      <span>Community Advisory</span>
    </span>
  );
}

export function DowntimeStatusBadge({ status }) {
  const config = DOWNTIME_STATUS_CONFIG[status] || DOWNTIME_STATUS_CONFIG.ONGOING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${config.badge}`}>
      {status === 'RESTORED' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
      {status === 'ONGOING' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
      {status === 'PLANNED' && <Clock className="w-3 h-3 text-blue-600" />}
      <span>{config.label}</span>
    </span>
  );
}

export function DemoNoticeBanner() {
  return (
    <div
      role="alert"
      className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-amber-900 text-xs font-semibold flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
        <span>DEMO ALERT — NOT AN OFFICIAL NOTICE (Testing Data)</span>
      </div>
      <span className="text-[10px] text-amber-700 font-mono hidden sm:inline">OCL CivWatch Sandbox</span>
    </div>
  );
}
