import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Mail,
  ShieldAlert,
  MapPin,
  Zap,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscriptionApi } from '../services/api';
import CitizenLayout from '../layouts/CitizenLayout';
import AdminLayout from '../layouts/AdminLayout';

const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu',
  'Uasin Gishu', 'Kilifi', 'Machakos', 'Kajiado', 'Meru',
  'Nyeri', 'Kakamega', 'Bungoma', 'Kisii', 'Kericho',
  'Garissa', 'Turkana', 'Mandera', 'Wajir', 'Lamu'
];

const ALERT_CATEGORIES = [
  { id: 'PUBLIC_SAFETY', label: 'Public Safety', desc: 'Emergency warnings, civil defense, security notices' },
  { id: 'UTILITY_DOWNTIME', label: 'Utility Downtime', desc: 'Power outages, water interruptions, road maintenance' },
  { id: 'OFFICIAL_COUNTY_ALERT', label: 'Official County Alerts', desc: 'County executive notices and county advisories' },
  { id: 'GOVERNMENT_ADVISORY', label: 'Government Advisories', desc: 'National ministry advisories and gazetted notices' },
  { id: 'WEATHER_ENVIRONMENTAL', label: 'Weather & Environmental', desc: 'Flooding, extreme weather, air quality notices' },
  { id: 'COMMUNITY_ADVISORY', label: 'Community Advisories', desc: 'Verified citizen reports and grassroots notices' }
];

const UTILITY_SERVICES = [
  { id: 'ELECTRICITY', label: 'Electricity (Power Grid)' },
  { id: 'WATER', label: 'Water & Sewage Supply' },
  { id: 'ROAD_INFRASTRUCTURE', label: 'Roads & Bridges' },
  { id: 'WASTE_SANITATION', label: 'Waste Collection & Sanitation' },
  { id: 'INTERNET_TELECOM', label: 'Telecommunications & Fiber' }
];

