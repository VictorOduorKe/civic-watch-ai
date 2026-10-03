# CivicWatch AI Kenya — Milestone Roadmap & Human Approval Gate Documentation

> **Single Source of Truth** for Platform Milestones M1 through M17.
> **Human Approval Gate**: A milestone cannot unlock the next milestone unless `status = VERIFIED` AND `humanApprovalStatus = APPROVED`.

---

## 1. Milestone Lifecycle & Human Approval Architecture

Every milestone follows a strict sequential lifecycle:

```
NOT_STARTED
      ↓
IN_PROGRESS
      ↓
IMPLEMENTED
      ↓
VERIFICATION
      ↓
VERIFIED
      ↓
WAITING_FOR_HUMAN_APPROVAL
      ↓
HUMAN_APPROVED
      ↓
NEXT_MILESTONE_UNLOCKED (Strictly one next milestone unlocked)
```

- **Rejection Flow**: If human review rejects progression, `humanApprovalStatus = REJECTED` with an auditable reason; future milestones remain locked.
- **Regression Flow**: If a previously verified milestone breaks: `VERIFIED -> REGRESSION -> IN_PROGRESS`, re-locking downstream stages.
- **Sequential Dependency**: `M1 → M2 → M3 → ... → M17`. Predecessors must be `VERIFIED + HUMAN_APPROVED`.

---

## 2. Dynamic Progress Metrics (Current Status)

- **Total Milestones**: 17
- **Implementation Progress**: 12 / 17 (71%)
- **Verification Progress**: 12 / 17 (71%)
- **Human Approval Progress**: 11 / 17 (65%)
- **Active / Current Milestone**: **M13 — Citizen Notifications & Subscriptions** (Status: `IN_PROGRESS`, `🔓 Unlocked`)
- **Next Unlocked Milestone**: **M14 — Verification & Trust Layer** (Status: `NOT_STARTED`, `🔒 Locked` awaiting M13 completion and Human Approval)

---

## 3. Milestones Specification (M1 – M17)

### M1 — FOUNDATION & PLATFORM SETUP
- **Objective**: Establish the core CivicWatch AI Kenya platform architecture.
- **Tasks**:
  - Initialize project architecture.
  - Establish frontend application.
  - Establish backend/API application.
  - Configure database.
  - Establish environment configuration.
  - Establish base routing.
  - Establish core UI layout.
  - Establish CivicWatch branding.
  - Establish reusable UI components.
  - Establish API communication.
  - Establish development configuration.
  - Establish basic error handling.
  - Establish initial security structure.
- **Acceptance Criteria**: Frontend runs, Backend runs, Database connects, API communication works, Core navigation works, CivicWatch branding is established, Environment variables separated.
- **Verification Requirements**: Frontend build, Backend startup, Database connection, Basic API test, Basic navigation test.
- **Dependencies**: None
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M2 — CIVIC REPORTING
- **Objective**: Create the core civic issue/reporting workflow.
- **Tasks**:
  - Create civic report submission interface.
  - Add report categories.
  - Add report descriptions.
  - Add location information.
  - Add validation.
  - Create backend report API.
  - Persist reports in database.
  - Implement report status.
  - Implement report retrieval.
  - Implement appropriate ownership/access controls.
  - Add error handling.
  - Add report submission feedback.
- **Acceptance Criteria**: A citizen can submit a valid civic report and the backend securely stores it.
- **Verification Requirements**: Valid report test, Invalid report handling, Missing fields validation, Unauthorized access checks, Database persistence test, Report retrieval test.
- **Dependencies**: M1
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M3 — CIVIC INFORMATION & ENGAGEMENT
- **Objective**: Expand CivicWatch beyond basic reporting into a broader civic-information and engagement platform.
- **Tasks**:
  - Civic information presentation.
  - Relevant civic content.
  - Citizen interaction mechanisms.
  - Information categorization.
  - Search/filtering where required.
  - Public information interfaces.
  - Engagement workflows.
  - Validation and moderation where appropriate.
- **Acceptance Criteria**: Citizens can access and interact with the implemented civic-information functionality without exposing private information.
- **Verification Requirements**: Public access test, Search/filtering test, User interaction test, Validation test, Mobile usability test, Unauthorized access test.
- **Dependencies**: M2
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M4 — AUTHENTICATION & ACCESS CONTROL
- **Objective**: Establish secure identity and role-based access.
- **Tasks**:
  - User registration.
  - User login.
  - Logout.
  - Session/token handling.
  - Password hashing.
  - Role management.
  - Protected routes.
  - Protected API endpoints.
  - Authorization middleware.
  - Account validation.
  - Authentication error handling.
