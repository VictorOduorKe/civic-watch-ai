import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, User, ShieldAlert, Paperclip, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function IncidentTable({ incidents, onSelectIncident }) {
  if (!incidents || incidents.length === 0) {
    return null;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse" aria-label="Incident Management Table">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold uppercase tracking-wider text-stone-600">
            <th scope="col" className="py-3 px-4">Reference</th>
            <th scope="col" className="py-3 px-4">Title & Context</th>
            <th scope="col" className="py-3 px-4">Category</th>
            <th scope="col" className="py-3 px-4">County</th>
            <th scope="col" className="py-3 px-4">Status</th>
            <th scope="col" className="py-3 px-4">Assigned To</th>
            <th scope="col" className="py-3 px-4">Updated</th>
            <th scope="col" className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 text-xs">
          {incidents.map((incident) => {
            const isAnonymous = Boolean(incident.is_anonymous);
            return (
              <tr
                key={incident.reference}
                className="hover:bg-gold-50/20 transition-colors group cursor-pointer"
                onClick={() => onSelectIncident(incident.reference)}
              >
                {/* Reference */}
                <td className="py-3 px-4 font-mono font-bold text-navy-950 whitespace-nowrap">
                  <span className="group-hover:text-gold-600 transition-colors">
                    {incident.reference}
                  </span>
                </td>

                {/* Title */}
                <td className="py-3 px-4 max-w-xs">
                  <div className="font-semibold text-navy-950 truncate" title={incident.title}>
                    {incident.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                    {isAnonymous && (
                      <span className="inline-flex items-center gap-1 text-stone-500 font-medium">
                        <User className="w-3 h-3 text-stone-400" />
                        <span>Anonymous</span>
                      </span>
                    )}
                    {incident.attachment_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-stone-500">
                        <Paperclip className="w-3 h-3 text-stone-400" />
                        <span>{incident.attachment_count}</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                    {incident.category?.name || 'General'}
                  </span>
                </td>

                {/* County */}
                <td className="py-3 px-4 text-stone-700 whitespace-nowrap">
                  {incident.county}
                  {incident.sub_county && (
                    <span className="text-stone-400 text-[11px] block">{incident.sub_county}</span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <StatusBadge status={incident.status} size="sm" />
                </td>

                {/* Assigned To */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {incident.assigned_to ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-navy-100 text-navy-800 text-[10px] font-bold flex items-center justify-center">
                        {incident.assigned_to.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-navy-900 leading-tight">
                          {incident.assigned_to.name}
                        </p>
                        <p className="text-[10px] text-stone-400 leading-none">
                          {incident.assigned_to.role}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-stone-400 italic text-[11px]">Unassigned</span>
                  )}
                </td>

                {/* Updated */}
                <td className="py-3 px-4 text-stone-500 whitespace-nowrap text-[11px]">
                  {formatDate(incident.updated_at || incident.created_at)}
                </td>

                {/* Action */}
                <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={`/admin/incidents/${encodeURIComponent(incident.reference)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-navy-900 hover:text-white bg-stone-100 hover:bg-navy-900 rounded-md transition-colors"
                  >
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
