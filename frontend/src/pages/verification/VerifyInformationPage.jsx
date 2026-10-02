import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  History,
  AlertCircle,
  Loader2,
  Upload,
  X
} from 'lucide-react';
import CitizenLayout from '../../layouts/CitizenLayout';
import VerificationDisclaimer from '../../components/verification/VerificationDisclaimer';
import verificationService from '../../services/verificationService';

export default function VerifyInformationPage() {
  const navigate = useNavigate();

  const [inputType, setInputType] = useState('TEXT');
  const [claimText, setClaimText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('The selected screenshot exceeds the maximum allowed size of 5 MB.');
      return;
    }

    // Check type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    setErrorMessage('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    const trimmedClaim = claimText.trim();
    const trimmedUrl = sourceUrl.trim();

    if (inputType === 'TEXT' && trimmedClaim.length < 3) {
      setErrorMessage('Please enter the statement or claim you want to verify (minimum 3 characters).');
      return;
    }

    if (inputType === 'URL' && !trimmedUrl) {
      setErrorMessage('Please provide a valid source URL to evaluate.');
      return;
    }

    if ((inputType === 'IMAGE' || inputType === 'TEXT_AND_IMAGE') && !imageFile) {
      setErrorMessage('Please attach a screenshot or image file to verify.');
      return;
    }

    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      setErrorMessage('Source URL must begin with http:// or https://');
      return;
    }

    try {
      setLoading(true);

      let payload;
      if (imageFile) {
        payload = new FormData();
        payload.append('input_type', inputType);
        if (trimmedClaim) payload.append('claim_text', trimmedClaim);
        if (trimmedUrl) payload.append('source_url', trimmedUrl);
        if (sourceTitle.trim()) payload.append('source_title', sourceTitle.trim());
        payload.append('image', imageFile);
      } else {
        payload = {
          input_type: inputType,
          claim_text: trimmedClaim || undefined,
          source_url: trimmedUrl || undefined,
          source_title: sourceTitle.trim() || undefined
        };
      }

      const response = await verificationService.createVerification(payload);

      if (response.success && response.verification?.id) {
        navigate(`/verify/${response.verification.id}`);
      } else {
        setErrorMessage('Verification could not be processed. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An unexpected error occurred during AI analysis.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CitizenLayout>
      {() => (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
          {/* Header Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-navy-900 text-gold-400 border border-gold-500/30 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight">
                  Verify Information
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5 leading-relaxed">
                  Submit a claim, source link, or screenshot and CivicWatch will provide an AI-assisted evidence assessment.
                </p>
              </div>
            </div>

            <Link
              to="/verify/history"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-navy-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors shrink-0"
            >
              <History className="w-4 h-4 text-stone-600" />
              <span>Verification History</span>
            </Link>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input Type Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                What are you submitting?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'TEXT', label: 'Text Claim', icon: FileText },
                  { id: 'URL', label: 'Web Link', icon: LinkIcon },
                  { id: 'IMAGE', label: 'Screenshot', icon: ImageIcon },
                  { id: 'TEXT_AND_URL', label: 'Claim & Link', icon: LinkIcon },
                  { id: 'TEXT_AND_IMAGE', label: 'Claim & Image', icon: ImageIcon }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = inputType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setInputType(type.id);
                        setErrorMessage('');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all text-xs font-semibold ${
                        isSelected
                          ? 'border-navy-900 bg-navy-950 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-gold-400' : 'text-stone-500'}`} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Claim / Statement Textarea */}
            {(inputType === 'TEXT' || inputType === 'TEXT_AND_URL' || inputType === 'TEXT_AND_IMAGE') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="claim-text" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Claim or Statement <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {claimText.length}/10,000 chars
                  </span>
                </div>
                <textarea
                  id="claim-text"
                  rows={4}
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  maxLength={10000}
                  placeholder="Paste the statement, rumor, announcement, or news excerpt you want analyzed..."
                  className="w-full text-xs sm:text-sm p-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-stone-900 placeholder:text-stone-400 resize-y"
                  disabled={loading}
                />
              </div>
            )}

            {/* Source URL & Title */}
            {(inputType === 'URL' || inputType === 'TEXT_AND_URL') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="source-url" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Source Link / URL <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="url"
                    id="source-url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://example.com/article..."
                    className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-stone-900 placeholder:text-stone-400"
                    disabled={loading}
                  />
                  <p className="text-[11px] text-stone-500">
                    Supplied URL will be evaluated for known public domain context (no live web scraping).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="source-title" className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Headline / Source Title (Optional)
                  </label>
                  <input
                    type="text"
                    id="source-title"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    placeholder="e.g. Daily Nation report, County Press Release"
                    className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-stone-900 placeholder:text-stone-400"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Image / Screenshot Upload */}
            {(inputType === 'IMAGE' || inputType === 'TEXT_AND_IMAGE') && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Attach Screenshot / Image <span className="text-rose-600">*</span>
                </label>

                {!imageFile ? (
                  <label
                    htmlFor="screenshot-upload"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 rounded-xl hover:border-navy-900 hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-8 h-8 text-stone-400 mb-2" />
                    <span className="text-xs font-bold text-navy-950">
                      Click to upload or drag screenshot
                    </span>
                    <span className="text-[11px] text-stone-500 mt-0.5">
                      JPG, PNG, or WEBP up to 5 MB
                    </span>
                    <input
                      id="screenshot-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                ) : (
                  <div className="relative border border-stone-300 rounded-xl p-3 bg-stone-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Screenshot preview"
                          className="w-16 h-16 object-cover rounded-lg border border-stone-200"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-neutral-900 truncate max-w-xs">
                          {imageFile.name}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={loading}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-stone-200 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Action & Loading State */}
            <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-stone-500">
                Analysis is powered by Google Gemini and verified against neutral civic frameworks.
              </span>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-navy-900 text-white text-xs font-bold rounded-lg hover:bg-navy-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs border-b-2 border-gold-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                    <span>Analyzing the information...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-gold-400" />
                    <span>Analyze Information</span>
                  </>
                )}
              </button>
            </div>

            {loading && (
              <p className="text-center text-xs text-stone-500 italic animate-pulse">
                Evaluating claims, cross-checking available evidence, and structuring assessment. This may take a few moments.
              </p>
            )}
          </form>

          {/* AI Disclaimer */}
          <VerificationDisclaimer />
        </div>
      )}
    </CitizenLayout>
  );
}
