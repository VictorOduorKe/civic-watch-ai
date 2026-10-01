import React from 'react';
import { History, ShieldAlert, FileText } from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * Recent Activity Section displaying an honest empty state for Milestone 3.
 */
export default function RecentActivity({ onReportClick }) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-navy-900" />
          <h3 className="text-sm font-bold text-neutral-900">
            Recent Civic Activity
          </h3>
        </div>
        <span className="text-[11px] font-medium text-stone-500">
          Last 30 Days
        </span>
      </div>

      <div className="py-2">
        <EmptyState
          icon={FileText}
          badgeText="No Records Found"
          title="No recent activity yet"
          description="Your submitted reports, status progression updates, and civic engagements will be recorded here chronologically as you use CivicWatch AI Kenya."
          actionLabel="View Reporting Workflow (M4)"
          onAction={onReportClick}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
        <span>Activity tracking integrates in Milestone 4 & 5</span>
        <span className="font-medium text-navy-900">0 events recorded</span>
      </div>
    </div>
  );
}
