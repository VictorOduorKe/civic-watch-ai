import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, Paperclip, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function IncidentCard({ incident }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isAnonymous = Boolean(incident.is_anonymous);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-3 hover:border-gold-400 transition-colors">
      {/* Header: Reference & Status */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold text-navy-950 bg-stone-100 px-2 py-0.5 rounded">
          {incident.reference}
        </span>
        <StatusBadge status={incident.status} size="sm" />
      </div>

      {/* Category & Title */}
      <div>
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gold-700 bg-gold-50 px-1.5 py-0.5 rounded mb-1">
          {incident.category?.name || 'General'}
        </span>
        <h3 className="text-sm font-bold text-navy-950 line-clamp-2">
          {incident.title}
        </h3>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{incident.county}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate justify-end">
          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>{formatDate(incident.updated_at || incident.created_at)}</span>
        </div>
      </div>

      {/* Assignment & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <div className="text-[11px]">
          {incident.assigned_to ? (
            <span className="text-stone-700 font-medium">
              Assigned: <strong className="text-navy-950">{incident.assigned_to.name}</strong>
            </span>
          ) : (
            <span className="text-stone-400 italic">Unassigned</span>
          )}
        </div>

        <Link
          to={`/admin/incidents/${encodeURIComponent(incident.reference)}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-600 hover:text-gold-700 hover:underline"
        >
          <span>Manage</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
