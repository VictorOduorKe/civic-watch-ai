import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import IncidentListPage from './pages/admin/IncidentListPage';
import IncidentDetailPage from './pages/admin/IncidentDetailPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NewReportPage from './pages/NewReportPage';
import MyReportsPage from './pages/MyReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import VerifyInformationPage from './pages/verification/VerifyInformationPage';
import VerificationHistoryPage from './pages/verification/VerificationHistoryPage';
import VerificationDetailPage from './pages/verification/VerificationDetailPage';
import AlertsFeedPage from './pages/alerts/AlertsFeedPage';
import AlertDetailPage from './pages/alerts/AlertDetailPage';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import HealthStatusPage from './pages/HealthStatusPage';
import RoadmapPage from './pages/roadmap/RoadmapPage';
import InsightsPage from './pages/InsightsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import SourcesPage from './pages/SourcesPage';
import AdminVerificationPage from './pages/admin/AdminVerificationPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import PetitionsPage from './pages/PetitionsPage';
import PetitionDetailPage from './pages/PetitionDetailPage';
import BudgetHearingsPage from './pages/BudgetHearingsPage';
import LegislativeFeedbackPage from './pages/LegislativeFeedbackPage';
import AdminParticipationPage from './pages/admin/AdminParticipationPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminSecurityMonitoringPage from './pages/admin/AdminSecurityMonitoringPage';
import AdminGovernancePage from './pages/admin/AdminGovernancePage';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/status" element={<HealthStatusPage />} />
            <Route path="/health" element={<HealthStatusPage />} />

            {/* Authenticated Citizen Workspace (Milestones 3, 4, 5) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <MyReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/new"
              element={
                <ProtectedRoute>
                  <NewReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/:reference"
              element={
                <ProtectedRoute>
                  <ReportDetailPage />
                </ProtectedRoute>
              }
            />
            {/* In-App Notifications & Citizen Subscriptions (Milestone 8 & 13) */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications/settings"
              element={
                <ProtectedRoute>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <ProtectedRoute>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* AI Information Verification (Milestone 9) */}
            <Route
              path="/verify"
              element={
                <ProtectedRoute>
                  <VerifyInformationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify/history"
              element={
                <ProtectedRoute>
                  <VerificationHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify/:id"
              element={
                <ProtectedRoute>
                  <VerificationDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Civic Alerts & Advisories (Milestone 11) — Public & Citizen Accessible */}
            <Route path="/alerts" element={<AlertsFeedPage />} />
            <Route path="/alerts/:id" element={<AlertDetailPage />} />

            {/* Platform Roadmap & Human Approval Gate (ROADMAP 1) */}
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/milestones" element={<RoadmapPage />} />

            {/* Civic Intelligence & Insights (Milestone 12) — Public */}
            <Route path="/insights" element={<InsightsPage />} />

            {/* Verification & Trust Layer Sources Directory (Milestone 14) — Public */}
            <Route path="/sources" element={<SourcesPage />} />

            {/* Civic Participation & Petitions (Milestone 15) */}
            <Route
              path="/participate/petitions"
              element={
                <ProtectedRoute>
                  <PetitionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/participate/petitions/:id"
              element={
                <ProtectedRoute>
                  <PetitionDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/participate/hearings"
              element={
                <ProtectedRoute>
                  <BudgetHearingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/participate/legislative"
              element={
                <ProtectedRoute>
                  <LegislativeFeedbackPage />
                </ProtectedRoute>
              }
            />

            {/* OCL Admin Workspace (Milestone 6, 7, 8, 11, 12, 14, ROADMAP 1) — restricted to Admin, Moderator, Analyst */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="incidents" element={<IncidentListPage />} />
              <Route path="incidents/:reference" element={<IncidentDetailPage />} />
              <Route path="alerts" element={<AdminAlertsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="verification" element={<AdminVerificationPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="participation" element={<AdminParticipationPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="audit" element={<AdminAuditPage />} />
              <Route path="security-monitoring" element={<AdminSecurityMonitoringPage />} />
              <Route path="governance" element={<AdminGovernancePage />} />
              <Route path="settings" element={<AdminGovernancePage />} />
              <Route path="roadmap" element={<RoadmapPage isAdminWorkspace={true} />} />
              <Route path="milestones" element={<RoadmapPage isAdminWorkspace={true} />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
