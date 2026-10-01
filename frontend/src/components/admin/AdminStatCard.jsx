import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function AdminStatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  colorScheme = 'navy',
  onClick
}) {
  const getColorStyles = () => {
    switch (colorScheme) {
      case 'gold':
        return {
          iconBg: 'bg-gold-50 border-gold-200 text-gold-700',
          accent: 'border-l-gold-500'
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50 border-blue-200 text-blue-700',
          accent: 'border-l-blue-500'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 border-amber-200 text-amber-700',
          accent: 'border-l-amber-500'
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          accent: 'border-l-emerald-500'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 border-purple-200 text-purple-700',
          accent: 'border-l-purple-500'
        };
      case 'navy':
      default:
        return {
          iconBg: 'bg-navy-50 border-navy-200 text-navy-900',
          accent: 'border-l-navy-900'
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-stone-200 shadow-sm border-l-4 ${
        styles.accent
      } ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-navy-900 font-serif">
              {value !== undefined && value !== null ? value.toLocaleString() : '—'}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold ${
                  trend > 0
                    ? 'text-emerald-600'
                    : trend < 0
                    ? 'text-rose-600'
                    : 'text-stone-500'
                }`}
              >
                {trend > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : trend < 0 ? (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1 text-xs text-stone-500">{subtext}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${styles.iconBg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