const SEVERITY_LEVELS = [
  { id: 'INFO', label: 'All Alerts (Info+)', color: 'border-blue-300 text-blue-800' },
  { id: 'LOW', label: 'Low & Above', color: 'border-stone-300 text-stone-700' },
  { id: 'MODERATE', label: 'Moderate & Above', color: 'border-gold-300 text-gold-800' },
  { id: 'HIGH', label: 'High & Critical Only', color: 'border-amber-400 text-amber-800' },
  { id: 'CRITICAL', label: 'Critical Emergencies Only', color: 'border-red-400 text-red-800' }
];

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const isAdmin = ['Admin', 'Moderator', 'Analyst'].includes(user?.role);
  const Layout = isAdmin ? AdminLayout : CitizenLayout;

  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Preferences State
  const [preferences, setPreferences] = useState({
    inAppEnabled: true,
    emailEnabled: false,
    minSeverity: 'LOW'
  });

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState([]);

  // New Subscription Form State
  const [newCounty, setNewCounty] = useState('');
  const [newSubCounty, setNewSubCounty] = useState('');
  const [creatingSub, setCreatingSub] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [prefRes, subRes] = await Promise.all([
        subscriptionApi.getPreferences(),
        subscriptionApi.getSubscriptions()
      ]);

      if (prefRes?.success && prefRes.data) {
        setPreferences({
          inAppEnabled: Boolean(prefRes.data.inAppEnabled),
          emailEnabled: Boolean(prefRes.data.emailEnabled),
          minSeverity: prefRes.data.minSeverity || 'LOW'
        });
      }

      if (subRes?.success && Array.isArray(subRes.data)) {
        setSubscriptions(subRes.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load notification settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update Global Preferences
  const handleSavePreferences = async (updatedPrefs) => {
    const payload = updatedPrefs || preferences;
    setSavingPrefs(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const res = await subscriptionApi.updatePreferences({
        in_app_enabled: payload.inAppEnabled,
        email_enabled: payload.emailEnabled,
        min_severity: payload.minSeverity
      });

      if (res?.success) {
        setPreferences({
          inAppEnabled: res.data.inAppEnabled,
          emailEnabled: res.data.emailEnabled,
          minSeverity: res.data.minSeverity
        });
        setSuccessMessage('Notification preferences saved successfully.');
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  // Toggle Category Subscription
  const handleToggleCategory = async (catId) => {
    const existing = subscriptions.find((s) => s.alertType === catId && !s.county && !s.utilityService);

    if (existing) {
      // Delete existing
      try {
        await subscriptionApi.deleteSubscription(existing.id);
        setSubscriptions((prev) => prev.filter((s) => s.id !== existing.id));
      } catch (err) {
        setErrorMessage(err.message || 'Failed to remove category subscription.');
      }
    } else {
      // Create new
      try {
        const res = await subscriptionApi.createSubscription({
          alert_type: catId,
          channel: 'IN_APP',
          is_active: true
        });
        if (res?.success && res.data) {
          setSubscriptions((prev) => [res.data, ...prev]);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to add category subscription.');
      }
    }
  };

  // Toggle Utility Subscription
  const handleToggleUtility = async (utilId) => {
    const existing = subscriptions.find((s) => s.utilityService === utilId);

    if (existing) {
      try {
        await subscriptionApi.deleteSubscription(existing.id);
        setSubscriptions((prev) => prev.filter((s) => s.id !== existing.id));
      } catch (err) {
        setErrorMessage(err.message || 'Failed to remove utility subscription.');
      }
    } else {
      try {
        const res = await subscriptionApi.createSubscription({
          alert_type: 'UTILITY_DOWNTIME',
          utility_service: utilId,
          channel: 'IN_APP',
          is_active: true
        });
        if (res?.success && res.data) {
          setSubscriptions((prev) => [res.data, ...prev]);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to add utility subscription.');
      }
    }
  };

  // Add Geographic Subscription
  const handleAddGeographicSub = async (e) => {
    e.preventDefault();
    if (!newCounty) return;

    setCreatingSub(true);
    setErrorMessage(null);
    try {
      const res = await subscriptionApi.createSubscription({
        county: newCounty,
        sub_county: newSubCounty.trim() || null,
        channel: 'IN_APP',
        is_active: true
      });

      if (res?.success && res.data) {
        setSubscriptions((prev) => [res.data, ...prev]);
        setNewCounty('');
        setNewSubCounty('');
        setSuccessMessage(`Subscribed to alerts in ${newCounty}.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add area subscription.');
    } finally {
      setCreatingSub(false);
    }
  };

  // Remove Subscription
  const handleRemoveSub = async (id) => {
    try {
      await subscriptionApi.deleteSubscription(id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete subscription.');
    }
  };

  const geoSubscriptions = subscriptions.filter((s) => s.county);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/notifications"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B4F72] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notifications Inbox
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-600 rounded-md">
            M13 Citizen Preferences
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0D2137] font-serif">
            Notification Settings & Subscriptions
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Control which civic alerts you receive, select specific geographic areas, and set minimum severity thresholds.
          </p>
        </div>

        {/* Feedback alerts */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-stone-200">
            <RefreshCw className="w-8 h-8 text-[#1B4F72] animate-spin mx-auto mb-3" />
            <p className="text-sm text-stone-600">Loading your notification preferences...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Delivery Channels */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
              <h2 className="text-base font-semibold text-[#0D2137] flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-[#1B4F72]" />
                Delivery Channels
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* In-App Channel */}
                <div
                  className={`p-4 rounded-xl border transition-colors ${
                    preferences.inAppEnabled
                      ? 'border-[#1B4F72] bg-[#1B4F72]/5'
                      : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-[#0D2137] flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#1B4F72]" />
                      In-App Notifications
                    </span>
                    <button
                      type="button"
                      disabled={savingPrefs}
                      onClick={() => {
                        const updated = { ...preferences, inAppEnabled: !preferences.inAppEnabled };
                        setPreferences(updated);
                        handleSavePreferences(updated);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        preferences.inAppEnabled ? 'bg-[#1B4F72]' : 'bg-stone-300'
                      }`}
                      role="switch"
                      aria-checked={preferences.inAppEnabled}
                      aria-label="Toggle in-app notifications"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          preferences.inAppEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-stone-600">
                    Receive alert notices and case updates in your top notification drawer and feed.
                  </p>
                </div>

                {/* Email Channel */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-stone-600 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-stone-500" />
                      Email Dispatch
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-stone-200 text-stone-700 rounded-sm">
                      Not Configured
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    External SMTP email delivery is disabled in current environment. In-app delivery remains fully active.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Minimum Severity Preference */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
              <h2 className="text-base font-semibold text-[#0D2137] flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-[#D99A00]" />
                Minimum Severity Threshold
              </h2>
              <p className="text-xs text-stone-600 mb-4">
                Choose the minimum alert urgency that triggers notifications for you. Lower severity levels will be filtered out.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {SEVERITY_LEVELS.map((lvl) => {
                  const isSelected = preferences.minSeverity === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      disabled={savingPrefs}
                      onClick={() => {
                        const updated = { ...preferences, minSeverity: lvl.id };
                        setPreferences(updated);
                        handleSavePreferences(updated);
                      }}
                      className={`p-3 text-left rounded-lg border transition-all text-xs font-medium flex items-center justify-between ${
                        isSelected
                          ? 'border-[#1B4F72] bg-[#1B4F72] text-white shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{lvl.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Category Subscriptions */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
              <h2 className="text-base font-semibold text-[#0D2137] flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-[#1B4F72]" />
                Alert Category Subscriptions
              </h2>
              <p className="text-xs text-stone-600 mb-4">
                Toggle categories you wish to subscribe to. When active, new alerts in these categories will notify you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ALERT_CATEGORIES.map((cat) => {
                  const isSubscribed = subscriptions.some(
                    (s) => s.alertType === cat.id && !s.county && !s.utilityService && s.isActive
                  );
                  return (
                    <div
                      key={cat.id}
                      className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                        isSubscribed
                          ? 'border-[#1B4F72]/40 bg-[#1B4F72]/5'
                          : 'border-stone-200 bg-white'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#0D2137]">{cat.label}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{cat.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0 ${
                          isSubscribed
                            ? 'bg-[#1B4F72] text-white hover:bg-[#1B4F72]/90'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Utility Outages Specific Subscriptions */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
              <h2 className="text-base font-semibold text-[#0D2137] flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-[#D99A00]" />
                Utility Downtime Subscriptions
              </h2>
              <p className="text-xs text-stone-600 mb-4">
                Target specific infrastructure services for power outages, water cuts, or road closures.
              </p>

              <div className="flex flex-wrap gap-2">
                {UTILITY_SERVICES.map((u) => {
                  const isSubscribed = subscriptions.some((s) => s.utilityService === u.id && s.isActive);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleToggleUtility(u.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                        isSubscribed
                          ? 'bg-[#1B4F72] text-white border-[#1B4F72]'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {isSubscribed ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      {u.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Geographic Area Subscriptions */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
              <h2 className="text-base font-semibold text-[#0D2137] flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-[#27AE60]" />
                Geographic Area Subscriptions
              </h2>
              <p className="text-xs text-stone-600 mb-4">
                Subscribe to local alerts for your residential or work counties and sub-counties.
              </p>

              {/* Add County Form */}
              <form onSubmit={handleAddGeographicSub} className="flex flex-col sm:flex-row gap-3 mb-5">
                <select
                  value={newCounty}
                  onChange={(e) => setNewCounty(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4F72]"
                  required
                >
                  <option value="">Select County...</option>
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c} County</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Optional Sub-county / Area..."
                  value={newSubCounty}
                  onChange={(e) => setNewSubCounty(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4F72] flex-1"
                />

                <button
                  type="submit"
                  disabled={creatingSub || !newCounty}
                  className="px-4 py-2 bg-[#1B4F72] text-white rounded-lg text-sm font-semibold hover:bg-[#1B4F72]/90 disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Area
                </button>
              </form>

              {/* Existing Area Subscriptions */}
              {geoSubscriptions.length === 0 ? (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-500 text-center">
                  You have not added any specific county subscriptions yet. You still receive national alerts and alerts for your registered profile location.
                </div>
              ) : (
                <div className="space-y-2">
                  {geoSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#27AE60] shrink-0" />
                        <span className="font-semibold text-[#0D2137]">{sub.county} County</span>
                        {sub.subCounty && (
                          <span className="text-stone-500">({sub.subCounty})</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSub(sub.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-sm hover:bg-red-50 flex items-center gap-1"
                        aria-label={`Unsubscribe from ${sub.county}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
