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

export default function ReportCategoryChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <AdminEmptyState
        title="No categories recorded"
        description="No incident categories found in database."
      />
    );
  }

  // Map to chart items
  const chartData = data
    .map((item) => ({
      name: item.category_name,
      count: Number(item.count) || 0
    }))
    .sort((a, b) => b.count - a.count);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, count } = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-3 rounded-lg shadow-xl border border-navy-800 text-xs">
          <p className="font-semibold text-gold-400">{name}</p>
          <p className="mt-1">
            <span className="text-stone-300">Total Reports: </span>
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
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="name"
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
          <Bar
            dataKey="count"
            fill="#141F35"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
