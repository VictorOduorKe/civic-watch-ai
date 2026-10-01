import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
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
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-stone-300 rounded-lg p-6 sm:p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Sign In to CivicWatch
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Enter your credentials to access your citizen account
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
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-neutral-900"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent text-neutral-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 p-1 focus:outline-none focus:ring-2 focus:ring-emerald-800 rounded"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold text-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-stone-200 text-center text-xs text-stone-600">
            Don't have a citizen account?{' '}
            <Link
              to="/register"
              className="font-bold text-emerald-900 hover:text-emerald-950 hover:underline"
            >
              Create one now
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
