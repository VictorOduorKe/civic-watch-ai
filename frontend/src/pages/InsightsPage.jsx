import React, { useState, useEffect, useCallback, useId } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import {
  FileText, Bell, MapPin, TrendingUp, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, ChevronDown, BarChart2
} from 'lucide-react';
import { analyticsApi } from '../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'all', label: 'All time' }
];

const STATUS_COLORS = {
  'Submitted': '#1B4F72',
  'Under Review': '#D99A00',
  'Verified': '#2E86AB',
  'Assigned': '#7B68EE',
  'In Progress': '#E67E22',
  'Resolved': '#27AE60',
  'Closed': '#5D6D7E',
  'Rejected': '#E74C3C',
  'Dismissed': '#95A5A6'
};

const CATEGORY_COLORS = [
  '#1B4F72', '#D99A00', '#27AE60', '#E67E22', '#2E86AB',
  '#7B68EE', '#E74C3C', '#16A085', '#8E44AD', '#2C3E50',
  '#D35400', '#1ABC9C'
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ title, value, subtext, icon: Icon, colorScheme = 'navy' }) {
  const colorMap = {
    navy:    { iconBg: 'bg-[#1B4F72]/10 text-[#1B4F72]', accent: 'border-l-[#1B4F72]' },
    gold:    { iconBg: 'bg-[#D99A00]/10 text-[#D99A00]', accent: 'border-l-[#D99A00]' },
    emerald: { iconBg: 'bg-emerald-50 text-emerald-700', accent: 'border-l-emerald-600' },
    amber:   { iconBg: 'bg-amber-50 text-amber-700',    accent: 'border-l-amber-500' }
  };
  const s = colorMap[colorScheme] || colorMap.navy;
  return (
    <div className={`bg-white rounded-xl p-5 border border-stone-200 shadow-sm border-l-4 ${s.accent}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{title}</p>
          <div className="mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-[#0D2137] font-serif">
              {value !== undefined && value !== null ? Number(value).toLocaleString() : '—'}
            </span>
          </div>
          {subtext && <p className="mt-1 text-xs text-stone-500">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, loading, error, empty, emptyMessage }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#1B4F72]" />}
        <h3 className="text-sm font-semibold text-[#0D2137]">{title}</h3>
      </div>
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="w-5 h-5 animate-spin text-[#1B4F72]" />
            <span className="ml-2 text-sm text-stone-500">Loading…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-sm text-stone-600">Unable to load civic insights.</p>
            <p className="text-xs text-stone-400 mt-1">Please try again.</p>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <BarChart2 className="w-8 h-8 text-stone-300 mb-2" />
            <p className="text-sm text-stone-500">{emptyMessage || 'No civic activity found for the selected period.'}</p>
          </div>
        ) : children}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0D2137] text-white px-3 py-2 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-[#D99A00] mb-1">{label}</p>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState({ overview: true, trends: true, categories: true, status: true, geography: true, alerts: true });
  const [error, setError]   = useState({});
  const [data, setData]     = useState({ overview: null, trends: [], categories: [], status: [], geography: [], alerts: null });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const rangeId = useId();

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const params = { range };

    const fetchSection = async (key, apiFn) => {
      setLoading((prev) => ({ ...prev, [key]: true }));
      setError((prev) => ({ ...prev, [key]: null }));
      try {
        const res = await apiFn(params);
        setData((prev) => {
          const val = res.data ?? res;
          return { ...prev, [key]: val };
        });
      } catch (err) {
        setError((prev) => ({ ...prev, [key]: err.message || 'Failed to load.' }));
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
    };

    await Promise.all([
      fetchSection('overview',   (p) => analyticsApi.getOverview(p)),
      fetchSection('trends',     (p) => analyticsApi.getReportTrends(p).then((r) => r.data?.trends ?? [])),
      fetchSection('categories', (p) => analyticsApi.getCategoryStats(p).then((r) => r.data?.categories ?? [])),
      fetchSection('status',     (p) => analyticsApi.getStatusStats(p).then((r) => r.data?.statuses ?? [])),
      fetchSection('geography',  (p) => analyticsApi.getGeographyStats(p).then((r) => r.data?.geography ?? [])),
      fetchSection('alerts',     (p) => analyticsApi.getAlertStats(p))
    ]);

    setLastUpdated(new Date());
    setRefreshing(false);
  }, [range]);

  useEffect(() => { fetchAll(false); }, [fetchAll]);

  // Flatten data structures from API responses
  const overviewData = data.overview?.data ?? data.overview ?? null;
  const trendsData   = Array.isArray(data.trends)     ? data.trends     : (data.trends?.data?.trends ?? []);
  const catData      = Array.isArray(data.categories) ? data.categories : (data.categories?.data?.categories ?? []);
  const statusData   = Array.isArray(data.status)     ? data.status     : (data.status?.data?.statuses ?? []);
  const geoData      = Array.isArray(data.geography)  ? data.geography  : (data.geography?.data?.geography ?? []);
  const alertsData   = data.alerts?.data ?? data.alerts ?? null;

  // Format period labels
  const formattedTrends = trendsData.map((item) => {
    let label = item.period;
    try {
      const d = new Date(item.period + (item.period.length === 7 ? '-01' : ''));
      label = item.period.length === 7
        ? d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
        : d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    } catch { /* keep original */ }
    return { ...item, label };
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Page Header */}
      <div className="bg-[#0D2137] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 className="w-5 h-5 text-[#D99A00]" />
                <span className="text-xs font-semibold text-[#D99A00] uppercase tracking-widest">Civic Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif">CivicWatch Insights</h1>
              <p className="mt-1 text-stone-300 text-sm">
                Aggregated civic activity, trends, and public service intelligence for Kenya.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-stone-400">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => fetchAll(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Refresh insights data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor={rangeId} className="text-xs text-stone-400 font-medium shrink-0">Time period:</label>
              <div className="relative">
                <select
                  id={rangeId}
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="appearance-none bg-white/10 border border-white/20 text-white text-xs rounded-lg pl-3 pr-7 py-2 focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                >
                  {RANGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-[#0D2137]">{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60 pointer-events-none" />
              </div>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-stone-400 bg-white/5 px-2 py-1 rounded">
                🔒 All data is aggregated — no personal information is shown
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Overview KPI Cards */}
        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Overview</h2>
          {loading.overview ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-stone-200 h-24 animate-pulse bg-stone-100" />
              ))}
            </div>
          ) : error.overview ? (
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
              <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-stone-600">Unable to load overview statistics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Reports"
                value={overviewData?.total_reports}
                subtext={`${overviewData?.active_reports ?? 0} active`}
                icon={FileText}
                colorScheme="navy"
              />
              <StatCard
                title="Resolved Reports"
                value={overviewData?.resolved_reports}
                subtext="Closed cases"
                icon={CheckCircle2}
                colorScheme="emerald"
              />
              <StatCard
                title="Active Alerts"
                value={overviewData?.active_alerts}
                subtext="Current public alerts"
                icon={Bell}
                colorScheme="gold"
              />
              <StatCard
                title="In Progress"
                value={overviewData?.in_progress_reports}
                subtext="Being addressed"
                icon={Clock}
                colorScheme="amber"
              />
            </div>
          )}
        </section>

        {/* Report Trends Chart */}
        <SectionCard
          title="Report Submissions Over Time"
          icon={TrendingUp}
          loading={loading.trends}
          error={error.trends}
          empty={!loading.trends && !error.trends && formattedTrends.length === 0}
        >
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#1B4F72" strokeWidth={2.5} fill="#1B4F72" fillOpacity={0.12}
                  activeDot={{ r: 5, fill: '#1B4F72', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#27AE60" strokeWidth={2} fill="#27AE60" fillOpacity={0.08}
                  activeDot={{ r: 4, fill: '#27AE60', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Category + Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Reports by Category */}
          <SectionCard
            title="Reports by Category"
            icon={BarChart2}
            loading={loading.categories}
            error={error.categories}
            empty={!loading.categories && !error.categories && catData.length === 0}
          >
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData.filter((c) => c.count > 0)} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="category_name" tick={{ fill: '#374151', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Reports" radius={[0, 4, 4, 0]}>
                    {catData.filter((c) => c.count > 0).map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* Reports by Status */}
          <SectionCard
            title="Reports by Status"
            icon={CheckCircle2}
            loading={loading.status}
            error={error.status}
            empty={!loading.status && !error.status && statusData.length === 0}
          >
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={2}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [Number(value).toLocaleString(), name]} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-stone-600">{value}</span>}
                    iconSize={10}
                    wrapperStyle={{ paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* Geographic Activity */}
        <SectionCard
          title="Geographic Activity by County"
          icon={MapPin}
          loading={loading.geography}
          error={error.geography}
          empty={!loading.geography && !error.geography && geoData.length === 0}
          emptyMessage="No geographic data available for the selected period. (Minimum 5 reports required per county for public display.)"
        >
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="county" tick={{ fill: '#374151', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Reports" fill="#1B4F72" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-stone-400 text-center">
            Counties with fewer than 5 reports are excluded to protect citizen privacy.
          </p>
        </SectionCard>

        {/* Alert Statistics */}
        <SectionCard
          title="Public Alert Statistics"
          icon={Bell}
          loading={loading.alerts}
          error={error.alerts}
          empty={!loading.alerts && !error.alerts && !alertsData}
        >
          {alertsData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Alerts', value: alertsData.total, color: 'text-[#1B4F72]' },
                  { label: 'Active', value: alertsData.active, color: 'text-emerald-600' },
                  { label: 'Expired', value: alertsData.expired, color: 'text-stone-500' },
                  { label: 'Archived', value: alertsData.archived, color: 'text-stone-400' }
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <p className={`text-2xl font-bold font-serif ${item.color}`}>{item.value ?? 0}</p>
                    <p className="text-xs text-stone-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              {alertsData.by_severity && alertsData.by_severity.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">By Severity</p>
                  <div className="flex flex-wrap gap-2">
                    {alertsData.by_severity.map((s) => (
                      <span key={s.severity} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-100 text-stone-700 rounded-full">
                        {s.severity} <span className="font-bold text-[#0D2137]">{s.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Privacy Notice */}
        <div className="bg-[#0D2137]/5 border border-[#0D2137]/10 rounded-xl p-4 text-center">
          <p className="text-xs text-stone-600">
            <span className="font-semibold text-[#0D2137]">Privacy Notice:</span>{' '}
            All data shown is aggregated and anonymised. No individual citizen information, private report details,
            exact addresses, or personal identifiers are included in these insights.
          </p>
        </div>

      </div>
    </div>
  );
}
