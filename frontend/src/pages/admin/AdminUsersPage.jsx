import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  Edit2,
  Lock,
  Unlock,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  AlertTriangle,
  Mail,
  Phone,
  FileCheck
} from 'lucide-react';
import { adminUsersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsersPage() {
  const { user: currentAuthUser } = useAuth();
  const isReadOnly = currentAuthUser?.role === 'Analyst';

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'audits'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [identityFilter, setIdentityFilter] = useState('');
  const [liaisonFilter, setLiaisonFilter] = useState('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [reactivateModal, setReactivateModal] = useState(false);
  const [liaisonModal, setLiaisonModal] = useState(false);
  const [identityModal, setIdentityModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);

  // Form states
  const [roleForm, setRoleForm] = useState({ role: 'Moderator', reason: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [reactivateReason, setReactivateReason] = useState('');
  const [liaisonForm, setLiaisonForm] = useState({
    is_county_liaison: true,
    liaison_county: 'Nairobi',
    liaison_sub_county: '',
    reason: ''
  });
  const [identityForm, setIdentityForm] = useState({
    status: 'VERIFIED',
    id_document_type: 'National ID',
    id_document_ref: '',
    reason: ''
  });
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    role: 'Moderator',
    is_county_liaison: false,
    liaison_county: 'Nairobi'
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminUsersApi.getUserStats(),
        adminUsersApi.getUsers({
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          identity_status: identityFilter || undefined,
          is_county_liaison: liaisonFilter !== '' ? liaisonFilter === 'true' : undefined
        })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setPagination(usersRes.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudits = async () => {
    try {
      const res = await adminUsersApi.getGlobalAudits({ limit: 50 });
      setAudits(res.data || []);
    } catch (err) {
      console.error('Failed to load audits:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, statusFilter, identityFilter, liaisonFilter]);

  useEffect(() => {
    if (activeTab === 'audits') {
      fetchAudits();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const notifySuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Open Details Modal
  const handleOpenDetails = async (u) => {
    try {
      const res = await adminUsersApi.getUserDetails(u.id);
      setSelectedUser(res.data);
      setDetailsModal(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load user profile');
    }
  };

  // Open Role Modal
  const handleOpenRoleModal = (u) => {
    setSelectedUser(u);
    setRoleForm({ role: u.role, reason: '' });
    setModalError(null);
    setRoleModal(true);
  };

  const handleSubmitRoleChange = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      await adminUsersApi.updateUserRole(selectedUser.id, roleForm);
      notifySuccess(`Successfully changed role for ${selectedUser.fullName} to ${roleForm.role}`);
      setRoleModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Suspend Modal
  const handleOpenSuspendModal = (u) => {
    setSelectedUser(u);
    setSuspendReason('');
    setModalError(null);
    setSuspendModal(true);
  };

  const handleSubmitSuspend = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      await adminUsersApi.suspendUser(selectedUser.id, { reason: suspendReason });
      notifySuccess(`Account for ${selectedUser.fullName} suspended and session revoked`);
      setSuspendModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to suspend account');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Reactivate Modal
  const handleOpenReactivateModal = (u) => {
    setSelectedUser(u);
    setReactivateReason('Administrative account reactivation');
    setModalError(null);
    setReactivateModal(true);
  };

  const handleSubmitReactivate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      await adminUsersApi.reactivateUser(selectedUser.id, { reason: reactivateReason });
      notifySuccess(`Account for ${selectedUser.fullName} reactivated successfully`);
      setReactivateModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to reactivate account');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Liaison Modal
  const handleOpenLiaisonModal = (u) => {
    setSelectedUser(u);
    setLiaisonForm({
      is_county_liaison: !u.isCountyLiaison,
      liaison_county: u.liaisonCounty || u.county || 'Nairobi',
      liaison_sub_county: u.liaisonSubCounty || u.ward || '',
      reason: ''
    });
    setModalError(null);
    setLiaisonModal(true);
  };

  const handleSubmitLiaison = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      await adminUsersApi.provisionCountyLiaison(selectedUser.id, liaisonForm);
      notifySuccess(`County liaison settings updated for ${selectedUser.fullName}`);
      setLiaisonModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to update liaison');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Identity Modal
  const handleOpenIdentityModal = (u) => {
    setSelectedUser(u);
    setIdentityForm({
      status: 'VERIFIED',
      id_document_type: 'National ID',
      id_document_ref: '',
      reason: 'Official identity document verified'
    });
    setModalError(null);
    setIdentityModal(true);
  };

  const handleSubmitIdentity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      await adminUsersApi.updateIdentityVerification(selectedUser.id, identityForm);
      notifySuccess(`Identity status updated to ${identityForm.status} for ${selectedUser.fullName}`);
      setIdentityModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to update identity status');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Staff Invite Modal
  const handleOpenInviteModal = () => {
    setInviteForm({
      email: '',
      full_name: '',
      role: 'Moderator',
      is_county_liaison: false,
      liaison_county: 'Nairobi'
    });
    setModalError(null);
    setInviteModal(true);
  };

  const handleSubmitInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      await adminUsersApi.inviteStaff(inviteForm);
      notifySuccess(`Staff invitation issued for ${inviteForm.email}`);
      setInviteModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to issue staff invitation');
    } finally {
      setSubmitting(false);
    }
  };

  // Role Badge Styling
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-navy-900 text-gold-400 border border-gold-500/40">Admin</span>;
      case 'Analyst':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-900/60 text-sky-300 border border-sky-600/40">Analyst</span>;
      case 'Moderator':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-600/40">Moderator</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-normal bg-stone-800 text-stone-300">Citizen</span>;
    }
  };

  // Status Badge Styling
  const renderStatusBadge = (status, isActive) => {
    if (status === 'SUSPENDED' || !isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-950 text-red-400 border border-red-800">
          <XCircle className="w-3 h-3" /> Suspended
        </span>
      );
    }
    if (status === 'PENDING_VERIFICATION') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
        <CheckCircle2 className="w-3 h-3" /> Active
      </span>
    );
  };

  // Identity Status Badge
  const renderIdentityBadge = (idStatus) => {
    switch (idStatus) {
      case 'VERIFIED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-700"><CheckCircle2 className="w-2.5 h-2.5" /> ID Verified</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-300 border border-amber-700"><Clock className="w-2.5 h-2.5" /> ID Review</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-950 text-red-300 border border-red-700"><XCircle className="w-2.5 h-2.5" /> ID Rejected</span>;
      default:
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] text-stone-400 bg-stone-900 border border-stone-800">Unverified</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-navy-900 border border-navy-800 p-5 rounded-lg text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-navy-950 border border-gold-500/40 text-gold-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                User & Role Management
                <span className="text-xs px-2 py-0.5 rounded bg-gold-500 text-navy-950 font-bold uppercase tracking-wide">
                  Milestone 14
                </span>
              </h1>
              <p className="text-xs text-stone-300 mt-0.5">
                Administrative user lifecycle, RBAC enforcement, staff onboarding, county liaison provisioning, and session invalidation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-navy-950 text-stone-300 hover:text-white border border-navy-800 hover:bg-navy-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {!isReadOnly && (
            <button
              type="button"
              onClick={handleOpenInviteModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-200 px-4 py-3 rounded-md text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="bg-red-950/80 border border-red-600 text-red-200 px-4 py-3 rounded-md text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-navy-900 border border-navy-800 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-stone-400">Total Users</span>
            <div className="text-xl font-extrabold text-white mt-1">{stats.totalUsers}</div>
            <span className="text-[10px] text-stone-400">Across 47 Counties</span>
          </div>
          <div className="bg-navy-900 border border-navy-800 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-stone-400">Active Accounts</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">{stats.activeUsers}</div>
            <span className="text-[10px] text-stone-400">Standard & staff access</span>
          </div>
          <div className="bg-navy-900 border border-navy-800 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-stone-400">Suspended</span>
            <div className="text-xl font-extrabold text-red-400 mt-1">{stats.suspendedUsers}</div>
            <span className="text-[10px] text-stone-400">Access revoked</span>
          </div>
          <div className="bg-navy-900 border border-navy-800 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-stone-400">County Liaisons</span>
            <div className="text-xl font-extrabold text-sky-400 mt-1">{stats.countyLiaisons}</div>
            <span className="text-[10px] text-stone-400">Regional coordinators</span>
          </div>
          <div className="bg-navy-900 border border-navy-800 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-stone-400">Verified IDs</span>
            <div className="text-xl font-extrabold text-gold-400 mt-1">{stats.verifiedIdentities}</div>
            <span className="text-[10px] text-stone-400">Government identity verified</span>
          </div>
          <div className="bg-navy-900 border border-navy-800 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-stone-400">Administrators</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">{stats.roles?.Admin || 1}</div>
            <span className="text-[10px] text-stone-400">Full system access</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-navy-800">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-gold-500 text-gold-400 bg-navy-900/40'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({pagination.total})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audits')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'audits'
              ? 'border-gold-500 text-gold-400 bg-navy-900/40'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Administrative Audit Trail</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-navy-900/80 border border-navy-800 p-4 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by name, email, phone, or county..."
                  className="w-full bg-navy-950 border border-navy-800 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-gold-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold bg-navy-800 text-white rounded hover:bg-navy-700 transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="bg-navy-950 border border-navy-800 rounded px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-gold-500"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Analyst">Analyst</option>
                <option value="Moderator">Moderator</option>
                <option value="Citizen">Citizen</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="bg-navy-950 border border-navy-800 rounded px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-gold-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <select
                value={identityFilter}
                onChange={(e) => {
                  setIdentityFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="bg-navy-950 border border-navy-800 rounded px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-gold-500"
              >
                <option value="">All Identity States</option>
                <option value="VERIFIED">Verified ID</option>
                <option value="PENDING">Pending Review</option>
                <option value="UNVERIFIED">Unverified</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={liaisonFilter}
                onChange={(e) => {
                  setLiaisonFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="bg-navy-950 border border-navy-800 rounded px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-gold-500"
              >
                <option value="">All Liaisons</option>
                <option value="true">County Liaisons Only</option>
                <option value="false">Regular Citizens</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-navy-900 border border-navy-800 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-navy-950 text-stone-400 uppercase text-[10px] font-bold tracking-wider border-b border-navy-800">
                  <tr>
                    <th className="px-4 py-3">User & Contact</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3">Identity Status</th>
                    <th className="px-4 py-3">County / Liaison</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                        No user accounts found matching your query filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isSelf = currentAuthUser?.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-navy-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                {u.fullName}
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-gold-500/20 text-gold-400 border border-gold-500/40">
                                    You
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-stone-500" />
                                {u.email}
                              </span>
                              {u.phone && (
                                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-stone-500" />
                                  {u.phone}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {renderRoleBadge(u.role)}
                          </td>
                          <td className="px-4 py-3">
                            {renderStatusBadge(u.status, u.isActive)}
                          </td>
                          <td className="px-4 py-3">
                            {renderIdentityBadge(u.identityStatus)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gold-500" />
                                {u.county || 'Not set'}
                              </span>
                              {u.isCountyLiaison ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 mt-0.5">
                                  ★ Liaison: {u.liaisonCounty} {u.liaisonSubCounty ? `(${u.liaisonSubCounty})` : ''}
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-400">
                                  {u.ward || 'General citizen'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-stone-400 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(u)}
                                title="View User Dossier & History"
                                className="p-1.5 rounded text-stone-300 hover:text-white hover:bg-navy-800 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {!isReadOnly && (
                                <>
                                  {/* Change Role */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRoleModal(u)}
                                    title="Change User Role"
                                    className="p-1.5 rounded text-gold-400 hover:text-gold-300 hover:bg-navy-800 transition-colors"
                                  >
                                    <Shield className="w-4 h-4" />
                                  </button>

                                  {/* County Liaison Provision */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenLiaisonModal(u)}
                                    title={u.isCountyLiaison ? 'Edit County Liaison Assignment' : 'Designate as County Liaison'}
                                    className="p-1.5 rounded text-sky-400 hover:text-sky-300 hover:bg-navy-800 transition-colors"
                                  >
                                    <MapPin className="w-4 h-4" />
                                  </button>

                                  {/* Identity Verification */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenIdentityModal(u)}
                                    title="Verify Identity Documents"
                                    className="p-1.5 rounded text-emerald-400 hover:text-emerald-300 hover:bg-navy-800 transition-colors"
                                  >
                                    <FileCheck className="w-4 h-4" />
                                  </button>

                                  {/* Suspend or Reactivate */}
                                  {u.status === 'SUSPENDED' || !u.isActive ? (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReactivateModal(u)}
                                      title="Reactivate Suspended Account"
                                      className="p-1.5 rounded text-emerald-400 hover:text-emerald-300 hover:bg-navy-800 transition-colors"
                                    >
                                      <Unlock className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSuspendModal(u)}
                                      title="Suspend Account (Immediate Revocation)"
                                      className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-navy-800 transition-colors"
                                    >
                                      <Lock className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-3 bg-navy-950 border-t border-navy-800 flex items-center justify-between text-xs text-stone-400">
                <span>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total accounts)
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    className="px-2.5 py-1 rounded bg-navy-900 border border-navy-800 disabled:opacity-40 hover:bg-navy-800 text-stone-300 text-xs"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    className="px-2.5 py-1 rounded bg-navy-900 border border-navy-800 disabled:opacity-40 hover:bg-navy-800 text-stone-300 text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="bg-navy-900 border border-navy-800 rounded-lg overflow-hidden shadow-xs">
            <div className="p-4 border-b border-navy-800 bg-navy-950/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-gold-400" />
                  Global Administrative Audit Log
                </h3>
                <p className="text-xs text-stone-400">
                  Chronological record of user role transitions, account suspensions, reactivations, and liaison assignments.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAudits}
                className="text-xs px-2.5 py-1 rounded bg-navy-900 text-stone-300 hover:text-white border border-navy-800"
              >
                Refresh Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-navy-950 text-stone-400 uppercase text-[10px] font-bold tracking-wider border-b border-navy-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Administrator</th>
                    <th className="px-4 py-3">Target User</th>
                    <th className="px-4 py-3">Reason / Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {audits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                        No administrative audits recorded yet.
                      </td>
                    </tr>
                  ) : (
                    audits.map((a) => (
                      <tr key={a.id} className="hover:bg-navy-800/50">
                        <td className="px-4 py-3 text-stone-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] font-bold text-gold-400 px-1.5 py-0.5 rounded bg-navy-950 border border-gold-500/30">
                            {a.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{a.actor?.name || 'System'}</span>
                            <span className="text-[10px] text-stone-400">{a.actor?.role}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{a.target?.name || 'N/A'}</span>
                            <span className="text-[10px] text-stone-400">{a.target?.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-stone-300 max-w-xs truncate">
                          {a.reason || 'No reason specified'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: User Profile & Audit Dossier */}
      {detailsModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xs p-4">
          <div className="bg-navy-900 border border-navy-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col text-white shadow-xl">
            <div className="p-4 border-b border-navy-800 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-400" />
                User Dossier: {selectedUser.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setDetailsModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded hover:bg-navy-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Overview Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-navy-950 p-3.5 rounded border border-navy-800">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold">Role</span>
                  <div className="mt-1">{renderRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold">Status</span>
                  <div className="mt-1">{renderStatusBadge(selectedUser.status, selectedUser.isActive)}</div>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold">Identity</span>
                  <div className="mt-1">{renderIdentityBadge(selectedUser.identityStatus)}</div>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-bold">County</span>
                  <div className="font-semibold text-white mt-1">{selectedUser.county || 'N/A'}</div>
                </div>
              </div>

              {selectedUser.suspensionReason && (
                <div className="p-3 bg-red-950/80 border border-red-800 rounded text-red-200">
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Suspended by {selectedUser.suspendedByName || 'Admin'} on{' '}
                    {new Date(selectedUser.suspendedAt).toLocaleString()}
                  </div>
                  <p className="mt-1 text-xs text-stone-300">
                    <span className="font-semibold text-red-300">Reason:</span> {selectedUser.suspensionReason}
                  </p>
                </div>
              )}

              {/* Identity Verification Records */}
              <div>
                <h4 className="font-bold text-stone-200 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-gold-500" />
                  Identity Verification History
                </h4>
                {selectedUser.identityHistory?.length === 0 ? (
                  <p className="text-stone-400 italic">No identity verification documents reviewed yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.identityHistory.map((h) => (
                      <div key={h.id} className="p-2.5 bg-navy-950 border border-navy-800 rounded flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            {renderIdentityBadge(h.status)}
                            <span className="font-semibold text-white">{h.idDocumentType || 'Government ID'}</span>
                            {h.idDocumentRef && (
                              <span className="text-stone-400 font-mono text-[10px]">Ref: {h.idDocumentRef}</span>
                            )}
                          </div>
                          {h.reason && <p className="text-stone-300 mt-1">{h.reason}</p>}
                        </div>
                        <div className="text-right text-[10px] text-stone-400">
                          <div>Reviewed by {h.verifiedByName || 'Admin'}</div>
                          <div>{new Date(h.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Administrative Lifecycle Audits */}
              <div>
                <h4 className="font-bold text-stone-200 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-gold-500" />
                  Lifecycle & Role Audit History
                </h4>
                {selectedUser.auditHistory?.length === 0 ? (
                  <p className="text-stone-400 italic">No administrative modifications recorded for this user.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.auditHistory.map((a) => (
                      <div key={a.id} className="p-2.5 bg-navy-950 border border-navy-800 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-gold-400 font-bold text-[11px]">{a.action}</span>
                          <span className="text-[10px] text-stone-400">{new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-stone-300 mt-1">{a.reason || 'No justification recorded'}</p>
                        <div className="mt-1 text-[10px] text-stone-400">
                          Actor: {a.actorName} ({a.actorRole})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-navy-800 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailsModal(false)}
                className="px-4 py-2 bg-navy-800 text-white rounded text-xs font-semibold hover:bg-navy-700"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Role Modal */}
      {roleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xs p-4">
          <div className="bg-navy-900 border border-navy-800 rounded-lg max-w-md w-full p-5 text-white shadow-xl">
            <h3 className="font-bold text-base flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-gold-400" />
              Change Role: {selectedUser.fullName}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Current role: <span className="font-bold text-white">{selectedUser.role}</span>. Changes take effect immediately.
            </p>

            {modalError && (
              <div className="p-2.5 mb-3 bg-red-950 border border-red-700 text-red-300 rounded text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitRoleChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-300">New Administrative Role</label>
                <select
                  value={roleForm.role}
                  onChange={(e) => setRoleForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="Citizen">Citizen (Public Access Only)</option>
                  <option value="Moderator">Moderator (Incident & Verification Triage)</option>
                  <option value="Analyst">Analyst (Read-Only Analytics & Intelligence)</option>
                  <option value="Admin">Admin (Full System & User Control)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-300">
                  Audit Justification Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={roleForm.reason}
                  onChange={(e) => setRoleForm((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Explain why this role change is being made (recorded in immutable audit trail)..."
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setRoleModal(false)}
                  className="px-3.5 py-2 rounded bg-navy-950 text-stone-300 border border-navy-800 hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-gold-500 text-navy-950 font-bold hover:bg-gold-400 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Confirm Role Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Suspend User Modal */}
      {suspendModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xs p-4">
          <div className="bg-navy-900 border border-red-800/80 rounded-lg max-w-md w-full p-5 text-white shadow-xl">
            <h3 className="font-bold text-base flex items-center gap-2 mb-1 text-red-400">
              <Lock className="w-5 h-5 text-red-500" />
              Suspend Account: {selectedUser.fullName}
            </h3>
            <p className="text-xs text-stone-300 mb-3">
              Suspending this account will <strong className="text-red-300">immediately invalidate active login sessions</strong> and prohibit further platform actions.
            </p>

            {modalError && (
              <div className="p-2.5 mb-3 bg-red-950 border border-red-700 text-red-300 rounded text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitSuspend} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-300">
                  Mandatory Suspension Justification <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  minLength={5}
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Detail the specific policy violation or security rationale (min 5 characters)..."
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setSuspendModal(false)}
                  className="px-3.5 py-2 rounded bg-navy-950 text-stone-300 border border-navy-800 hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50"
                >
                  {submitting ? 'Suspending...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Reactivate User Modal */}
      {reactivateModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xs p-4">
          <div className="bg-navy-900 border border-navy-800 rounded-lg max-w-md w-full p-5 text-white shadow-xl">
            <h3 className="font-bold text-base flex items-center gap-2 mb-1 text-emerald-400">
              <Unlock className="w-5 h-5 text-emerald-500" />
              Reactivate Account: {selectedUser.fullName}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Restores full active status. The user will be permitted to log in and interact with the platform again.
            </p>

            {modalError && (
              <div className="p-2.5 mb-3 bg-red-950 border border-red-700 text-red-300 rounded text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitReactivate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-300">Reactivation Notes</label>
                <textarea
                  rows={2}
                  value={reactivateReason}
                  onChange={(e) => setReactivateReason(e.target.value)}
                  placeholder="Compliance review passed or appeal accepted..."
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setReactivateModal(false)}
                  className="px-3.5 py-2 rounded bg-navy-950 text-stone-300 border border-navy-800 hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitting ? 'Reactivating...' : 'Confirm Reactivation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: County Liaison Provisioning */}
      {liaisonModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xs p-4">
          <div className="bg-navy-900 border border-navy-800 rounded-lg max-w-md w-full p-5 text-white shadow-xl">
            <h3 className="font-bold text-base flex items-center gap-2 mb-1 text-sky-400">
              <MapPin className="w-5 h-5 text-sky-500" />
              County Liaison Scope: {selectedUser.fullName}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Configure county jurisdiction and sub-county scope for regional coordination.
            </p>

            {modalError && (
              <div className="p-2.5 mb-3 bg-red-950 border border-red-700 text-red-300 rounded text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitLiaison} className="space-y-4 text-xs">
              <div className="flex items-center gap-2 bg-navy-950 p-3 rounded border border-navy-800">
                <input
                  type="checkbox"
                  id="is_liaison_cb"
                  checked={liaisonForm.is_county_liaison}
                  onChange={(e) => setLiaisonForm((p) => ({ ...p, is_county_liaison: e.target.checked }))}
                  className="rounded bg-navy-900 border-navy-700 text-gold-500 focus:ring-0"
                />
                <label htmlFor="is_liaison_cb" className="font-semibold text-stone-200">
                  Designate as Official County Liaison
                </label>
              </div>

              {liaisonForm.is_county_liaison && (
                <>
                  <div>
                    <label className="block font-semibold mb-1 text-stone-300">Assigned County</label>
                    <input
                      type="text"
                      required
                      value={liaisonForm.liaison_county}
                      onChange={(e) => setLiaisonForm((p) => ({ ...p, liaison_county: e.target.value }))}
                      placeholder="e.g. Nairobi, Kisumu, Mombasa, Nakuru"
                      className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-stone-300">
                      Sub-County Scope <span className="text-stone-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={liaisonForm.liaison_sub_county || ''}
                      onChange={(e) => setLiaisonForm((p) => ({ ...p, liaison_sub_county: e.target.value }))}
                      placeholder="e.g. Westlands, Kisumu Central, Nyali"
                      className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold mb-1 text-stone-300">Reason for Provisioning</label>
                <input
                  type="text"
                  value={liaisonForm.reason}
                  onChange={(e) => setLiaisonForm((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Official county administration appointment..."
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setLiaisonModal(false)}
                  className="px-3.5 py-2 rounded bg-navy-950 text-stone-300 border border-navy-800 hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-sky-600 text-white font-bold hover:bg-sky-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Liaison Scope'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Identity Verification Modal */}
      {identityModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xs p-4">
          <div className="bg-navy-900 border border-navy-800 rounded-lg max-w-md w-full p-5 text-white shadow-xl">
            <h3 className="font-bold text-base flex items-center gap-2 mb-1 text-emerald-400">
              <FileCheck className="w-5 h-5 text-emerald-500" />
              Verify Identity: {selectedUser.fullName}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Review and record verified government identity document status.
            </p>

            {modalError && (
              <div className="p-2.5 mb-3 bg-red-950 border border-red-700 text-red-300 rounded text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitIdentity} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-300">Verification Outcome</label>
                <select
                  value={identityForm.status}
                  onChange={(e) => setIdentityForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="VERIFIED">VERIFIED (Identity confirmed against government record)</option>
                  <option value="PENDING">PENDING (Documents uploaded, awaiting further proof)</option>
                  <option value="REJECTED">REJECTED (Document invalid or mismatched)</option>
                  <option value="UNVERIFIED">UNVERIFIED (Reset to unverified)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-300">Document Type</label>
                <select
                  value={identityForm.id_document_type}
                  onChange={(e) => setIdentityForm((p) => ({ ...p, id_document_type: e.target.value }))}
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="National ID">Kenya National ID Card</option>
                  <option value="Passport">Kenyan / East African Passport</option>
                  <option value="Voter ID">IEBC Voter Registration Card</option>
                  <option value="Alien Card">Alien ID Card</option>
                  <option value="Official Letter">Official County / National Letter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-300">Document Reference Number</label>
                <input
                  type="text"
                  value={identityForm.id_document_ref}
                  onChange={(e) => setIdentityForm((p) => ({ ...p, id_document_ref: e.target.value }))}
                  placeholder="e.g. KE-ID-12345678"
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-300">Verification Note</label>
                <input
                  type="text"
                  value={identityForm.reason}
                  onChange={(e) => setIdentityForm((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Verified against registry or cross-checked..."
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIdentityModal(false)}
                  className="px-3.5 py-2 rounded bg-navy-950 text-stone-300 border border-navy-800 hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Save Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Staff Invitation Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xs p-4">
          <div className="bg-navy-900 border border-navy-800 rounded-lg max-w-md w-full p-5 text-white shadow-xl">
            <h3 className="font-bold text-base flex items-center gap-2 mb-1 text-gold-400">
              <Plus className="w-5 h-5 text-gold-500" />
              Invite OCL Staff Member
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Issue an onboarding invitation for a new Administrator, Moderator, or Analyst.
            </p>

            {modalError && (
              <div className="p-2.5 mb-3 bg-red-950 border border-red-700 text-red-300 rounded text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-300">Staff Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. juma@civicwatch.ke"
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="e.g. Juma Kiprono"
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-300">Assigned Staff Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="Moderator">Moderator (Triage & Verification)</option>
                  <option value="Analyst">Analyst (Civic Intelligence & Reports)</option>
                  <option value="Admin">Admin (Full System Controls)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-navy-950 p-2.5 rounded border border-navy-800">
                <input
                  type="checkbox"
                  id="inv_liaison"
                  checked={inviteForm.is_county_liaison}
                  onChange={(e) => setInviteForm((p) => ({ ...p, is_county_liaison: e.target.checked }))}
                  className="rounded bg-navy-900 border-navy-700 text-gold-500 focus:ring-0"
                />
                <label htmlFor="inv_liaison" className="font-semibold text-stone-300">
                  Assign as County Liaison
                </label>
              </div>

              {inviteForm.is_county_liaison && (
                <div>
                  <label className="block font-semibold mb-1 text-stone-300">Liaison County</label>
                  <input
                    type="text"
                    value={inviteForm.liaison_county}
                    onChange={(e) => setInviteForm((p) => ({ ...p, liaison_county: e.target.value }))}
                    placeholder="e.g. Nairobi, Mombasa"
                    className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setInviteModal(false)}
                  className="px-3.5 py-2 rounded bg-navy-950 text-stone-300 border border-navy-800 hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-gold-500 text-navy-950 font-bold hover:bg-gold-400 disabled:opacity-50"
                >
                  {submitting ? 'Issuing...' : 'Send Staff Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
