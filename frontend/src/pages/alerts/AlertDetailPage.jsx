import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
  Building,
  Zap,
  Droplet,
  Truck,
  CheckCircle,
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alertApi } from '../../services/api';
import {
  SeverityBadge,
  SourceBadge,
  DowntimeStatusBadge,
  DemoNoticeBanner
} from '../../components/alerts/AlertBadge';
import CitizenLayout from '../../layouts/CitizenLayout';
import {
  ALERT_TYPE_LABELS,
  UTILITY_SERVICE_LABELS
} from '../../constants/alertConstants';
import TrustBadge from '../../components/trust/TrustBadge';
import ProvenanceModal from '../../components/trust/ProvenanceModal';
import logo from '../../assets/logo.jpg';

export default function AlertDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);

  useEffect(() => {
    async function loadAlert() {
      setLoading(true);
      setError(null);
      try {
        const res = await alertApi.getPublicAlertById(id);
        if (res.success && res.data) {
          setAlert(res.data);
        } else {
          throw new Error(res.message || 'Alert not found');
        }
      } catch (err) {
        setError(err.message || 'Could not load alert details.');
      } finally {
        setLoading(false);
      }
    }
    loadAlert();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isUtility = alert?.alert_type === 'UTILITY_DOWNTIME';
  const isExpired = alert?.status === 'EXPIRED' || (alert?.end_time && new Date(alert.end_time) < new Date());

  const detailContent = (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/alerts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Alerts</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 bg-white border border-stone-200 rounded-2xl p-8">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-stone-600">Loading alert details...</p>
        </div>
      ) : error || !alert ? (
        <div className="p-8 bg-white border border-stone-200 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-navy-900">Alert Not Found</h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            {error || 'This alert is no longer public, draft only, or does not exist.'}
          </p>
          <Link
            to="/alerts"
            className="inline-block mt-3 px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-xl hover:bg-navy-800"
          >
            Return to Alerts Feed
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Demo Notice Banner (Rule 35) */}
          {alert.is_demo && <DemoNoticeBanner />}

          {/* Expired Banner if applicable */}
          {isExpired && (
            <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl text-xs font-medium text-stone-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500 shrink-0" />
              <span>This alert has expired and is archived for historical reference. Recommended actions may no longer apply.</span>
            </div>
          )}

          {/* Main Dossier Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header Meta */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={alert.severity} />
                  <SourceBadge
                    isOfficial={alert.is_official}
                    sourceType={alert.source_type}
                    sourceName={alert.source_name}
                  />
                  <TrustBadge
                    status={alert.verification_status}
                    isOfficial={alert.is_official}
                    onClick={() => setShowProvenanceModal(true)}
                  />
                  {isUtility && alert.downtime_status && (
                    <DowntimeStatusBadge status={alert.downtime_status} />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProvenanceModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-navy-900 hover:bg-stone-50 text-xs font-semibold transition-colors"
                    title="View trust provenance, verification history and supporting references"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-navy-800" />
                    <span>Trust &amp; Provenance</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-navy-900 hover:bg-stone-50 text-xs font-semibold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? 'Link Copied!' : 'Share Alert'}</span>
                  </button>
                </div>
              </div>

              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                {ALERT_TYPE_LABELS[alert.alert_type] || alert.alert_type}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight leading-snug">
                {alert.title}
              </h1>

              {/* Summary lead */}
              <p className="text-base text-stone-700 leading-relaxed font-medium bg-stone-50 p-4 rounded-xl border border-stone-100">
                {alert.summary}
              </p>
            </div>

            {/* Affected Area & Timing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50/80 rounded-xl border border-stone-200 text-xs">
              <div className="space-y-1.5">
                <span className="text-stone-500 font-semibold uppercase tracking-wider block">
                  Geographic Location
                </span>
                <div className="flex items-start gap-2 text-stone-800">
                  <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-semibold">
                      {alert.county ? alert.county : 'National Broadcast (All Counties)'}
                    </strong>
                    {(alert.sub_county || alert.ward || alert.location_text) && (
                      <span className="text-stone-600">
                        {[alert.sub_county, alert.ward, alert.location_text].filter(Boolean).join(' • ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-stone-500 font-semibold uppercase tracking-wider block">
                  Publication Schedule
                </span>
                <div className="flex items-start gap-2 text-stone-800">
                  <Calendar className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-stone-600">
                      Published:{' '}
                      <strong className="text-stone-800 font-semibold">
                        {alert.published_at
                          ? new Date(alert.published_at).toLocaleString('en-KE', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })
                          : 'Immediate'}
                      </strong>
                    </span>
                    {alert.end_time && (
                      <span className="block text-stone-600">
                        Expires:{' '}
                        <strong className="text-stone-800 font-semibold">
                          {new Date(alert.end_time).toLocaleString('en-KE', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Utility Outage Section if applicable */}
            {isUtility && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gold-500" />
                    <span>Utility Interruption Schedule</span>
                  </h2>
                  {alert.downtime_status && (
                    <DowntimeStatusBadge status={alert.downtime_status} />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                  <div>
                    <span className="text-stone-500 block">Service Affected</span>
                    <strong className="text-stone-800">
                      {UTILITY_SERVICE_LABELS[alert.utility_service] || alert.utility_service}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Expected Restoration</span>
                    <strong className="text-stone-800">
                      {alert.expected_restoration
                        ? new Date(alert.expected_restoration).toLocaleString('en-KE', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })
                        : 'To be determined'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Operating Provider</span>
                    <strong className="text-stone-800">{alert.source_name}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Full Description */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                Full Advisory Details
              </h2>
              <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-white border border-stone-100 p-4 rounded-xl shadow-2xs">
                {alert.description}
              </div>
            </div>

            {/* Recommended Citizen Actions */}
            {alert.recommended_action && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Recommended Citizen Action</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-950 leading-relaxed">
                  {alert.recommended_action}
                </p>
              </div>
            )}

            {/* Traceable Source & Verification Information */}
            <div className="border-t border-stone-200 pt-6 space-y-3 text-xs">
              <h2 className="font-bold text-navy-900 uppercase tracking-wider">
                Source & Verification Audit
              </h2>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-500 block">Publishing Source</span>
                  <span className="font-semibold text-stone-800">{alert.source_name}</span>
                  <span className="text-stone-500 block text-[11px] mt-0.5">
                    Type: {alert.source_type}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block">Verification Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-stone-800">
                      {alert.verification_status}
                    </span>
                    {alert.verifier_name && (
                      <span className="text-stone-500 text-[11px]">
                        (by {alert.verifier_name})
                      </span>
                    )}
                  </div>
                </div>

                {alert.source_reference && (
                  <div className="sm:col-span-2 pt-2 border-t border-stone-200">
                    <span className="text-stone-500 block">Original Source Reference</span>
                    <a
                      href={alert.source_reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 font-semibold break-all mt-0.5"
                    >
                      <span>{alert.source_reference}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provenance & Trust History Modal */}
      {alert && (
        <ProvenanceModal
          isOpen={showProvenanceModal}
          onClose={() => setShowProvenanceModal(false)}
          entityType="ALERT"
          entityId={alert.id}
        />
      )}
    </div>
  );

  if (user) {
    return <CitizenLayout>{detailContent}</CitizenLayout>;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col antialiased text-neutral-900">
      <header className="sticky top-0 z-40 bg-navy-950 text-white border-b border-navy-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="CivicWatch AI" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <span className="font-bold text-base tracking-tight text-white block">
                CivicWatch AI
              </span>
              <span className="text-[10px] text-gold-400 font-mono tracking-widest block uppercase">
                Kenya Civic Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/alerts"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-200 hover:text-white hover:bg-navy-900 transition-colors"
            >
              All Alerts
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {detailContent}
      </main>

      <footer className="px-4 sm:px-6 lg:px-8 py-4 border-t border-stone-200 bg-white text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 CivicWatch AI Kenya • Developed for Open Civic Lab (OCL)</span>
        <div className="flex items-center gap-4">
          <Link to="/alerts" className="hover:underline">Alerts</Link>
          <Link to="/status" className="hover:underline">System Status</Link>
        </div>
      </footer>
    </div>
  );
}
