import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, LogOut, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AuthSuccessPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-900 text-white flex items-center justify-center font-bold">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="block text-sm font-black tracking-tight text-neutral-900 leading-none">
                CIVICWATCH
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-900">
                AI Kenya • Milestone 2
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-neutral-900 border border-stone-300 rounded hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <div className="bg-white border border-stone-300 rounded-lg p-6 sm:p-8 shadow-sm">
          {/* Milestone 2 Contract Notice */}
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-md mb-8">
            <CheckCircle2 className="w-6 h-6 text-emerald-800 shrink-0" />
            <div>
              <h1 className="text-base font-bold text-emerald-950">
                Authentication Successful
              </h1>
              <p className="text-xs sm:text-sm text-emerald-900">
                Your authenticated session is active. The Citizen Dashboard will be implemented in Milestone 3.
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-neutral-900 mb-4 pb-2 border-b border-stone-200">
            Authenticated Profile Identity
          </h2>

          {/* User Profile Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Full Name
              </span>
              <span className="font-bold text-neutral-900">{user?.fullName}</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Email Address
              </span>
              <span className="font-bold text-neutral-900">{user?.email}</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Phone Number
              </span>
              <span className="font-bold text-neutral-900">{user?.phone}</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Assigned Role
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-900">
                {user?.role}
              </span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                County
              </span>
              <span className="font-bold text-neutral-900">{user?.county}</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Ward
              </span>
              <span className="font-bold text-neutral-900">{user?.ward || 'Not specified'}</span>
            </div>
          </div>

          {/* Milestone 3 Hand-off Explanation */}
          <div className="p-4 bg-stone-100 border border-stone-300 rounded text-xs text-stone-700 leading-relaxed mb-6">
            <strong className="text-neutral-900 font-semibold">Milestone 2 Scope Boundary: </strong>
            This page serves as the verified destination for the protected-route mechanism and user identity retrieval. In Milestone 3, this route will be transitioned to the full Citizen Dashboard with incident overview, participation widgets, and civic stats.
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Landing Page
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-800 font-semibold text-sm rounded transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-stone-200 bg-white text-center text-xs text-stone-500">
        CivicWatch AI Kenya • Milestone 2 Authentication & Identity
      </footer>
    </div>
  );
}
