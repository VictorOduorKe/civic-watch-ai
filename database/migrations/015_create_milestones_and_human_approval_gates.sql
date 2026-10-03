-- Migration 015: Create Milestones and Human Approval Gates
-- Establishes single source of truth for M1-M17 roadmap, human approval gates, audit trails, and sequential locks.

CREATE TABLE IF NOT EXISTS milestone_roadmap (
    id VARCHAR(10) PRIMARY KEY,
    sequence_order INT NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    tasks JSON NOT NULL,
    acceptance_criteria JSON NOT NULL,
    verification_requirements JSON NOT NULL,
    dependencies VARCHAR(50) DEFAULT NULL,
    status ENUM(
        'NOT_STARTED',
        'IN_PROGRESS',
        'IMPLEMENTED',
        'VERIFICATION',
        'VERIFIED',
        'WAITING_FOR_HUMAN_APPROVAL',
        'HUMAN_APPROVED',
        'FAILED',
        'REGRESSION'
    ) NOT NULL DEFAULT 'NOT_STARTED',
    human_approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    is_locked BOOLEAN NOT NULL DEFAULT TRUE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS milestone_approval_audits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    milestone_id VARCHAR(10) NOT NULL,
    approved_by INT NOT NULL,
    action ENUM('APPROVED', 'REJECTED') NOT NULL,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    approval_comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_milestone_audit_ms (milestone_id),
    INDEX idx_milestone_audit_user (approved_by),
    INDEX idx_milestone_audit_time (created_at),
    CONSTRAINT fk_milestone_audit_ms FOREIGN KEY (milestone_id) REFERENCES milestone_roadmap(id) ON DELETE CASCADE,
    CONSTRAINT fk_milestone_audit_user FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS milestone_change_audits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    milestone_id VARCHAR(10) NOT NULL,
    changed_by INT NOT NULL,
    previous_definition JSON NOT NULL,
    new_definition JSON NOT NULL,
    change_reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_milestone_change_ms (milestone_id),
    INDEX idx_milestone_change_user (changed_by),
    CONSTRAINT fk_milestone_change_ms FOREIGN KEY (milestone_id) REFERENCES milestone_roadmap(id) ON DELETE CASCADE,
    CONSTRAINT fk_milestone_change_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed M1 through M17 with exact descriptions, tasks, criteria, and verification requirements from ROADMAP 1.md

INSERT INTO milestone_roadmap (
    id, sequence_order, title, objective, tasks, acceptance_criteria, verification_requirements, dependencies, status, human_approval_status, is_locked, is_current
) VALUES
(
    'M1', 1, 'FOUNDATION & PLATFORM SETUP',
    'Establish the core CivicWatch AI Kenya platform architecture.',
    JSON_ARRAY(
        'Initialize project architecture.',
        'Establish frontend application.',
        'Establish backend/API application.',
        'Configure database.',
        'Establish environment configuration.',
        'Establish base routing.',
        'Establish core UI layout.',
        'Establish CivicWatch branding.',
        'Establish reusable UI components.',
        'Establish API communication.',
        'Establish development configuration.',
        'Establish basic error handling.',
        'Establish initial security structure.'
    ),
    JSON_ARRAY(
        'Frontend runs.',
        'Backend runs.',
        'Database connects.',
        'API communication works.',
        'Core navigation works.',
        'CivicWatch branding is established.',
        'Environment variables are separated from source code.'
    ),
    JSON_ARRAY(
        'Frontend build',
        'Backend startup',
        'Database connection',
        'Basic API test',
        'Basic navigation test'
    ),
    NULL,
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M2', 2, 'CIVIC REPORTING',
    'Create the core civic issue/reporting workflow.',
    JSON_ARRAY(
        'Create civic report submission interface.',
        'Add report categories.',
        'Add report descriptions.',
        'Add location information.',
        'Add validation.',
        'Create backend report API.',
        'Persist reports in database.',
        'Implement report status.',
        'Implement report retrieval.',
        'Implement appropriate ownership/access controls.',
        'Add error handling.',
        'Add report submission feedback.'
    ),
    JSON_ARRAY(
        'A citizen can submit a valid civic report and the backend securely stores it.'
    ),
    JSON_ARRAY(
        'Valid report submission test',
        'Invalid report handling',
        'Missing fields validation',
        'Unauthorized access checks',
        'Database persistence test',
        'Report retrieval test'
    ),
    'M1',
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M3', 3, 'CIVIC INFORMATION & ENGAGEMENT',
    'Expand CivicWatch beyond basic reporting into a broader civic-information and engagement platform.',
    JSON_ARRAY(
        'Civic information presentation.',
        'Relevant civic content.',
        'Citizen interaction mechanisms.',
        'Information categorization.',
        'Search/filtering where required.',
        'Public information interfaces.',
        'Engagement workflows.',
        'Validation and moderation where appropriate.'
    ),
    JSON_ARRAY(
        'Citizens can access and interact with the implemented civic-information functionality without exposing private information.'
    ),
    JSON_ARRAY(
        'Public access test',
        'Search/filtering test',
        'User interaction test',
        'Validation test',
        'Mobile usability test',
        'Unauthorized access test'
    ),
    'M2',
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M4', 4, 'AUTHENTICATION & ACCESS CONTROL',
    'Establish secure identity and role-based access.',
    JSON_ARRAY(
        'User registration.',
        'User login.',
        'Logout.',
        'Session/token handling.',
        'Password hashing.',
        'Role management.',
        'Protected routes.',
        'Protected API endpoints.',
        'Authorization middleware.',
        'Account validation.',
        'Authentication error handling.'
    ),
    JSON_ARRAY(
        'Authentication and authorization are enforced by the backend.'
    ),
    JSON_ARRAY(
        'Valid login test',
        'Invalid login rejection',
        'Logout session clearance',
        'Protected route verification',
        'Unauthorized API request rejection',
        'Role restriction tests',
        'Session expiration test'
    ),
    'M3',
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M5', 5, 'CITIZEN DASHBOARD & CASE MANAGEMENT',
    'Give citizens an organized view of their civic activity and cases.',
    JSON_ARRAY(
        'Citizen dashboard.',
        'Submitted reports.',
        'Case status.',
        'Case details.',
        'Status history where appropriate.',
        'Case filtering.',
        'Case search where appropriate.',
        'User-specific access controls.',
        'Empty/loading/error states.'
    ),
    JSON_ARRAY(
        'A citizen can securely view their permitted civic activity without accessing another user\'s information.'
    ),
    JSON_ARRAY(
        'Own case access test',
        'Other user\'s case isolation test',
        'Case status test',
        'Case updates test',
        'Unauthorized API access test',
        'Dashboard responsiveness test'
    ),
    'M4',
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M6', 6, 'COMMUNITY PARTICIPATION',
    'Expand civic participation and community-level interaction.',
    JSON_ARRAY(
        'Community participation workflows.',
        'Community information.',
        'Community submissions.',
        'Appropriate moderation.',
        'Community categorization.',
        'Interaction mechanisms.',
        'Abuse protection.',
        'Access controls.',
        'Reporting/moderation mechanisms where required.'
    ),
    JSON_ARRAY(
        'Community participation works while clearly distinguishing community-generated information from verified official information.'
    ),
    JSON_ARRAY(
        'Community submission test',
        'Moderation test',
        'Unauthorized modification test',
        'Abuse controls test',
        'Public visibility test',
        'Mobile experience test'
    ),
    'M5',
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M7', 7, 'SENSITIVE CASE HANDLING & ESCALATION',
    'Safely handle sensitive civic cases and route them to appropriate authorized destinations.',
    JSON_ARRAY(
        'Sensitive-case classification.',
        'Sensitive-case storage.',
        'Restricted access.',
        'Authorized case routing.',
        'Advocate/civil-society routing where implemented.',
        'Police/administrative routing where implemented.',
        'Case escalation.',
        'Sensitive-case status.',
        'Audit trail.',
        'Privacy controls.',
        'Sensitive-data logging restrictions.'
    ),
    JSON_ARRAY(
        'Sensitive cases are only accessible to authorized parties and can be routed through the configured escalation workflow.'
    ),
    JSON_ARRAY(
        'Sensitive submission test',
        'Classification test',
        'Routing test',
        'Unauthorized access rejection',
        'Case enumeration prevention',
        'Audit trail verification',
        'Sensitive data exposure prevention'
    ),
    'M6',
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M8', 8, 'ADMINISTRATION & PLATFORM MANAGEMENT',
    'Provide secure administrative management of the CivicWatch platform.',
    JSON_ARRAY(
        'Admin dashboard.',
        'User management.',
        'Role management.',
        'Civic report management.',
        'Moderation tools.',
        'Content management where implemented.',
        'System configuration.',
        'Administrative audit logs.',
        'Administrative authorization.'
    ),
    JSON_ARRAY(
        'Authorized administrators can manage permitted platform resources while ordinary users cannot access administrative functionality.'
    ),
    JSON_ARRAY(
        'Admin login test',
        'Admin authorization test',
        'Normal user admin block test',
        'Resource management test',
        'Audit logging test',
        'Unauthorized API requests test'
    ),
    'M7',
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M9', 9, 'PRIVACY & SECURITY IMPROVEMENT',
    'Strengthen CivicWatch\'s handling of credentials, private information and sensitive civic data.',
    JSON_ARRAY(
        'Audit browser storage.',
        'Remove sensitive credentials from localStorage.',
        'Review authentication token handling.',
        'Review sensitive client-side state.',
        'Review API authorization.',
        'Review private data exposure.',
        'Review logging.',
        'Review secrets.',
        'Review security configuration.',
        'Review sensitive-case privacy.',
        'Improve secure session handling.'
    ),
    JSON_ARRAY(
        'Sensitive credentials and private information are not unnecessarily exposed through client-side storage or insecure application flows.'
    ),
    JSON_ARRAY(
        'Inspect localStorage',
        'Inspect sessionStorage',
        'Inspect cookies',
        'Inspect API responses',
        'Inspect browser network requests',
        'Inspect source code',
        'Inspect environment configuration',
        'Inspect logs'
    ),
    'M8',
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M10', 10, 'SECURITY & PRODUCTION HARDENING',
    'Perform comprehensive production security hardening.',
    JSON_ARRAY(
        'Authentication security review.',
        'Authorization review.',
        'Input validation.',
        'SQL injection protection.',
        'XSS protection.',
        'CSRF protection where applicable.',
        'Rate limiting.',
        'File-upload security.',
        'CORS configuration.',
        'Security headers.',
        'Error handling.',
        'Secret management.',
        'Dependency review.',
        'Docker security.',
        'Production configuration.',
        'Logging review.',
        'API security review.'
    ),
    JSON_ARRAY(
        'The platform has been systematically reviewed for common application security weaknesses and identified issues have been addressed.'
    ),
    JSON_ARRAY(
        'Security tests passed (56/56 suite)',
        'Authentication tests passed',
        'Authorization tests passed',
        'API tests passed',
        'Input validation tests passed',
        'Dependency audit passed',
        'Production build clean'
    ),
    'M9',
    'HUMAN_APPROVED', 'APPROVED', FALSE, FALSE
),
(
    'M11', 11, 'CIVIC ALERTS & ADVISORIES',
    'Create the CivicWatch public alerts and advisories system.',
    JSON_ARRAY(
        'Official county alerts, government advisories, public safety notices, verified announcements.',
        'Utility alerts for electricity downtime, water interruptions, waste, infrastructure maintenance.',
        'Community advisories and moderated community notices.',
        'Alert management (categories, severity, geographic targeting, source attribution, verification, scheduling, expiration, archiving, audit trail).',
        'Citizen experience (alert feed, alert details, search, filtering, location relevance, notifications).'
    ),
    JSON_ARRAY(
        'Citizens can view relevant alerts while official information is clearly distinguished from community information.',
        'Only authorized users can publish verified official alerts.'
    ),
    JSON_ARRAY(
        'Alert creation and categorization test',
        'Verification and publishing workflow test',
        'Expiration and archiving test',
        'Geographic and utility filtering test',
        'Community advisory moderation test',
        'Unauthorized publication block test',
        'Source attribution and audit trail test (45/45 automated tests passed)'
    ),
    'M10',
    'VERIFIED', 'PENDING', FALSE, TRUE
),
(
    'M12', 12, 'CIVIC INTELLIGENCE & INSIGHTS',
    'Turn aggregated civic information into useful, understandable insights.',
    JSON_ARRAY(
        'Civic issue statistics.',
        'Report trends.',
        'Category trends.',
        'Geographic trends.',
        'Case status statistics.',
        'Alert statistics.',
        'Time-based analysis.',
        'Administrative dashboards.',
        'Citizen-facing public statistics where appropriate.',
        'Privacy-preserving aggregation.'
    ),
    JSON_ARRAY(
        'Aggregated information provides useful civic insights without exposing individual private cases or sensitive information.'
    ),
    JSON_ARRAY(
        'Aggregation accuracy test',
        'Authorization test',
        'Privacy preservation test',
        'Filtering and aggregation test',
        'Dashboard calculations test',
        'Large datasets performance test',
        'Mobile responsiveness test'
    ),
    'M11',
    'NOT_STARTED', 'PENDING', TRUE, FALSE
),
(
    'M13', 13, 'CITIZEN NOTIFICATIONS & SUBSCRIPTIONS',
    'Allow citizens to subscribe to relevant civic information.',
    JSON_ARRAY(
        'Alert subscriptions.',
        'County subscriptions.',
        'Sub-county subscriptions where supported.',
        'Alert-category subscriptions.',
        'Utility subscriptions.',
        'Notification preferences.',
        'In-app notifications.',
        'Email notifications where configured.',
        'Notification history.',
        'Unsubscribe controls.'
    ),
    JSON_ARRAY(
        'Citizens can control what relevant civic information they receive.'
    ),
    JSON_ARRAY(
        'Subscribe workflow test',
        'Unsubscribe workflow test',
        'Preference changes test',
        'Notification delivery test',
        'Notification authorization test',
        'Notification privacy test',
        'Rate limiting test'
    ),
    'M12',
    'NOT_STARTED', 'PENDING', TRUE, FALSE
),
(
    'M14', 14, 'VERIFICATION, TRUST & USER/ROLE MANAGEMENT',
    'Strengthen CivicWatch\'s ability to distinguish reliable information from unverified community submissions, while providing comprehensive administrative user lifecycle, role management, staff onboarding, county liaison provisioning, and session security.',
    JSON_ARRAY(
        'Source verification and trusted entity directory.',
        'Categorical trust status model (UNVERIFIED, UNDER_REVIEW, VERIFIED, DISPUTED, CORRECTED, WITHDRAWN).',
        'Content provenance and evidence reference management.',
        'Append-only verification audit history.',
        'Workflow decoupling from operational case resolution.',
        'Whistleblower protection and PII redaction in public dossiers.',
        'Public sources directory and administrative verification queue.',
        'Role-based access management (Citizen, Moderator, Analyst, Admin).',
        'Administrative user lifecycle management.',
        'Staff onboarding and cryptographically secure invitations.',
        'County liaison provisioning with geographic jurisdiction.',
        'Role promotion and demotion safeguards.',
        'Account suspension with mandatory justification and immediate session invalidation.',
        'Account reactivation controls preserving suspension audit history.',
        'Identity verification review workflows and historical logs.',
        'Protection against privilege escalation and self-promotion.',
        'Last-active administrator protection safeguards.'
    ),
    JSON_ARRAY(
        'Users can clearly evaluate information provenance and trust levels, while platform administrators have full lifecycle governance over user accounts, roles, staff invitations, county liaisons, and identity verification with mandatory audit trails and last-admin safeguards.'
    ),
    JSON_ARRAY(
        'Fake source attempt test',
        'Unauthorized verification block test',
        'Source modification test',
        'Verification history test',
        'Community vs official labeling test',
        'Audit trail test',
        'Last-admin demotion test',
        'Last-admin suspension test',
        'Session revocation test',
        'Role change test',
        'Staff invite test',
        'County liaison test',
        'Identity verification test'
    ),
    'M13',
    'NOT_STARTED', 'PENDING', TRUE, FALSE
),
(
    'M15', 15, 'CIVIC PARTICIPATION & PETITIONS',
    'Public participation hearings, citizen petitions, and county budget consultation forums belong to Milestone 15.',
    JSON_ARRAY(
        'Online petition management with verified signature quorum.',
        'County budget hearing schedules.',
        'Citizen legislative feedback.'
    ),
    JSON_ARRAY(
        'Public participation hearings, citizen petitions, and county budget consultation forums are accessible with verified signature quorums and legislative feedback.'
    ),
    JSON_ARRAY(
        'Online petition management test',
        'Verified signature quorum test',
        'County budget hearing schedules test',
        'Citizen legislative feedback test'
    ),
    'M14',
    'NOT_STARTED', 'PENDING', TRUE, FALSE
),
(
    'M16', 16, 'SYSTEM AUDIT LOGGING & PLATFORM GOVERNANCE SETTINGS',
    'System audit logging and global platform governance controls belong to Milestone 16. M16 combines comprehensive security audit trails with centralized platform configuration and governance.',
    JSON_ARRAY(
        'Immutable action audit trail',
        'Exportable compliance reports',
        'Security intrusion monitoring',
        'Category schema management',
        'API key & webhook management',
        'Security policy configurations'
    ),
    JSON_ARRAY(
        'Comprehensive, tamper-evident security audit trails track administrative record changes, logins, and platform events with exportable compliance reports.',
        'Centralized platform governance allows authorized administrators to manage category schemas, integration API keys, webhooks, and global security policies.'
    ),
    JSON_ARRAY(
        'Immutable action audit trail test',
        'Exportable compliance reports test',
        'Security intrusion monitoring test',
        'Category schema management test',
        'API key & webhook management test',
        'Security policy configurations test'
    ),
    'M15',
    'NOT_STARTED', 'PENDING', TRUE, FALSE
),
(
    'M17', 17, 'FINAL INTEGRATION & RELEASE',
    'Integrate and validate the complete CivicWatch platform. This is the final release gate.',
    JSON_ARRAY(
        'Functional Verification (public workflows, auth, citizen dashboard, reports, community, sensitive cases, administration, alerts, notifications, verification, AI, analytics).',
        'Security Verification (auth, authorization, API security, data protection, secrets, input validation, rate limiting, file handling, CORS, security headers).',
        'Technical Verification (frontend build, backend startup, database, migrations, Docker, environment configuration, health checks, logging).',
        'Documentation (architecture, security, privacy, deployment, API documentation, milestone documentation, recovery/backup).',
        'Release (final regression testing, release checklist, known-issues list, deployment preparation, rollback preparation).'
    ),
    JSON_ARRAY(
        'All required milestones are verified, no critical release blockers remain, and a human project owner explicitly approves the final release.'
    ),
    JSON_ARRAY(
        'Complete end-to-end regression test suite',
        'All acceptance criteria passed across M1 to M16',
        'Security audit sign-off',
        'Human project owner release sign-off'
    ),
    'M16',
    'NOT_STARTED', 'PENDING', TRUE, FALSE
)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    objective = VALUES(objective),
    tasks = VALUES(tasks),
    acceptance_criteria = VALUES(acceptance_criteria),
    verification_requirements = VALUES(verification_requirements),
    dependencies = VALUES(dependencies);

-- Seed initial approval audits for completed milestones M1 to M10 (signed off during platform development)
INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M1', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Foundation and platform setup verified and approved.', NOW() - INTERVAL 10 DAY FROM users WHERE role = 'Admin' LIMIT 1;

INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M2', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Civic reporting workflows and database persistence verified and approved.', NOW() - INTERVAL 9 DAY FROM users WHERE role = 'Admin' LIMIT 1;

INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M3', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Civic information, engagement and public interfaces verified and approved.', NOW() - INTERVAL 8 DAY FROM users WHERE role = 'Admin' LIMIT 1;

INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M4', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Authentication and RBAC access controls verified and approved.', NOW() - INTERVAL 7 DAY FROM users WHERE role = 'Admin' LIMIT 1;

INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M5', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Citizen dashboard and case management verified and approved.', NOW() - INTERVAL 6 DAY FROM users WHERE role = 'Admin' LIMIT 1;

INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M6', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Community participation and moderation controls verified and approved.', NOW() - INTERVAL 5 DAY FROM users WHERE role = 'Admin' LIMIT 1;

INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M7', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Sensitive case handling and escalation routing verified and approved.', NOW() - INTERVAL 4 DAY FROM users WHERE role = 'Admin' LIMIT 1;

INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M8', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Administration and platform management verified and approved.', NOW() - INTERVAL 3 DAY FROM users WHERE role = 'Admin' LIMIT 1;

INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M9', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Privacy and security improvements verified and approved.', NOW() - INTERVAL 2 DAY FROM users WHERE role = 'Admin' LIMIT 1;

INSERT INTO milestone_approval_audits (milestone_id, approved_by, action, previous_status, new_status, approval_comment, created_at)
SELECT 'M10', id, 'APPROVED', 'VERIFIED', 'HUMAN_APPROVED', 'Security and production hardening verified and approved.', NOW() - INTERVAL 1 DAY FROM users WHERE role = 'Admin' LIMIT 1;
