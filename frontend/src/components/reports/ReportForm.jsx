import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Send,
  HelpCircle,
  EyeOff,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { reportApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReportCategorySelect from './ReportCategorySelect';
import ReportLocationFields from './ReportLocationFields';
import ReportAttachmentUpload from './ReportAttachmentUpload';

export default function ReportForm({ onSuccess }) {
  const { user } = useAuth();

  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  // Form inputs state
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    county: user?.county || '',
    sub_county: '',
    ward: user?.ward || '',
    location_text: '',
    latitude: null,
    longitude: null,
    incident_date: '',
    incident_time: '',
    is_anonymous: false,
    preferred_contact: 'none'
  });

  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Fetch active categories on mount
  useEffect(() => {
    async function fetchCats() {
      try {
        setLoadingCategories(true);
        const res = await reportApi.getCategories();
        if (res.success && Array.isArray(res.categories)) {
          setCategories(res.categories);
        } else {
          setCategoryError('Failed to load incident categories.');
        }
      } catch (err) {
        setCategoryError(err.message || 'Unable to connect to categories service.');
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCats();
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.category_id) {
      errs.category_id = 'Please select an incident category.';
    }
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters long.';
    }
    if (!formData.county.trim()) {
      errs.county = 'Please select a county.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to the first error
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      // Build multipart FormData
      const data = new FormData();
      data.append('category_id', formData.category_id);
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('county', formData.county.trim());

      if (formData.sub_county) data.append('sub_county', formData.sub_county.trim());
      if (formData.ward) data.append('ward', formData.ward.trim());
      if (formData.location_text) data.append('location_text', formData.location_text.trim());
      if (formData.latitude !== null && formData.latitude !== '') data.append('latitude', formData.latitude);
      if (formData.longitude !== null && formData.longitude !== '') data.append('longitude', formData.longitude);
      if (formData.incident_date) data.append('incident_date', formData.incident_date);
      if (formData.incident_time) data.append('incident_time', formData.incident_time);

      data.append('is_anonymous', String(formData.is_anonymous));
      data.append('preferred_contact', formData.preferred_contact);

      // Append files
      files.forEach((file) => {
        data.append('attachments', file);
      });

      const response = await reportApi.createReport(data);

      if (response.success && response.report) {
        onSuccess(response.report);
      } else {
        throw new Error(response.message || 'Submission failed.');
      }
    } catch (err) {
      console.error('[ReportForm] Submit error:', err);
      setServerError(err.message || 'An error occurred while submitting your report.');
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
      {/* 1. Emergency Warning Banner (Section 9) */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div className="text-xs text-red-900 leading-relaxed">
          <strong className="font-bold block text-sm mb-0.5">Emergency Warning:</strong>
          If you or someone in your community is facing immediate danger, physical harm, or requires urgent medical or police intervention, contact national emergency responders (<strong>999 / 112</strong>) or local authorities directly. CivicWatch is an accountability recording platform, not an emergency first-response dispatch service.
        </div>
      </div>

      {/* 2. Responsible Reporting Notice (Section 10) */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-navy-900 shrink-0 mt-0.5" />
        <p className="text-xs text-stone-600 leading-relaxed">
          <strong className="text-neutral-900 font-semibold">Responsible Reporting:</strong> Please provide information as accurately as possible. A submitted report represents a reported community concern and does not by itself establish guilt, criminal responsibility, or legal liability.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-bold block">Submission Error:</span>
            {serverError}
          </div>
        </div>
      )}

      {/* Section 1: Incident Category */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            1. Select Incident Category <span className="text-red-600">*</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Choose the category that best describes the civic issue or concern.
          </p>
        </div>

        {errors.category_id && (
          <p className="text-xs text-red-600 font-medium">{errors.category_id}</p>
        )}

        <ReportCategorySelect
          categories={categories}
          selectedCategoryId={formData.category_id}
          onSelectCategory={(id) => handleFieldChange('category_id', id)}
          loading={loadingCategories}
          error={categoryError}
        />
      </div>

      {/* Section 2: Incident Details */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            2. Incident Details <span className="text-red-600">*</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Describe the situation clearly and concisely for community review.
          </p>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="report-title"
            className="block text-xs font-bold text-neutral-900 mb-1"
          >
            Incident Title <span className="text-red-600">*</span>
          </label>
          <input
            id="report-title"
            type="text"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="e.g. Major sewer pipe leak causing flooding along Ring Road"
            className={`w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-gold-500 ${
              errors.title ? 'border-red-500' : 'border-stone-300'
            }`}
            required
            maxLength={255}
          />
          {errors.title && (
            <p className="mt-1 text-[11px] text-red-600">{errors.title}</p>
          )}
          <span className="text-[10px] text-stone-400 mt-1 block">
            Max 255 characters. Make it descriptive and specific.
          </span>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="report-description"
            className="block text-xs font-bold text-neutral-900 mb-1"
          >
            Detailed Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="report-description"
            rows={5}
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Describe what occurred, how long the issue has persisted, public impact, and any relevant details..."
            className={`w-full px-3 py-2 text-xs border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-gold-500 leading-relaxed ${
              errors.description ? 'border-red-500' : 'border-stone-300'
            }`}
            required
            maxLength={5000}
          />
          {errors.description && (
            <p className="mt-1 text-[11px] text-red-600">{errors.description}</p>
          )}
          <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1">
            <span>Minimum 10 characters. Avoid accusatory or defamatory language.</span>
            <span>{formData.description.length} / 5000</span>
          </div>
        </div>

        {/* Date and Time (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label
              htmlFor="report-incident-date"
              className="block text-xs font-semibold text-neutral-800 mb-1"
            >
              Date of Incident <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              id="report-incident-date"
              type="date"
              value={formData.incident_date}
              onChange={(e) => handleFieldChange('incident_date', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-gold-500"
            />
          </div>

          <div>
            <label
              htmlFor="report-incident-time"
              className="block text-xs font-semibold text-neutral-800 mb-1"
            >
              Approximate Time <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              id="report-incident-time"
              type="time"
              value={formData.incident_time}
              onChange={(e) => handleFieldChange('incident_time', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-gold-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Location */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            3. Location Details <span className="text-red-600">*</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Identify the administrative jurisdiction and landmark for field verification.
          </p>
        </div>

        <ReportLocationFields
          values={formData}
          onChange={handleFieldChange}
          errors={errors}
        />
      </div>

      {/* Section 4: Attachments */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            4. Supporting Files & Media
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Photographs or documents that corroborate the reported issue.
          </p>
        </div>

        <ReportAttachmentUpload
          files={files}
          onFilesChange={(newFiles) => setFiles(newFiles)}
        />
      </div>

      {/* Section 5: Privacy & Contact Preferences */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            5. Privacy & Contact Preferences
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Control how your identity and communication preferences are handled.
          </p>
        </div>

        {/* Anonymous Option */}
        <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_anonymous}
              onChange={(e) => handleFieldChange('is_anonymous', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-navy-900 focus:ring-navy-800"
            />
            <div>
              <span className="text-xs font-bold text-neutral-900 block">
                Submit this report anonymously
              </span>
              <p className="text-[11px] text-stone-600 leading-relaxed mt-0.5">
                Anonymous reporting hides your name and contact details from normal report-facing views. Your account is still recorded internally for platform security, spam prevention, and abuse control.
              </p>
            </div>
          </label>
        </div>

        {/* Preferred Contact */}
        <div>
          <label className="block text-xs font-bold text-neutral-900 mb-2">
            Preferred Follow-up Contact Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'none',
                label: 'No Contact',
                desc: 'Do not contact me regarding this report'
              },
              {
                id: 'email',
                label: 'Email',
                desc: user?.email ? `Via ${user.email}` : 'Via account email'
              },
              {
                id: 'phone',
                label: 'Phone Call / SMS',
                desc: user?.phone ? `Via ${user.phone}` : 'Via contact phone'
              }
            ].map((option) => (
              <label
                key={option.id}
                className={`p-3 rounded-lg border cursor-pointer text-left transition-all flex items-start gap-2.5 ${
                  formData.preferred_contact === option.id
                    ? 'bg-navy-50/80 border-navy-800 ring-1 ring-gold-400'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="preferred_contact"
                  value={option.id}
                  checked={formData.preferred_contact === option.id}
                  onChange={(e) => handleFieldChange('preferred_contact', e.target.value)}
                  className="mt-0.5 h-3.5 w-3.5 border-stone-300 text-navy-900 focus:ring-navy-800"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    {option.label}
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    {option.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-stone-500 text-center sm:text-left">
          By submitting, you affirm that this information is accurate to the best of your knowledge.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 text-white text-xs font-bold rounded-lg hover:bg-navy-950 border-b-2 border-gold-500 transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting Report...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-gold-400" />
              <span>Submit Report</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
