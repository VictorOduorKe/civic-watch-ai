import React, { useEffect, useState } from 'react';
import { X, ExternalLink, ShieldCheck, FileText, History, Link as LinkIcon, AlertCircle, Building2 } from 'lucide-react';
import { trustApi } from '../../services/api';
import TrustBadge from './TrustBadge';

export default function ProvenanceModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  initialDossier = null
}) {
  const [dossier, setDossier] = useState(initialDossier);
  const [loading, setLoading] = useState(!initialDossier);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !entityType || !entityId) return;

    let isMounted = true;
    const fetchDossier = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await trustApi.getProvenanceDossier(entityType, entityId);
        if (isMounted) {
          setDossier(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to load provenance information');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDossier();
    return () => {
      isMounted = false;
    };
  }, [isOpen, entityType, entityId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provenance-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#0D2137] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D99A00]" />
            <h2 id="provenance-modal-title" className="text-lg font-bold">
              Provenance & Verification Dossier
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-12 text-center text-slate-500">
              <div className="animate-spin w-8 h-8 border-4 border-[#1B4F72] border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm">Loading verified provenance data...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded text-rose-800 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to load verification details</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && dossier && (
            <>
              {/* Entity Overview & Trust Status */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {dossier.entityType} #{dossier.entityId}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {dossier.title}
                  </h3>
                  {dossier.verifiedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Last Verified: {new Date(dossier.verifiedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <TrustBadge
                    status={dossier.verificationStatus}
                    isOfficial={dossier.isOfficial}
                    size="lg"
                  />
                </div>
              </div>

              {/* Source Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#1B4F72]" /> Source Attribution
                </h4>
                {dossier.source ? (
                  <div className="p-4 rounded border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">
                        {dossier.source.name}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {dossier.source.sourceType}
                      </span>
                    </div>
                    {dossier.source.organization && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Organization:</span> {dossier.source.organization}
                      </p>
                    )}
                    {dossier.source.website && (
                      <a
                        href={dossier.source.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#1B4F72] hover:underline"
                      >
                        <span>Official Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No formal source record attached.</p>
                )}
              </div>

              {/* Supporting References & Evidence */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-[#1B4F72]" /> Supporting Evidence & References ({dossier.referencesCount || 0})
                </h4>
                {dossier.references && dossier.references.length > 0 ? (
                  <div className="space-y-2">
                    {dossier.references.map((ref) => (
                      <div
                        key={ref.id}
                        className="p-3 rounded border border-slate-200 bg-white text-sm flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{ref.title}</p>
                          {ref.description && (
                            <p className="text-xs text-slate-600">{ref.description}</p>
                          )}
                          <span className="text-[11px] text-slate-400">
                            Source Type: {ref.sourceType || 'General'}
                          </span>
                        </div>
                        <a
                          href={ref.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-1.5 rounded text-[#1B4F72] hover:bg-slate-100 transition-colors"
                          title="Open public reference"
                          aria-label={`Open reference: ${ref.title}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    No external references currently attached.
                  </div>
                )}
              </div>

              {/* Append-Only Verification History Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#1B4F72]" /> Chronological Verification History
                </h4>
                {dossier.history && dossier.history.length > 0 ? (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {dossier.history.map((h) => (
                      <div key={h.id} className="relative text-xs">
                        <div className="absolute -left-[1.625rem] top-1 w-2.5 h-2.5 rounded-full bg-[#1B4F72] border-2 border-white ring-2 ring-slate-100" />
                        <div className="p-3 rounded border border-slate-200 bg-white space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">
                              {h.action}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {new Date(h.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {h.reason && (
                            <p className="text-slate-700 font-medium">
                              Reason: <span className="font-normal text-slate-600">{h.reason}</span>
                            </p>
                          )}
                          {h.evidenceSummary && (
                            <p className="text-slate-500">
                              Evidence: {h.evidenceSummary}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400">
                            Recorded by: <span className="font-medium text-slate-600">{h.verifierRole}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No historical status modifications recorded.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>CivicWatch AI Verification & Trust Layer</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
