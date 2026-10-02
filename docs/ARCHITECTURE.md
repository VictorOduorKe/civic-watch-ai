# Architecture Documentation — CivicWatch AI Kenya

## Overview

CivicWatch AI Kenya is an AI-powered civic engagement and public accountability platform developed for the **Open Civic Lab (OCL)**.

This document details the architectural foundation established in **Milestone 0 (Project Foundation)**.

---

## High-Level Architecture Flow

```text
React 18 + Vite (Frontend)
       │
       │ HTTP / REST API (Axios, JSON)
       ▼
Node.js + Express (Backend)
  ├── Security Middleware (Helmet, CORS, Rate Limiting)
  ├── Request Logging (Sensitive-data safe)
  ├── Validation Layer (Zod Foundation)
  ├── Centralized Error Handling
  ├── Routing Layer (/api/health)
  ├── Controller & Service Layer
       │
       │ mysql2 Connection Pool
       ▼
MySQL 8+ Database (civic_ai_watch-db)
```

---

## Directory Structure & Architectural Purpose

```text
civicwatch-ai-kenya/
├── frontend/                     # Client application (React + Vite + Tailwind)
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── assets/               # Local icons and static media
│   │   ├── components/           # Reusable UI component building blocks
│   │   ├── context/              # React Context state providers (future milestones)
│   │   ├── features/             # Feature-specific components and logic
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layouts/              # Shell layouts (Navbar, Sidebar, Footer)
│   │   ├── pages/                # Route-level page components (HealthStatusPage)
│   │   ├── services/             # HTTP clients & API abstraction (api.js)
│   │   ├── utils/                # Client utility and formatting functions
│   │   ├── App.jsx               # Client router setup (react-router-dom)
│   │   ├── index.css             # Tailwind base & utilities
│   │   └── main.jsx              # Application bootstrap & DOM root render
│   ├── index.html                # HTML entrypoint
│   ├── package.json              # Frontend dependencies and scripts
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   └── vite.config.js            # Vite build and dev server config
│
├── backend/                      # Server application (Node.js + Express)
│   ├── src/
│   │   ├── config/               # Environment configuration & database pool setup
│   │   ├── controllers/          # HTTP request handlers and response formatters
│   │   ├── database/             # Database access helpers and utilities
│   │   ├── middleware/           # Express middleware (CORS, Helmet, RateLimit, Loggers, ErrorHandlers)
│   │   ├── models/               # Data access models and query abstractions (Milestone 2+)
│   │   ├── routes/               # Modular Express API routers
│   │   ├── services/             # Business logic layer
│   │   ├── utils/                # Server helper functions
│   │   ├── validators/           # Zod request validation schemas
│   │   ├── app.js                # Express app configuration & middleware pipeline
│   │   └── server.js             # HTTP server bootstrap, port binding & graceful shutdown
│   ├── uploads/                  # User uploads directory (gitignored)
│   ├── package.json              # Backend dependencies and scripts
│   └── .env.example              # Sample backend environment configuration
│
├── database/                     # Database infrastructure
│   ├── migrations/               # Incremental SQL migration scripts (001_*.sql)
│   ├── seeds/                    # Development seed scripts
│   └── migrate.js                # Migration runner tracking migrations in _migrations
│
├── docs/                         # Technical documentation
│   ├── ARCHITECTURE.md           # Architecture and directory documentation
│   ├── DATABASE.md               # Database setup, migrations, and schema guide
│   └── API.md                    # REST API specifications and contracts
│
├── .env.example                  # Root environment variable template
├── .gitignore                    # Git ignore file excluding sensitive files & build output
├── package.json                  # Root npm workspace orchestrator
└── README.md                     # Project overview and getting started guide
```

---

## Architectural Separation of Concerns

1. **Separation of App and Server (`app.js` vs `server.js`)**:
   - `app.js` configures the Express application pipeline: HTTP security headers, CORS origin whitelisting, rate limiting, request logging, JSON body parsing, route mounting, and centralized error handling.
   - `server.js` manages runtime lifecycle: reading environment variables, verifying database connectivity on boot, binding the HTTP listener, and intercepting `SIGINT`/`SIGTERM` for graceful shutdown.

