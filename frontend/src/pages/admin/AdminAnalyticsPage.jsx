import React, { useState, useEffect, useCallback, useId } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import {
  FileText, Bell, MapPin, TrendingUp, RefreshCw,
  AlertTriangle, CheckCircle2, Users, BarChart2, ChevronDown
} from 'lucide-react';
import { adminAnalyticsApi } from '../../services/api';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'all', label: 'All time' }
];

const STATUS_COLORS = {
  'Submitted': '#1B4F72', 'Under Review': '#D99A00', 'Verified': '#2E86AB',
  'Assigned': '#7B68EE', 'In Progress': '#E67E22', 'Resolved': '#27AE60',
  'Closed': '#5D6D7E', 'Rejected': '#E74C3C', 'Dismissed': '#95A5A6'
};
const CATEGORY_COLORS = [
  '#1B4F72', '#D99A00', '#27AE60', '#E67E22', '#2E86AB',
  '#7B68EE', '#E74C3C', '#16A085', '#8E44AD', '#2C3E50', '#D35400', '#1ABC9C'
];

function SectionCard({ title, icon: Icon, children, loading, error }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-navy-800" />}
        <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
      </div>
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-5 h-5 animate-spin text-navy-700" />
            <span className="ml-2 text-sm text-stone-500">Loading analytics…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <AlertTriangle className="w-7 h-7 text-amber-500 mb-2" />
            <p className="text-sm text-stone-600">Unable to load analytics.</p>
            <p className="text-xs text-stone-400 mt-1">Please try again.</p>
          </div>
        ) : children}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-950 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-gold-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-stone-300">
            {p.name}: <span className="font-bold text-white">{Number(p.value).toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState({});
  const [error, setError]   = useState({});
  const [data, setData]     = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing]   = useState(false);
  const rangeId = useId();

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const params = { range };

    const fetchSection = async (key, apiFn) => {
      setLoading((prev) => ({ ...prev, [key]: true }));
      setError((prev) => ({ ...prev, [key]: null }));
      try {
        const res = await apiFn(params);
        setData((prev) => ({ ...prev, [key]: res.data ?? res }));
      } catch (err) {
        setError((prev) => ({ ...prev, [key]: err.message || 'Failed to load.' }));
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
    };

    await Promise.all([
      fetchSection('overview',   (p) => adminAnalyticsApi.getAdminOverview(p)),
      fetchSection('trends',     (p) => adminAnalyticsApi.getAdminReportTrends(p).then((r) => r.data?.trends ?? [])),
      fetchSection('categories', (p) => adminAnalyticsApi.getAdminCategoryStats(p).then((r) => r.data?.categories ?? [])),
      fetchSection('status',     (p) => adminAnalyticsApi.getAdminStatusStats(p).then((r) => r.data?.statuses ?? [])),
      fetchSection('geography',  (p) => adminAnalyticsApi.getAdminGeographyStats(p).then((r) => r.data?.geography ?? [])),
      fetchSection('alerts',     (p) => adminAnalyticsApi.getAdminAlertStats(p))
    ]);

    setLastUpdated(new Date());
    setRefreshing(false);
  }, [range]);

  useEffect(() => { fetchAll(false); }, [fetchAll]);

  const overview   = data.overview ?? {};
  const trendsData = Array.isArray(data.trends)     ? data.trends     : [];
  const catData    = Array.isArray(data.categories) ? data.categories : [];
  const statusData = Array.isArray(data.status)     ? data.status     : [];
  const geoData    = Array.isArray(data.geography)  ? data.geography  : [];
  const alerts     = data.alerts ?? {};

  const formattedTrends = trendsData.map((item) => {
    let label = item.period;
    try {
      const d = new Date(item.period + (item.period.length === 7 ? '-01' : ''));
      label = item.period.length === 7
        ? d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
        : d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    } catch { /**/ }
    return { ...item, label };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy-900 font-serif">Civic Intelligence & Insights</h1>
          <p className="text-sm text-stone-500 mt-0.5">Administrative analytics — aggregated platform data.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <label htmlFor={rangeId} className="sr-only">Time range</label>
            <select
              id={rangeId}
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-stone-200 rounded-lg text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-800"
            >
              {RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm font-medium text-navy-800 border border-stone-200 bg-white hover:bg-stone-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      {lastUpdated && <p className="text-xs text-stone-400">Last updated: {lastUpdated.toLocaleString()}</p>}

      {/* KPI Overview Cards */}
      <section aria-labelledby="admin-overview-heading">
        <h2 id="admin-overview-heading" className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Overview</h2>
        {loading.overview ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-stone-200 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <AdminStatCard title="Total Reports"    value={overview.total_reports}    subtext={`${overview.active_reports ?? 0} active`}  icon={FileText}     colorScheme="navy" />
            <AdminStatCard title="Resolved Reports" value={overview.resolved_reports} subtext="Closed cases"                               icon={CheckCircle2} colorScheme="emerald" />
            <AdminStatCard title="Active Alerts"    value={overview.active_alerts}    subtext="Current alerts"                             icon={Bell}         colorScheme="gold" />
            <AdminStatCard title="Total Users"      value={overview.total_users}      subtext={`${overview.active_users ?? 0} active`}     icon={Users}        colorScheme="blue" />
          </div>
        )}

        {/* Additional Admin Stats */}
        {!loading.overview && !error.overview && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Submitted', value: overview.submitted_reports,    color: 'text-navy-800' },
              { label: 'Under Review', value: overview.under_review_reports, color: 'text-amber-600' },
              { label: 'Anonymous Reports', value: overview.anonymous_reports_count, color: 'text-stone-600' },
              { label: 'Draft Alerts', value: overview.draft_alerts, color: 'text-stone-500' }
            ].map((item) => (
              <div key={item.label} className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-center">
                <p className={`text-xl font-bold font-serif ${item.color}`}>{item.value ?? 0}</p>
                <p className="text-xs text-stone-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trend Chart */}
      <SectionCard title="Report Trends Over Time" icon={TrendingUp} loading={loading.trends} error={error.trends}>
        {formattedTrends.length === 0 ? (
          <AdminEmptyState title="No trend data" description="No reports recorded in the selected period." />
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total"    name="Total"    stroke="#1B4F72" strokeWidth={2.5} fill="#1B4F72" fillOpacity={0.12} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#27AE60" strokeWidth={2}   fill="#27AE60" fillOpacity={0.08} />
                <Area type="monotone" dataKey="active"   name="Active"   stroke="#D99A00" strokeWidth={2}   fill="#D99A00" fillOpacity={0.06} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      {/* Category + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Reports by Category" icon={BarChart2} loading={loading.categories} error={error.categories}>
          {catData.filter((c) => c.count > 0).length === 0 ? (
            <AdminEmptyState title="No category data" description="No reports in this period." />
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData.filter((c) => c.count > 0)} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="category_name" tick={{ fill: '#374151', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Reports" radius={[0, 4, 4, 0]}>
                    {catData.filter((c) => c.count > 0).map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Reports by Status" icon={CheckCircle2} loading={loading.status} error={error.status}>
          {statusData.length === 0 ? (
            <AdminEmptyState title="No status data" description="No reports in this period." />
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={85} innerRadius={40} paddingAngle={2}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [Number(v).toLocaleString(), n]} />
                  <Legend formatter={(v) => <span className="text-xs text-stone-600">{v}</span>} iconSize={10} wrapperStyle={{ paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Geography */}
      <SectionCard title="Geographic Distribution by County" icon={MapPin} loading={loading.geography} error={error.geography}>
        {geoData.length === 0 ? (
          <AdminEmptyState title="No geographic data" description="No county data for the selected period." />
        ) : (
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="county" tick={{ fill: '#374151', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count"    name="Total"    fill="#1B4F72" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#27AE60" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      {/* Alert Analytics */}
      <SectionCard title="Alert Analytics" icon={Bell} loading={loading.alerts} error={error.alerts}>
        {!alerts.total && alerts.total !== 0 ? (
          <AdminEmptyState title="No alert data" description="No alerts found." />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Total', value: alerts.total, color: 'text-navy-900' },
                { label: 'Draft', value: alerts.draft, color: 'text-stone-500' },
                { label: 'Active', value: alerts.active, color: 'text-emerald-600' },
                { label: 'Expired', value: alerts.expired, color: 'text-stone-400' },
                { label: 'Archived', value: alerts.archived, color: 'text-stone-400' }
              ].map((item) => (
                <div key={item.label} className="text-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <p className={`text-xl font-bold font-serif ${item.color}`}>{item.value ?? 0}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
            {alerts.by_severity?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">By Severity</p>
                <div className="flex flex-wrap gap-2">
                  {alerts.by_severity.map((s) => (
                    <span key={s.severity} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-100 text-stone-700 rounded-full">
                      {s.severity} <span className="font-bold text-navy-900">{s.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {alerts.by_category?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">By Type</p>
                <div className="flex flex-wrap gap-2">
                  {alerts.by_category.map((c) => (
                    <span key={c.category} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-navy-50 text-navy-800 rounded-full border border-navy-100">
                      {c.category?.replace(/_/g, ' ')} <span className="font-bold">{c.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Privacy note */}
      <div className="bg-navy-50 border border-navy-100 rounded-xl p-4 text-center">
        <p className="text-xs text-navy-700">
          <span className="font-semibold">Admin Note:</span>{' '}
          All analytics are aggregated counts. No citizen names, email addresses, phone numbers,
          private report content, or exact addresses are included.
        </p>
      </div>
    </div>
  );
}