- **Acceptance Criteria**: Authentication and authorization are enforced by the backend.
- **Verification Requirements**: Valid login test, Invalid login rejection, Logout session clearance, Protected route verification, Unauthorized API request rejection, Role restriction tests, Session expiration test.
- **Dependencies**: M3
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M5 — CITIZEN DASHBOARD & CASE MANAGEMENT
- **Objective**: Give citizens an organized view of their civic activity and cases.
- **Tasks**:
  - Citizen dashboard.
  - Submitted reports.
  - Case status.
  - Case details.
  - Status history where appropriate.
  - Case filtering.
  - Case search where appropriate.
  - User-specific access controls.
  - Empty/loading/error states.
- **Acceptance Criteria**: A citizen can securely view their permitted civic activity without accessing another user's information.
- **Verification Requirements**: Own case access test, Other user's case isolation test, Case status test, Case updates test, Unauthorized API access test, Dashboard responsiveness test.
- **Dependencies**: M4
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M6 — COMMUNITY PARTICIPATION
- **Objective**: Expand civic participation and community-level interaction.
- **Tasks**:
  - Community participation workflows.
  - Community information.
  - Community submissions.
  - Appropriate moderation.
  - Community categorization.
  - Interaction mechanisms.
  - Abuse protection.
  - Access controls.
  - Reporting/moderation mechanisms where required.
- **Acceptance Criteria**: Community participation works while clearly distinguishing community-generated information from verified official information.
- **Verification Requirements**: Community submission test, Moderation test, Unauthorized modification test, Abuse controls test, Public visibility test, Mobile experience test.
- **Dependencies**: M5
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M7 — SENSITIVE CASE HANDLING & ESCALATION
- **Objective**: Safely handle sensitive civic cases and route them to appropriate authorized destinations.
- **Tasks**:
  - Sensitive-case classification.
  - Sensitive-case storage.
  - Restricted access.
  - Authorized case routing.
  - Advocate/civil-society routing where implemented.
  - Police/administrative routing where implemented.
  - Case escalation.
  - Sensitive-case status.
  - Audit trail.
  - Privacy controls.
  - Sensitive-data logging restrictions.
- **Acceptance Criteria**: Sensitive cases are only accessible to authorized parties and can be routed through the configured escalation workflow.
- **Verification Requirements**: Sensitive submission test, Classification test, Routing test, Unauthorized access rejection, Case enumeration prevention, Audit trail verification, Sensitive data exposure prevention.
- **Dependencies**: M6
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M8 — ADMINISTRATION & PLATFORM MANAGEMENT
- **Objective**: Provide secure administrative management of the CivicWatch platform.
- **Tasks**:
  - Admin dashboard.
  - User management.
  - Role management.
  - Civic report management.
  - Moderation tools.
  - Content management where implemented.
  - System configuration.
  - Administrative audit logs.
  - Administrative authorization.
- **Acceptance Criteria**: Authorized administrators can manage permitted platform resources while ordinary users cannot access administrative functionality.
- **Verification Requirements**: Admin login test, Admin authorization test, Normal user admin block test, Resource management test, Audit logging test, Unauthorized API requests test.
- **Dependencies**: M7
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M9 — PRIVACY & SECURITY IMPROVEMENT
- **Objective**: Strengthen CivicWatch's handling of credentials, private information and sensitive civic data.
- **Tasks**:
  - Audit browser storage.
  - Remove sensitive credentials from localStorage.
  - Review authentication token handling.
  - Review sensitive client-side state.
  - Review API authorization.
  - Review private data exposure.
  - Review logging.
  - Review secrets.
  - Review security configuration.
  - Review sensitive-case privacy.
  - Improve secure session handling.
