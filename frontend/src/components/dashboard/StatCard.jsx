import React from 'react';

/**
 * Summary Stat Card displaying honest, real zero counts without simulated numbers.
 */
export default function StatCard({ title, count = 0, subtext, icon: Icon, statusColor = 'stone' }) {
  const colorMap = {
    stone: 'bg-stone-100 text-stone-700 border-stone-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    blue: 'bg-sky-50 text-sky-900 border-sky-200',
    green: 'bg-green-50 text-green-900 border-green-200',
    emerald: 'bg-green-50 text-green-900 border-green-200',
    gold: 'bg-gold-50 text-gold-900 border-gold-200',
    navy: 'bg-navy-50 text-navy-900 border-navy-200'
  };

  const badgeMap = {
    stone: 'bg-stone-200 text-stone-700',
    amber: 'bg-amber-100 text-amber-800',
    blue: 'bg-sky-100 text-sky-800',
    green: 'bg-green-100 text-green-800',
    emerald: 'bg-green-100 text-green-800',
    gold: 'bg-gold-100 text-gold-900',
    navy: 'bg-navy-100 text-navy-900'
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${colorMap[statusColor] || colorMap.stone}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          {count}
        </span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${badgeMap[statusColor] || badgeMap.stone}`}>
          Active
        </span>
      </div>

      <p className="mt-2 text-xs text-stone-500">
        {subtext}
      </p>
    </div>
  );
}
