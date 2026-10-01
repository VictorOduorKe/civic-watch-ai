import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AdminEmptyState({
  title = 'No data available',
  description = 'There are no records matching your selected timeframe.',
  icon: Icon = BarChart3,
  actionText,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-300">
      <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-navy-900">{title}</h4>
      <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-3.5 py-1.5 text-xs font-semibold text-navy-900 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
