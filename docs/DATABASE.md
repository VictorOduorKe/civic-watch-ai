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
├── 001_init_migrations.sql         # M0: Migration tracking table
├── 002_create_users_table.sql      # M2: User accounts and authentication
└── 003_create_reports_table.sql    # Future Milestone 3+
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

---

## Tables Established in Milestone 2

### `users` Table

Stores citizen and administrative user profiles, contact details, authentication credentials, geographical location, and account status.

#### Schema

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  county VARCHAR(100) NOT NULL,
  ward VARCHAR(100) NULL,
  role ENUM('Citizen', 'Admin', 'Moderator', 'Analyst') NOT NULL DEFAULT 'Citizen',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Field Descriptions

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | `AUTO_INCREMENT`, `PRIMARY KEY` | Unique internal user ID |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | Citizen's full legal name |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Normalized lowercase email address (login credential) |
| `phone` | `VARCHAR(50)` | `NOT NULL` | Contact telephone number |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | bcrypt salt & hash (12 cost factor rounds) |
| `county` | `VARCHAR(100)` | `NOT NULL` | Citizen's primary county (one of 47 Kenyan counties) |
| `ward` | `VARCHAR(100)` | `NULL` | Optional ward or constituency identifier |
| `role` | `ENUM` | `NOT NULL`, Default `'Citizen'` | Role hierarchy: `Citizen`, `Admin`, `Moderator`, `Analyst` |
| `is_active` | `BOOLEAN` | `NOT NULL`, Default `TRUE` | Soft-deactivation flag; deactivated users cannot login |
| `email_verified`| `BOOLEAN` | `NOT NULL`, Default `FALSE`| Reserved for future email verification milestone |
| `created_at` | `TIMESTAMP` | Default `CURRENT_TIMESTAMP` | Account creation timestamp |
| `updated_at` | `TIMESTAMP` | Auto-updates on modification | Last profile update timestamp |
| `last_login_at`| `TIMESTAMP` | `NULL` | Updated on every successful authentication |

#### Security & Integrity Rules

1. **Email Uniqueness & Case Normalization**: The `uq_users_email` unique key enforces email uniqueness at the database layer. All emails are lowercased and trimmed prior to insertion and queries.
2. **Password Security**: Passwords are never stored in plaintext. They are salted and hashed using bcrypt with 12 rounds before insertion.
3. **Role Protection**: The database defaults `role` to `'Citizen'`. Even if an incoming request provides an administrative role, the application service explicitly defaults public registrations to `'Citizen'`.
4. **Active Account Check**: The authentication service checks `is_active = TRUE` on both login and profile retrieval (`GET /api/auth/me`).

