import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute — Strict frontend gate for the OCL Administration area.
 * Allowed roles: Admin, Moderator, Analyst.
 * Citizens attempting to access /admin receive a clear 403 Forbidden page.
 */
export default function AdminRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-stone-700">
            Verifying administrative clearance...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but role is not authorized (e.g. Citizen)
  const allowedAdminRoles = ['Admin', 'Moderator', 'Analyst'];
  if (!allowedAdminRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-xl p-6 sm:p-8 text-center shadow-xs">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full inline-block mb-2">
            403 Forbidden
          </span>

          <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight">
            Access Restricted
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 mt-2 mb-6 leading-relaxed">
            The <strong>OCL Administration Dashboard</strong> is strictly reserved for authorized oversight officers. Your current account has the role of <strong>{user?.role || 'Citizen'}</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-950 transition-colors border-b-2 border-gold-500 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-gold-400" />
              <span>Citizen Workspace</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 text-navy-950 text-xs font-semibold rounded-lg hover:bg-stone-200 transition-colors border border-stone-300"
            >
              <Home className="w-4 h-4 text-stone-500" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
