import React, { useState, useEffect, useCallback, useId } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ChevronDown
} from 'lucide-react';
import { adminApi } from '../../services/api';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import ReportTrendChart from '../../components/admin/ReportTrendChart';
import ReportCategoryChart from '../../components/admin/ReportCategoryChart';
import ReportStatusChart from '../../components/admin/ReportStatusChart';
import ReportCountyChart from '../../components/admin/ReportCountyChart';

// Range options available for filtering dashboard data
const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'year', label: 'This year' },
  { value: 'all', label: 'All time' }
];

// Helpers to derive stat card sub-values
function getResolvedCount(byStatus) {
  if (!byStatus) return 0;
  return (Number(byStatus['Resolved']) || 0) + (Number(byStatus['Closed']) || 0);
}

function getActiveCount(byStatus) {
  if (!byStatus) return 0;
  return (
    (Number(byStatus['Submitted']) || 0) +
    (Number(byStatus['Under Review']) || 0) +
    (Number(byStatus['Verified']) || 0) +
    (Number(byStatus['Assigned']) || 0) +
    (Number(byStatus['In Progress']) || 0)
  );
}

export default function AdminDashboardPage() {
  const outletContext = useOutletContext();
  const onFeaturePreview = outletContext?.onFeaturePreview;

  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const rangeSelectId = useId();

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const result = await adminApi.getDashboardSummary({ range });
        setData(result.data);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const handleRangeChange = (e) => {
    setRange(e.target.value);
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const totalReports = data?.total_reports ?? 0;
  const totalUsers = data?.users?.total ?? 0;
  const resolvedCount = getResolvedCount(data?.reports_by_status);
  const activeCount = getActiveCount(data?.reports_by_status);
  const resolutionRate =
    totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">

      {/* Page Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Nationwide civic incident surveillance · Open Civic Lab Kenya
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Selector */}
          <div className="relative">
            <label htmlFor={rangeSelectId} className="sr-only">
              Date range
            </label>
            <div className="flex items-center">
              <Clock className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <select
                id={rangeSelectId}
                value={range}
                onChange={handleRangeChange}
                className="appearance-none pl-9 pr-8 py-2 text-sm font-medium text-navy-900 bg-white border border-stone-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
              >
                {RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-navy-900 bg-white border border-stone-300 rounded-xl shadow-sm hover:bg-stone-50 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin text-gold-600' : ''}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Last updated note */}
      {lastUpdated && !loading && (
        <p className="text-[11px] text-stone-400">
          Last refreshed:{' '}
          {lastUpdated.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to load dashboard data</p>
            <p className="mt-0.5 text-xs text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => fetchData(false)}
              className="mt-2 text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton for Stat Cards */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-stone-200 h-28 border-l-4 border-l-stone-200"
            >
              <div className="h-3 bg-stone-100 rounded w-24 mb-3" />
              <div className="h-8 bg-stone-100 rounded w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Summary Stat Cards */}
      {!loading && !error && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminStatCard
            title="Total Incident Reports"
            value={totalReports}
            subtext={`${RANGE_OPTIONS.find((o) => o.value === range)?.label ?? range}`}
            icon={FileText}
            colorScheme="navy"
          />
          <AdminStatCard
            title="Active Incidents"
            value={activeCount}
            subtext="Submitted through In Progress"
            icon={AlertTriangle}
            colorScheme="amber"
          />
          <AdminStatCard
            title="Resolved & Closed"
            value={resolvedCount}
            subtext={`${resolutionRate}% resolution rate`}
            icon={CheckCircle2}
            colorScheme="emerald"
          />
          <AdminStatCard
            title="Registered Users"
            value={totalUsers}
            subtext={`${data.users?.citizens ?? 0} citizens · ${
              (data.users?.admins ?? 0) +
              (data.users?.moderators ?? 0) +
              (data.users?.analysts ?? 0)
            } staff`}
            icon={Users}
            colorScheme="blue"
          />
        </div>
      )}

      {/* Charts Section */}
      {!loading && !error && data && (
        <div id="analytics-section" className="space-y-6">

          {/* Row 1: Trend + Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports Over Time */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-navy-900 mb-1">
                Incident Submissions Over Time
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Daily report volumes for selected period
              </p>
              <ReportTrendChart data={data.reports_over_time} />
            </div>

            {/* Reports by Status */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-navy-900 mb-1">
                Reports by Lifecycle Status
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Distribution across all 8 lifecycle stages
              </p>
              <ReportStatusChart data={data.reports_by_status} />
            </div>
          </div>

          {/* Row 2: Categories + County */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports by Category */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-navy-900 mb-1">
                Reports by Category
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Incident type breakdown across all 12 civic categories
              </p>
              <ReportCategoryChart data={data.reports_by_category} />
            </div>

            {/* Top Counties */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-navy-900 mb-1">
                Top Reporting Counties
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Top 10 counties by report volume
              </p>
              <ReportCountyChart data={data.reports_by_county} />
            </div>
          </div>

          {/* User Breakdown Table */}
          {data.users && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-navy-900 mb-4">
                User Account Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  {
                    label: 'Total Accounts',
                    value: data.users.total,
                    color: 'border-navy-900 text-navy-900'
                  },
                  {
                    label: 'Citizens',
                    value: data.users.citizens,
                    color: 'border-stone-400 text-stone-700'
                  },
                  {
                    label: 'Admins',
                    value: data.users.admins,
                    color: 'border-purple-500 text-purple-700'
                  },
                  {
                    label: 'Moderators',
                    value: data.users.moderators,
                    color: 'border-blue-500 text-blue-700'
                  },
                  {
                    label: 'Analysts',
                    value: data.users.analysts,
                    color: 'border-emerald-500 text-emerald-700'
                  }
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className={`rounded-xl border-l-4 ${color} bg-stone-50 border border-stone-200 p-4`}
                  >
                    <p className="text-xs font-medium text-stone-500">{label}</p>
                    <p className={`text-2xl font-bold font-serif mt-0.5 ${color.split(' ')[1]}`}>
                      {value ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Empty state if no data at all */}
      {!loading && !error && !data && (
        <AdminEmptyState
          title="No dashboard data"
          description="Could not load summary data. Check your connection and try again."
          actionText="Retry"
          onAction={() => fetchData(false)}
        />
      )}
    </div>
  );
}