2. **Layered Request Flow**:
   - **Route**: Declares endpoints and connects middleware (`routes/healthRoutes.js`).
   - **Validator**: Enforces schema validation using Zod before business execution (`middleware/validate.js`).
   - **Controller**: Extracts request data, calls services, and serializes HTTP responses (`controllers/healthController.js`).
   - **Service**: Implements business rules and orchestrates database interactions (`services/healthService.js`).
   - **Database**: Reusable connection pool with connection pooling and resource cleanup (`config/database.js`).

3. **Graceful Shutdown**:
   - When the process receives `SIGTERM` or `SIGINT`, it stops accepting new HTTP connections, closes the active HTTP listener, drains the `mysql2` connection pool, and cleanly terminates the process without leaking open sockets or connections.

4. **Security Hardening**:
   - `helmet` adds HTTP security headers (`X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`, etc.).
   - `cors` is locked to the configured `FRONTEND_URL` (`http://localhost:5173` by default).
   - `express-rate-limit` prevents brute-force floods while keeping thresholds suitable for development.
   - Sensitive fields (passwords, tokens, database credentials) are strictly stripped from logs and error responses.

---

## Authentication & Authorization Architecture (Milestone 2)

Milestone 2 introduces a complete, production-grade identity and authentication layer built with JWT, bcrypt, Zod, and React Context.

```text
┌─────────────────┐       POST /api/auth/login        ┌─────────────────────────┐
│                 ├──────────────────────────────────►│ authRoutes (Rate Limit) │
│  React Client   │                                   └────────────┬────────────┘
│  (AuthContext)  │◄──────────────────────────────────┐            │
│                 │   Set-Cookie: HttpOnly (No JWT)   │            ▼
└────────┬────────┘   Safe User Profile JSON          │  validate(loginSchema)
         │                                            └────────────┬────────────┘
         │ Axios (withCredentials: true)                           │
         │ Automatic Browser Cookie + X-XSRF-TOKEN                 ▼
         ▼                                               authController.login
┌─────────────────────────────────┐                                │
│        Protected API Request    │                                ▼
│  (e.g., GET /api/auth/me)       │                      authService.loginUser
└────────────────┬────────────────┘                                │
                 │                                                 ▼
                 ▼                                       Bcrypt verify password
    authMiddleware.requireAuth                                     │
                 │                                                 ▼
                 ├─► Read HttpOnly cookie (civicwatch_auth)  Generate Signed JWT
                 ├─► Verify JWT signature & expiration             │
                 ├─► Query DB: user exists & is_active?            ▼
                 └─► Attach req.user (safe, no password)     Set HttpOnly Cookie
                                                             Set CSRF Cookie
                                                             Update last_login_at
```

### Hardened Authentication & Security Components

1. **HttpOnly Cookie Authentication Transport**:
   - Sensitive JWT credentials are **never stored in `localStorage` or `sessionStorage`**, eliminating risk from cross-site scripting (XSS) token extraction.
   - Credentials are set exclusively by the Express backend via `Set-Cookie`:
     - Cookie name: `civicwatch_auth` (configurable via `AUTH_COOKIE_NAME`)
     - `httpOnly: true` (strictly inaccessible to JavaScript)
     - `secure: isProduction || AUTH_COOKIE_SECURE === 'true'` (requires HTTPS in production; supports HTTP on localhost development)
     - `sameSite: process.env.AUTH_COOKIE_SAME_SITE || 'lax'` (prevents cross-site credential leakage)
     - `path: '/'`
     - `maxAge: 24 * 60 * 60 * 1000` (1 day, synchronized with JWT lifespan)

2. **CSRF Protection Architecture**:
   - Implements two-layer CSRF defense for cookie-based authentication:
     1. **Origin / Referer Verification**: All state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) verify that the incoming `Origin` or `Referer` header matches the trusted `FRONTEND_URL`. Malicious origins receive `403 Forbidden`.
     2. **Double-Submit Cookie Pattern**: A client-readable cookie `XSRF-TOKEN` is issued on initial visit or authentication. The Axios client automatically reads this cookie and sends the matching value in the `X-XSRF-TOKEN` header on state-changing requests. Malicious third-party sites cannot read or forge this cookie due to the Same-Origin Policy.
   - The CSRF token contains a cryptographically random hex string (`crypto.randomBytes(32)`), preserving zero exposure of user credentials or JWTs.

