import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables using Node's built-in loadEnvFile
const envPaths = [
  path.resolve(__dirname, '../backend/.env'),
  path.resolve(__dirname, '../.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
      } else {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match && !process.env[match[1]]) {
            process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
          }
        }
      }
    } catch (e) {
      // ignore
    }
    break;
  }
}

// Dynamically import mysql2
let mysql;
try {
  mysql = await import('mysql2/promise');
} catch (e) {
  const backendMysqlPath = path.resolve(__dirname, '../backend/node_modules/mysql2/promise.js');
  mysql = await import(backendMysqlPath);
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'civic_ai_watch-db',
  multipleStatements: true
};

async function runMigrations() {
  console.log(`[Migration] Connecting to database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}...`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (err) {
    console.error(`[Migration Error] Failed to connect to MySQL: ${err.message}`);
    process.exit(1);
  }

  try {
    // 1. Ensure migrations table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Fetch already executed migrations
    const [rows] = await connection.query('SELECT name FROM _migrations ORDER BY id ASC');
    const appliedMigrations = new Set(rows.map(r => r.name));

    // 3. Read migration files
    const migrationsDir = path.resolve(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[Migration] No migrations directory found.');
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`[Migration] Found ${files.length} migration file(s).`);

    let appliedCount = 0;
    for (const file of files) {
      if (appliedMigrations.has(file)) {
        console.log(`  - [Already Applied] ${file}`);
        continue;
      }

      console.log(`  -> [Applying] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute SQL inside transaction
      await connection.beginTransaction();
      try {
        await connection.query(sql);
        await connection.query('INSERT INTO _migrations (name) VALUES (?)', [file]);
        await connection.commit();
        console.log(`  -> [Success] ${file}`);
        appliedCount++;
      } catch (migrationErr) {
        await connection.rollback();
        console.error(`[Migration Error] Failed running ${file}:`, migrationErr.message);
        throw migrationErr;
      }
    }

    if (appliedCount === 0) {
      console.log('[Migration] Database is up to date. No new migrations.');
    } else {
      console.log(`[Migration] Successfully applied ${appliedCount} migration(s).`);
    }
  } finally {
    await connection.end();
  }
}

runMigrations().catch(err => {
  console.error('[Migration] Migration process terminated with error:', err.message);
  process.exit(1);
});
