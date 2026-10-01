import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import AdminEmptyState from './AdminEmptyState';

export default function ReportCountyChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <AdminEmptyState
        title="No county distribution"
        description="No county location data recorded for this timeframe."
      />
    );
  }

  // Take top 10 counties
  const chartData = data
    .slice(0, 10)
    .map((item) => ({
      county: item.county || 'Unspecified',
      count: Number(item.count) || 0
    }))
    .reverse(); // For horizontal layout top-to-bottom

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { county, count } = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-3 rounded-lg shadow-xl border border-navy-800 text-xs">
          <p className="font-semibold text-gold-400">{county} County</p>
          <p className="mt-1">
            <span className="text-stone-300">Incident Reports: </span>
            <span className="font-bold text-white text-sm">{count}</span>
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
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 20, left: 45, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            dataKey="county"
            type="category"
            tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="#D99A00"
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
