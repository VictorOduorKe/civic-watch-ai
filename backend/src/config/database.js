import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'civic_ai_watch-db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create a connection pool
export const pool = mysql.createPool(dbConfig);

/**
 * Verifies whether MySQL database is reachable.
 * @returns {Promise<{connected: boolean, message: string}>}
 */
export async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.query('SELECT 1 AS alive');
      return {
        connected: true,
        message: 'connected'
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    return {
      connected: false,
      message: 'disconnected'
    };
  }
}

/**
 * Closes the MySQL pool gracefully.
 */
export async function closeDatabasePool() {
  try {
    await pool.end();
  } catch (error) {
    console.error('Error closing database pool:', error.message);
  }
}

export default pool;