3. **Backend Middleware & Controllers**:
   - **`cookieParser.js`**: Parses incoming HTTP `Cookie` header into `req.cookies`.
   - **`csrfMiddleware.js`**: Enforces origin check and double-submit token match on state-changing endpoints.
   - **`authMiddleware.js`**: Reads `req.cookies[AUTH_COOKIE_NAME]` as primary authentication transport, verifies signature and expiration, retrieves active user from MySQL, and attaches sanitized `req.user`.
   - **`authController.js`**: Login and registration endpoints set cookies and return safe user profiles, strictly omitting `token` or `accessToken` from JSON bodies.

4. **Frontend Architecture (`AuthContext.jsx` & `api.js`)**:
   - **Zero Browser Storage**: Completely free of `localStorage.getItem("token")` or `localStorage.setItem("token")`.
   - **Centralized Axios Client**: Instantiated with `withCredentials: true`, ensuring all requests automatically include the HttpOnly authentication cookie.
   - **Session Rehydration**: On mount, calls `GET /api/auth/me`. If valid, populates user profile; if unauthenticated, cleanly clears user state without attempting to read or recover stale credentials from disk.
   - **`ProtectedRoute.jsx`**: Relies on backend-authenticated user state; redirects unauthenticated visitors to `/login`.


---

## Citizen Dashboard & Authenticated Workspace Architecture (Milestone 3)

Milestone 3 establishes the primary authenticated workspace for citizens. It reuses the real M2 authentication layer (`AuthContext`, `ProtectedRoute`, `/api/auth/me`) and provides a modular UI structure designed to integrate subsequent milestones without architectural refactoring.

```text
┌───────────────────────────────────────────────────────────┐
│                       CitizenLayout                       │
│ ┌───────────────────────┬───────────────────────────────┐ │
│ │  DashboardSidebar     │ DashboardHeader               │ │
│ │  • Brand Logo         │ • Page Context Title          │ │
│ │  • /dashboard Link    │ • Notification Trigger (M8)   │ │
│ │  • My Reports (M5)    │ • User Avatar & Profile Link  │ │
│ │  • Report Issue (M4)  │ • Direct Sign Out Button      │ │
│ │  • Notifications (M8) ├───────────────────────────────┤ │
│ │  • /profile Link      │ <Outlet> / Page Content       │ │
│ │  • Citizen User Card  │ • DashboardPage               │ │
│ │  • Sign Out Action    │ • ProfilePage                 │ │
│ └───────────────────────┴───────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### Component Hierarchy & Responsibilities

1. **Authenticated Shell Layout (`layouts/CitizenLayout.jsx`)**:
   - Manages responsive layout switching: permanent fixed sidebar on desktop (`lg:w-64`), slide-over drawer navigation on mobile with backdrop overlay and keyboard-friendly dismissal.
   - Provides global shell header with context title, notification bell trigger, user profile dropdown, and logout action.
   - Hosts `ComingSoonModal` to provide transparent, informative milestone roadmap modals when upcoming features are accessed.

2. **Citizen Dashboard Overview (`pages/DashboardPage.jsx`)**:
   - **Personalized Welcome Banner**: Greets the authenticated user by their first name using real user data from `AuthContext` (no hardcoded strings) and displays their verified Kenyan county and ward badge.
   - **Summary Stat Cards (`StatCard.jsx`)**: Displays 4 report counters: *Reports Submitted*, *Under Review*, *In Progress*, and *Resolved*. Adheres to the strict **zero-fake-data rule** by honestly presenting `0` with clear "No reports submitted yet" messaging.
   - **Civic Quick Actions (`QuickActionCard.jsx`)**: Actionable cards for *Report an Issue* (M4 Preview), *View My Reports* (M5 Preview), *Verify Information* (M9 Preview), and *View Civic Alerts* (M11 Preview), triggering clean roadmap explanations.
   - **Recent Activity Section (`RecentActivity.jsx`)**: Renders an honest, informative empty state explaining that chronological incident tracking and agency responses will appear once Milestone 4 is deployed.
   - **Civic Guidance Card (`CivicInfoCard.jsx`)**: Educational panel detailing how CivicWatch AI Kenya bridges citizen-government accountability and provides non-partisan civic engagement.

3. **Citizen Profile & Identity View (`pages/ProfilePage.jsx`)**:
   - Mounted at protected route `/profile`.
   - Displays real authenticated user data: Full Legal Name, Email, Phone Number, County, Ward/Constituency, Role badge (`Citizen`), Account Status (`Active`), Membership Date (`createdAt`), and Last Login Timestamp (`lastLoginAt`).
   - Clean, verified read-only presentation (strictly no fake "Save Changes" buttons; profile self-service editing reserved for future updates).

4. **Security & Session Integrity**:
   - Both `/dashboard` and `/profile` are guarded by `ProtectedRoute`. Unauthenticated visitors are instantly redirected to `/login?from=<target>`.
   - Authenticated users visiting `/login` or `/register` are redirected to `/dashboard` to prevent redundant authentication cycles.
   - Refreshing `/dashboard` or `/profile` transparently rehydrates the session from `GET /api/auth/me` without flickering unauthenticated states.
   - Logging out clears client tokens and session cookies, immediately revoking access to all dashboard routes.

---

## Milestone 4 Architecture: Incident Reporting Module

Milestone 4 introduces the authenticated citizen incident reporting workflow (`/reports/new`), enabling citizens across Kenya's 47 counties to submit real-world incidents with optional multimedia attachments, geolocation coordinates, and privacy preferences.

```text
┌─────────────────────────────────────────────────────────────┐
│                 /reports/new (CitizenLayout)                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Emergency 999/112 Banner & Responsible Reporting Notice │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Step 1: Category Selection (12 DB Categories via Cards) │ │
│ │ Step 2: Incident Details (Title, Description)           │ │
│ │ Step 3: Location (County, Sub-County, Ward, GPS/Geo)   │ │
│ │ Step 4: Incident Date & Approximate Time (Optional)     │ │
│ │ Step 5: Supporting Attachments (Max 5, 5MB, JPG/PNG/PDF)│ │
│ │ Step 6: Privacy & Contact (Anonymous Mode, Prefs)      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Submission Action -> POST /api/reports (Multipart)      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                              │                              │
│                              ▼                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Success View: CWK-YYYY-XXXXXX Tracking Reference        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Principles & Pipeline

