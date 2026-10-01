import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import AdminEmptyState from './AdminEmptyState';

export default function ReportTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <AdminEmptyState
        title="No incident submissions"
        description="No reports recorded in the selected period."
      />
    );
  }

  // Format the date label for X-axis (e.g. "Sep 28" or "2026-09-28")
  const formattedData = data.map((item) => {
    let dateStr = item.date;
    try {
      const d = new Date(item.date);
      dateStr = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    } catch {
      dateStr = item.date;
    }
    return {
      ...item,
      displayDate: dateStr,
      count: Number(item.count) || 0
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-950 text-white p-3 rounded-lg shadow-xl border border-navy-800 text-xs">
          <p className="font-semibold text-gold-400">{label}</p>
          <p className="mt-1">
            <span className="text-stone-300">Submissions: </span>
            <span className="font-bold text-white text-sm">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="displayDate"
            tick={{ fill: '#6B7280', fontSize: 11 }}
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
          <Area
            type="monotone"
            dataKey="count"
            stroke="#D99A00"
            strokeWidth={2.5}
            fill="#D99A00"
            fillOpacity={0.15}
            activeDot={{ r: 6, fill: '#D99A00', stroke: '#FFFFFF', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
