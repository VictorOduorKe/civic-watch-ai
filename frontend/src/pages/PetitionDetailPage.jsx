import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Building,
  MapPin,
  Calendar,
  ArrowLeft,
  Share2,
  AlertCircle,
  HelpCircle,
  Check,
  XCircle,
  History
} from 'lucide-react';
import { participationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PetitionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [petition, setPetition] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Signing Modal
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signComment, setSignComment] = useState('');
  const [signLoading, setSignLoading] = useState(false);
  const [signError, setSignError] = useState(null);

  // Withdraw State
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'signatures' | 'audits'

  const fetchPetitionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [petitionRes, sigsRes] = await Promise.all([
        participationApi.getPetition(id),
        participationApi.getSignatures(id, { limit: 100 }).catch(() => ({ data: [] }))
      ]);

      setPetition(petitionRes.data);
      setSignatures(sigsRes.data || []);

      if (user && ['Admin', 'Moderator', 'Analyst'].includes(user.role)) {
        try {
          const auditRes = await participationApi.getAudits('PETITION', id);
          setAudits(auditRes.data || []);
        } catch {
          // ignore audit failures for non-admins
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load petition details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetitionData();
  }, [id, user]);

  const handleSign = async (e) => {
    e.preventDefault();
    try {
      setSignLoading(true);
      setSignError(null);

      await participationApi.signPetition(id, { comment: signComment });
      setSignModalOpen(false);
      setSignComment('');
      fetchPetitionData();
    } catch (err) {
      setSignError(err.message || 'Failed to record signature.');
    } finally {
      setSignLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw your signature from this petition?')) {
      return;
    }
    try {
      setWithdrawLoading(true);
      setWithdrawError(null);

      await participationApi.withdrawSignature(id);
      fetchPetitionData();
    } catch (err) {
      setWithdrawError(err.message || 'Failed to withdraw signature.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        <div className="h-6 bg-stone-200 rounded w-24 animate-pulse"></div>
        <div className="h-32 bg-white rounded-xl border border-stone-200 p-6 animate-pulse space-y-4">
          <div className="h-4 bg-stone-200 rounded w-1/4"></div>
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 max-w-3xl mx-auto text-center space-y-4">
        <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm space-y-3">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-stone-900">Petition Unavailable</h2>
          <p className="text-sm text-stone-600">{error || 'This petition could not be found.'}</p>
          <Link
            to="/petitions"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Petitions</span>
          </Link>
        </div>
      </div>
    );
  }

  const quorumTarget = petition.quorum_requirement || 50;
  const verifiedSigs = petition.verified_signatures || 0;
  const totalSigs = petition.total_signatures || 0;
  const pct = Math.min(Math.round((verifiedSigs / quorumTarget) * 100), 100);
  const isQuorumReached = petition.status === 'QUORUM_REACHED' || verifiedSigs >= quorumTarget;
  const isVerifiedUser = user?.identity_status === 'VERIFIED';

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/petitions"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Petitions</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Ref: PET-{petition.id}</span>
          </div>
        </div>

        {withdrawError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{withdrawError}</span>
          </div>
        )}

        {/* Main Header Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full font-medium bg-stone-100 text-stone-700 border border-stone-200">
                {petition.category}
              </span>
              {petition.county ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <MapPin className="w-3.5 h-3.5" />
                  {petition.county} {petition.sub_county ? `• ${petition.sub_county}` : ''}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  National Jurisdiction
                </span>
              )}
            </div>

            {isQuorumReached ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                Quorum Reached ({verifiedSigs} Verified)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-4 h-4" />
                Active ({verifiedSigs}/{quorumTarget} Verified Signatures)
              </span>
            )}
          </div>

          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
              {petition.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
              {petition.summary}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Target Authority</span>
                <span className="font-medium text-stone-800">{petition.target_authority}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Petition Timeline</span>
                <span className="font-medium text-stone-800">
                  Opened {new Date(petition.opening_date).toLocaleDateString()} — Closes {new Date(petition.closing_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Initiated By</span>
                <span className="font-medium text-stone-800">{petition.creator_name || 'Verified Citizen'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quorum Action Box */}
        <div className="bg-stone-900 text-white rounded-xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Signature Quorum — Kenya Constitution Art. 37</span>
              </div>
              <h3 className="text-lg font-bold">
                {isQuorumReached
                  ? 'Official Petition Quorum Achieved'
                  : `${quorumTarget - verifiedSigs} More Verified Signatures Required`}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                Signatures from citizens with verified national identities count toward the constitutional quorum. All signatures demonstrate community consensus.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {petition.hasUserSigned ? (
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Signed on {new Date(petition.userSignature?.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={withdrawLoading}
                    className="px-3 py-2 rounded-lg border border-stone-600 hover:bg-stone-800 text-stone-300 text-xs font-medium transition-colors"
                  >
                    {withdrawLoading ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                </div>
              ) : isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setSignModalOpen(true)}
                  className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-md flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Sign This Petition</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-md"
                >
                  Sign In to Sign Petition
                </Link>
              )}
            </div>
          </div>

          {/* Quorum Progress Bar */}
          <div className="space-y-2 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-300">
                Verified Citizen Quorum Progress: <strong className="text-white">{verifiedSigs}</strong> of {quorumTarget}
              </span>
              <span className="font-bold text-emerald-400">{pct}% Complete</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden border border-stone-700">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${pct}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>{totalSigs} total signers across Kenya</span>
              <span>{isVerifiedUser ? '✓ Your account identity is verified' : 'ℹ Verify your identity to contribute to official quorum'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-stone-200 flex items-center gap-4 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'details'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Petition Dossier & Demands
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signatures')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'signatures'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Signatures List</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-stone-200 text-stone-700">
              {signatures.length}
            </span>
          </button>
          {audits.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('audits')}
              className={`pb-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'audits'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>Audit History</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-stone-200 text-stone-700">
                {audits.length}
              </span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Purpose & Constitutional Basis */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                1. Purpose & Constitutional Objective
              </h3>
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-normal whitespace-pre-line">
                {petition.purpose}
              </p>
            </div>

            {/* Requested Action */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                2. Requested Administrative Action
              </h3>
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-stone-800 text-sm leading-relaxed whitespace-pre-line">
                {petition.requested_action}
              </div>
            </div>

            {/* Comprehensive Description */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                3. Full Background & Context
              </h3>
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-line">
                {petition.description}
              </p>

              {petition.supporting_information && (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Supporting Data & Evidence References
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 whitespace-pre-line">
                    {petition.supporting_information}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Signatures Tab */}
        {activeTab === 'signatures' && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Registered Citizen Signatures</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Signatures are privacy-protected. All emails and personal identifiers are strictly redacted.
                </p>
              </div>
              <div className="text-xs text-stone-600 font-medium">
                {signatures.length} citizen signatures recorded
              </div>
            </div>

            {signatures.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">
                No signatures recorded yet. Be the first citizen to sign!
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {signatures.map((sig) => (
                  <div key={sig.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">{sig.display_name}</span>
                        {Boolean(sig.is_verified_signer) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Quorum Signer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                            Citizen Signer
                          </span>
                        )}
                        {sig.county && (
                          <span className="text-stone-500 text-xs">({sig.county})</span>
                        )}
                      </div>
                      {sig.comment && (
                        <p className="text-xs text-stone-600 italic">"{sig.comment}"</p>
                      )}
                    </div>

                    <div className="text-stone-400 text-xs sm:text-right flex-shrink-0">
                      {new Date(sig.signed_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audits Tab */}
        {activeTab === 'audits' && audits.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900">Participation Audit Trail</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Immutable, append-only audit trail tracking every lifecycle transition for this petition.
              </p>
            </div>

            <div className="divide-y divide-stone-100 text-xs sm:text-sm">
              {audits.map((audit) => (
                <div key={audit.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-900">{audit.action}</div>
                    <div className="text-xs text-stone-500">
                      By {audit.actor_name || 'Staff Member'} ({audit.actor_role}) • {audit.reason || 'Routine action'}
                    </div>
                  </div>
                  <div className="text-stone-400 text-xs">
                    {new Date(audit.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sign Petition Modal */}
      {signModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Sign Citizen Petition</h3>
                <p className="text-xs text-stone-500 mt-0.5">PET-{petition.id}: {petition.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSignModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 rounded-lg p-1.5 focus:outline-none"
              >
                &times;
              </button>
            </div>

            {signError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {signError}
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1.5 text-xs text-stone-700">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                {isVerifiedUser ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Your Signature Will Count Toward Official Quorum</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Community Signature Recorded</span>
                  </>
                )}
              </div>
              <p>
                Signing as <strong>{user?.fullName}</strong> ({user?.county || 'Kenya'}). Your email and national ID are completely confidential and never published.
              </p>
            </div>

            <form onSubmit={handleSign} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Optional Endorsement Comment
                </label>
                <textarea
                  rows={3}
                  value={signComment}
                  onChange={(e) => setSignComment(e.target.value)}
                  placeholder="Share why you support this petition (optional, visible to public)..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSignModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signLoading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {signLoading ? 'Signing...' : 'Confirm Signature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