1. **Dynamic Category Ingestion**:
   - Incident categories are queried dynamically from `report_categories` via `GET /api/reports/categories`. No category lists are hardcoded on the client.
   - Categories include rich descriptions and intuitive icons assisting citizens in choosing appropriate classifications.

2. **Atomic Submission & Reference Generation**:
   - Report submission is routed through `POST /api/reports` with `multipart/form-data`.
   - The backend service (`reportService.js`) initiates an ACID database transaction:
     1. Inserts the core report record with initial status `'Submitted'`.
     2. Generates a formatted reference code: `CWK-${year}-${String(reportId).padStart(6, '0')}` (e.g. `CWK-2026-000001`).
     3. Updates the report with the unique reference.
     4. Inserts attachment metadata records in `report_attachments`.
     5. Commits the transaction.
   - If any step fails or database errors occur, the transaction rolls back and any newly uploaded files on disk are immediately unlinked to prevent orphaned storage.

3. **Secure File Upload Pipeline (`uploadMiddleware.js`)**:
   - Handled via `multer` using disk storage in `backend/uploads/reports/`.
   - Enforces a maximum of 5 files per submission and 5MB per file.
   - Whitelists strict MIME types: `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`.
   - Sanitizes filenames against path traversal attacks (`path.basename`) and assigns randomized non-colliding storage names: `${Date.now()}-${randomHex(8)}${ext}`.
   - Excludes uploaded media from Git via `.gitignore` while maintaining directory structure using `.gitkeep`.

4. **Privacy & Anonymity Enforcement**:
   - Citizens can toggle "Submit Anonymously".
   - The user ID is retained in `reports.user_id` for abuse prevention and rate-limiting integrity, but `is_anonymous = true` ensures that when report inspection is implemented in Milestone 5+, citizen identity details are withheld from public and administrative views.

5. **Rate Limiting & Abuse Prevention**:
   - Report creation endpoint is shielded by a dedicated Express rate limiter: maximum 25 report submissions per 15 minutes per IP.
   - Input fields are strictly validated via Zod schemas (`reportValidators.js`) prior to processing.

