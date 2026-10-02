import { apiClient } from './api.js';

/**
 * CivicWatch AI Kenya — Frontend Verification Service (Milestone 9)
 * Communicates with the AI information verification endpoints using HttpOnly cookies and CSRF protection.
 */
export const verificationService = {
  /**
   * Submit information (claim text, URL, or screenshot) for AI verification
   * @param {FormData|Object} data
   */
  async createVerification(data) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post('/verifications', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  /**
   * Fetch paginated verification history for the authenticated user
   */
  async getVerifications({ page = 1, limit = 20, status = null } = {}) {
    const params = { page, limit };
    if (status) {
      params.status = status;
    }
    const response = await apiClient.get('/verifications', { params });
    return response.data;
  },

  /**
   * Fetch single verification result detail by ID
   */
  async getVerification(id) {
    const response = await apiClient.get(`/verifications/${encodeURIComponent(id)}`);
    return response.data;
  }
};

export default verificationService;
