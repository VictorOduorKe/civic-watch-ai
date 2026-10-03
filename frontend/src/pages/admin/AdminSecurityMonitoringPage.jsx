import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Activity,
  Lock,
  UserX,
  Radio,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { securityMonitoringApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminSecurityMonitoringPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [threatTypeFilter, setThreatTypeFilter] = useState('');

  // Triage Modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, statsRes] = await Promise.all([
        securityMonitoringApi.listEvents({
          search: search || undefined,
          status: statusFilter || undefined,
          severity: severityFilter || undefined,
          threat_type: threatTypeFilter || undefined,
          limit: 50
        }),
        securityMonitoringApi.getStats()
      ]);

      setEvents(eventsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load security intrusion telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter, threatTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openTriageModal = (evt) => {
    setSelectedEvent(evt);
    setNewStatus(evt.status === 'DETECTED' ? 'REVIEWING' : evt.status);
    setResolutionNotes(evt.resolution_notes || '');
    setUpdateError(null);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !newStatus) return;

    setUpdatingStatus(true);
    setUpdateError(null);
    try {
      await securityMonitoringApi.updateStatus(selectedEvent.id, {
        status: newStatus,
        resolution_notes: resolutionNotes || undefined
      });

      setSelectedEvent(null);
      await loadData();
    } catch (err) {
      setUpdateError(err.message || 'Failed to update alert triage status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-900/60 text-red-200 border border-red-700/50">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-orange-900/60 text-orange-200 border border-orange-700/50">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-900/60 text-yellow-200 border border-yellow-700/50">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">LOW</span>;
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'DETECTED':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-900/60 text-yellow-300 border border-yellow-700/50 flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> DETECTED</span>;
      case 'REVIEWING':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 flex items-center gap-1 w-fit"><Activity className="w-3 h-3" /> REVIEWING</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 w-fit"><ShieldAlert className="w-3 h-3" /> CONFIRMED</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> RESOLVED</span>;
      case 'DISMISSED':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> DISMISSED</span>;
      default:
        return <span className="text-xs text-slate-400">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-600 tracking-wider uppercase mb-1">
            <ShieldAlert className="w-4 h-4 text-gold-600" />
            Milestone 16 • Threat Intelligence
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-red-600" />
            Security Intrusion Monitoring
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Continuous intrusion anomaly detection, credential stuffing bursts, unauthorized route probing, and incident response triage.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-navy-800 text-slate-200 border border-navy-700 hover:bg-navy-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Telemetry
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Intrusion Alerts</span>
            <Radio className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {stats?.totalEvents ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">All time recorded</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Under Active Triage</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400 mt-2">
            {(stats?.detectedEvents ?? 0) + (stats?.reviewingEvents ?? 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats?.detectedEvents ?? 0} Detected • {stats?.reviewingEvents ?? 0} Reviewing
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {stats?.resolvedEvents ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Mitigated & cleared</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High / Critical Alerts</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-2">
            {stats?.highSeverityEvents ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Priority response required</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-navy-900/70 border border-navy-700/80 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by IP, description, or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-navy-950/70 border border-navy-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={threatTypeFilter}
              onChange={(e) => setThreatTypeFilter(e.target.value)}
              className="px-3 py-2 bg-navy-950/70 border border-navy-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="">All Threat Types</option>
              <option value="FAILED_LOGIN_BURST">Failed Login Burst</option>
              <option value="UNAUTHORIZED_ACCESS_BURST">Unauthorized Probing</option>
              <option value="SUSPICIOUS_IP_BURST">Suspicious IP Burst</option>
              <option value="TOKEN_TAMPERING">Token Tampering</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-navy-950/70 border border-navy-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="">All Severities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-navy-950/70 border border-navy-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-gold-500"
            >
              <option value="">All Statuses</option>
              <option value="DETECTED">DETECTED</option>
              <option value="REVIEWING">REVIEWING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="DISMISSED">DISMISSED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-semibold text-sm rounded-lg transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Events Table */}
      <div className="rounded-xl bg-navy-900/80 border border-navy-700/80 overflow-hidden shadow-sm">
        {error && (
          <div className="p-4 bg-red-950/50 border-b border-red-800/50 text-red-200 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-navy-950/80 text-xs uppercase text-slate-400 border-b border-navy-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Detected At</th>
                <th className="py-3 px-4 font-semibold">Threat & Description</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Source IP / Actor</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-400" />
                    Scanning intrusion telemetry...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No intrusion alerts found. Security perimeter healthy.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-navy-800/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(evt.detected_at || evt.created_at).toLocaleString('en-KE', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-xs">{evt.threat_type}</div>
                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{evt.description}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getSeverityBadge(evt.severity)}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs text-slate-200">{evt.ip_address || 'Unknown IP'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {evt.user_email || evt.user_id ? `User: ${evt.user_email || evt.user_id}` : 'Unauthenticated'}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(evt.status)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openTriageModal(evt)}
                        className="px-2.5 py-1 text-xs font-medium rounded bg-navy-800 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Triage & Resolution Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-navy-800 flex items-center justify-between bg-navy-950/50">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Triage Security Intrusion Alert</h3>
                  <div className="text-xs text-slate-400">
                    Event #{selectedEvent.id} • Detected {new Date(selectedEvent.detected_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleStatusUpdate} className="p-6 space-y-5 overflow-y-auto">
              {/* Alert Summary Box */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{selectedEvent.threat_type}</span>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(selectedEvent.severity)}
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                </div>
                <p className="text-slate-300">{selectedEvent.description}</p>
                <div className="pt-2 border-t border-navy-800/80 grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
                  <div>IP: <span className="text-slate-200">{selectedEvent.ip_address}</span></div>
                  <div>User: <span className="text-slate-200">{selectedEvent.user_email || 'None'}</span></div>
                </div>
              </div>

              {/* Trigger Details JSON */}
              {selectedEvent.trigger_details && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Telemetry Trigger Details
                  </h4>
                  <pre className="p-3 rounded-xl bg-navy-950 text-red-300 font-mono text-xs overflow-x-auto border border-navy-800 max-h-40">
                    {typeof selectedEvent.trigger_details === 'string'
                      ? selectedEvent.trigger_details
                      : JSON.stringify(selectedEvent.trigger_details, null, 2)}
                  </pre>
                </div>
              )}

              {/* Lifecycle Transition Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Update Investigation Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['REVIEWING', 'CONFIRMED', 'RESOLVED', 'DISMISSED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition text-center ${
                        newStatus === st
                          ? 'bg-gold-500/20 text-gold-300 border-gold-500'
                          : 'bg-navy-950 text-slate-400 border-navy-800 hover:bg-navy-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                  Investigation & Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail mitigation steps taken, IP blacklist actions, or rationale for dismissal..."
                  className="w-full p-3 bg-navy-950 border border-navy-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              {updateError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  {updateError}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-lg bg-navy-800 text-slate-300 hover:bg-navy-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Save Triage Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
