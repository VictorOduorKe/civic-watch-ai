import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Shared Axios client instance with standard security defaults.
 * Configured with withCredentials: true for HttpOnly cookie authentication
 * and Double-Submit CSRF token header attachments.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach CSRF token header from client-readable XSRF-TOKEN cookie
apiClient.interceptors.request.use(
  (config) => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
      if (match && !config.headers['X-XSRF-TOKEN']) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(match[1]);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for standardized error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    const formattedError = {
      message,
      status: error.response?.status || 500,
      data: error.response?.data || null,
      errors: error.response?.data?.errors || null
    };
    return Promise.reject(formattedError);
  }
);

/**
 * Authentication API methods.
 * Operates purely via HttpOnly cookies and safe user JSON; never touches localStorage.
 */
export const authApi = {
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async getCsrfToken() {
    const response = await apiClient.get('/auth/csrf-token');
    return response.data;
  }
};

/**
 * Incident Reporting API methods (Milestone 4).
 */
export const reportApi = {
  async getCategories() {
    const response = await apiClient.get('/reports/categories');
    return response.data;
  },

  async createReport(formData) {
    const response = await apiClient.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async getMyStats() {
    const response = await apiClient.get('/reports/stats/me');
    return response.data;
  },

  /**
   * Milestone 5: Retrieve paginated reports for authenticated citizen
   */
  async getMyReports(params = {}) {
    const response = await apiClient.get('/reports/my', { params });
    return response.data;
  },

  /**
   * Milestone 5: Retrieve real database summary breakdown of citizen report statuses
   */
  async getMySummary() {
    const response = await apiClient.get('/reports/my/summary');
    return response.data;
  },

  /**
   * Milestone 5: Retrieve full details, attachments metadata, and visible timeline of an owned report
   */
  async getMyReportDetail(reference) {
    const response = await apiClient.get(`/reports/my/${encodeURIComponent(reference)}`);
    return response.data;
  },

  /**
   * Milestone 5: Securely fetch and trigger browser download of an owned attachment
   */
  async downloadAttachment(reference, attachmentId, filename) {
    const response = await apiClient.get(
      `/reports/my/${encodeURIComponent(reference)}/attachments/${encodeURIComponent(attachmentId)}`,
      { responseType: 'blob' }
    );
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'attachment';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};

/**
 * Administrative OCL API methods (Milestone 6).
 */
export const adminApi = {
  async getDashboardSummary(params = {}) {
    const response = await apiClient.get('/admin/dashboard/summary', { params });
    return response.data;
  }
};

/**
 * Administrative Incident Management API methods (Milestone 7).
 */
export const adminIncidentApi = {
  async listIncidents(params = {}) {
    const response = await apiClient.get('/admin/incidents', { params });
    return response.data;
  },
  async getAssignees() {
    const response = await apiClient.get('/admin/incidents/assignees');
    return response.data;
  },
  async getIncidentDetail(reference) {
    const response = await apiClient.get(`/admin/incidents/${encodeURIComponent(reference)}`);
    return response.data;
  },
  async updateStatus(reference, data) {
    const response = await apiClient.patch(`/admin/incidents/${encodeURIComponent(reference)}/status`, data);
    return response.data;
  },
  async assignIncident(reference, data) {
    const response = await apiClient.post(`/admin/incidents/${encodeURIComponent(reference)}/assign`, data);
    return response.data;
  },
  async unassignIncident(reference, data = {}) {
    const response = await apiClient.post(`/admin/incidents/${encodeURIComponent(reference)}/unassign`, data);
    return response.data;
  },
  async addInternalNote(reference, data) {
    const response = await apiClient.post(`/admin/incidents/${encodeURIComponent(reference)}/internal-notes`, data);
    return response.data;
  },
  async addCitizenUpdate(reference, data) {
    const response = await apiClient.post(`/admin/incidents/${encodeURIComponent(reference)}/updates`, data);
    return response.data;
  },
  async createReferral(reference, data) {
    const response = await apiClient.post(`/admin/incidents/${encodeURIComponent(reference)}/referrals`, data);
    return response.data;
  },
  async updateReferralStatus(reference, referralId, data) {
    const response = await apiClient.patch(
      `/admin/incidents/${encodeURIComponent(reference)}/referrals/${encodeURIComponent(referralId)}`,
      data
    );
    return response.data;
  },
  async downloadAttachment(reference, attachmentId, filename) {
    const response = await apiClient.get(
      `/admin/incidents/${encodeURIComponent(reference)}/attachments/${encodeURIComponent(attachmentId)}`,
      { responseType: 'blob' }
    );
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'attachment';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};

/**
 * Public & Citizen Civic Alerts & Advisories API (Milestone 11)
 */
export const alertApi = {
  async getPublicAlerts(params = {}) {
    const response = await apiClient.get('/alerts', { params });
    return response.data;
  },
  async getPublicAlertById(id) {
    const response = await apiClient.get(`/alerts/${id}`);
    return response.data;
  },
  async submitCommunityAdvisory(data) {
    const response = await apiClient.post('/alerts/community', data);
    return response.data;
  }
};

/**
 * Administrative Civic Alerts & Advisories API (Milestone 11)
 */
export const adminAlertApi = {
  async getAlertSummary() {
    const response = await apiClient.get('/admin/alerts/summary');
    return response.data;
  },
  async getAdminAlerts(params = {}) {
    const response = await apiClient.get('/admin/alerts', { params });
    return response.data;
  },
  async getAdminAlertById(id) {
    const response = await apiClient.get(`/admin/alerts/${id}`);
    return response.data;
  },
  async createAlert(data) {
    const response = await apiClient.post('/admin/alerts', data);
    return response.data;
  },
  async updateAlert(id, data) {
    const response = await apiClient.put(`/admin/alerts/${id}`, data);
    return response.data;
  },
  async verifyAlert(id, data) {
    const response = await apiClient.post(`/admin/alerts/${id}/verify`, data);
    return response.data;
  },
  async publishAlert(id, data = {}) {
    const response = await apiClient.post(`/admin/alerts/${id}/publish`, data);
    return response.data;
  },
  async archiveAlert(id, data = {}) {
    const response = await apiClient.post(`/admin/alerts/${id}/archive`, data);
    return response.data;
  }
};

/**
 * Milestone Roadmap & Human Approval Gate API methods.
 */
export const milestoneApi = {
  async getRoadmap() {
    const response = await apiClient.get('/milestones');
    return response.data;
  },
  async getMilestoneDetails(id) {
    const response = await apiClient.get(`/milestones/${id}`);
    return response.data;
  }
};

export const adminMilestoneApi = {
  async getRoadmap() {
    const response = await apiClient.get('/admin/milestones');
    return response.data;
  },
  async getMilestoneDetails(id) {
    const response = await apiClient.get(`/admin/milestones/${id}`);
    return response.data;
  },
  async approveMilestone(id, data = {}) {
    const response = await apiClient.post(`/admin/milestones/${id}/approve`, data);
    return response.data;
  },
  async rejectMilestone(id, data) {
    const response = await apiClient.post(`/admin/milestones/${id}/reject`, data);
    return response.data;
  },
  async reportRegression(id, data) {
    const response = await apiClient.post(`/admin/milestones/${id}/regression`, data);
    return response.data;
  },
  async updateMilestoneDefinition(id, data) {
    const response = await apiClient.put(`/admin/milestones/${id}`, data);
    return response.data;
  }
};

/**
 * M12 — Civic Intelligence & Insights: Public Analytics API
 */
export const analyticsApi = {
  async getOverview(params = {}) {
    const response = await apiClient.get('/analytics/overview', { params });
    return response.data;
  },
  async getReportTrends(params = {}) {
    const response = await apiClient.get('/analytics/reports', { params });
    return response.data;
  },
  async getCategoryStats(params = {}) {
    const response = await apiClient.get('/analytics/reports/categories', { params });
    return response.data;
  },
  async getStatusStats(params = {}) {
    const response = await apiClient.get('/analytics/reports/status', { params });
    return response.data;
  },
  async getGeographyStats(params = {}) {
    const response = await apiClient.get('/analytics/reports/geography', { params });
    return response.data;
  },
  async getAlertStats(params = {}) {
    const response = await apiClient.get('/analytics/alerts', { params });
    return response.data;
  },
  async getTrends(params = {}) {
    const response = await apiClient.get('/analytics/trends', { params });
    return response.data;
  }
};

/**
 * M12 — Civic Intelligence & Insights: Admin Analytics API
 */
export const adminAnalyticsApi = {
  async getAdminOverview(params = {}) {
    const response = await apiClient.get('/analytics/admin/overview', { params });
    return response.data;
  },
  async getAdminReportTrends(params = {}) {
    const response = await apiClient.get('/analytics/admin/reports', { params });
    return response.data;
  },
  async getAdminCategoryStats(params = {}) {
    const response = await apiClient.get('/analytics/admin/categories', { params });
    return response.data;
  },
  async getAdminStatusStats(params = {}) {
    const response = await apiClient.get('/analytics/admin/status', { params });
    return response.data;
  },
  async getAdminGeographyStats(params = {}) {
    const response = await apiClient.get('/analytics/admin/geography', { params });
    return response.data;
  },
  async getAdminAlertStats(params = {}) {
    const response = await apiClient.get('/analytics/admin/alerts', { params });
    return response.data;
  }
};

/**
 * M13 — Citizen Notifications & Subscriptions API
 */
export const subscriptionApi = {
  async getPreferences() {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },
  async updatePreferences(data) {
    const response = await apiClient.put('/notifications/preferences', data);
    return response.data;
  },
  async getSubscriptions() {
    const response = await apiClient.get('/alert-subscriptions');
    return response.data;
  },
  async createSubscription(data) {
    const response = await apiClient.post('/alert-subscriptions', data);
    return response.data;
  },
  async updateSubscription(id, data) {
    const response = await apiClient.put(`/alert-subscriptions/${id}`, data);
    return response.data;
  },
  async deleteSubscription(id) {
    const response = await apiClient.delete(`/alert-subscriptions/${id}`);
    return response.data;
  },
  async unsubscribe(data) {
    const response = await apiClient.post('/alert-subscriptions/unsubscribe', data);
    return response.data;
  }
};

/**
 * M14 — Verification & Trust Layer API
 */
export const trustApi = {
  async getSources(params = {}) {
    const response = await apiClient.get('/trust/sources', { params });
    return response.data;
  },
  async getSourceById(id) {
    const response = await apiClient.get(`/trust/sources/${id}`);
    return response.data;
  },
  async createSource(data) {
    const response = await apiClient.post('/trust/sources', data);
    return response.data;
  },
  async updateSource(id, data) {
    const response = await apiClient.put(`/trust/sources/${id}`, data);
    return response.data;
  },
  async getProvenanceDossier(entityType, entityId) {
    const response = await apiClient.get(`/trust/verify/${entityType}/${entityId}`);
    return response.data;
  },
  async getVerificationHistory(entityType, entityId) {
    const response = await apiClient.get(`/trust/verify/${entityType}/${entityId}/history`);
    return response.data;
  },
  async getVerificationReferences(entityType, entityId) {
    const response = await apiClient.get(`/trust/verify/${entityType}/${entityId}/references`);
    return response.data;
  },
  async executeVerificationAction(entityType, entityId, data) {
    const response = await apiClient.post(`/trust/verify/${entityType}/${entityId}`, data);
    return response.data;
  },
  async addReference(entityType, entityId, data) {
    const response = await apiClient.post(`/trust/verify/${entityType}/${entityId}/references`, data);
    return response.data;
  },
  async getVerificationQueue(params = {}) {
    const response = await apiClient.get('/trust/admin/queue', { params });
    return response.data;
  },
  async getVerificationStats() {
    const response = await apiClient.get('/trust/admin/stats');
    return response.data;
  }
};

/**
 * Milestone 14-1: Administrative User & Role Management API
 */
export const adminUsersApi = {
  async getUsers(params = {}) {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },
  async getUserDetails(id) {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },
  async getUserAudits(id, params = {}) {
    const response = await apiClient.get(`/admin/users/${id}/audits`, { params });
    return response.data;
  },
  async getGlobalAudits(params = {}) {
    const response = await apiClient.get('/admin/users/audits', { params });
    return response.data;
  },
  async getUserStats() {
    const response = await apiClient.get('/admin/users/stats');
    return response.data;
  },
  async updateUserRole(id, data) {
    const response = await apiClient.patch(`/admin/users/${id}/role`, data);
    return response.data;
  },
  async suspendUser(id, data) {
    const response = await apiClient.post(`/admin/users/${id}/suspend`, data);
    return response.data;
  },
  async reactivateUser(id, data = {}) {
    const response = await apiClient.post(`/admin/users/${id}/reactivate`, data);
    return response.data;
  },
  async provisionCountyLiaison(id, data) {
    const response = await apiClient.patch(`/admin/users/${id}/liaison`, data);
    return response.data;
  },
  async updateIdentityVerification(id, data) {
    const response = await apiClient.patch(`/admin/users/${id}/identity`, data);
    return response.data;
  },
  async inviteStaff(data) {
    const response = await apiClient.post('/admin/users/invite', data);
    return response.data;
  }
};

/**
 * Milestone 15 — Civic Participation & Petitions API methods
 */
export const participationApi = {
  // Petitions
  async listPetitions(params = {}) {
    const response = await apiClient.get('/participation/petitions', { params });
    return response.data;
  },
  async getPetition(id) {
    const response = await apiClient.get(`/participation/petitions/${id}`);
    return response.data;
  },
  async createPetition(data) {
    const response = await apiClient.post('/participation/petitions', data);
    return response.data;
  },
  async updatePetition(id, data) {
    const response = await apiClient.patch(`/participation/petitions/${id}`, data);
    return response.data;
  },
  async moderatePetition(id, data) {
    const response = await apiClient.post(`/participation/petitions/${id}/moderate`, data);
    return response.data;
  },
  async signPetition(id, data = {}) {
    const response = await apiClient.post(`/participation/petitions/${id}/sign`, data);
    return response.data;
  },
  async withdrawSignature(id) {
    const response = await apiClient.delete(`/participation/petitions/${id}/sign`);
    return response.data;
  },
  async getSignatures(id, params = {}) {
    const response = await apiClient.get(`/participation/petitions/${id}/signatures`, { params });
    return response.data;
  },

  // Budget Hearings
  async listHearings(params = {}) {
    const response = await apiClient.get('/participation/hearings', { params });
    return response.data;
  },
  async getHearing(id) {
    const response = await apiClient.get(`/participation/hearings/${id}`);
    return response.data;
  },
  async createHearing(data) {
    const response = await apiClient.post('/participation/hearings', data);
    return response.data;
  },
  async updateHearing(id, data) {
    const response = await apiClient.patch(`/participation/hearings/${id}`, data);
    return response.data;
  },
  async cancelHearing(id, data) {
    const response = await apiClient.post(`/participation/hearings/${id}/cancel`, data);
    return response.data;
  },

  // Legislative Items & Feedback
  async listLegislativeItems(params = {}) {
    const response = await apiClient.get('/participation/legislative-items', { params });
    return response.data;
  },
  async getLegislativeItem(id) {
    const response = await apiClient.get(`/participation/legislative-items/${id}`);
    return response.data;
  },
  async createLegislativeItem(data) {
    const response = await apiClient.post('/participation/legislative-items', data);
    return response.data;
  },
  async listFeedback(itemId, params = {}) {
    const response = await apiClient.get(`/participation/legislative-items/${itemId}/feedback`, { params });
    return response.data;
  },
  async submitFeedback(itemId, data) {
    const response = await apiClient.post(`/participation/legislative-items/${itemId}/feedback`, data);
    return response.data;
  },
  async moderateFeedback(feedbackId, data) {
    const response = await apiClient.patch(`/participation/feedback/${feedbackId}/moderate`, data);
    return response.data;
  },

  // Audits & Stats
  async getParticipationStats() {
    const response = await apiClient.get('/participation/stats');
    return response.data;
  },
  async getAudits(entityType, entityId) {
    const response = await apiClient.get('/participation/audits', { params: { entityType, entityId } });
    return response.data;
  }
};

/**
 * System Audit Logging & Compliance API methods (Milestone 16).
 */
export const auditApi = {
  async listEvents(params = {}) {
    const response = await apiClient.get('/admin/audit', { params });
    return response.data;
  },
  async getEvent(id) {
    const response = await apiClient.get(`/admin/audit/${id}`);
    return response.data;
  },
  async verifyIntegrity(params = {}) {
    const response = await apiClient.get('/admin/audit/integrity', { params });
    return response.data;
  },
  async exportEvents(data) {
    const response = await apiClient.post('/admin/audit/export', data);
    return response.data;
  }
};

/**
 * Security Intrusion Monitoring API methods (Milestone 16).
 */
export const securityMonitoringApi = {
  async listEvents(params = {}) {
    const response = await apiClient.get('/admin/security-events', { params });
    return response.data;
  },
  async getStats() {
    const response = await apiClient.get('/admin/security-events/stats');
    return response.data;
  },
  async getEvent(id) {
    const response = await apiClient.get(`/admin/security-events/${id}`);
    return response.data;
  },
  async updateStatus(id, data) {
    const response = await apiClient.patch(`/admin/security-events/${id}/status`, data);
    return response.data;
  }
};

/**
 * Platform Governance Settings API methods (Milestone 16).
 * Covers Categories, API Keys, Webhooks, and Security Policies.
 */
export const governanceApi = {
  // Categories
  async listCategories(params = {}) {
    const response = await apiClient.get('/admin/categories', { params });
    return response.data;
  },
  async createCategory(data) {
    const response = await apiClient.post('/admin/categories', data);
    return response.data;
  },
  async updateCategory(id, data) {
    const response = await apiClient.put(`/admin/categories/${id}`, data);
    return response.data;
  },
  async archiveCategory(id, data = {}) {
    const response = await apiClient.post(`/admin/categories/${id}/archive`, data);
    return response.data;
  },

  // API Keys
  async listApiKeys() {
    const response = await apiClient.get('/admin/api-keys');
    return response.data;
  },
  async createApiKey(data) {
    const response = await apiClient.post('/admin/api-keys', data);
    return response.data;
  },
  async rotateApiKey(id) {
    const response = await apiClient.post(`/admin/api-keys/${id}/rotate`);
    return response.data;
  },
  async revokeApiKey(id, data = {}) {
    const response = await apiClient.post(`/admin/api-keys/${id}/revoke`, data);
    return response.data;
  },

  // Webhooks
  async listWebhooks() {
    const response = await apiClient.get('/admin/webhooks');
    return response.data;
  },
  async createWebhook(data) {
    const response = await apiClient.post('/admin/webhooks', data);
    return response.data;
  },
  async updateWebhook(id, data) {
    const response = await apiClient.put(`/admin/webhooks/${id}`, data);
    return response.data;
  },
  async deleteWebhook(id) {
    const response = await apiClient.delete(`/admin/webhooks/${id}`);
    return response.data;
  },
  async testWebhook(id) {
    const response = await apiClient.post(`/admin/webhooks/${id}/test`);
    return response.data;
  },
  async listDeliveries(id) {
    const response = await apiClient.get(`/admin/webhooks/${id}/deliveries`);
    return response.data;
  },

  // Security Policies
  async listSecurityPolicies() {
    const response = await apiClient.get('/admin/security-policies');
    return response.data;
  },
  async updateSecurityPolicies(data) {
    const response = await apiClient.put('/admin/security-policies', data);
    return response.data;
  },
  async getPolicyHistory(params = {}) {
    const response = await apiClient.get('/admin/security-policies/history', { params });
    return response.data;
  }
};

/**
 * Health check API service.
 * Fetches status from GET /api/health
 */
export async function getHealthStatus() {
  try {
    const response = await apiClient.get('/health');
    return {
      connected: true,
      data: response.data
    };
  } catch (error) {
    return {
      connected: false,
      status: error.status,
      data: error.data || { database: 'disconnected', message: error.message }
    };
  }
}

export default apiClient;