- **Acceptance Criteria**: Sensitive credentials and private information are not unnecessarily exposed through client-side storage or insecure application flows.
- **Verification Requirements**: Inspect localStorage, Inspect sessionStorage, Inspect cookies, Inspect API responses, Inspect browser network requests, Inspect source code, Inspect environment configuration, Inspect logs.
- **Dependencies**: M8
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M10 — SECURITY & PRODUCTION HARDENING
- **Objective**: Perform comprehensive production security hardening.
- **Tasks**:
  - Authentication security review.
  - Authorization review.
  - Input validation.
  - SQL injection protection.
  - XSS protection.
  - CSRF protection where applicable.
  - Rate limiting.
  - File-upload security.
  - CORS configuration.
  - Security headers.
  - Error handling.
  - Secret management.
  - Dependency review.
  - Docker security.
  - Production configuration.
  - Logging review.
  - API security review.
- **Acceptance Criteria**: The platform has been systematically reviewed for common application security weaknesses and identified issues have been addressed.
- **Verification Requirements**: Security tests passed (56/56 suite), Authentication tests passed, Authorization tests passed, API tests passed, Input validation tests passed, Dependency audit passed, Production build clean.
- **Dependencies**: M9
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)

---

### M11 — CIVIC ALERTS & ADVISORIES
- **Objective**: Create the CivicWatch public alerts and advisories system.
- **Tasks**:
  - Official alerts (county alerts, government advisories, public safety, verified announcements).
  - Utility alerts (electricity downtime, water interruptions, waste, infrastructure maintenance).
  - Community advisories and moderated notices.
  - Alert management (categories, severity, geographic targeting, verification, scheduling, expiration, archiving, audit trail).
  - Citizen experience (alert feed, alert details, search, filtering, location relevance, notifications).
- **Acceptance Criteria**: Citizens can view relevant alerts while official information is clearly distinguished from community information. Only authorized users can publish verified official alerts.
- **Verification Requirements**: Alert creation, Verification, Publishing, Expiration, Geographic filtering, Utility outage, Community advisory, Unauthorized publication block, Source attribution, Audit trail (45/45 automated tests passed).
- **Dependencies**: M10
- **Current Status**: `VERIFIED` (`PENDING` Human Approval)
- **Gate Action**: Awaiting explicit Human Approval from project owner to unlock M12.

---

### M12 — CIVIC INTELLIGENCE & INSIGHTS
- **Objective**: Turn aggregated civic information into useful, understandable insights.
- **Tasks**:
  - [x] Analytics validator schemas (Zod) — all public + admin endpoints
  - [x] Analytics service — privacy-preserving aggregation (public + admin)
  - [x] Analytics controller — public + admin endpoint handlers
  - [x] Analytics routes — `/api/analytics/*` and `/api/analytics/admin/*`
  - [x] Frontend public Insights page (`/insights`) — KPI cards, area trends, category/status charts, geography, alerts
  - [x] Admin Analytics page (`/admin/analytics`) — full admin view with additional stats
  - [x] Frontend API services (`analyticsApi`, `adminAnalyticsApi`)
  - [x] Public navbar Insights link
  - [x] Admin sidebar Analytics link (M12 badge)
  - [x] Privacy threshold (MIN_PUBLIC_COUNT=5) enforced on geographic data
  - [x] No PII exposed in any aggregated output
- **Acceptance Criteria**: Aggregated information provides useful civic insights without exposing individual private cases or sensitive information.
- **Verification Requirements**: Aggregation accuracy test, Authorization test, Privacy preservation test, Filtering and aggregation test, Dashboard calculations test, Large datasets performance test, Mobile responsiveness test.
- **Verification Results**: 70/70 automated verification tests passed (`backend/test_m12_analytics.js`). All regression suites verified (M7: 14/14, M8: 14/14, M9: 30/30, M10: 56/56, M11: 45/45, Roadmap Gate: 34/34). Browser UI fully verified for public and administrative views.
- **Analytics Endpoints**:
  - `GET /api/analytics/overview` — Public civic KPI aggregates and privacy metadata
  - `GET /api/analytics/reports` — Report time-series trends (daily/monthly)
  - `GET /api/analytics/reports/categories` — Category counts and percentages
  - `GET /api/analytics/reports/status` — Report status distribution
  - `GET /api/analytics/reports/geography` — Geographic activity by county (threshold-enforced)
  - `GET /api/analytics/alerts` — Public alert statistics (excludes drafts)
  - `GET /api/analytics/trends` — Combined time-series trends
  - `GET /api/analytics/admin/overview` — Admin overview with sensitive counts, user counts, draft alerts
  - `GET /api/analytics/admin/reports` — Admin report trends with active/resolved breakdown
  - `GET /api/analytics/admin/categories` — Admin category breakdown
  - `GET /api/analytics/admin/status` — Admin status breakdown
  - `GET /api/analytics/admin/geography` — Admin geographic breakdown (full, no suppression)
  - `GET /api/analytics/admin/alerts` — Admin alert statistics with draft counts and type breakdown
