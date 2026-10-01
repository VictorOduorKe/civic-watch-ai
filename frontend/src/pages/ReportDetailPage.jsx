import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Paperclip,
  ShieldCheck,
  EyeOff,
  AlertCircle,
  FileText,
  Navigation,
  CheckCircle2,
  Share2
} from 'lucide-react';
import CitizenLayout from '../layouts/CitizenLayout';
import ReportStatusBadge from '../components/reports/ReportStatusBadge';
import ReportTimeline from '../components/reports/ReportTimeline';
import ReportAttachmentList from '../components/reports/ReportAttachmentList';
import { reportApi } from '../services/api';

export default function ReportDetailPage() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadReport() {
      if (!reference) return;

      try {
        setLoading(true);
        setError(null);
        const res = await reportApi.getMyReportDetail(reference);
        if (res.success && res.report) {
          setReport(res.report);
        } else {
          throw new Error(res.message || 'Report not found');
        }
      } catch (err) {
        console.error('[ReportDetail] Failed to load:', err);
        setError(err.message || 'Report not found or unavailable.');
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [reference]);

  const handleCopyReference = () => {
    if (!report?.reference) return;
    navigator.clipboard.writeText(report.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
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
  };

  return (
    <CitizenLayout>
      <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
        {/* Back Link */}
        <div>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-navy-950 transition-colors py-1 focus:outline-none focus:ring-1 focus:ring-gold-500 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Reports</span>
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-stone-200 rounded-xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-10 h-10 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-stone-700" role="status">
              Loading report details...
            </p>
          </div>
        ) : error || !report ? (
          <div className="bg-white border border-stone-200 rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900">
              Report Not Found
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 mb-5 leading-relaxed">
              The requested report could not be found or does not belong to your authenticated citizen account.
            </p>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-950 transition-colors shadow-xs border-b-2 border-gold-500"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to My Reports</span>
            </Link>
          </div>
        ) : (
          /* Report Loaded Successfully */
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-7 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Copyable Reference Box */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 border border-stone-300 rounded-md font-mono text-xs font-black text-navy-950 tracking-wider">
                      <span>{report.reference}</span>
                      <button
                        type="button"
                        onClick={handleCopyReference}
                        className="p-0.5 text-stone-500 hover:text-navy-900 transition-colors"
                        title="Copy report reference"
                        aria-label="Copy report reference code"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {copied && (
                      <span className="text-[11px] text-green-700 font-semibold">
                        Reference copied
                      </span>
                    )}

                    {/* Anonymous Indicator */}
                    {report.is_anonymous && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-300">
                        <EyeOff className="w-3 h-3 text-stone-500" />
                        <span>Submitted anonymously</span>
                      </span>
                    )}
                  </div>

                  {/* Incident Title (Plain Text safe against XSS) */}
                  <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight leading-snug">
                    {report.title}
                  </h1>
                </div>

                {/* Prominent Current Status */}
                <div className="shrink-0 flex items-center md:flex-col md:items-end gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hidden md:block">
                    Current Status
                  </span>
                  <ReportStatusBadge status={report.status} size="lg" />
                </div>
              </div>

              {/* Meta strip */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                  <span className="font-semibold text-neutral-900">
                    {report.category?.name || 'General Concern'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                  <span>
                    {report.county}
                    {report.ward ? `, ${report.ward}` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Submitted {formatDateTime(report.created_at)}</span>
                </div>
              </div>
            </div>

            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left/Main Column: Incident Info & Attachments */}
              <div className="lg:col-span-7 space-y-6">
                {/* Section: Incident Description */}
                <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-3">
                  <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-navy-900" />
                    <span>Incident Description</span>
                  </h2>

                  {/* Rendered strictly as plain text to prevent stored XSS */}
                  <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-wrap font-sans bg-stone-50/60 p-4 rounded-lg border border-stone-200">
                    {report.description}
                  </div>
                </div>

                {/* Section: Location & Details */}
                <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                  <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-navy-900" />
                    <span>Incident Location & Details</span>
                  </h2>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200">
                      <dt className="text-stone-500 text-[11px]">County</dt>
                      <dd className="font-semibold text-neutral-900 mt-0.5">
                        {report.county}
                      </dd>
                    </div>

                    {report.sub_county && (
                      <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200">
                        <dt className="text-stone-500 text-[11px]">Sub-County</dt>
                        <dd className="font-semibold text-neutral-900 mt-0.5">
                          {report.sub_county}
                        </dd>
                      </div>
                    )}

                    {report.ward && (
                      <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200">
                        <dt className="text-stone-500 text-[11px]">Ward</dt>
                        <dd className="font-semibold text-neutral-900 mt-0.5">
                          {report.ward}
                        </dd>
                      </div>
                    )}

                    {report.location_text && (
                      <div className="sm:col-span-2 bg-stone-50/70 p-3 rounded-lg border border-stone-200">
                        <dt className="text-stone-500 text-[11px]">Specific Location / Landmark</dt>
                        <dd className="font-semibold text-neutral-900 mt-0.5">
                          {report.location_text}
                        </dd>
                      </div>
                    )}

                    {/* Simple text GPS coordinates display (no heavy map overhead) */}
                    {(report.latitude !== null || report.longitude !== null) && (
                      <div className="sm:col-span-2 bg-stone-50/70 p-3 rounded-lg border border-stone-200 flex items-center gap-2 text-stone-700 font-mono text-[11px]">
                        <Navigation className="w-4 h-4 text-gold-600 shrink-0" />
                        <div>
                          <span className="text-stone-500 mr-2">GPS Coordinates:</span>
                          <span className="font-semibold text-navy-950">
                            {report.latitude !== null ? report.latitude : '—'},{' '}
                            {report.longitude !== null ? report.longitude : '—'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Incident Date & Time */}
                    {report.incident_date && (
                      <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200">
                        <dt className="text-stone-500 text-[11px]">Incident Date</dt>
                        <dd className="font-semibold text-neutral-900 mt-0.5 font-mono">
                          {formatDate(report.incident_date)}
                          {report.incident_time ? ` at ${report.incident_time}` : ''}
                        </dd>
                      </div>
                    )}

                    {/* Preferred Contact Mode */}
                    <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-200">
                      <dt className="text-stone-500 text-[11px]">Preferred Contact</dt>
                      <dd className="font-semibold text-neutral-900 mt-0.5 capitalize">
                        {report.preferred_contact || 'None'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Section: Supporting Files / Attachments */}
                <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-navy-900" />
                      <span>Supporting Files ({report.attachments?.length || 0})</span>
                    </h2>
                    <span className="text-[11px] text-stone-500">
                      Secure Citizen Storage
                    </span>
                  </div>

                  <ReportAttachmentList
                    reference={report.reference}
                    attachments={report.attachments || []}
                  />
                </div>
              </div>

              {/* Right Column: Status Progress Timeline & Verification Info */}
              <div className="lg:col-span-5 space-y-6">
                {/* Section: Status Progression Timeline */}
                <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-navy-900" />
                      <span>Report Progress</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Chronological history of official status transitions recorded in CivicWatch.
                    </p>
                  </div>

                  <ReportTimeline
                    history={report.status_history || []}
                    currentStatus={report.status}
                  />
                </div>

                {/* Section: Citizen Integrity Note */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-xs space-y-3 text-xs text-stone-600">
                  <div className="flex items-center gap-2 font-bold text-navy-950">
                    <ShieldCheck className="w-4 h-4 text-navy-900" />
                    <span>CivicWatch Integrity Policy</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    This report is authenticated under your verified citizen credentials. Only you can view your full report dossier. Status progressions are updated transparently by authorized oversight workflows.
                  </p>
                  <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-500 flex items-center justify-between">
                    <span>Reference: {report.reference}</span>
                    <span>OCL Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
