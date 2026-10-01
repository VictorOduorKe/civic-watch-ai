# CivicWatch AI Kenya

CivicWatch AI Kenya is an AI-powered civic engagement and public accountability platform built for the **Open Civic Lab (OCL)**.

---

## Current Milestone: Milestone 6 — OCL Admin Dashboard (Completed)

This repository contains the completed public presentation layer, database foundation, hardened authentication system, citizen workspace, authenticated incident reporting workflow, report tracking module, and the OCL Administrative Dashboard for CivicWatch AI Kenya:
* **OCL Admin Dashboard (M6)**: Role-restricted administrative workspace at `/admin` for `Admin`, `Moderator`, and `Analyst` roles. Citizen accounts receive a 403 Forbidden screen. Features a dedicated AdminLayout with sidebar navigation, sticky header, and milestone roadmap preview modals. Real-time database aggregation dashboard with: date range selector (7d / 30d / 90d / year / all), 4 Recharts visualizations (AreaChart trends, status BarChart, category BarChart, horizontal county BarChart), 4 stat cards (total reports, active, resolved, users), and a user account role breakdown table.
* **Citizen Report Tracking (M5)**: Authenticated citizen tracking at `/reports`, paginated report listing, dynamic debounced search, status filtering, category filtering, responsive table and card layouts, detailed dossier view at `/reports/:reference`, copyable reference code with clipboard confirmation, plain-text stored XSS protection, OCL-branded status badges, authentic chronological status progression timeline (`report_status_history`), secure authorized attachment downloads, and strict server-side tenant ownership isolation.
* **Authentication Security Hardening**: Completely eliminated client-side token storage in `localStorage` and `sessionStorage`. Migrated to HttpOnly, SameSite secure cookies (`civicwatch_auth`), implemented two-layer CSRF protection (Origin verification + Double-Submit Cookie `XSRF-TOKEN`), zero credential exposure in login/registration JSON responses, and centralized credentialed Axios client.
* **Incident Reporting Module (M4)**: Authenticated intake flow at `/reports/new`, dynamic category loading from database (12 categories with icons and descriptions), location metadata (47 Kenyan counties, sub-county, ward, landmark, GPS auto-detection), incident date/time, optional file attachments (up to 5 files, 5MB each, JPG/PNG/WEBP/PDF), anonymous submission privacy toggle, preferred contact selection, emergency 999/112 advisory, atomic database transactions with rollback cleanup, and server-side reference generation (`CWK-YYYY-XXXXXX`).
* **Citizen Dashboard & Workspace (M3)**: Authenticated dashboard at `/dashboard` and profile at `/profile`, responsive sidebar & mobile navigation drawer, real user identity welcome banner, live report counters from database, quick action workflow triggers, recent activity empty states, and educational guidance cards.
* **Authentication & Identity (M2)**: Registration with Kenyan county selection, secure login, profile inspection, persistent authentication context (`AuthContext`), password hashing with bcrypt, Zod validation, and protected routing.
* **Landing Page (M1)**: Public website at `/` with responsive navigation, hero section, planned capabilities, workflow overview, responsible civic-tech principles, Open Civic Lab introduction, and transparent roadmap modals.
* **M0 Foundation**: React 18 + Vite frontend, Express backend, MySQL connection pool, database migrations, security middleware, and real-time health verification endpoint (`GET /api/health` and `/status`).

---

## Technology Stack

* **Frontend**: React 18, Vite, React Router v6, Tailwind CSS v3, Axios, Recharts
* **Backend**: Node.js v20+, Express.js v4, mysql2, dotenv, cors, helmet, express-rate-limit, zod, bcryptjs, jsonwebtoken
* **Database**: MySQL 8+ / MariaDB 10.5+
* **Language**: JavaScript (ES Modules, JSX) — *No TypeScript*

---

## Requirements

1. **Node.js**: `v20.0.0` or newer (Tested on Node `v24.15.0`)
2. **npm**: `v10.0.0` or newer
3. **MySQL / MariaDB**: `v8.0+` or `v10.5+` running locally on port 3306

---

## Installation

Clone the repository and install all dependencies:

```bash
# 1. Install root orchestrator dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Install frontend dependencies
cd frontend && npm install && cd ..
```

---

## MySQL Setup

Create the local database:

```sql
CREATE DATABASE IF NOT EXISTS `civic_ai_watch-db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## Environment Variables

Copy the example environment files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure your MySQL credentials in `backend/.env`:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=civic_ai_watch-db
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=development_jwt_secret_change_in_production_min32chars
JWT_EXPIRES_IN=1d

# Cookie & CSRF Security Settings
AUTH_COOKIE_NAME=civicwatch_auth
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
CSRF_COOKIE_NAME=XSRF-TOKEN

MAX_REPORT_ATTACHMENT_SIZE_MB=5
MAX_REPORT_ATTACHMENTS=5

GEMINI_API_KEY=
```

---

## Database Migrations

Run database migrations to initialize tracking tables:

```bash
npm run migrate
```

---

## Development Workflow

### Starting Frontend and Backend Concurrently

From the root project directory:

```bash
npm run dev
```

This starts:
* **Backend API**: `http://localhost:5000`
* **Frontend App**: `http://localhost:5173`

### Starting Individually

To start the backend only:
```bash
npm run dev:backend
# or: cd backend && npm run dev
```

To start the frontend only:
```bash
npm run dev:frontend
# or: cd frontend && npm run dev
```

---

## Application & Verification Routes
 
* **Backend Health API**: `http://localhost:5000/api/health`
* **Public Landing Page**: `http://localhost:5173/`
* **Citizen Login Page**: `http://localhost:5173/login`
* **Citizen Registration Page**: `http://localhost:5173/register`
* **Citizen Workspace (M3)**: `http://localhost:5173/dashboard` (Protected)
* **My Reports Tracking (M5)**: `http://localhost:5173/reports` (Protected)
* **Report Detail & Timeline (M5)**: `http://localhost:5173/reports/:reference` (Protected)
* **Citizen Incident Report (M4)**: `http://localhost:5173/reports/new` (Protected)
* **Citizen Profile (M3)**: `http://localhost:5173/profile` (Protected)
* **OCL Admin Dashboard (M6)**: `http://localhost:5173/admin` (Admin / Moderator / Analyst only)
* **System Status Page**: `http://localhost:5173/status`

### Key API Endpoints

* **Authentication (Hardened HttpOnly Cookie)**:
  * `POST /api/auth/register` — Register citizen account (sets HttpOnly cookie)
  * `POST /api/auth/login` — Sign in (sets HttpOnly cookie, returns safe user JSON)
  * `GET /api/auth/me` — Retrieve active profile via HttpOnly cookie
  * `POST /api/auth/logout` — Clear auth and CSRF cookies
  * `GET /api/auth/csrf-token` — Retrieve Double-Submit CSRF cookie
* **Incident Reports & Citizen Tracking (M4 & M5)**:
  * `GET /api/reports/categories` — Retrieve all active incident categories
  * `POST /api/reports` — Submit new incident report (atomic transaction with initial status history)
  * `GET /api/reports/my` — List paginated reports submitted by authenticated user (search, filter, sort)
  * `GET /api/reports/my/summary` — Retrieve status breakdown counts for citizen reports
  * `GET /api/reports/my/:reference` — Inspect citizen-safe report details, attachments, and status timeline
  * `GET /api/reports/my/:reference/attachments/:attachmentId` — Securely download authorized attachment
  * `GET /api/reports/stats/me` — Retrieve current citizen report count stats for dashboard
* **Admin Dashboard (M6 — Admin / Moderator / Analyst only)**:
  * `GET /api/admin/dashboard/summary` — Aggregate report counts by status, category, county, trend, and user breakdown (accepts `?range=7d|30d|90d|year|all`)

---

## Documentation

* [Architecture Overview](file:///home/alpha/projects/civic-watch-ai/docs/ARCHITECTURE.md)
* [Database Guide & Migrations](file:///home/alpha/projects/civic-watch-ai/docs/DATABASE.md)
* [API Specification](file:///home/alpha/projects/civic-watch-ai/docs/API.md)

---

## Next Milestone

* **Milestone 7**: Incident Review, Assignment & Status Mutation Workflows

### Admin Test Accounts (Seeded — M6)

| Email | Password | Role |
|---|---|---|
| `admin@civicwatch.ke` | `Password123!` | Admin |
| `moderator@civicwatch.ke` | `Password123!` | Moderator |
| `analyst@civicwatch.ke` | `Password123!` | Analyst |