---

## 8. Milestone 5: Citizen Report Tracking Architecture

### Overview

Milestone 5 introduces the Citizen Report Tracking Module, allowing authenticated citizens to view, search, filter, and inspect reports they have submitted, and to follow the official chronological status history of their cases.

```
Authenticated Citizen (HttpOnly Cookie)
              │
              ▼
   Authentication Middleware (requireAuth)
              │
              ▼
    req.user (Strict Server-Side ID)
              │
  ┌───────────┴───────────────────────────────┐
  ▼                                           ▼
GET /api/reports/my                  GET /api/reports/my/:reference
(Scoped: WHERE user_id = req.user.id) (Scoped: WHERE user_id = req.user.id AND reference = :ref)
  │                                           │
  ▼                                           ▼
Paginated Report List                Citizen-Safe Dossier View
- Debounced Search (Ref, Title)      - Original Description (Plain Text Safe)
- Status Filter (All, Submitted...)   - Location & Optional GPS Coordinates
- Category Filter (Active List)      - Citizen-Visible History (visible_to_citizen = TRUE)
- Real Database Summary Counts        - Secure Attachments (Download Token / Endpoint)
```

### Architectural Principles & Enforcement

1. **Strict Ownership Authorization Rule**:
   - The backend NEVER trusts a `user_id` supplied in request bodies, query parameters, or route paths.
   - All queries are strictly scoped to `req.user.id` obtained from the verified HttpOnly JWT authentication cookie.
   - If a citizen attempts to access a report reference belonging to another user, the backend returns a generic `404 Not Found` (`"Report not found"`). This prevents tenancy probing or confirming whether a reference exists under another user.

2. **Authentic Chronological Status History (`report_status_history`)**:
   - Reports do not rely on simulated or hardcoded future progression steps.
   - Only authentic recorded events from `report_status_history` are rendered.
   - Initial report creation atomically records the `'Submitted'` event with `note: 'Report submitted by citizen.'` and `visible_to_citizen: true`.
   - Internal administrative notes and workflows will use `visible_to_citizen: false`, ensuring internal notes are filtered out at the SQL layer and never leaked over the wire.

3. **Secure Attachment Delivery Chain**:
   - Attachments are served only via the authorized endpoint:
     `GET /api/reports/my/:reference/attachments/:attachmentId`.
   - The backend validates the complete relational chain:
     `req.user.id` owns `reports.id`, which matches `report_reference`, which owns `report_attachments.id`.
   - Internal filesystem paths (`storage_path`) and internal disk filenames are never exposed to the client.

4. **Information Leakage & Stored XSS Prevention**:
   - Citizen descriptions and titles are rendered strictly as plain text on the frontend, never as `dangerouslySetInnerHTML`.
   - SQL queries utilize parameterized statements for all filter, search, reference, and pagination parameters.
   - Rate limiting is configured on `GET /api/reports/my/:reference` (120 requests / 15 min) to prevent automated reference enumeration.




---

## Section 9 — Milestone 6: OCL Admin Dashboard

### Overview

Milestone 6 introduces the role-restricted OCL Administrative Workspace at `/admin`. Only users with roles `Admin`, `Moderator`, or `Analyst` may access it. Citizens receive a `403 Forbidden` screen on both the API and the frontend.

### Frontend Architecture

```
frontend/src/
  components/
    AdminRoute.jsx          — Role gate (Admin|Moderator|Analyst); 403 screen for Citizens
    admin/
      AdminSidebar.jsx      — OCL-branded sidebar with nav groups and milestone preview actions
      AdminHeader.jsx        — Sticky header with role pill, bell, citizen portal link, user summary
      AdminComingSoonModal.jsx — Roadmap preview modal for future milestones
      AdminStatCard.jsx      — Reusable stat metric card with color schemes
      AdminEmptyState.jsx    — Empty chart/data placeholder component
      ReportTrendChart.jsx   — Recharts AreaChart: submissions over time (gold accent)
      ReportCategoryChart.jsx — Recharts BarChart: reports by category (navy bars)
      ReportStatusChart.jsx  — Recharts BarChart: status distribution with per-status color cells
      ReportCountyChart.jsx  — Recharts horizontal BarChart: top counties (gold bars)
  layouts/
    AdminLayout.jsx          — Shell: sidebar + header + <Outlet> + preview modal state
  pages/
    admin/
      AdminDashboardPage.jsx — Dashboard: range selector, stat cards, 4 charts, user breakdown
```

