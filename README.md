# CivicWatch AI Kenya

CivicWatch AI Kenya is an AI-powered civic engagement and public accountability platform built for the **Open Civic Lab (OCL)**.

---

## Current Milestone: Milestone 11 — Civic Alerts & Advisories (Completed)

This repository contains the completed public presentation layer, database foundation, hardened authentication system, citizen workspace, authenticated incident reporting workflow, report tracking module, OCL Administrative Dashboard, Administrative Incident Management workspace, in-app Notification Infrastructure, AI Information Verification Engine, Production Security Hardening, and Civic Alerts & Advisories system for CivicWatch AI Kenya:
* **Civic Alerts & Advisories (M11)**: Centralized civic alert broadcast system strictly distinguishing verified official notices from community advisories. Features: controlled alert classifications (`OFFICIAL_COUNTY_ALERT`, `GOVERNMENT_ADVISORY`, `UTILITY_DOWNTIME`, `PUBLIC_SAFETY`, `WEATHER_ENVIRONMENTAL`, `COMMUNITY_ADVISORY`); severity levels (`CRITICAL`, `HIGH`, `MODERATE`, `LOW`, `INFO`) with priority-sorted feeds; geographic targeting (National, 47 Kenyan counties, sub-county, ward); dedicated utility downtime tracking (Electricity, Water, Roads, Sanitation, Telecom) with outage statuses (`PLANNED`, `ONGOING`, `RESTORED`, `CANCELLED`), provider attribution, and restoration timelines; citizen community advisory submission workflow with automatic moderation holds and severity clamping; full administrative management workspace at `/admin/alerts` with KPI counters, draft authoring, scheduling, editing, verification, rejection, and archiving; complete immutable audit trail in `civic_alert_audits`; in-app notification broadcasting (`ALERT_PUBLISHED`) to targeted counties; public and citizen-facing alert feeds at `/alerts` and detailed dossiers at `/alerts/:id`; and Rule 35 safety guardrails marking all testing/development data with `"DEMO ALERT — NOT AN OFFICIAL NOTICE"`.
* **Final Security, QA & Production Hardening (M10)**: Comprehensive full-project audit, end-to-end security verification (55 automated tests passing with 0 failures), strict HttpOnly cookie authentication architecture with zero localStorage tokens, server-side RBAC enforcement (Citizen, Analyst, Moderator, Admin), cross-tenant isolation and IDOR elimination across all report, attachment, verification, and notification pathways, anonymous civic whistleblower privacy protection with server-side identity masking, SQL injection immunity via parameterized MySQL queries and strict Zod schemas, XSS mitigation with React text-node escaping and Zod payload validation, Double-Submit CSRF protection with Origin verification across state-changing endpoints, abuse prevention with configurable express-rate-limiters (auth, reports, admin, verifications, notifications), secure file uploads outside web root with randomized filenames and MIME validation, hardened production HTTP security headers (Helmet CSP, HSTS, DENY frameguard, nosniff, strict-origin-when-cross-origin, Permissions-Policy), strict CORS origin restriction, production error masking preventing SQL/path exposure, clean frontend Vite production bundle build, and zero committed secrets.
* **AI Information Verification (M9)**: Full evidence-based information evaluation service using Google Gemini (`gemini-2.5-flash`) via `@google/genai`. Features multi-input submission (text claim, news URL, or screenshot image upload up to 5MB with randomized filenames and MIME validation), provider abstraction layer, structured JSON schema response validation, 5 controlled evidentiary statuses (`EVIDENCE_SUPPORTS_CLAIM`, `EVIDENCE_CONFLICTS_WITH_CLAIM`, `INSUFFICIENT_EVIDENCE`, `MISSING_CONTEXT`, `REQUIRES_VERIFICATION`), confidence assessment (`LOW`, `MEDIUM`, `HIGH`), structured evidence categorization (supporting points, contradictory points, missing context, recommended verification steps), prompt injection defenses, strict user ownership isolation (`WHERE user_id = req.user.id`), submission rate limiting (15/hr in prod), and dedicated frontend interface at `/verify`, `/verify/history`, and `/verify/:id`.
* **Notification System & In-App Alerts (M8)**: Full in-app notification engine with real platform event-driven notifications (`REPORT_RECEIVED`, `REPORT_STATUS_CHANGED`, `REPORT_UPDATED`, `REPORT_ASSIGNED`, `SYSTEM_NOTICE`). Dedicated `notifications` database table with foreign keys, index optimization, and `dedupe_key` unique constraint preventing notification flooding. Complete secure API suite (`GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`) protected by HttpOnly cookie authentication, Double-Submit CSRF protection, and strict tenant ownership verification. Header `NotificationBell` with live unread counter badge, interactive `NotificationDropdown` with 5-item preview and click-to-route navigation, and dedicated full-screen `/notifications` (and `/admin/notifications`) inbox with All/Unread filtering, pagination, mark-read, mark-all-as-read, and accessible empty states.
* **OCL Administrative Incident Management (M7)**: Controlled operational workspace at `/admin/incidents` and `/admin/incidents/:reference` for `Admin`, `Moderator`, and `Analyst` roles (citizens strictly prohibited). Includes: debounced full-text and code search; multi-filter criteria (status, category, county, assignment state, date range); tabular and mobile card views; pagination; complete incident dossier inspection; staff case assignment and reassignment preserving history with `unassigned_at`; operational status mutation with transaction rollback safety and transition validation; private internal staff notes; official citizen-visible case notices (`report_updates`) integrated directly into citizen tracking (M5); formal external agency referrals (KeNHA, EACC, KNCHR, NPS, etc.); whistleblowing anonymity protections; emergency 999/112 protocol warnings; and secure administrative attachment delivery.
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
* **Verify Information Center (M9)**: `http://localhost:5173/verify` (Protected)
* **Verification History (M9)**: `http://localhost:5173/verify/history` (Protected)
* **Verification Detail Assessment (M9)**: `http://localhost:5173/verify/:id` (Protected)
* **Citizen Notification Center (M8)**: `http://localhost:5173/notifications` (Protected)
* **My Reports Tracking (M5)**: `http://localhost:5173/reports` (Protected)
* **Report Detail & Timeline (M5)**: `http://localhost:5173/reports/:reference` (Protected)
* **Citizen Incident Report (M4)**: `http://localhost:5173/reports/new` (Protected)
* **Citizen Profile (M3)**: `http://localhost:5173/profile` (Protected)
* **OCL Admin Dashboard (M6)**: `http://localhost:5173/admin` (Admin / Moderator / Analyst only)
* **OCL Admin Notification Center (M8)**: `http://localhost:5173/admin/notifications` (Admin / Moderator / Analyst only)
* **OCL Incident Management List (M7)**: `http://localhost:5173/admin/incidents` (Admin / Moderator / Analyst only)
* **OCL Incident Management Dossier (M7)**: `http://localhost:5173/admin/incidents/:reference` (Admin / Moderator / Analyst only)
* **System Status Page**: `http://localhost:5173/status`

