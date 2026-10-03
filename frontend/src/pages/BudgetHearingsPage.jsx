import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Users,
  Search,
  Plus,
  AlertCircle,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  Phone,
  Info,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { participationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const KENYA_COUNTIES = [
  'All Counties',
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export default function BudgetHearingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [hearings, setHearings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [search, setSearch] = useState('');

  // Liaison / Admin capabilities
  const isLiaison = Boolean(user?.is_county_liaison);
  const isAdmin = user?.role === 'Admin';
  const canSchedule = isAdmin || isLiaison;
  const liaisonCounty = user?.liaison_county;

  // Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    county: isLiaison ? liaisonCounty : 'Nairobi',
    sub_county: '',
    ward: '',
    description: '',
    fiscal_year: 'FY 2026/2027',
    hearing_date: '',
    start_time: '09:00',
    end_time: '13:00',
    venue: '',
    participation_instructions: '',
    contact_information: ''
  });

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedHearingForCancel, setSelectedHearingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedCounty !== 'All Counties') params.county = selectedCounty;
      if (search.trim()) params.search = search.trim();

      const [hearingsRes, statsRes] = await Promise.all([
        participationApi.listHearings(params),
        participationApi.getParticipationStats().catch(() => null)
      ]);

      setHearings(hearingsRes.data || []);
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load budget hearings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, [selectedCounty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHearings();
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setScheduleLoading(true);
      setScheduleError(null);
      setScheduleSuccess(null);

      const payload = {
        ...formData,
        county: isLiaison ? liaisonCounty : formData.county
      };

      await participationApi.createHearing(payload);
      setScheduleSuccess('Hearing scheduled and published successfully!');
      fetchHearings();
      setTimeout(() => {
        setScheduleModalOpen(false);
        setScheduleSuccess(null);
      }, 1500);
    } catch (err) {
      setScheduleError(err.message || 'Failed to schedule hearing.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHearingForCancel) return;
    try {
      setCancelLoading(true);
      setCancelError(null);

      await participationApi.cancelHearing(selectedHearingForCancel.id, { reason: cancelReason });
      setCancelModalOpen(false);
      setSelectedHearingForCancel(null);
      setCancelReason('');
      fetchHearings();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel hearing.');
    } finally {
      setCancelLoading(false);
    }
  };

  const canManageHearing = (hearing) => {
    if (isAdmin) return true;
    if (isLiaison && hearing.county.toLowerCase() === liaisonCounty?.toLowerCase()) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Building className="w-3.5 h-3.5" />
                <span>Public Finance Management Act & Article 201</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                County Budget Hearing Schedules
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-2xl">
                Official calendar of county stakeholder consultations and public budget forums. Attend local hearings to review county exchequer allocations and submit citizen memoranda.
              </p>
            </div>

            {canSchedule && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    county: isLiaison ? liaisonCounty : 'Nairobi'
                  });
                  setScheduleModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <Plus className="w-4 h-4" />
                <span>{isLiaison ? `Schedule ${liaisonCounty} Hearing` : 'Schedule Hearing'}</span>
              </button>
            )}
          </div>

          {/* Liaison Jurisdiction Notice */}
          {isLiaison && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>
                You are authenticated as the County Liaison for <strong>{liaisonCounty}</strong>. In accordance with platform governance, your administrative scheduling rights are strictly scoped to {liaisonCounty} County.
              </span>
            </div>
          )}

          {/* Stats Bar */}
          {stats?.hearings && (
            <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-medium text-stone-500">Upcoming Hearings</div>
                <div className="text-xl font-bold text-stone-900 mt-1">
                  {stats.hearings.upcoming}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-medium text-stone-500">Total Scheduled</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">
                  {stats.hearings.total}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-medium text-stone-500">Participating Counties</div>
                <div className="text-xl font-bold text-navy-800 mt-1">
                  {stats.hearings.countiesCovered}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-medium text-stone-500">Completed Sessions</div>
                <div className="text-xl font-bold text-stone-700 mt-1">
                  {stats.hearings.completed || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hearing title, venue, or ward..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-stone-500">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-medium">Filter by County:</span>
            </div>

            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {KENYA_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error / Loading */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Hearings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse space-y-4">
                <div className="h-4 bg-stone-200 rounded w-1/4"></div>
                <div className="h-6 bg-stone-200 rounded w-3/4"></div>
                <div className="h-10 bg-stone-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : hearings.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900">No budget hearings scheduled</h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              There are currently no public budget consultation sessions scheduled for the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {hearings.map((h) => {
              const isCancelled = h.status === 'CANCELLED';
              const isManager = canManageHearing(h);

              return (
                <div
                  key={h.id}
                  className={`bg-white rounded-xl border shadow-sm p-6 sm:p-7 space-y-5 transition-all ${
                    isCancelled ? 'border-red-200 bg-red-50/20' : 'border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <MapPin className="w-3 h-3" />
                          {h.county} {h.sub_county ? `• ${h.sub_county}` : ''}
                        </span>
                        {h.ward && (
                          <span className="px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600">
                            {h.ward} Ward
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-600">
                          {h.fiscal_year}
                        </span>

                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3 h-3" />
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Scheduled & Confirmed
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-stone-900 leading-snug">
                        {h.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                        {h.description}
                      </p>
                    </div>

                    {/* Manager Actions */}
                    {isManager && !isCancelled && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHearingForCancel(h);
                            setCancelModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-medium transition-colors"
                        >
                          Cancel Hearing
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cancellation Reason Banner */}
                  {isCancelled && h.cancellation_reason && (
                    <div className="p-3.5 rounded-lg bg-red-100/60 border border-red-200 text-xs text-red-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Hearing Cancellation Notice</span>
                      </div>
                      <p className="italic">"{h.cancellation_reason}"</p>
                    </div>
                  )}

                  {/* Hearing Logistics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-100 text-xs text-stone-700">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Date & Time</span>
                        <span className="font-semibold text-stone-900">
                          {new Date(h.hearing_date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <div className="text-stone-500 text-[11px] mt-0.5">
                          {h.start_time?.slice(0, 5)} - {h.end_time?.slice(0, 5)} EAT
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Venue</span>
                        <span className="font-semibold text-stone-900">{h.venue}</span>
                        {h.sub_county && <div className="text-stone-500 text-[11px] mt-0.5">{h.sub_county}</div>}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Enquiries & Contact</span>
                        <span className="font-medium text-stone-900">{h.contact_information || 'County Liaison Office'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  {h.participation_instructions && (
                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
                      <Info className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-stone-800">Public Guidelines: </strong>
                        <span>{h.participation_instructions}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Hearing Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Schedule Budget Hearing</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isLiaison ? `Authorized jurisdiction: ${liaisonCounty} County` : 'Platform Admin Scheduling'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 rounded-lg p-1.5 focus:outline-none"
              >
                &times;
              </button>
            </div>

            {scheduleError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {scheduleError}
              </div>
            )}
            {scheduleSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
                {scheduleSuccess}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Forum Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Kisumu County FY 2026/2027 Pre-Budget Stakeholder Forum"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">County *</label>
                  {isLiaison ? (
                    <input
                      type="text"
                      disabled
                      value={liaisonCounty}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-100 text-stone-600 font-bold"
                    />
                  ) : (
                    <select
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {KENYA_COUNTIES.filter((c) => c !== 'All Counties').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Sub-County</label>
                  <input
                    type="text"
                    value={formData.sub_county}
                    onChange={(e) => setFormData({ ...formData, sub_county: e.target.value })}
                    placeholder="e.g., Kisumu Central"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Hearing Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.hearing_date}
                    onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Venue Address *</label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g., Kisumu Social Hall, Station Road"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description & Agenda *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Public consultation focus (e.g., healthcare investments and vocational bursaries)..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Participation Instructions</label>
                <input
                  type="text"
                  value={formData.participation_instructions}
                  onChange={(e) => setFormData({ ...formData, participation_instructions: e.target.value })}
                  placeholder="e.g., Bring national ID; oral submissions limited to 4 minutes."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Contact Email / Phone</label>
                <input
                  type="text"
                  value={formData.contact_information}
                  onChange={(e) => setFormData({ ...formData, contact_information: e.target.value })}
                  placeholder="e.g., budget@county.go.ke / 0700-000-000"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleLoading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {scheduleLoading ? 'Publishing...' : 'Publish Hearing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Hearing Modal */}
      {cancelModalOpen && selectedHearingForCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-red-900">Cancel Budget Hearing</h3>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 rounded-lg p-1.5 focus:outline-none"
              >
                &times;
              </button>
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {cancelError}
              </div>
            )}

            <p className="text-xs text-stone-600">
              You are cancelling <strong>{selectedHearingForCancel.title}</strong> in {selectedHearingForCancel.county}. A mandatory explanation is required for public transparency.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Cancellation Reason *
                </label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Venue renovation conflict; rescheduled to next week..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
