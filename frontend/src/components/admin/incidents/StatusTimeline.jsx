import React from 'react';
import { Clock, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function StatusTimeline({ statusHistory = [] }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
        <Clock className="w-4 h-4 text-navy-800" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
          Official Status Progression Timeline
        </h3>
      </div>

      {statusHistory.length > 0 ? (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
          {statusHistory.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-navy-900 border-2 border-white ring-2 ring-stone-200" />

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} size="sm" />
                  <span className="text-[11px] text-stone-400 font-medium">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                {item.changed_by && (
                  <p className="text-[11px] text-stone-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-400" />
                    <span>
                      Changed by: <strong>{item.changed_by.name}</strong> ({item.changed_by.role})
                    </span>
                  </p>
                )}

                {item.note && (
                  <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded border border-stone-200/70 mt-1 leading-relaxed">
                    {item.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-stone-400 py-4 text-center">
          No status history recorded.
        </p>
      )}
    </div>
  );
}
