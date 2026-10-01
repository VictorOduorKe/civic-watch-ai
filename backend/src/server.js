import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { checkDatabaseConnection, closeDatabasePool } from './config/database.js';

const PORT = Number(process.env.PORT) || 5000;

// Start Server and verify DB connection
async function startServer() {
  console.log('Initializing CivicWatch AI Kenya backend...');

  // Check Database status
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    console.log(`[Database] MySQL connection pool verified (${process.env.DB_NAME || 'civic_ai_watch-db'})`);
  } else {
    console.warn('[Database] MySQL connection pool check failed - database may be offline or credentials incorrect');
  }

  // Start HTTP server
  const server = app.listen(PORT, () => {
    console.log(`[Server] CivicWatch AI Kenya API is running on http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Environment] ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown handling
  let isShuttingDown = false;
  async function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async (err) => {
      if (err) {
        console.error('[Server] Error while closing HTTP server:', err.message);
        process.exit(1);
      }
      console.log('[Server] HTTP server closed.');

      // Close MySQL connection pool
      await closeDatabasePool();
      console.log('[Database] MySQL connection pool closed.');

      console.log('[Server] Graceful shutdown complete. Exiting.');
      process.exit(0);
    });

    // Force shutdown if taking longer than 10 seconds
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((error) => {
  console.error('[Server] Fatal startup error:', error);
  process.exit(1);
});
