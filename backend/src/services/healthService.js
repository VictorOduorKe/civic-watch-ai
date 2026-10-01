import { checkDatabaseConnection } from '../config/database.js';

/**
 * Health check service.
 * Verifies backend health and probes database connectivity.
 */
export async function getSystemHealth() {
  const dbStatus = await checkDatabaseConnection();

  return {
    isHealthy: dbStatus.connected,
    database: dbStatus.connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  };
}
