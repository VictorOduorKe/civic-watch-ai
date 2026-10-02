import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Cpu,
  Clock,
  History,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import CitizenLayout from '../../layouts/CitizenLayout';
import VerificationStatusBadge from '../../components/verification/VerificationStatusBadge';
import EvidenceSection from '../../components/verification/EvidenceSection';
import VerificationDisclaimer from '../../components/verification/VerificationDisclaimer';
import verificationService from '../../services/verificationService';

export default function VerificationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchVerification() {
      try {
        setLoading(true);
        setError('');
        const response = await verificationService.getVerification(id);
        if (isMounted) {
          if (response.success && response.verification) {
            setVerification(response.verification);
          } else {
            setError('Verification assessment not found or access denied.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Unable to load verification details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) {
      fetchVerification();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <CitizenLayout>
      {() => (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
          {/* Top Navigation */}
          <div className="flex items-center justify-between">
            <Link
              to="/verify/history"
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-navy-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Verification History</span>
            </Link>

            <Link
              to="/verify"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-950 transition-colors shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Verify Another Claim</span>
            </Link>
          </div>

          {loading ? (
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center shadow-xs flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-navy-900 mb-3" />
              <p className="text-sm font-semibold text-stone-700">
                Loading verification assessment...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white border border-rose-200 rounded-xl p-8 text-center shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-neutral-900">
                Verification Record Unavailable
              </h2>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                {error}
              </p>
              <button
                type="button"
                onClick={() => navigate('/verify')}
                className="px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-lg hover:bg-navy-950 transition-colors"
              >
                Go to Verification Center
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Status Banner */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-stone-500">
                      Assessment Result #{verification.id}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(verification.createdAt).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-500 uppercase">
                      Confidence:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider ${
                        verification.confidence === 'HIGH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : verification.confidence === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {verification.confidence}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-navy-950">
                      {verification.mainClaim || 'Information Verification Assessment'}
                    </h1>
                    {verification.sourceTitle && (
                      <p className="text-xs text-stone-600 mt-0.5">
                        Reported context: <strong>{verification.sourceTitle}</strong>
                      </p>
                    )}
                  </div>

                  <VerificationStatusBadge status={verification.status} size="lg" />
                </div>
              </div>

              {/* Submitted Content Card */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Submitted Information
                </h3>

                {verification.claimText && (
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs sm:text-sm text-stone-900 leading-relaxed font-mono">
                    "{verification.claimText}"
                  </div>
                )}

                {verification.sourceUrl && (
                  <div className="flex items-center gap-2 text-xs text-stone-600 pt-1">
                    <ExternalLink className="w-4 h-4 text-navy-700 shrink-0" />
                    <span>User-provided Source Link:</span>
                    <a
                      href={verification.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-navy-900 underline hover:text-navy-950 truncate max-w-sm"
                    >
                      {verification.sourceUrl}
                    </a>
                  </div>
                )}

                {verification.hasImage && (
                  <div className="pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-stone-700">
                      <ImageIcon className="w-4 h-4 text-stone-500" />
                      <span>Attached Screenshot</span>
                    </div>
                    <div className="max-w-md border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                      <img
                        src={`/api/verifications/${verification.id}/image`}
                        alt="Submitted screenshot"
                        className="w-full max-h-80 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* AI Summary Card */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-500" />
                  <span>AI Analysis & Summary</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                  {verification.summary}
                </p>
              </div>

              {/* 4 Categorized Evidence Sections */}
              <EvidenceSection
                supporting={verification.supportingInformation}
                contradictory={verification.contradictoryInformation}
                missingContext={verification.missingContext}
                recommended={verification.recommendedVerification}
              />

              {/* Technical AI Metadata Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-[11px] text-stone-500 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-stone-400" />
                    <span>Provider: <strong>{verification.aiProvider} ({verification.aiModel})</strong></span>
                  </span>
                  {verification.processingDurationMs && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Processing time: {(verification.processingDurationMs / 1000).toFixed(1)}s</span>
                    </span>
                  )}
                </div>
                <span>Prompt Schema: {verification.promptVersion}</span>
              </div>

              {/* Disclaimer */}
              <VerificationDisclaimer />
            </div>
          )}
        </div>
      )}
    </CitizenLayout>
  );
}
