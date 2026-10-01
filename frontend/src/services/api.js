import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Shared Axios client instance with standard defaults.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for standard error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error shape
    const formattedError = {
      message: error.response?.data?.message || error.message || 'Network request failed',
      status: error.response?.status || 500,
      data: error.response?.data || null
    };
    return Promise.reject(formattedError);
  }
);

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