- **Supported Filters**:
  - Predefined ranges: `7d`, `30d`, `90d`, `12m`, `all`
  - Custom date ranges: `start_date`, `end_date` (strict order validation)
  - Geographic filter: `county`
  - Category filter: `category`
  - Status filter: `status`
- **Privacy & Aggregation Rules**:
  - Public Minimum Aggregation Threshold: `MIN_PUBLIC_COUNT = 5` (geographic groups with < 5 reports suppressed)
  - Zero PII: citizen names, phone numbers, emails, passwords, and private coordinates excluded
  - Sensitive case protection: internal notes, private case notes, and individual addresses suppressed
  - Public alert stats filter out `DRAFT` status alerts
- **Access Control (RBAC)**:
  - Public endpoints: Open access with rate limiting (300 req / 15 min)
  - Admin endpoints: Require authentication (`civicwatch_auth` HttpOnly cookie) + authorized role (`Admin`, `Moderator`, `Analyst`). Ordinary citizens blocked with 403 Forbidden.
- **Dependencies**: M11
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)
- **Gate Action**: Verified (70/70 automated tests passed) and approved by project owner. Unlocked M13.

---

### M13 — CITIZEN NOTIFICATIONS & SUBSCRIPTIONS
- **Objective**: Allow citizens to subscribe to relevant civic information.
- **Tasks**:
  - [x] Database migration: `user_notification_preferences` and `alert_subscriptions` tables created with indexes and foreign keys (`016_create_citizen_notifications_and_subscriptions.sql`).
  - [x] Notification preferences: In-app toggle, email dispatch toggle, minimum severity threshold (`ALL`, `LOW`, `MODERATE`, `HIGH`, `CRITICAL`), email configuration disclosure.
  - [x] Alert subscriptions: Category subscriptions (`PUBLIC_SAFETY`, `UTILITY_DOWNTIME`, `OFFICIAL_COUNTY`, `GOVERNMENT_ADVISORY`, `WEATHER_ENVIRONMENT`, `COMMUNITY_ADVISORY`), utility subscriptions (`ELECTRICITY`, `WATER`, `ROADS`, `WASTE`, `TELECOM`), geographic subscriptions (`county`, `sub_county`, `ward`).
  - [x] Notification Matching Engine: Server-side subscriber matching when civic alerts are published (`ACTIVE`), applying category, utility, geographic rules, and severity thresholds.
  - [x] Deduplication: Multi-match subscriptions (e.g. matching both county AND category) yield strictly 1 consolidated in-app notification per citizen.
  - [x] Lifecycle protection: Draft or unreviewed community notices strictly prevented from dispatching subscriber notifications.
  - [x] In-app notification state: Unread counter, read/unread states, mark single as read, mark all as read.
  - [x] Direct alert navigation: In-app notification items render `ALERT_PUBLISHED` badge with direct linking to `/alerts/:id`.
  - [x] Unsubscribe controls: Granular unsubscribe buttons in active subscriptions table and direct filter unsubscription API.
  - [x] Frontend UI: Responsive Notification Settings page (`/notifications/settings`) with channel status disclosure ("Not Configured" badge for email), severity chips, subscription cards, and active subscription management.
- **Acceptance Criteria**: Citizens can control what relevant civic information they receive.
- **Verification Requirements**: Subscribe workflow test, Unsubscribe workflow test, Preference changes test, Notification delivery test, Notification authorization test, Notification privacy test, Rate limiting test.
- **Verification Results**: 43/43 automated verification tests passed (`backend/test_m13_notifications.js`). Full regression passed: M7 (14/14), M8 (14/14), M9 (30/30), M10 (56/56), M11 (45/45), M12 (70/70), Roadmap Gate (16/16). Frontend production build passed cleanly. Browser UI verified with visual artifacts.
- **Dependencies**: M12
- **Current Status**: `VERIFIED` (`PENDING` Human Approval)
- **Gate Action**: Awaiting explicit Human Approval from project owner to unlock M14. Antigravity has stopped at the gate.

