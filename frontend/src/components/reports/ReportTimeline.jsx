import React from 'react';
import {
  CheckCircle2,
  Clock,
  CircleDot,
  FileCheck,
  UserCheck,
  AlertCircle,
  XCircle,
  Calendar
} from 'lucide-react';

/**
 * Returns an appropriate icon for a historical status event.
 */
function getStatusIcon(status) {
  switch (status) {
    case 'Submitted':
      return <FileCheck className="w-4 h-4 text-navy-900" />;
    case 'Under Review':
      return <Clock className="w-4 h-4 text-gold-500" />;
    case 'Verified':
      return <CheckCircle2 className="w-4 h-4 text-navy-900" />;
    case 'Assigned':
      return <UserCheck className="w-4 h-4 text-gold-500" />;
    case 'In Progress':
      return <CircleDot className="w-4 h-4 text-gold-500" />;
    case 'Resolved':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'Closed':
      return <CheckCircle2 className="w-4 h-4 text-navy-900" />;
    case 'Rejected':
    case 'Dismissed':
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-stone-500" />;
  }
}

/**
 * Formats ISO timestamp to citizen-friendly Kenyan standard: e.g. "1 Oct 2026, 14:20"
 */
function formatEventDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export default function ReportTimeline({ history = [], currentStatus }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-center text-xs text-stone-500">
        No recorded status progression events yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
      {history.map((event, index) => {
        const isLatest = index === history.length - 1;

        return (
          <div key={event.id || index} className="relative group">
            {/* Timeline Node Indicator */}
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform duration-150 ${
                isLatest
                  ? 'bg-white border-gold-500 ring-4 ring-gold-100 shadow-xs'
                  : 'bg-white border-stone-300'
              }`}
              aria-hidden="true"
            >
              {getStatusIcon(event.status)}
            </div>

            {/* Event Details */}
            <div className="bg-stone-50/70 border border-stone-200 rounded-lg p-3 sm:p-3.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                <span className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                  <span>{event.status}</span>
                  {isLatest && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gold-100 text-gold-900 border border-gold-300 rounded">
                      Current State
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>{formatEventDate(event.created_at)}</span>
                </span>
              </div>

              {/* Citizen-Visible Note */}
              {event.note ? (
                <p className="text-xs text-stone-700 leading-relaxed mt-1">
                  {event.note}
                </p>
              ) : (
                <p className="text-[11px] text-stone-500 italic mt-0.5">
                  Report status transitioned to {event.status}.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
