import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import AdminEmptyState from './AdminEmptyState';

const STATUS_COLORS = {
  'Submitted': '#D97706',      // amber-600
  'Under Review': '#2563EB',   // blue-600
  'Verified': '#7C3AED',       // purple-600
  'Assigned': '#0891B2',       // cyan-600
  'In Progress': '#4F46E5',    // indigo-600
  'Resolved': '#059669',       // emerald-600
  'Closed': '#4B5563',         // stone-600
  'Rejected': '#E11D48'        // rose-600
};

export default function ReportStatusChart({ data = {} }) {
  const chartData = Object.entries(data).map(([status, count]) => ({
    status,
    count: Number(count) || 0,
    color: STATUS_COLORS[status] || '#141F35'
  }));

  const totalCount = chartData.reduce((acc, curr) => acc + curr.count, 0);

  if (totalCount === 0 && chartData.length === 0) {
    return (
      <AdminEmptyState
        title="No status data"
        description="No status records found in database."
      />
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { status, count, color } = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-3 rounded-lg shadow-xl border border-navy-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            <p className="font-semibold text-white">{status}</p>
          </div>
          <p className="mt-1">
            <span className="text-stone-300">Count: </span>
            <span className="font-bold text-gold-400 text-sm">{count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="status"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
