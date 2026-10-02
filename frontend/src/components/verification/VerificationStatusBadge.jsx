import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Info,
  Clock
} from 'lucide-react';

const STATUS_CONFIG = {
  EVIDENCE_SUPPORTS_CLAIM: {
    label: 'Evidence Supports Claim',
    icon: CheckCircle2,
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    iconClasses: 'text-emerald-600'
  },
  EVIDENCE_CONFLICTS_WITH_CLAIM: {
    label: 'Evidence Conflicts With Claim',
    icon: AlertTriangle,
    badgeClasses: 'bg-rose-50 text-rose-800 border-rose-300',
    iconClasses: 'text-rose-600'
  },
  INSUFFICIENT_EVIDENCE: {
    label: 'Insufficient Evidence',
    icon: HelpCircle,
    badgeClasses: 'bg-stone-100 text-stone-700 border-stone-300',
    iconClasses: 'text-stone-500'
  },
  MISSING_CONTEXT: {
    label: 'Missing Context',
    icon: Info,
    badgeClasses: 'bg-amber-50 text-amber-900 border-amber-300',
    iconClasses: 'text-amber-600'
  },
  REQUIRES_VERIFICATION: {
    label: 'Requires Verification',
    icon: Clock,
    badgeClasses: 'bg-blue-50 text-blue-900 border-blue-300',
    iconClasses: 'text-blue-600'
  }
};

export default function VerificationStatusBadge({ status, size = 'md', className = '' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.REQUIRES_VERIFICATION;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  }[size] || 'px-2.5 py-1 text-xs gap-1.5';

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size] || 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border shadow-2xs ${config.badgeClasses} ${sizeClasses} ${className}`}
    >
      <Icon className={`${iconSizes} ${config.iconClasses} shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
