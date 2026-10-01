# Database Documentation — CivicWatch AI Kenya

## Requirements

* **Database Engine**: MySQL 8.0+ or MariaDB 10.5+
* **Driver**: Node.js `mysql2` (with Promise-based API `mysql2/promise`)
* **Connection Mechanism**: Thread-safe Connection Pool (max 10 connections, auto-reconnect, keep-alive)

---

## Database Creation

The database must be created manually before running migrations or starting the application. The system **never** runs destructive commands like `DROP DATABASE` automatically.

```sql
-- Connect to MySQL
mysql -u root -p

-- Create the CivicWatch database
CREATE DATABASE IF NOT EXISTS `civic_ai_watch-db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## Environment Variables

Configure your database connection in `backend/.env` (or project root `.env`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=civic_ai_watch-db
DB_USER=root
DB_PASSWORD=your_mysql_password
```

---

## Incremental Migration Strategy

In CivicWatch AI Kenya, database tables are introduced **incrementally per milestone**, rather than all at once upfront.

* **Milestone 0**: Only establishes the migration system and the `_migrations` tracking table.
* **Milestone 2**: Will introduce `users`, `roles`, and authentication tables.
* **Milestone 3+**: Will introduce incidents, reports, verifications, alerts, and other modules.

### Migration Tracking Table

The migration runner records every applied migration in the `_migrations` table:

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration File Naming Convention

Migration files are located in `database/migrations/` and must follow a sequential 3-digit prefix:

```text
database/migrations/
├── 001_init_migrations.sql
├── 002_create_users_table.sql       # Future Milestone 2
└── 003_create_reports_table.sql     # Future Milestone 3
```

### Running Migrations

Execute all pending migrations using either command:

```bash
# From project root:
npm run migrate

# Or from backend directory:
npm run migrate --prefix backend

# Direct Node invocation:
node database/migrate.js
```

The migration runner will:
1. Connect using credentials from `backend/.env`.
2. Ensure the `_migrations` table exists.
3. Compare local `.sql` files against applied records.
4. Execute unapplied files sequentially within atomic database transactions.
5. Record successful executions in `_migrations`.

### Adding Tables in Future Milestones

1. Create a new file in `database/migrations/` using the next sequential number (e.g., `002_create_users_table.sql`).
2. Write clean SQL statements using `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.
3. Run `npm run migrate`.
4. Test and commit the `.sql` file to version control.
