import React from 'react';

/**
 * ReportStatusBadge — Accessible status indicator respecting OCL brand identity.
 * Color semantic mapping:
 * - Submitted: Navy (#141F35)
 * - Under Review: Gold (#D99A00)
 * - Verified: Navy (#141F35)
 * - Assigned: Gold (#D99A00)
 * - In Progress: Gold (#D99A00)
 * - Resolved: Green (#168A45)
 * - Closed: Navy (#141F35)
 * - Rejected / Dismissed: Red (#C62828)
 */
export function getStatusConfig(status) {
  switch (status) {
    case 'Submitted':
      return {
        badgeClass: 'bg-navy-50 text-navy-900 border-navy-300',
        dotClass: 'bg-navy-900',
        label: 'Submitted'
      };
    case 'Under Review':
      return {
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
        dotClass: 'bg-gold-500',
        label: 'Under Review'
      };
    case 'Verified':
      return {
        badgeClass: 'bg-navy-50 text-navy-900 border-navy-300',
        dotClass: 'bg-navy-700',
        label: 'Verified'
      };
    case 'Assigned':
      return {
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
        dotClass: 'bg-gold-500',
        label: 'Assigned'
      };
    case 'In Progress':
      return {
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
        dotClass: 'bg-gold-500',
        label: 'In Progress'
      };
    case 'Resolved':
      return {
        badgeClass: 'bg-green-50 text-green-900 border-green-300',
        dotClass: 'bg-green-600',
        label: 'Resolved'
      };
    case 'Closed':
      return {
        badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
        dotClass: 'bg-navy-900',
        label: 'Closed'
      };
    case 'Rejected':
    case 'Dismissed':
      return {
        badgeClass: 'bg-red-50 text-red-900 border-red-300',
        dotClass: 'bg-red-600',
        label: status === 'Dismissed' ? 'Dismissed' : 'Rejected'
      };
    default:
      return {
        badgeClass: 'bg-stone-100 text-stone-700 border-stone-300',
        dotClass: 'bg-stone-500',
        label: status || 'Pending'
      };
  }
}

export default function ReportStatusBadge({ status, size = 'sm', className = '' }) {
  const config = getStatusConfig(status);

  const sizeClasses =
    size === 'lg'
      ? 'px-3 py-1.5 text-xs font-bold gap-2'
      : size === 'md'
      ? 'px-2.5 py-1 text-xs font-semibold gap-1.5'
      : 'px-2 py-0.5 text-[11px] font-semibold gap-1.5';

  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${sizeClasses} ${config.badgeClass} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span className={`rounded-full shrink-0 ${dotSize} ${config.dotClass}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