### Key API Endpoints

* **Authentication (Hardened HttpOnly Cookie)**:
  * `POST /api/auth/register` — Register citizen account (sets HttpOnly cookie)
  * `POST /api/auth/login` — Sign in (sets HttpOnly cookie, returns safe user JSON)
  * `GET /api/auth/me` — Retrieve active profile via HttpOnly cookie
  * `POST /api/auth/logout` — Clear auth and CSRF cookies
  * `GET /api/auth/csrf-token` — Retrieve Double-Submit CSRF cookie
* **AI Information Verification (M9 — Google Gemini Grounded)**:
  * `POST /api/verifications` — Submit text claim, web link, or screenshot image for AI evidence-based verification
  * `GET /api/verifications` — Retrieve paginated verification history for authenticated user (supports `?page=1&limit=20&status=...`)
  * `GET /api/verifications/:id` — Retrieve detailed structured verification assessment (strict user ownership)
  * `GET /api/verifications/:id/image` — Securely download uploaded verification screenshot (strict user ownership)
* **Notifications (M8 — In-App Event Driven)**:
  * `GET /api/notifications` — Retrieve paginated notifications for authenticated user (supports `?page=1&limit=20&unread_only=true|false`)
  * `GET /api/notifications/unread-count` — Retrieve live unread notification counter for badge
  * `PATCH /api/notifications/:id/read` — Mark an individual notification as read (with strict user ownership verification)
  * `PATCH /api/notifications/read-all` — Mark all unread notifications as read for authenticated user
