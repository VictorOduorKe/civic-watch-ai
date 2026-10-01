import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-stone-600">Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full bg-white border border-stone-300 rounded-lg p-6 text-center">
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-stone-600 mb-4">
            Your account role ({user?.role}) does not have permission to view this section.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded hover:bg-navy-950 border-b-2 border-gold-500 shadow-xs"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