### Backend Architecture

```
backend/src/
  validators/adminDashboardValidators.js  — Zod schema: range allowlist validation
  services/adminDashboardService.js       — Real SQL aggregations per date range
  controllers/adminDashboardController.js — Express handler wrapping service
  routes/adminRoutes.js                  — requireAuth + requireRole + rateLimit + validate
```

### RBAC

| Role | Admin API | Admin UI |
|---|---|---|
| `Admin` | 200 OK | Full dashboard |
| `Moderator` | 200 OK | Full dashboard |
| `Analyst` | 200 OK | Full dashboard |
| `Citizen` | 403 Forbidden | 403 Forbidden screen |
| Unauthenticated | 401 Unauthorized | Redirect to /login |

### Date Range Filtering

The `?range` query parameter is validated against an allowlist before being mapped to MySQL `DATE_SUB` arithmetic:

| Value | SQL Condition |
|---|---|
| `7d` | `created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)` |
| `30d` | `created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)` |
| `90d` | `created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)` |
| `year` | `created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)` |
| `all` | No date filter applied |

---

## Section 10 — Milestone 7: Administrative Incident Management

### Overview

Milestone 7 transforms the OCL Administrative Workspace from an aggregate overview into a controlled operational incident triage and resolution platform. It introduces role-restricted incident inspection, assignment, status mutation workflows, internal case notes, published citizen updates, and agency referrals.

### Incident Management Architectural Topology

```text
                                 [ Citizen User ]
                                        │
                         M5 Tracking API (/api/reports/my)
                         - Status Progression Timeline
                         - Official Case Notices (report_updates)
                         - NO Internal Notes or Referrals
                                        ▲
                                        │ (Database Separation)
                                        ▼
[ Admin / Moderator / Analyst ] ────────┴──────── [ Database Tables ]
       │                                          ├── reports
       ▼                                          ├── report_status_history
/admin/incidents                                  ├── report_assignments
  ├── Search, Multi-Filter, Pagination            ├── report_internal_notes
/admin/incidents/:reference                       ├── report_updates
  ├── Status Mutation Controller (Admin/Mod)      └── report_referrals
  ├── Assignment & Reassignment (Admin/Mod)
  ├── Internal Notes Desk (Staff Only)
  ├── Official Citizen Notice Publisher
  └── External Organization Referrals
```

### RBAC Permission Matrix

| Capability | Admin | Moderator | Analyst | Citizen |
|---|---|---|---|---|
| View Incident List | Yes | Yes | Yes | No (Own via M5) |
| Filter & Search Incidents | Yes | Yes | Yes | No (Own via M5) |
| View Incident Detail | Yes | Yes | Yes | No (Own via M5) |
| Download Attachments | Yes | Yes | Yes | Own only |
| Mutate Status | Yes | Yes | No (403) | No (403) |
| Assign / Reassign Staff | Yes | Yes | No (403) | No (403) |
| Add Internal Notes | Yes | Yes | No (403) | No (403) |
| Publish Citizen Updates | Yes | Yes | No (403) | No (403) |
| Create / Update Referrals | Yes | Yes | No (403) | No (403) |
| View Internal Notes | Yes | Yes | Controlled | Never |
| View Referral Records | Yes | Yes | Controlled | Never |

### Transactional Integrity & Workflow Safeguards

1. **Atomic Status Mutation**:
   - Status updates are executed within database transactions (`BEGIN ... COMMIT / ROLLBACK`).
   - `reports.status` and `report_status_history` are updated together.
   - If `publish_citizen_update` is requested, the citizen notice is inserted in the exact same transaction.
   - State jumping is rejected via the transition validation matrix.

2. **Assignment & Historical Integrity**:
   - Reassigning an incident sets `unassigned_at = CURRENT_TIMESTAMP` on the active record and creates a new row. Historical assignments are never overwritten or deleted.
   - Assignees are strictly validated against active users possessing `Admin` or `Moderator` roles. Citizen accounts are rejected with `422 Unprocessable Entity`.
   - The assigning actor (`assigned_by_user_id`) is strictly extracted from the authenticated session, never trusted from client request parameters.

