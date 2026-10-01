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

---

## Tables Established in Milestone 4

### `report_categories` Table

Stores official incident categories available for citizen reporting, populated with 12 initial categories.

#### Schema

```sql
CREATE TABLE IF NOT EXISTS report_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categories_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Field Descriptions

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | `AUTO_INCREMENT`, `PRIMARY KEY` | Category identifier |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Distinct category name (e.g. Infrastructure, Corruption Concern) |
| `description` | `TEXT` | `NOT NULL` | Citizen-facing explanation of what concerns belong in this category |
| `is_active` | `BOOLEAN` | `NOT NULL`, Default `TRUE` | Active flag for dynamic intake dropdowns |
| `created_at` | `TIMESTAMP` | Default `CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | Auto-updates on modification | Last update timestamp |

---

### `reports` Table

Stores citizen-submitted incident reports, geographical metadata, contact preferences, and lifecycle status.

#### Schema

```sql
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_reference VARCHAR(50) NULL UNIQUE,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  county VARCHAR(100) NOT NULL,
  sub_county VARCHAR(100) NULL,
  ward VARCHAR(100) NULL,
  location_text VARCHAR(255) NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  incident_date DATE NULL,
  incident_time TIME NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_contact ENUM('none', 'email', 'phone') NOT NULL DEFAULT 'none',
  status ENUM('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Dismissed') NOT NULL DEFAULT 'Submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reports_user_id (user_id),
  INDEX idx_reports_category_id (category_id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_created_at (created_at),
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reports_category FOREIGN KEY (category_id) REFERENCES report_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Field Descriptions

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | `AUTO_INCREMENT`, `PRIMARY KEY` | Internal report ID |
| `report_reference` | `VARCHAR(50)` | `UNIQUE` | Human-readable tracking reference (e.g. `CWK-2026-000001`) |
| `user_id` | `INT` | `NOT NULL`, FK to `users(id)` | Submitting citizen ID |
| `category_id` | `INT` | `NOT NULL`, FK to `report_categories(id)` | Assigned incident category |
| `title` | `VARCHAR(255)` | `NOT NULL` | Concise incident headline (5-255 characters) |
| `description` | `TEXT` | `NOT NULL` | Detailed incident description (10-5000 characters) |
| `county` | `VARCHAR(100)` | `NOT NULL` | Kenyan county (1 of 47) |
| `sub_county` | `VARCHAR(100)` | `NULL` | Sub-county or constituency |
| `ward` | `VARCHAR(100)` | `NULL` | Ward within sub-county |
| `location_text` | `VARCHAR(255)` | `NULL` | Prominent local landmark or physical directions |
| `latitude` | `DECIMAL(10, 8)` | `NULL` | GPS coordinate (-4.7 to 5.5 in Kenya) |
| `longitude` | `DECIMAL(11, 8)` | `NULL` | GPS coordinate (33.9 to 41.9 in Kenya) |
| `incident_date` | `DATE` | `NULL` | Date when the incident occurred |
| `incident_time` | `TIME` | `NULL` | Approximate time of incident |
| `is_anonymous` | `BOOLEAN` | `NOT NULL`, Default `FALSE` | When true, identity is hidden on public and administrative views |
| `preferred_contact`| `ENUM` | Default `'none'` | Contact method: `'none'`, `'email'`, `'phone'` |
| `status` | `ENUM` | Default `'Submitted'` | Lifecycle status: `Submitted`, `Under Review`, `In Progress`, `Resolved`, `Dismissed` |
| `created_at` | `TIMESTAMP` | Default `CURRENT_TIMESTAMP` | Report submission timestamp |
| `updated_at` | `TIMESTAMP` | Auto-updates on modification | Last update timestamp |

---

### `report_attachments` Table

Stores metadata and local disk storage references for uploaded supporting media (images and PDF documents).

#### Schema

```sql
CREATE TABLE IF NOT EXISTS report_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_attachments_report_id (report_id),
  CONSTRAINT fk_attachments_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Field Descriptions

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | `AUTO_INCREMENT`, `PRIMARY KEY` | Attachment identifier |
| `report_id` | `INT` | `NOT NULL`, FK to `reports(id)` | Parent report ID (cascades on delete) |
| `original_name` | `VARCHAR(255)` | `NOT NULL` | Sanitized original client filename |
| `stored_name` | `VARCHAR(255)` | `NOT NULL` | Randomized storage filename on disk (`${timestamp}-${randomHex}${ext}`) |
| `mime_type` | `VARCHAR(100)` | `NOT NULL` | Validated MIME type (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) |
| `size_bytes` | `INT` | `NOT NULL` | File size in bytes (max 5 MB) |
| `storage_path` | `VARCHAR(500)` | `NOT NULL` | Relative storage path (`uploads/reports/...`) |
| `created_at` | `TIMESTAMP` | Default `CURRENT_TIMESTAMP` | Attachment upload timestamp |

