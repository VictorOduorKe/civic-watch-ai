import { getSystemHealth } from '../services/healthService.js';

/**
 * Health check controller.
 * GET /api/health
 */
export async function getHealth(req, res, next) {
  try {
    const health = await getSystemHealth();

    if (health.isHealthy) {
      return res.status(200).json({
        success: true,
        message: 'CivicWatch AI Kenya API is running',
        database: 'connected',
        timestamp: health.timestamp
      });
    }

    return res.status(503).json({
      success: false,
      message: 'CivicWatch AI Kenya API is running (database unavailable)',
      database: 'disconnected',
      timestamp: health.timestamp
    });
  } catch (error) {
    next(error);
  }
}
