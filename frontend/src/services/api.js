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
