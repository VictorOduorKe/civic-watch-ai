import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  PlusCircle,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Archive,
  Clock,
  Eye,
  Edit,
  History,
  ChevronLeft,
  ChevronRight,
  Send,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAlertApi } from '../../services/api';
import {
  SeverityBadge,
  SourceBadge,
  DowntimeStatusBadge,
  DemoNoticeBanner
} from '../../components/alerts/AlertBadge';
import {
  KENYAN_COUNTIES,
  ALERT_TYPES,
  ALERT_SEVERITIES,
  ALERT_TYPE_LABELS,
  UTILITY_SERVICE_LABELS
} from '../../constants/alertConstants';

export default function AdminAlertsPage() {
  const { user } = useAuth();
  const isStaffWriter = ['Admin', 'Moderator'].includes(user?.role);

  // Stats state
  const [stats, setStats] = useState({
    draft: 0,
    pending: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    rejected: 0,
    archived: 0,
    official: 0,
    community: 0,
    total: 0
  });

  // Table filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [countyFilter, setCountyFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Alerts data
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalAlert, setEditModalAlert] = useState(null);
  const [auditModalAlert, setAuditModalAlert] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Form state for creation/editing
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    alert_type: 'OFFICIAL_COUNTY_ALERT',
    severity: 'INFO',
    status: 'DRAFT',
    source_type: 'COUNTY_GOVERNMENT',
    source_name: '',
    source_reference: '',
    county: 'National',
    sub_county: '',
    ward: '',
    location_text: '',
    utility_service: '',
    downtime_status: '',
    expected_restoration: '',
    recommended_action: '',
    start_time: '',
    end_time: '',
    is_official: true,
    is_demo: true,
    change_summary: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Load summary stats
  const fetchStats = async () => {
    try {
      const res = await adminAlertApi.getAlertSummary();
      if (res.success && res.data?.summary) {
        setStats(res.data.summary);
      }
    } catch (err) {
      console.warn('[AdminAlerts] Could not load alert stats:', err.message);
    }
  };

  // Load alerts list
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
        status: statusFilter || undefined,
        alert_type: typeFilter || undefined,
        severity: severityFilter || undefined,
        county: countyFilter && countyFilter !== 'All' ? countyFilter : undefined,
        search: searchQuery.trim() || undefined
      };

      const res = await adminAlertApi.getAdminAlerts(params);
      if (res.success) {
        setAlerts(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrative alerts list');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, severityFilter, countyFilter, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchAlerts();
  }, [fetchAlerts]);

  // Handle Verify/Reject
  const handleVerify = async (alertId, verification_status) => {
    try {
      const res = await adminAlertApi.verifyAlert(alertId, {
        verification_status,
        notes: `Alert ${verification_status.toLowerCase()} by ${user?.fullName}`
      });
      if (res.success) {
        setActionSuccess(`Alert #${alertId} ${verification_status.toLowerCase()} successfully.`);
        fetchStats();
        fetchAlerts();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  };

  // Handle Publish
  const handlePublish = async (alertId) => {
    try {
      const res = await adminAlertApi.publishAlert(alertId, {
        notes: `Published immediately by ${user?.fullName}`
      });
      if (res.success) {
        setActionSuccess(`Alert #${alertId} published and broadcasted.`);
        fetchStats();
        fetchAlerts();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Publishing failed');
    }
  };

  // Handle Archive
  const handleArchive = async (alertId) => {
    try {
      const res = await adminAlertApi.archiveAlert(alertId, {
        notes: `Archived by ${user?.fullName}`
      });
      if (res.success) {
        setActionSuccess(`Alert #${alertId} archived.`);
        fetchStats();
        fetchAlerts();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Archive failed');
    }
  };

  // View Audit Logs
  const handleViewAudits = async (alertItem) => {
    setAuditModalAlert(alertItem);
    setAuditLoading(true);
    setAuditLogs([]);
    try {
      const res = await adminAlertApi.getAdminAlertById(alertItem.id);
      if (res.success && res.data) {
        setAuditLogs(res.data.audits || []);
      }
    } catch (err) {
      console.error('Failed to load audits:', err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      title: '',
      summary: '',
      description: '',
      alert_type: 'OFFICIAL_COUNTY_ALERT',
      severity: 'INFO',
      status: 'DRAFT',
      source_type: 'COUNTY_GOVERNMENT',
      source_name: 'County Government of Nairobi',
      source_reference: '',
      county: 'Nairobi',
      sub_county: '',
      ward: '',
      location_text: '',
      utility_service: '',
      downtime_status: '',
      expected_restoration: '',
      recommended_action: '',
      start_time: '',
      end_time: '',
      is_official: true,
      is_demo: true,
      change_summary: ''
    });
    setFormError(null);
    setCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (alertItem) => {
    setEditModalAlert(alertItem);
    setFormData({
      title: alertItem.title,
      summary: alertItem.summary,
      description: alertItem.description,
      alert_type: alertItem.alert_type,
      severity: alertItem.severity,
      status: alertItem.status,
      source_type: alertItem.source_type,
      source_name: alertItem.source_name,
      source_reference: alertItem.source_reference || '',
      county: alertItem.county || 'National',
      sub_county: alertItem.sub_county || '',
      ward: alertItem.ward || '',
      location_text: alertItem.location_text || '',
      utility_service: alertItem.utility_service || '',
      downtime_status: alertItem.downtime_status || '',
      expected_restoration: alertItem.expected_restoration ? alertItem.expected_restoration.slice(0, 16) : '',
      recommended_action: alertItem.recommended_action || '',
      start_time: alertItem.start_time ? alertItem.start_time.slice(0, 16) : '',
      end_time: alertItem.end_time ? alertItem.end_time.slice(0, 16) : '',
      is_official: Boolean(alertItem.is_official),
      is_demo: Boolean(alertItem.is_demo),
      change_summary: ''
    });
    setFormError(null);
  };

  // Submit Create or Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = { ...formData };
      if (!payload.utility_service) delete payload.utility_service;
      if (!payload.downtime_status) delete payload.downtime_status;
      if (!payload.expected_restoration) delete payload.expected_restoration;
      if (!payload.start_time) delete payload.start_time;
      if (!payload.end_time) delete payload.end_time;
      if (!payload.source_reference) delete payload.source_reference;

      if (editModalAlert) {
        // Update existing alert
        const res = await adminAlertApi.updateAlert(editModalAlert.id, payload);
        if (res.success) {
          setActionSuccess(`Alert #${editModalAlert.id} updated successfully.`);
          setEditModalAlert(null);
          fetchStats();
          fetchAlerts();
          setTimeout(() => setActionSuccess(null), 3000);
        }
      } else {
        // Create new alert
        const res = await adminAlertApi.createAlert(payload);
        if (res.success) {
          setActionSuccess(`Alert #${res.data?.id || ''} created successfully.`);
          setCreateModalOpen(false);
          fetchStats();
          fetchAlerts();
          setTimeout(() => setActionSuccess(null), 3000);
        }
      }
    } catch (err) {
      setFormError(err.message || 'Operation failed. Please check your inputs.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Warning Banner */}
      <DemoNoticeBanner />

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-navy-900 text-gold-400 rounded-xl">
              <Radio className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Civic Alerts & Advisories Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-600">
            Publish official government advisories, track utility outages, verify citizen notices, and manage broadcasts.
          </p>
        </div>

        {isStaffWriter && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 text-sm font-semibold transition-all shadow-sm self-start sm:self-center"
          >
            <PlusCircle className="w-4 h-4 text-gold-400" />
            <span>Create Alert</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Drafts
          </span>
          <span className="text-2xl font-black text-navy-900 mt-1 block">
            {stats.draft}
          </span>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/30 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Pending Review
          </span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">
            {stats.pending}
          </span>
        </div>

        <div className="bg-white border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Active Alerts
          </span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">
            {stats.active}
          </span>
        </div>

        <div className="bg-white border border-blue-200 bg-blue-50/30 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
            Scheduled
          </span>
          <span className="text-2xl font-black text-blue-800 mt-1 block">
            {stats.scheduled}
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Expired
          </span>
          <span className="text-2xl font-black text-stone-700 mt-1 block">
            {stats.expired}
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Official vs Comm.
          </span>
          <div className="text-xs font-semibold text-stone-800 mt-2 space-y-0.5">
            <div>Official: <strong>{stats.official}</strong></div>
            <div>Community: <strong>{stats.community}</strong></div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search alerts, sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="ACTIVE">Active</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled / Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
            >
              <option value="">All Alert Types</option>
              <option value="OFFICIAL_COUNTY_ALERT">Official County Alert</option>
              <option value="GOVERNMENT_ADVISORY">Government Advisory</option>
              <option value="UTILITY_DOWNTIME">Utility Downtime</option>
              <option value="PUBLIC_SAFETY">Public Safety</option>
              <option value="WEATHER_ENVIRONMENTAL">Weather / Environmental</option>
              <option value="COMMUNITY_ADVISORY">Community Advisory</option>
            </select>
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High Severity</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
              <option value="INFO">Informational</option>
            </select>
          </div>

          <div>
            <select
              value={countyFilter}
              onChange={(e) => { setCountyFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
            >
              <option value="All">All Counties</option>
              {KENYAN_COUNTIES.filter(c => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Alert Dossier</th>
                <th className="py-3 px-3">Type & Source</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Timing</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500">
                    <div className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading alerts records...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500">
                    No alert records match current filters.
                  </td>
                </tr>
              ) : (
                alerts.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-navy-900 hover:text-gold-600">
                        <a href={`/alerts/${item.id}`} target="_blank" rel="noopener noreferrer">
                          {item.title}
                        </a>
                      </div>
                      <p className="text-stone-500 line-clamp-1 mt-0.5">{item.summary}</p>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <SourceBadge
                          isOfficial={item.is_official}
                          sourceType={item.source_type}
                          sourceName={item.source_name}
                        />
                        <span className="block text-[11px] text-stone-500 font-medium">
                          {ALERT_TYPE_LABELS[item.alert_type] || item.alert_type}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <SeverityBadge severity={item.severity} />
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : item.status === 'PENDING_REVIEW'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : item.status === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-stone-700 font-medium">
                      {item.county || 'National'}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-stone-500">
                      <div>
                        {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Unpublished'}
                      </div>
                      <div className="text-[10px]">
                        Created by {item.creator_name || 'Staff'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Audit Logs */}
                        <button
                          type="button"
                          title="View Audit Trail"
                          onClick={() => handleViewAudits(item)}
                          className="p-1 text-stone-500 hover:text-navy-900 hover:bg-stone-100 rounded"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        {isStaffWriter && (
                          <button
                            type="button"
                            title="Edit Alert"
                            onClick={() => openEditModal(item)}
                            className="p-1 text-stone-500 hover:text-navy-900 hover:bg-stone-100 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Moderation Actions for Pending Reviews */}
                        {isStaffWriter && item.status === 'PENDING_REVIEW' && (
                          <>
                            <button
                              type="button"
                              title="Verify & Activate"
                              onClick={() => handleVerify(item.id, 'VERIFIED')}
                              className="px-2 py-1 bg-emerald-700 text-white rounded text-[11px] font-semibold hover:bg-emerald-800"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              title="Reject"
                              onClick={() => handleVerify(item.id, 'REJECTED')}
                              className="px-2 py-1 bg-red-600 text-white rounded text-[11px] font-semibold hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Publish Draft */}
                        {isStaffWriter && item.status === 'DRAFT' && (
                          <button
                            type="button"
                            title="Publish Immediately"
                            onClick={() => handlePublish(item.id)}
                            className="px-2 py-1 bg-navy-900 text-gold-400 rounded text-[11px] font-semibold hover:bg-navy-800"
                          >
                            Publish
                          </button>
                        )}

                        {/* Archive */}
                        {isStaffWriter && item.status === 'ACTIVE' && (
                          <button
                            type="button"
                            title="Archive Alert"
                            onClick={() => handleArchive(item.id)}
                            className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 text-xs">
            <span className="text-stone-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-stone-200 rounded text-stone-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-2.5 py-1 border border-stone-200 rounded text-stone-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Alert */}
      {(createModalOpen || editModalAlert) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl my-8 overflow-hidden">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-900">
                {editModalAlert ? `Edit Alert #${editModalAlert.id}` : 'Create New Civic Alert'}
              </h2>
              <button
                type="button"
                onClick={() => { setCreateModalOpen(false); setEditModalAlert(null); }}
                className="p-1 rounded text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Alert Title *
                </label>
                <input
                  type="text"
                  required
                  minLength={5}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-stone-300 focus:outline-hidden focus:border-navy-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Alert Type *
                  </label>
                  <select
                    value={formData.alert_type}
                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-stone-300 bg-white"
                  >
                    <option value="OFFICIAL_COUNTY_ALERT">Official County Alert</option>
                    <option value="GOVERNMENT_ADVISORY">Government Advisory</option>
                    <option value="UTILITY_DOWNTIME">Utility Downtime</option>
                    <option value="PUBLIC_SAFETY">Public Safety</option>
                    <option value="WEATHER_ENVIRONMENTAL">Weather / Environmental</option>
                    <option value="COMMUNITY_ADVISORY">Community Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-stone-300 bg-white"
                  >
                    <option value="INFO">INFO</option>
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Publish Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-stone-300 bg-white"
                  >
                    <option value="DRAFT">DRAFT (Not public)</option>
                    <option value="ACTIVE">ACTIVE (Publish Now)</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                  </select>
                </div>
              </div>

              {/* Source Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Source Type *
                  </label>
                  <select
                    value={formData.source_type}
                    onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300 bg-white"
                  >
                    <option value="COUNTY_GOVERNMENT">County Government</option>
                    <option value="NATIONAL_AGENCY">National Agency</option>
                    <option value="UTILITY_PROVIDER">Utility Provider</option>
                    <option value="EMERGENCY_SERVICES">Emergency Services</option>
                    <option value="CIVIC_ORGANIZATION">Civic Organization</option>
                    <option value="COMMUNITY">Community</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Source Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.source_name}
                    onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                    placeholder="e.g., NCWSC, KeNHA, KMD"
                    className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Official Reference Link
                  </label>
                  <input
                    type="url"
                    value={formData.source_reference}
                    onChange={(e) => setFormData({ ...formData, source_reference: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300"
                  />
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    County
                  </label>
                  <select
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300 bg-white"
                  >
                    <option value="National">National (All)</option>
                    {KENYAN_COUNTIES.filter(c => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Sub-County
                  </label>
                  <input
                    type="text"
                    value={formData.sub_county}
                    onChange={(e) => setFormData({ ...formData, sub_county: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Ward
                  </label>
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Locality / Street
                  </label>
                  <input
                    type="text"
                    value={formData.location_text}
                    onChange={(e) => setFormData({ ...formData, location_text: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300"
                  />
                </div>
              </div>

              {/* Utility Downtime Section if selected */}
              {formData.alert_type === 'UTILITY_DOWNTIME' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div>
                    <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                      Utility Service *
                    </label>
                    <select
                      value={formData.utility_service}
                      onChange={(e) => setFormData({ ...formData, utility_service: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300 bg-white"
                    >
                      <option value="">Select Service</option>
                      <option value="ELECTRICITY">Electricity</option>
                      <option value="WATER">Water</option>
                      <option value="ROAD_INFRASTRUCTURE">Roads</option>
                      <option value="WASTE_SANITATION">Waste</option>
                      <option value="INTERNET_TELECOM">Telecom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                      Outage Status
                    </label>
                    <select
                      value={formData.downtime_status}
                      onChange={(e) => setFormData({ ...formData, downtime_status: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300 bg-white"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="RESTORED">Restored</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                      Expected Restoration
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expected_restoration}
                      onChange={(e) => setFormData({ ...formData, expected_restoration: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded-lg border-stone-300"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Summary * (Concise 1-2 sentences)
                </label>
                <input
                  type="text"
                  required
                  minLength={10}
                  maxLength={500}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Recommended Citizen Action
                </label>
                <input
                  type="text"
                  value={formData.recommended_action}
                  onChange={(e) => setFormData({ ...formData, recommended_action: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Expiration / End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg border-stone-300 text-xs"
                  />
                </div>
              </div>

              {editModalAlert && (
                <div>
                  <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                    Reason for Edit / Change Summary * (Recorded in Audit Trail)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Updated restoration timestamp following NCWSC notice update"
                    value={formData.change_summary}
                    onChange={(e) => setFormData({ ...formData, change_summary: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-stone-300 text-xs"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setCreateModalOpen(false); setEditModalAlert(null); }}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editModalAlert ? 'Save Changes' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Audit Trail */}
      {auditModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl my-8 overflow-hidden">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900">
                  Lifecycle Audit Trail: Alert #{auditModalAlert.id}
                </h2>
                <span className="text-xs text-stone-500">{auditModalAlert.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalAlert(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto text-xs space-y-3">
              {auditLoading ? (
                <div className="py-8 text-center text-stone-500">Loading audit history...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-8 text-center text-stone-500">No audit log records for this alert.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                        {log.action}
                      </span>
                      <span className="text-stone-500 text-[10px]">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-stone-700">{log.change_summary || 'No summary recorded'}</p>
                    <div className="text-stone-500 text-[10px]">
                      By: <strong>{log.user_name}</strong> ({log.user_role})
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
