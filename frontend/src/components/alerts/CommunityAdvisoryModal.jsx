import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { alertApi } from '../../services/api';
import { KENYAN_COUNTIES } from '../../constants/alertConstants';

export default function CommunityAdvisoryModal({ isOpen, onClose, onSuccess, userCounty }) {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    alert_type: 'COMMUNITY_ADVISORY',
    severity: 'LOW',
    county: userCounty || '',
    sub_county: '',
    ward: '',
    location_text: '',
    recommended_action: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await alertApi.submitCommunityAdvisory(formData);
      if (res.success) {
        setSuccessMsg(res.message || 'Advisory submitted for moderator review.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1800);
      } else {
        throw new Error(res.message || 'Submission failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your advisory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-2xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-navy-900" />
            <h2 id="modal-title" className="text-lg font-bold text-navy-900">
              Submit Community Advisory
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Community advisories must be factual and public-service oriented. All submissions undergo moderation before appearing publicly. <strong>Community advisories are never labeled as official government alerts.</strong>
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-6 mb-0 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Advisory Title *
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={5}
              maxLength={255}
              placeholder="e.g., Blocked Drainage Causing Flooding on Jogoo Road"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                name="alert_type"
                value={formData.alert_type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-sm bg-white"
              >
                <option value="COMMUNITY_ADVISORY">Community Advisory</option>
                <option value="PUBLIC_SAFETY">Public Safety / Hazard</option>
                <option value="WEATHER_ENVIRONMENTAL">Weather & Local Environment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Assessed Severity *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-sm bg-white"
              >
                <option value="LOW">Low (Awareness only)</option>
                <option value="INFO">Informational</option>
                <option value="MODERATE">Moderate (Disruption possible)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                County
              </label>
              <select
                name="county"
                value={formData.county}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-sm bg-white"
              >
                <option value="">Select County</option>
                {KENYAN_COUNTIES.filter(c => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Sub-County
              </label>
              <input
                type="text"
                name="sub_county"
                placeholder="e.g., Kamukunji"
                value={formData.sub_county}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
                Ward / Specific Locality
              </label>
              <input
                type="text"
                name="location_text"
                placeholder="e.g., Near Muthurwa Market"
                value={formData.location_text}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Brief Summary * (Max 500 characters)
            </label>
            <input
              type="text"
              name="summary"
              required
              minLength={10}
              maxLength={500}
              placeholder="A concise summary of the advisory for preview cards"
              value={formData.summary}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              minLength={10}
              maxLength={5000}
              placeholder="Describe the situation clearly, when it started, and who is affected."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Recommended Action for Residents
            </label>
            <input
              type="text"
              name="recommended_action"
              placeholder="e.g., Use Landhies Road as alternative route until water recedes"
              value={formData.recommended_action}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-50 text-sm font-semibold transition-all shadow-sm"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-gold-400" />
                  <span>Submit Advisory</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
