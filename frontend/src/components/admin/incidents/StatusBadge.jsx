import React from 'react';
import {
  FileText,
  Clock,
  ShieldCheck,
  UserCheck,
  Activity,
  CheckCircle2,
  Lock,
  XCircle,
  Slash
} from 'lucide-react';

const STATUS_CONFIGS = {
  'Submitted': {
    label: 'Submitted',
    icon: FileText,
    classes: 'bg-navy-50 text-navy-800 border-navy-300',
    dotClass: 'bg-navy-600'
  },
  'Under Review': {
    label: 'Under Review',
    icon: Clock,
    classes: 'bg-gold-50 text-gold-900 border-gold-300',
    dotClass: 'bg-gold-500'
  },
  'Verified': {
    label: 'Verified',
    icon: ShieldCheck,
    classes: 'bg-navy-100 text-navy-900 border-navy-300 font-semibold',
    dotClass: 'bg-navy-700'
  },
  'Assigned': {
    label: 'Assigned',
    icon: UserCheck,
    classes: 'bg-amber-50 text-amber-900 border-amber-300',
    dotClass: 'bg-amber-500'
  },
  'In Progress': {
    label: 'In Progress',
    icon: Activity,
    classes: 'bg-blue-50 text-blue-900 border-blue-300',
    dotClass: 'bg-blue-600'
  },
  'Resolved': {
    label: 'Resolved',
    icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    dotClass: 'bg-emerald-600'
  },
  'Closed': {
    label: 'Closed',
    icon: Lock,
    classes: 'bg-stone-100 text-stone-700 border-stone-300',
    dotClass: 'bg-stone-500'
  },
  'Rejected': {
    label: 'Rejected',
    icon: XCircle,
    classes: 'bg-rose-50 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-600'
  },
  'Dismissed': {
    label: 'Dismissed',
    icon: Slash,
    classes: 'bg-stone-100 text-stone-600 border-stone-300',
    dotClass: 'bg-stone-400'
  }
};

export default function StatusBadge({ status, size = 'sm', showIcon = true }) {
  const config = STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    icon: FileText,
    classes: 'bg-stone-100 text-stone-700 border-stone-200',
    dotClass: 'bg-stone-400'
  };

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${config.classes}`}
    >
      {showIcon && (
        <Icon className={isSm ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} aria-hidden="true" />
      )}
      <span>{config.label}</span>
    </span>
  );
}
