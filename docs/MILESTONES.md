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
- **Current Status**: `HUMAN_APPROVED` (`APPROVED`)
- **Gate Action**: Verified (43/43 automated tests passed) and approved by project owner. Unlocked M14.

---

### M14 — VERIFICATION, TRUST & USER/ROLE MANAGEMENT
- **Objective**: Strengthen CivicWatch's ability to distinguish reliable information from unverified community submissions, while providing comprehensive administrative user lifecycle, role management, staff onboarding, county liaison provisioning, and session security.
- **Part A: Verification & Trust Layer**:
  - [x] Database schema: Created `sources`, `verification_records`, `verification_references` tables; extended `reports` and `civic_alerts` with `verification_status`, `source_id`, `verified_by`, `verified_at` (`017_create_verification_and_trust_layer.sql`).
  - [x] Seeded authentic baseline civic sources: Nairobi City County, Kenya Power (KPLC), Nairobi Water (NCWSC), NDMU, Kenya Red Cross, and CivicWatch Community Submissions.
  - [x] Trust status model: Categorical enum (`UNVERIFIED`, `UNDER_REVIEW`, `VERIFIED`, `DISPUTED`, `CORRECTED`, `WITHDRAWN`), strictly avoiding deceptive numerical "trust scores".
  - [x] Append-only audit history: `verification_records` logs every action, status transition, verified_by user, mandatory justification reason, and evidence summary.
  - [x] Reference & evidence management: `verification_references` table with strict URL sanitization rejecting `javascript:`, `data:`, or malformed URI protocols.
  - [x] Action workflows: `VERIFY`, `DISPUTE` (requires reason, does not brand content false, queues for review), `CORRECT` (requires reason and supporting reference), and `WITHDRAW` (preserves historical trail).
  - [x] Decoupling: Verification status is completely decoupled from case resolution workflow status (`Submitted`, `In Progress`, `Resolved`).
  - [x] Whistleblower & privacy protection: Public source listings and provenance dossiers strictly redact reporter PII, internal contact emails, and personal phones.
  - [x] Public Sources Directory: Responsive public view (`/sources`) with category filtering, live search, official verification badges, external site links, and direct provenance dossier modals.
  - [x] Administrative Verification Dashboard: OCL workspace view (`/admin/verification`) with review queue, KPI metrics counters, entity filter, source registration modal, and inline status update actions.
  - [x] Alert detail provenance integration: Embedded `TrustBadge` in alert headers and clickable `Trust & Provenance` audit modal displaying source attribution, reference links, and chronological audit history.
- **Part B: User & Role Management**:
  - [x] Database schema: Extended `users` table with `status` (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`), `identity_status` (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`), `is_county_liaison`, `liaison_county`, `liaison_sub_county`, `suspension_reason`, `suspended_at`, `suspended_by`; created `user_management_audits`, `identity_verification_records`, and `staff_invitations` tables (`018_create_user_and_role_management.sql`).
  - [x] Role-Based Access Control (RBAC): Hierarchical permissions across `Citizen`, `Moderator`, `Analyst`, and `Admin`. Mutations strictly restricted to `Admin`; read-only intelligence access granted to `Analyst`.
  - [x] Last-Admin Protection: Strict server-side safeguards preventing the demotion or suspension of the platform's last active administrator, preventing accidental lockout.
  - [x] Self-Promotion Safeguards: Direct blocks preventing users from unilaterally escalating their own privileges to Administrator.
  - [x] Account Suspension & Immediate Session Revocation: Mandatory justification reason (min 5 characters) required for suspension. Setting `is_active = 0` immediately invalidates active authentication sessions across all API endpoints.
  - [x] Account Reactivation: Administrative reactivation restores full platform access while preserving prior suspension audit records.
  - [x] County Liaison Provisioning: Designates authorized county liaisons with geographic jurisdiction (County and optional Sub-county scope) for regional crisis coordination.
  - [x] Identity Verification Workflow: Administrative review of government identity documents (National ID, Passport, Voter ID) with document reference tracking, status recording (`VERIFIED`, `REJECTED`, `PENDING`), and audit history.
  - [x] Staff Onboarding & Invitations: Cryptographically secure staff invitations (token-based with 7-day expiration) for onboarding Administrators, Moderators, and Analysts.
  - [x] Privacy Protection: Password hashes, salt keys, and sensitive internal tokens are strictly excluded from all user management API endpoints and dossiers.
  - [x] Administrative User Management UI: Dedicated `/admin/users` workspace featuring real-time KPI metrics, search, role/status/identity filters, user table, profile dossier modal, role change modal, suspension modal, reactivation modal, county liaison provisioning modal, identity verification modal, and staff invitation modal.
  - [x] Administrative Audit Trail: Global audit log (`/admin/users/audits` and within the UI tab) tracking all administrative actions with actor metadata, previous state, new state, and justification reason.
