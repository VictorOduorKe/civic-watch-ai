import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
  'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export default function RegisterPage() {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    county: '',
    ward: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for that field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function validateLocal() {
    const errors = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 9) {
      errors.phone = 'Phone number must be at least 9 digits.';
    }
    if (!formData.county) {
      errors.county = 'Please select your county.';
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.termsAccepted) {
      errors.termsAccepted = 'You must acknowledge the platform terms and privacy notice.';
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    const clientErrors = validateLocal();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setErrorMessage('Please correct the highlighted fields before submitting.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        county: formData.county,
        ward: formData.ward.trim() || undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        termsAccepted: formData.termsAccepted
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const mapped = {};
        err.errors.forEach((e) => {
          mapped[e.field.replace('body.', '')] = e.message;
        });
        setFieldErrors(mapped);
      }
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="py-4 px-4 sm:px-8 border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 rounded p-1"
          >
            <div className="w-8 h-8 rounded bg-emerald-900 text-white flex items-center justify-center font-bold">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="block text-sm font-black tracking-tight text-neutral-900 leading-none">
                CIVICWATCH
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-900">
                AI Kenya • Open Civic Lab
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl bg-white border border-stone-300 rounded-lg p-6 sm:p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Create Citizen Account
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Join CivicWatch AI Kenya to participate in civic engagement and public transparency
            </p>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 mb-5 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2.5 text-xs text-rose-800"
            >
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
              >
                Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Victor Oduor"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-neutral-900 ${
                  fieldErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email and Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                >
                  Email Address <span className="text-rose-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="citizen@example.com"
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-neutral-900 ${
                    fieldErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                >
                  Phone Number <span className="text-rose-600">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0712345678"
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-neutral-900 ${
                    fieldErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            {/* County and Ward Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* County */}
              <div>
                <label
                  htmlFor="county"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                >
                  County <span className="text-rose-600">*</span>
                </label>
                <select
                  id="county"
                  name="county"
                  required
                  value={formData.county}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-neutral-900 ${
                    fieldErrors.county ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                  }`}
                >
                  <option value="">Select your County</option>
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {fieldErrors.county && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.county}</p>
                )}
              </div>

              {/* Ward (Optional) */}
              <div>
                <label
                  htmlFor="ward"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                >
                  Ward <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="ward"
                  name="ward"
                  type="text"
                  value={formData.ward}
                  onChange={handleChange}
                  placeholder="e.g. Kilimani"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-neutral-900"
                />
              </div>
            </div>

            {/* Password and Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                >
                  Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-neutral-900 pr-10 ${
                      fieldErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 p-1 focus:outline-none focus:ring-2 focus:ring-emerald-800 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                >
                  Confirm Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-neutral-900 pr-10 ${
                      fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 p-1 focus:outline-none focus:ring-2 focus:ring-emerald-800 rounded"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600 leading-normal">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-stone-300 text-emerald-900 focus:ring-emerald-800"
                />
                <span>
                  I acknowledge that CivicWatch AI Kenya is an independent civic platform, and I agree to the platform community guidelines and privacy notice. <span className="text-rose-600">*</span>
                </span>
              </label>
              {fieldErrors.termsAccepted && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.termsAccepted}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold text-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating Citizen Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-stone-200 text-center text-xs text-stone-600">
            Already have a citizen account?{' '}
            <Link
              to="/login"
              className="font-bold text-emerald-900 hover:text-emerald-950 hover:underline"
            >
              Log in here
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-4 border-t border-stone-200 bg-white text-center text-xs text-stone-500">
        CivicWatch AI Kenya • Open Civic Lab (OCL)
      </footer>
    </div>
  );
}