---

### M14 — VERIFICATION & TRUST LAYER
- **Objective**: Strengthen CivicWatch's ability to distinguish reliable information from unverified community information.
- **Tasks**:
  - Source verification.
  - Organization verification.
  - Content provenance.
  - Verification status.
  - Source references.
  - Moderation workflow.
  - Correction workflow.
  - Alert verification.
  - Community-content distinction.
  - Audit history.
  - Verified-source management.
- **Acceptance Criteria**: Users can clearly understand whether information is official/verified, community submitted, pending verification, rejected, or expired.
- **Verification Requirements**: Fake source attempt test, Unauthorized verification block test, Source modification test, Verification history test, Community vs official labeling test, Audit trail test.
- **Dependencies**: M13
- **Current Status**: `NOT_STARTED` (`🔒 Locked`)

---

### M15 — AI CIVIC ASSISTANT
- **Objective**: Expand CivicWatch's AI functionality into a useful civic information assistant.
- **Tasks**:
  - Civic information discovery.
  - Natural-language civic questions.
  - Report guidance.
  - Alert discovery.
  - Information classification where appropriate.
  - Case-routing assistance where appropriate.
  - Source attribution.
  - AI response safety.
  - AI failure handling.
  - Rate limiting.
  - Prompt/input protection.
  - Sensitive-information handling.
- **Acceptance Criteria**: The AI assistant provides useful civic information while clearly distinguishing AI-generated responses from verified source information. AI must not fabricate official announcements.
- **Verification Requirements**: Normal questions test, Unknown information handling test, Source attribution test, Prompt injection attempts test, Sensitive information protection test, AI service failure fallback test, Rate limits test, Incorrect AI output handling test.
- **Dependencies**: M14
- **Current Status**: `NOT_STARTED` (`🔒 Locked`)

---

### M16 — MONITORING, ANALYTICS & IMPACT
- **Objective**: Provide operational visibility into the platform and measure civic engagement.
- **Tasks**:
  - Application monitoring.
  - Error monitoring.
  - System health.
  - API performance.
  - Usage analytics.
  - Civic engagement metrics.
  - Report statistics.
  - Alert engagement.
  - Notification statistics.
  - Administrative analytics.
  - Privacy-preserving analytics.
- **Acceptance Criteria**: Administrators can understand platform health and legitimate usage patterns without exposing unnecessary personal information.
- **Verification Requirements**: Metrics accuracy test, Privacy protection test, Access control test, Performance benchmarks test, Error tracking test, Dashboard calculations test.
- **Dependencies**: M15
- **Current Status**: `NOT_STARTED` (`🔒 Locked`)

---

### M17 — FINAL INTEGRATION & RELEASE
- **Objective**: Integrate and validate the complete CivicWatch platform. This is the final release gate.
- **Tasks**:
  - Functional Verification (public workflows, auth, citizen dashboard, reports, community, sensitive cases, administration, alerts, notifications, verification, AI, analytics).
  - Security Verification (auth, authorization, API security, data protection, secrets, input validation, rate limiting, file handling, CORS, security headers).
  - Technical Verification (frontend build, backend startup, database, migrations, Docker, environment configuration, health checks, logging).
  - Documentation (architecture, security, privacy, deployment, API documentation, milestone documentation, recovery/backup).
  - Release (final regression testing, release checklist, known-issues list, deployment preparation, rollback preparation).
- **Acceptance Criteria**: All required milestones are verified, no critical release blockers remain, and a human project owner explicitly approves the final release.
- **Verification Requirements**: Complete end-to-end regression test suite, All acceptance criteria passed across M1 to M16, Security audit sign-off, Human project owner release sign-off.
- **Dependencies**: M16
- **Current Status**: `NOT_STARTED` (`🔒 Locked`)

---

## 4. Human Approval Gate Protocol

1. **Gate Verification Rule**: Antigravity or any automated process MUST STOP after completing milestone verification.
2. **Current Gate Status**:
   - M10 has been verified and approved.
   - M11 has been implemented and verified (45/45 automated tests passed).
   - M11 is currently **WAITING FOR HUMAN APPROVAL**.
   - **M12 remains LOCKED**. No implementation of M12 may begin until explicit human approval is received.
