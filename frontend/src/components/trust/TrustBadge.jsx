import React from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, XCircle, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

/**
 * M14 — TrustBadge Component
 * Accessible visual trust indicators complying with Section 14 & 31:
 * - Clear text labels (does not rely solely on color)
 * - Accessible aria-labels
 * - Zero misleading numerical "trust scores"
 */
export default function TrustBadge({
  status = 'UNVERIFIED',
  isOfficial = false,
  size = 'md',
  onClick = null,
  showIcon = true,
  className = ''
}) {
  const normStatus = (status || 'UNVERIFIED').toUpperCase();

  const configs = {
    VERIFIED: {
      label: isOfficial ? 'Official & Verified' : 'Verified Community Notice',
      icon: isOfficial ? ShieldCheck : CheckCircle2,
      bg: isOfficial ? 'bg-[#1B4F72]/10 text-[#1B4F72] border-[#1B4F72]/30' : 'bg-emerald-50 text-emerald-800 border-emerald-300',
      iconColor: isOfficial ? 'text-[#1B4F72]' : 'text-emerald-700'
    },
    DISPUTED: {
      label: 'Verification Disputed',
      icon: AlertTriangle,
      bg: 'bg-amber-50 text-amber-900 border-amber-300',
      iconColor: 'text-amber-700'
    },
    CORRECTED: {
      label: 'Notice Corrected',
      icon: RefreshCw,
      bg: 'bg-blue-50 text-blue-900 border-blue-300',
      iconColor: 'text-blue-700'
    },
    WITHDRAWN: {
      label: 'Notice Withdrawn',
      icon: XCircle,
      bg: 'bg-rose-50 text-rose-900 border-rose-300',
      iconColor: 'text-rose-700'
    },
    UNDER_REVIEW: {
      label: 'Under Verification Review',
      icon: Clock,
      bg: 'bg-purple-50 text-purple-900 border-purple-300',
      iconColor: 'text-purple-700'
    },
    PENDING: {
      label: 'Pending Verification',
      icon: Clock,
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      iconColor: 'text-amber-600'
    },
    UNVERIFIED: {
      label: isOfficial ? 'Pending Verification' : 'Unverified Community Submission',
      icon: HelpCircle,
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      iconColor: 'text-slate-500'
    }
  };

  const config = configs[normStatus] || configs.UNVERIFIED;
  const Icon = config.icon;

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
      className={`inline-flex items-center rounded border transition-colors ${config.bg} ${sizeStyles[size]} ${onClick ? 'cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1B4F72]' : ''} ${className}`}
      title={`Trust status: ${config.label}`}
      aria-label={`Trust Status: ${config.label}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor} shrink-0`} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}
