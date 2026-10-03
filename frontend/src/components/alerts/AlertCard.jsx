import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  Zap,
  Droplet,
  Truck,
  Building,
  CloudRain,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import {
  SeverityBadge,
  SourceBadge,
  DowntimeStatusBadge
} from './AlertBadge';
import {
  ALERT_TYPE_LABELS,
  UTILITY_SERVICE_LABELS
} from '../../constants/alertConstants';

function getServiceIcon(service) {
  switch (service) {
    case 'ELECTRICITY':
      return <Zap className="w-4 h-4 text-amber-500" />;
    case 'WATER':
      return <Droplet className="w-4 h-4 text-blue-500" />;
    case 'ROAD_INFRASTRUCTURE':
      return <Truck className="w-4 h-4 text-stone-600" />;
    case 'WASTE_SANITATION':
      return <Building className="w-4 h-4 text-emerald-600" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-gold-500" />;
  }
}

export default function AlertCard({ alert }) {
  const isUtility = alert.alert_type === 'UTILITY_DOWNTIME';
  const isExpired = alert.status === 'EXPIRED' || (alert.end_time && new Date(alert.end_time) < new Date());

  return (
    <article
      className={`bg-white border rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        isExpired ? 'border-stone-200 opacity-80' : 'border-stone-200 hover:border-navy-900/30'
      }`}
    >
      <div>
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={alert.severity} />
            <SourceBadge
              isOfficial={alert.is_official}
              sourceType={alert.source_type}
              sourceName={alert.source_name}
            />
            {isUtility && alert.downtime_status && (
              <DowntimeStatusBadge status={alert.downtime_status} />
            )}
            {isExpired && (
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-300">
                Expired
              </span>
            )}
          </div>

          <span className="text-xs font-medium text-stone-500">
            {ALERT_TYPE_LABELS[alert.alert_type] || alert.alert_type}
          </span>
        </div>

        {/* Demo Flag Indicator if is_demo */}
        {alert.is_demo && (
          <div className="mb-2">
            <span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded">
              DEMO NOTICE
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-navy-900 tracking-tight mb-2 hover:text-gold-600 transition-colors">
          <Link to={`/alerts/${alert.id}`}>
            {alert.title}
          </Link>
        </h3>

        {/* Summary */}
        <p className="text-sm text-stone-600 line-clamp-2 mb-4 leading-relaxed">
          {alert.summary}
        </p>

        {/* Utility Downtime Section if applicable */}
        {isUtility && (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 mb-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-1.5 font-medium">
                {getServiceIcon(alert.utility_service)}
                <span>Service: {UTILITY_SERVICE_LABELS[alert.utility_service] || alert.utility_service}</span>
              </span>
              <span className="font-semibold text-stone-800">
                Provider: {alert.source_name}
              </span>
            </div>

            {alert.expected_restoration && (
              <div className="flex items-center gap-1.5 text-stone-600 pt-1 border-t border-stone-200">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  Expected Restoration:{' '}
                  <strong className="text-stone-800 font-medium">
                    {new Date(alert.expected_restoration).toLocaleString('en-KE', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </strong>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta: Location, Source, and Action Button */}
      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="font-medium text-stone-700">
              {alert.county ? `${alert.county}${alert.sub_county ? ` • ${alert.sub_county}` : ''}` : 'National Broadcast'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              {alert.published_at
                ? new Date(alert.published_at).toLocaleDateString('en-KE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'Recent'}
            </span>
          </div>
        </div>

        <Link
          to={`/alerts/${alert.id}`}
          className="inline-flex items-center gap-1 font-semibold text-navy-900 hover:text-gold-600 transition-colors self-end sm:self-center"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
