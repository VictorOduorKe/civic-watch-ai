import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.jpg';

const ADMIN_ROLES = ['Admin', 'Moderator', 'Analyst'];

function getDefaultRedirect(role) {
  return ADMIN_ROLES.includes(role) ? '/admin' : '/dashboard';
}

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If the user was redirected here from a specific page (e.g. /admin), honour that;
  // otherwise route by role: admins go to /admin, citizens go to /dashboard.
  const intendedPath = location.state?.from?.pathname;

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const dest = intendedPath || getDefaultRedirect(user.role);
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, authLoading, user, navigate, intendedPath]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });
      // Route by role: admin roles → /admin, citizens → /dashboard
      const dest = intendedPath || getDefaultRedirect(result?.user?.role);
      navigate(dest, { replace: true });
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
            className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-navy-800 rounded p-1"
          >
            <img
              src={logo}
              alt="Open Civic Lab Logo"
              className="w-8 h-8 rounded-full object-cover border border-gold-400 shadow-sm"
            />
            <div>
              <span className="block text-sm font-black tracking-tight text-navy-950 leading-none">
                CIVIC<span className="text-gold-500">WATCH</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-navy-700">
                AI Kenya • Open Civic Lab
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-navy-900 transition-colors"
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
            <div className="inline-flex items-center justify-center p-2 rounded-full bg-navy-50 border border-gold-200 mb-3">
              <img src={logo} alt="OCL Emblem" className="w-10 h-10 rounded-full object-cover" />
            </div>
            <h1 className="text-2xl font-black text-navy-950 tracking-tight">
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
                className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1"
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
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-gold-500 text-neutral-900"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-navy-900"
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
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-gold-500 text-neutral-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-navy-900 p-1 focus:outline-none focus:ring-2 focus:ring-navy-800 rounded"
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
                className="w-full py-3 bg-navy-900 hover:bg-navy-950 text-white font-semibold text-sm rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-800 border-b-2 border-gold-500 disabled:opacity-50 transition-colors"
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
              className="font-bold text-navy-900 hover:text-gold-600 hover:underline"
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
