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
import HealthStatusPage from './pages/HealthStatusPage';

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
            {/* In-App Notifications (Milestone 8) */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* OCL Admin Workspace (Milestone 6, 7, 8) — restricted to Admin, Moderator, Analyst */}
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
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
