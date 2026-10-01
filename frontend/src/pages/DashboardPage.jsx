import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  ShieldCheck,
  Radio,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reportApi } from '../services/api';
import CitizenLayout from '../layouts/CitizenLayout';
import StatCard from '../components/dashboard/StatCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import CivicInfoCard from '../components/dashboard/CivicInfoCard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    submitted: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await reportApi.getMyStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.warn('[Dashboard] Could not load user report stats:', err.message);
      }
    }
    if (user) {
      loadStats();
    }
  }, [user]);

  if (loading) {
    return (
      <CitizenLayout>
        {() => (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-8 h-8 border-4 border-navy-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-stone-600">
              Loading your citizen workspace...
            </p>
          </div>
        )}
      </CitizenLayout>
    );
  }

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Citizen';

  return (
    <CitizenLayout>
      {({ onFeaturePreview }) => (
        <div className="space-y-6 sm:space-y-8 animate-fadeIn">
          {/* Top Welcome Banner */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-green-50 text-green-800 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5"></span>
                    Verified {user?.role || 'Citizen'}
                  </span>
                  {user?.county && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                      <MapPin className="w-3 h-3 text-gold-600" />
                      <span>{user.county} County</span>
                      {user.ward && <span>• {user.ward} Ward</span>}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight">
                  Welcome back, {firstName}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                  Stay informed, participate in civic life, and keep track of the issues you raise across your community.
                </p>
              </div>

              {/* Action Button for Milestone 4 Incident Reporting */}
              <div className="shrink-0">
                <Link
                  to="/reports/new"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-950 transition-colors shadow-xs border-b-2 border-gold-500"
                >
                  <PlusCircle className="w-4 h-4 text-gold-400" />
                  <span>Report an Issue (M4)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Overview Statistics (Real database counts) */}
          <section aria-labelledby="stats-heading">
            <div className="flex items-center justify-between mb-3">
              <h3 id="stats-heading" className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                My Reports Overview
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">
                Real database counts • No simulated data
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Reports Submitted"
                count={stats.submitted}
                subtext={stats.submitted === 0 ? "No reports submitted yet" : `${stats.submitted} record(s) recorded in MySQL`}
                icon={FileText}
                statusColor="stone"
              />
              <StatCard
                title="Under Review"
                count={stats.underReview}
                subtext="Zero pending review"
                icon={Clock}
                statusColor="amber"
              />
              <StatCard
                title="In Progress"
                count={stats.inProgress}
                subtext="Active investigations"
                icon={AlertCircle}
                statusColor="blue"
              />
              <StatCard
                title="Resolved"
                count={stats.resolved}
                subtext="Community issues resolved"
                icon={CheckCircle}
                statusColor="green"
              />
            </div>
          </section>

          {/* Section: Quick Actions */}
          <section aria-labelledby="quick-actions-heading">
            <div className="flex items-center justify-between mb-3">
              <h3 id="quick-actions-heading" className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Civic Quick Actions
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">
                Milestone Roadmap Previews
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                title="Report an Issue"
                description="Submit community infrastructure or service delivery challenges directly to county oversight."
                milestone="Active (M4)"
                icon={PlusCircle}
                onClick={() => navigate('/reports/new')}
              />

              <QuickActionCard
                title="View My Reports"
                description="Track status progression, official responses, and resolution timelines for your submitted cases."
                milestone="M5 Preview"
                icon={FileText}
                onClick={() =>
                  onFeaturePreview({
                    title: 'Report Tracking & Status Hub',
                    milestone: 'Milestone 5',
                    icon: <FileText className="w-5 h-5 text-gold-500" />,
                    description:
                      'Milestone 5 establishes the citizen tracking dashboard. Filter by status, inspect response logs from local leaders, and share public case updates.',
                    plannedCapabilities: [
                      'Chronological timeline of investigation steps',
                      'Direct public official response logs',
                      'Community validation upvotes and corroborations',
                      'PDF export for ward barazas and community meetings'
                    ]
                  })
                }
              />

              <QuickActionCard
                title="Verify Information"
                description="Use AI fact-checking grounded in official gazettes, laws, and verified civic databases."
                milestone="M9 Preview"
                icon={ShieldCheck}
                onClick={() =>
                  onFeaturePreview({
                    title: 'AI Civic Verification Engine',
                    milestone: 'Milestone 9',
                    icon: <ShieldCheck className="w-5 h-5 text-gold-500" />,
                    description:
                      'Milestone 9 connects Gemini AI to Kenyan legal frameworks, County Integrated Development Plans (CIDP), and gazetted notices to verify claims and dispel misinformation.',
                    plannedCapabilities: [
                      'Constitution of Kenya 2010 cross-referencing',
                      'County budget and project verification',
                      'Automated claim veracity scoring with citations',
                      'Public myth-busting civic registry'
                    ]
                  })
                }
              />

              <QuickActionCard
                title="View Civic Alerts"
                description="Monitor urgent public advisories, service interruptions, and county health notifications."
                milestone="M11 Preview"
                icon={Radio}
                onClick={() =>
                  onFeaturePreview({
                    title: 'Civic Alerts & Public Advisories',
                    milestone: 'Milestone 11',
                    icon: <Radio className="w-5 h-5 text-gold-500" />,
                    description:
                      'Milestone 11 integrates county emergency networks and public utility boards to broadcast real-time localized advisories and infrastructure downtime notices.',
                    plannedCapabilities: [
                      'Geo-targeted county alerts (Floods, water rationing, road closures)',
                      'Emergency hotline directory with verified response numbers',
                      'Community safety advisories vetted by civil society',
                      'SMS and browser push subscription options'
                    ]
                  })
                }
              />
            </div>
          </section>

          {/* Section: Activity & Educational Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity
              onReportClick={() => navigate('/reports/new')}
            />

            <CivicInfoCard />
          </div>
        </div>
      )}
    </CitizenLayout>
  );
}
