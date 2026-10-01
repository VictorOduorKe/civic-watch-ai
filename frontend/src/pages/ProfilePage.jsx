import React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CitizenLayout from '../layouts/CitizenLayout';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <CitizenLayout>
        {() => (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-stone-600">
              Loading your profile...
            </p>
          </div>
        )}
      </CitizenLayout>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not available';
    try {
      return new Date(dateStr).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'CW';

  return (
    <CitizenLayout>
      {() => (
        <div className="space-y-6 animate-fadeIn">
          {/* Page Header */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-navy-900 text-gold-400 border-2 border-gold-500/40 font-extrabold text-xl flex items-center justify-center shadow-xs shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-navy-950">
                      {user?.fullName || 'Citizen User'}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-gold-50 text-navy-950 border border-gold-300">
                      <Shield className="w-3 h-3 text-gold-600" />
                      <span>{user?.role || 'Citizen'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Citizen Account #{user?.id || 1} • Registered via CivicWatch AI Kenya
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 self-start sm:self-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>Account Status: Active</span>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Contact Information */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100 mb-4">
                <User className="w-4 h-4 text-navy-900" />
                <h3 className="text-sm font-bold text-navy-950">
                  Contact Information
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Full Legal Name
                  </label>
                  <div className="mt-1 text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-stone-400" />
                    <span>{user?.fullName || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="mt-1 text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-stone-400" />
                    <span>{user?.email || 'Not provided'}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Used for login credentials and critical platform communications.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <div className="mt-1 text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-stone-400" />
                    <span>{user?.phone || 'Not provided'}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Contact number for SMS notices and incident corroboration.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Geographical Jurisdiction */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100 mb-4">
                <MapPin className="w-4 h-4 text-navy-900" />
                <h3 className="text-sm font-bold text-navy-950">
                  Geographical Jurisdiction
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Primary County
                  </label>
                  <div className="mt-1 text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-600" />
                    <span>{user?.county || 'Kenya (National)'} County</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Determines local government routing and county baraza alerts.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Ward / Sub-County
                  </label>
                  <div className="mt-1 text-sm font-medium text-neutral-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-stone-400" />
                    <span>{user?.ward || 'General Constituency'}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Local grassroots administrative boundary.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Constitutional Jurisdiction
                  </label>
                  <div className="mt-1 text-xs text-stone-600 bg-stone-50 p-2.5 rounded border border-stone-200">
                    Republic of Kenya • Devolution Chapter 11 (CoK 2010)
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Account Security & Timestamps */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100 mb-4">
                <Shield className="w-4 h-4 text-navy-900" />
                <h3 className="text-sm font-bold text-navy-950">
                  Security & Session State
                </h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 block">
                      Account Password
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Hashed with bcrypt (12 cost factor rounds)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-800">
                    <Lock className="w-3.5 h-3.5 text-green-700" />
                    <span>Protected</span>
                  </span>
                </div>

                <div className="flex items-start justify-between pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 block">
                      Current Authentication
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Signed JSON Web Token (24h validity)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                    <span>Active Session</span>
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-medium">Member Since:</span>
                    <span>{formatDate(user?.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-600">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-medium">Last Login:</span>
                    <span>{formatDate(user?.lastLoginAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Governance & Scope Notice */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-stone-100 mb-4">
                  <Info className="w-4 h-4 text-navy-900" />
                  <h3 className="text-sm font-bold text-navy-950">
                    Profile Policy & Privacy
                  </h3>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-2 mb-3">
                  <p className="text-xs text-stone-700 font-medium">
                    Read-Only Presentation (Milestone 3 Contract)
                  </p>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    In compliance with the project specifications, profile information is presented in a verified read-only view. Self-service profile editing and phone OTP verification will be integrated with backend validation in subsequent updates.
                  </p>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Your personal identity data is stored securely in the local MySQL database and is protected in accordance with the Kenya Data Protection Act, 2019.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                <span>Open Civic Lab • Verified Registry</span>
                <span className="font-bold text-navy-900">M3 Profile View</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </CitizenLayout>
  );
}