---

## Tables Established in Milestone 5

### `report_status_history` Table

Tracks the authentic chronological status progression and official lifecycle events for incident reports. Supports filtering citizen-visible entries from future administrative internal notes.

#### Schema

```sql
CREATE TABLE IF NOT EXISTS report_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  status ENUM(
    'Submitted',
    'Under Review',
    'Verified',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
    'Rejected',
    'Dismissed'
  ) NOT NULL,
  note TEXT NULL,
  visible_to_citizen BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status_history_report_created (report_id, created_at),
  CONSTRAINT fk_status_history_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Field Descriptions

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | `AUTO_INCREMENT`, `PRIMARY KEY` | Event history ID |
| `report_id` | `INT` | `NOT NULL`, FK to `reports(id)` | Parent report ID (cascades on delete) |
| `status` | `ENUM` | `NOT NULL` | Lifecycle state: `Submitted`, `Under Review`, `Verified`, `Assigned`, `In Progress`, `Resolved`, `Closed`, `Rejected`, `Dismissed` |
| `note` | `TEXT` | `NULL` | Contextual note explaining status change (e.g. `"Report submitted by citizen."`) |
| `visible_to_citizen` | `BOOLEAN` | `NOT NULL`, Default `TRUE` | When `TRUE`, returned in citizen API `/reports/my/:reference`; when `FALSE`, strictly excluded |
| `created_at` | `TIMESTAMP` | Default `CURRENT_TIMESTAMP` | Event timestamp |

#### Status Lifecycle Consistency

Migration 004 upgraded the `reports.status` column to consistently support:
`'Submitted'`, `'Under Review'`, `'Verified'`, `'Assigned'`, `'In Progress'`, `'Resolved'`, `'Closed'`, `'Rejected'`, `'Dismissed'`.

Every newly submitted report automatically creates an initial `report_status_history` entry with status `'Submitted'`, note `'Report submitted by citizen.'`, and `visible_to_citizen = TRUE` inside an atomic transaction.



---

## Migration 005 — Admin Dashboard Performance Indexes

File: `database/migrations/005_add_admin_dashboard_indexes.sql`

Added composite and simple indexes to optimize aggregate dashboard queries:

| Index | Table | Purpose |
|---|---|---|
| `idx_reports_county` | `reports` | Accelerates `GROUP BY county` for county distribution charts |
| `idx_users_is_active` | `users` | Accelerates active user count filters |

---

## Migration 006 — Admin Role Seed Accounts

File: `database/migrations/006_seed_admin_roles.sql`

Seeds three administrative test accounts for local development (password: `Password123!` hashed with bcrypt):

| Email | Role | Purpose |
|---|---|---|
| `admin@civicwatch.ke` | `Admin` | Full administrative access |
| `moderator@civicwatch.ke` | `Moderator` | Incident moderation |
| `analyst@civicwatch.ke` | `Analyst` | Read-only analytics |

> **Note**: These accounts are for development only and should not be seeded in production without changing credentials.