3. **Privacy Invariant & Separation of Concerns**:
   - Internal notes (`report_internal_notes`) and citizen updates (`report_updates`) reside in separate database tables.
   - Citizen APIs (`/api/reports/my/:reference`) explicitly join `report_updates` but strictly avoid joining `report_internal_notes` or `report_referrals`.
   - Anonymous submissions (`is_anonymous = true`) conceal reporter contact information across both the API and UI to safeguard civic whistleblowers.

---

## Section 11 — Milestone 8: In-App Notification System

### Overview

Milestone 8 introduces the CivicWatch in-app notification infrastructure, allowing citizens and administrators to receive factual updates generated exclusively by real platform events. It integrates with existing authentication, report creation (M4), tracking (M5), admin workspace (M6), and incident management (M7).

### Notification Event Pipeline

```text
               ┌────────────────────────────────────────────────────────┐
               │                  Real System Events                    │
               └─────────┬──────────────────┬──────────────────┬────────┘
                         │                  │                  │
               [ Report Created ]  [ Status Changed ]  [ Case Assigned ]
                         │                  │                  │
                         └──────────┬───────┴──────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │ Notification Service│
                         │ (notificationService)
                         └──────────┬──────────┘
                                    │
                                    ├── Deduplication Check (dedupe_key)
                                    ├── Privacy Boundary Verification
                                    │
                         ┌──────────▼──────────┐
                         │  MySQL Persistence  │
                         │    notifications    │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │  Notification API   │
                         │  /api/notifications │
                         │ (Strict User Scope) │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │ Frontend UI Center  │
                         │ - NotificationBell  │
                         │ - Dropdown & Badges │
                         │ - /notifications    │
                         └─────────────────────┘
```

### Event Integrations

1. **Report Submission (`REPORT_RECEIVED`)**:
   - Triggered upon successful transaction commit in `reportService.createReport`.
   - Generates: `"Your report CWK-YYYY-XXXXXX has been received."`
   - Scoped strictly to the reporting citizen user ID.
   - Dedupe key: `report-received:<reportId>:<recipientUserId>`

2. **Status Change (`REPORT_STATUS_CHANGED`)**:
   - Triggered upon successful transaction commit in `incidentManagementService.changeIncidentStatus`.
   - **Privacy Boundary**: If `visible_to_citizen = false`, notification creation is suppressed.
   - Factual message: `"Your report CWK-YYYY-XXXXXX is now <status>."`
   - Dedupe key: `status-change:<reportId>:<historyId>`

3. **Official Citizen Notice (`REPORT_UPDATED`)**:
   - Triggered when authorized staff publish a citizen update via `incidentManagementService.addCitizenUpdate`.
   - Generates: `"There is a new update on your report CWK-YYYY-XXXXXX."`
   - Internal administrative notes **never** trigger citizen notifications.
   - Dedupe key: `report-update:<reportId>:<updateId>`

4. **Incident Assignment (`REPORT_ASSIGNED`)**:
   - Triggered when an incident is assigned in `incidentManagementService.assignIncident`.
   - Scoped strictly to the assigned staff member (`assigned_to_user_id`).
   - The reporting citizen does not receive internal staff assignment notices.
   - Dedupe key: `assignment:<reportId>:<assignedToUserId>`

### Security & Privacy Controls

1. **Strict Server-Side Recipient Derivation**:
   - Client requests never supply `recipient_user_id`. The backend exclusively queries `WHERE recipient_user_id = req.user.id`.
   - Attempting to mark another user's notification as read returns `403 Forbidden`.

2. **Deduplication Engine**:
   - The `dedupe_key` database column is constrained by a `UNIQUE` index.
   - Concurrent retries or re-executions of the same event return the existing record without generating duplicate notices or skewing unread badge counts.

3. **Safe Navigation Routing**:
   - Notifications do not store arbitrary destination URLs. The frontend inspects `entity_type` and `entity_reference` to navigate strictly within authorized application routes.

4. **Future Channel Extensibility**:
   - Architected so external communication channels (Email, SMS, WhatsApp) can be integrated as modular listeners to the notification service in future milestones without altering in-app database persistence.