- **Acceptance Criteria**: Users can clearly evaluate information provenance and trust levels, while platform administrators have full lifecycle governance over user accounts, roles, staff invitations, county liaisons, and identity verification with mandatory audit trails and last-admin safeguards.
- **Verification Requirements**: Fake source attempt test, Unauthorized verification block test, Source modification test, Verification history test, Community vs official labeling test, Audit trail test, Last-admin demotion test, Last-admin suspension test, Session revocation test, Role change test, Staff invite test, County liaison test, Identity verification test.
- **Verification Results**:
  - Verification & Trust Layer: 64/64 automated tests passed (`backend/test_m14_verification.js`).
  - User & Role Management: 59/59 automated tests passed (`backend/test_m14_users.js`).
  - Total M14 Test Suite: 123/123 tests passed.
  - Full Regression Passed: M7 (14/14), M8 (14/14), M9 (30/30), M10 (56/56), M11 (45/45), M12 (70/70), M13 (43/43), M14 (123/123), Roadmap Gate (16/16) — Total: 411/411 tests passing.
  - Frontend production build (`npm run build --prefix frontend`) passed with 0 errors.
  - Verified Visual Artifacts:
    - Public Sources Directory: `m14_public_sources_directory.png`
    - Admin Verification Dashboard: `m14_admin_verification_dashboard.png`
    - Alert Provenance Modal: `m14_alert_provenance_modal.png`
    - Admin User Directory: `m14_admin_users_directory.png`
    - User Dossier & Audit History Modal: `m14_admin_user_dossier_modal.png`
- **Dependencies**: M13
- **Current Status**: `VERIFIED` (`PENDING` Human Approval)
- **Gate Action**: Awaiting explicit Human Approval from project owner to unlock M15. Antigravity has stopped at the gate.

---

### M15 — CIVIC PARTICIPATION & PETITIONS
- **Objective**: Public participation hearings, citizen petitions, and county budget consultation forums belong to Milestone 15.
- **Scheduled Capabilities**:
  - Online petition management with verified signature quorum
  - County budget hearing schedules
  - Citizen legislative feedback