* **Incident Reports & Citizen Tracking (M4 & M5)**:
  * `GET /api/reports/categories` — Retrieve all active incident categories
  * `POST /api/reports` — Submit new incident report (atomic transaction with initial status history; fires `REPORT_RECEIVED` notification)
  * `GET /api/reports/my` — List paginated reports submitted by authenticated user (search, filter, sort)
  * `GET /api/reports/my/summary` — Retrieve status breakdown counts for citizen reports
  * `GET /api/reports/my/:reference` — Inspect citizen-safe report details, attachments, published citizen updates, and status timeline
  * `GET /api/reports/my/:reference/attachments/:attachmentId` — Securely download authorized attachment
  * `GET /api/reports/stats/me` — Retrieve current citizen report count stats for dashboard
* **Admin Dashboard (M6 — Admin / Moderator / Analyst only)**:
  * `GET /api/admin/dashboard/summary` — Aggregate report counts by status, category, county, trend, and user breakdown (accepts `?range=7d|30d|90d|year|all`)
* **Admin Incident Management (M7 — Admin / Moderator / Analyst; mutations restricted to Admin / Moderator)**:
  * `GET /api/admin/incidents` — Paginated, searchable, filtered incident queue
  * `GET /api/admin/incidents/assignees` — Eligible staff members for assignment
  * `GET /api/admin/incidents/:reference` — Complete operational incident dossier
  * `GET /api/admin/incidents/:reference/attachments/:attachmentId` — Authorized administrative attachment download
  * `PATCH /api/admin/incidents/:reference/status` — Transactional status update (fires `REPORT_STATUS_CHANGED` notification if `visible_to_citizen = true`)
  * `POST /api/admin/incidents/:reference/assign` — Case assignment / reassignment (fires `REPORT_ASSIGNED` notification to assignee)
  * `POST /api/admin/incidents/:reference/unassign` — Case unassignment preserving history
  * `POST /api/admin/incidents/:reference/internal-notes` — Staff-only investigation notes (strictly internal; never notifies citizens)
  * `POST /api/admin/incidents/:reference/updates` — Publish citizen-visible case update (fires `REPORT_UPDATED` notification to citizen reporter)
  * `POST /api/admin/incidents/:reference/referrals` — Create referral to external organization
  * `PATCH /api/admin/incidents/:reference/referrals/:referralId` — Update external referral status

---

## Documentation

* [Architecture Overview](file:///home/alpha/projects/civic-watch-ai/docs/ARCHITECTURE.md)
* [Database Guide & Migrations](file:///home/alpha/projects/civic-watch-ai/docs/DATABASE.md)
* [API Specification](file:///home/alpha/projects/civic-watch-ai/docs/API.md)

---

## Next Milestone

* **Milestone 10**: CivicWatch Map (M10 will introduce the public civic map while preserving the privacy boundaries established by incident reporting, report tracking, incident management, notifications, and AI verification)

### Admin Test Accounts (Seeded — M6)

| Email | Password | Role |
|---|---|---|
| `admin@civicwatch.ke` | `Password123!` | Admin |
| `moderator@civicwatch.ke` | `Password123!` | Moderator |
| `analyst@civicwatch.ke` | `Password123!` | Analyst |