- **Implemented Technical Scope**:
  - **Online Petition Management**: Full petition lifecycle (`DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `CLOSED`, `QUORUM_REACHED`, `REJECTED`, `ARCHIVED`), server-side quorum verification (verified vs unverified signature weights), duplicate signature prevention via database unique constraints, and public dossier privacy (redacted email/National ID, masked citizen names).
  - **County Budget Hearing Schedules**: County-scoped hearing management (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), strict liaison authorization preventing cross-county scheduling, venue / virtual participation link support, and public county filtering.
  - **Citizen Legislative Feedback**: Bill / policy discussion items, public memorandum submissions, moderation workflow (`SUBMITTED`, `PUBLISHED`, `REJECTED`), and privacy protection (masked author names, redacted emails).
  - **Participation Audit Trail & Metrics**: Append-only event auditing (`milestone_participation_audits`), actor attribution, and administrative KPI metric endpoints (`/api/participation/stats`).
  - **Frontend Workspaces**:
    - Petitions Directory (`/participate/petitions`) with search, county filter, status tabs, and petition creation modal.
    - Petition Detail & Signing View (`/participate/petitions/:id`) with real-time quorum progress bar, verified signer badges, signature signing/withdrawal, and public signers list.
    - County Budget Hearings Schedule (`/participate/hearings`) with county dropdown, date filtering, participation badges, and county-liaison scheduling modal.
    - Legislative Feedback & Memoranda Feed (`/participate/legislative`) with active bill cards, memorandum submission modal, and published public feedback feed.
    - Admin Participation Dashboard (`/admin/participation`) with pending petition moderation queue, legislative feedback moderation, and county hearing oversight.
- **Acceptance Criteria**: Public participation hearings, citizen petitions, and county budget consultation forums are accessible with verified signature quorums and legislative feedback.
- **Verification Requirements**: Online petition management test, Verified signature quorum test, County budget hearing schedules test, Citizen legislative feedback test.
- **Verification Results**:
  - 74/74 automated verification tests passed (`backend/test_m15_participation.js`).
  - Full regression test suite passed: M10 (56/56), M11 (45/45), M12 (70/70), M13 (43/43), M14 (123/123), M15 (74/74), Roadmap Gate (16/16) — Total: 427/427 tests passing.
  - Frontend production build (`npm run build --prefix frontend`) passed with 0 errors (2334 modules transformed).
- **Dependencies**: M14
- **Current Status**: `HUMAN_APPROVED` (Approved by Project Owner)
- **Gate Action**: M15 approved by human project owner. M16 unlocked for implementation.

---

### M16 — SYSTEM AUDIT LOGGING & PLATFORM GOVERNANCE SETTINGS
- **Objective**: System audit logging and global platform governance controls belong to Milestone 16. M16 combines comprehensive security audit trails with centralized platform configuration and governance.
- **Scheduled Capabilities**:
  - **System Audit Logging**:
    - Immutable action audit trail
    - Exportable compliance reports
    - Security intrusion monitoring
  - **Platform Governance Settings**:
    - Category schema management
    - API key & webhook management
    - Security policy configurations
- **Implemented Technical Scope**:
  - **Immutable Action Audit Trail**:
    - Chained SHA-256 cryptographic hashing (`payload + previousHash`), append-only database storage (`audit_events`), tamper-evident verification engine traversing from genesis root to head block.
    - Automatic sensitive credential redaction (passwords, secrets, tokens, national IDs) at ingestion.
    - Actor IP, user agent, entity reference, severity (`INFO`, `NOTICE`, `WARNING`, `SECURITY`, `CRITICAL`), and outcome tracking (`SUCCESS`, `FAILURE`, `DENIED`, `BLOCKED`).
  - **Exportable Compliance Reports**:
    - Filter-based compliance report generation (`CSV`, `JSON`) with cryptographic audit-the-audit tracking (`AUDIT_EXPORT_GENERATED`).
    - Standardized compliance headers and cryptographic hashes in exports.
  - **Security Intrusion Monitoring**:
    - Automated heuristic detection: rapid failed login bursts, unauthorized 403 route probing, credential stuffing bursts.
    - Threat triage lifecycle: `DETECTED` → `REVIEWING` → `CONFIRMED` / `DISMISSED` / `RESOLVED` with mandatory audit rationale notes.
    - Operational security statistics endpoint (`/api/admin/security-events/stats`).
  - **Platform Governance Settings**:
    - **Category Schema Registry**: Schema governance extending `report_categories` with lifecycle status (`ACTIVE`, `ARCHIVED`), module scope (`INCIDENT`, `PARTICIPATION`, `ALERT`), and display order with safe archiving protections.
    - **API Key Management**: Machine-to-machine integration credentials with prefix tracking (`cwk_live_`), SHA-512 secret hashing, granular scopes, rate limit governance, secret rotation, and immediate revocation. Raw secrets are revealed strictly once.
    - **Outbound Webhook Integrations**: Event dispatch (`incident.created`, `alert.published`, `petition.created`, `audit.threshold_breach`) with SSRF prevention (strictly blocking localhost, loopback, and RFC 1918 private IP subnets), HMAC-SHA256 signature headers, test ping diagnostics, and delivery history logs.
    - **Security Policy Configurations**: Centralized policy parameter management (`session_timeout_minutes`, `max_failed_logins`, `lockout_duration_minutes`, `password_min_length`, `require_mfa`, etc.) with strict min/max boundary validation and versioned audit history (`security_policy_history`).
  - **Frontend Workspaces**:
    - System Audit Trail (`/admin/audit`): Search, multi-module filtering, cryptographic block inspector modal, one-click "Verify Chain Integrity" with live verification modal, and compliance export modal.
    - Security Intrusion Monitoring (`/admin/security-monitoring`): Threat telemetry KPI cards, status filters, and interactive threat triage modal.
    - Platform Governance Settings (`/admin/governance`): 4-tab centralized hub covering Category Schemas, API Keys & Credentials, Outbound Webhooks, and Security Policy Controls with historical change audit.
- **Acceptance Criteria**: Comprehensive, tamper-evident security audit trails track administrative record changes, logins, and platform events with exportable compliance reports. Centralized platform governance allows authorized administrators to manage category schemas, integration API keys, webhooks, and global security policies.
- **Verification Requirements**: Immutable action audit trail test, Exportable compliance reports test, Security intrusion monitoring test, Category schema management test, API key & webhook management test, Security policy configurations test.
- **Verification Results**:
  - **61/61 automated verification tests passed** (`backend/test_m16_governance.js`).
  - **Cryptographic integrity verified**: SHA-256 block chain validated across all 100+ recorded system actions with zero tampering.
  - **Regression test suites passed**: M14 (123/123), M15 (74/74), M16 (61/61) — Total: 258/258 tests passing.
  - **Frontend production build** (`npm run build --prefix frontend`) passed with 0 errors (2,337 modules transformed).
  - **Verified Visual Artifacts**:
    - System Audit Trail Dashboard: `m16_system_audit_trail.png`
    - Cryptographic Chain Integrity Verified Modal: `m16_audit_integrity_verified.png`
    - Security Intrusion Monitoring Workspace: `m16_security_intrusion_monitoring.png`
    - Category Schemas Registry: `m16_governance_categories.png`
    - API Key & Credentials Management: `m16_governance_api_keys.png`
    - Outbound Webhooks & Security Policies: `m16_governance_policies.png`
    - Platform Roadmap Gate: `m16_admin_roadmap_gate.png`
- **Dependencies**: M15
- **Current Status**: `VERIFIED` (`PENDING` Human Approval)
- **Gate Action**: M16 verified. Awaiting explicit Human Approval from project owner to unlock M17. Antigravity has stopped at the gate.

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
   - M14 and M15 have been verified and officially approved by the project owner.
   - M16 has been implemented and verified (61/61 automated tests passed, cryptographic hash chain integrity validated).
   - M16 is currently **WAITING FOR HUMAN APPROVAL**.
   - **M17 remains LOCKED**. No implementation of M17 may begin until explicit human approval is received.
