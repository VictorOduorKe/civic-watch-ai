CivicWatch AI Kenya — Complete Milestone Roadmap & Human Approval Gate

OBJECTIVE

Extend the CivicWatch AI Kenya Milestone Tracking system so that it contains the complete project roadmap, including:

- Every milestone
- Milestone objectives
- Tasks to be performed
- Expected functionality
- Acceptance criteria
- Verification requirements
- Dependencies
- Current status
- Human approval status

The milestone system must become the project's single source of truth for development progress.

---

CRITICAL RULE — HUMAN APPROVAL IS REQUIRED

NEVER AUTOMATICALLY PROCEED TO THE NEXT MILESTONE

This is a mandatory project rule.

A milestone may be:

- Implemented
- Tested
- Verified

without automatically activating the next milestone.

The next milestone MUST remain locked until a human project owner explicitly approves progression.

The system must never interpret:

Milestone completed

as:

Proceed to next milestone

These are two separate states.

---

1. MILESTONE LIFECYCLE

Every milestone follows this lifecycle:

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
NEXT_MILESTONE_UNLOCKED

If verification fails:

VERIFICATION
      ↓
FAILED
      ↓
IN_PROGRESS

If a previously verified milestone later breaks:

VERIFIED
      ↓
REGRESSION
      ↓
IN_PROGRESS

---

2. HUMAN APPROVAL GATE

Every milestone must have:

humanApprovalStatus

with values:

PENDING
APPROVED
REJECTED

Default:

PENDING

A milestone cannot unlock the next milestone unless:

status = VERIFIED

AND:

humanApprovalStatus = APPROVED

Both conditions are mandatory.

---

3. APPROVAL AUTHORIZATION

Only an authorized project administrator/project owner may approve a milestone.

The frontend must never be trusted to determine approval.

The backend must verify:

- Authentication
- Administrator/project-owner role
- Milestone ID
- Current milestone status
- Previous milestone status

A normal citizen must never be able to approve a milestone.

---

4. APPROVAL ACTION

Provide an explicit action such as:

Approve Milestone & Unlock Next

Before approval, show:

M10 has been verified.

The next milestone is M11 — Civic Alerts & Advisories.

Approving this milestone will unlock M11.

This action should only be performed after human review.

[Cancel] [Approve & Unlock M11]

Do not make approval automatic.

---

5. APPROVAL RECORD

When approved, record:

milestone_id
approved_by
approved_at
previous_status
new_status
approval_comment

The approval record must be preserved.

Do not allow the frontend to supply:

approved_by
approved_at

These must be determined by the authenticated backend session.

---

6. REJECTION

A human must also be able to reject progression.

If rejected:

humanApprovalStatus = REJECTED

Require a reason.

Example:

Milestone M10 verified, but approval rejected.

Reason:
"Review the authentication regression before proceeding."

The next milestone remains locked.

---

7. MILESTONE LOCKING

Future milestones must display:

🔒 Locked

Waiting for human approval of the previous milestone.

Do not allow implementation of the next milestone through the milestone management interface while it is locked.

The current milestone remains active until explicitly approved.

---

8. ROADMAP

Populate the milestone roadmap with the following project stages.

IMPORTANT:

The roadmap should be stored centrally and version-controlled.

Do not duplicate these definitions across multiple frontend components.

---

M1 — FOUNDATION & PLATFORM SETUP

Objective

Establish the core CivicWatch AI Kenya platform architecture.

Tasks

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

Acceptance Criteria

- Frontend runs.
- Backend runs.
- Database connects.
- API communication works.
- Core navigation works.
- CivicWatch branding is established.
- Environment variables are separated from source code.

Verification

Run:

- Frontend build
- Backend startup
- Database connection
- Basic API test
- Basic navigation test

---

M2 — CIVIC REPORTING

Objective

Create the core civic issue/reporting workflow.

Tasks

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

Acceptance Criteria

A citizen can submit a valid civic report and the backend securely stores it.

Verification

Test:

- Valid report
- Invalid report
- Missing fields
- Unauthorized access
- Database persistence
- Report retrieval

---

M3 — CIVIC INFORMATION & ENGAGEMENT

Objective

Expand CivicWatch beyond basic reporting into a broader civic-information and engagement platform.

Tasks

- Civic information presentation.
- Relevant civic content.
- Citizen interaction mechanisms.
- Information categorization.
- Search/filtering where required.
- Public information interfaces.
- Engagement workflows.
- Validation and moderation where appropriate.

Acceptance Criteria

Citizens can access and interact with the implemented civic-information functionality without exposing private information.

Verification

Test:

- Public access
- Search/filtering
- User interaction
- Validation
- Mobile usability
- Unauthorized access

---

M4 — AUTHENTICATION & ACCESS CONTROL

Objective

Establish secure identity and role-based access.

Tasks

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

Acceptance Criteria

Authentication and authorization are enforced by the backend.

Verification

Test:

- Valid login
- Invalid login
- Logout
- Protected route
- Unauthorized API request
- Role restriction
- Session expiration

---

M5 — CITIZEN DASHBOARD & CASE MANAGEMENT

Objective

Give citizens an organized view of their civic activity and cases.

Tasks

- Citizen dashboard.
- Submitted reports.
- Case status.
- Case details.
- Status history where appropriate.
- Case filtering.
- Case search where appropriate.
- User-specific access controls.
- Empty/loading/error states.

Acceptance Criteria

A citizen can securely view their permitted civic activity without accessing another user's information.

Verification

Test:

- Own case access
- Other user's case access
- Case status
- Case updates
- Unauthorized API access
- Dashboard responsiveness

---

M6 — COMMUNITY PARTICIPATION

Objective

Expand civic participation and community-level interaction.

Tasks

- Community participation workflows.
- Community information.
- Community submissions.
- Appropriate moderation.
- Community categorization.
- Interaction mechanisms.
- Abuse protection.
- Access controls.
- Reporting/moderation mechanisms where required.

Acceptance Criteria

Community participation works while clearly distinguishing community-generated information from verified official information.

Verification

Test:

- Community submission
- Moderation
- Unauthorized modification
- Abuse controls
- Public visibility
- Mobile experience

---

M7 — SENSITIVE CASE HANDLING & ESCALATION

Objective

Safely handle sensitive civic cases and route them to appropriate authorized destinations.

Tasks

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

Acceptance Criteria

Sensitive cases are only accessible to authorized parties and can be routed through the configured escalation workflow.

Verification

Test:

- Sensitive submission
- Classification
- Routing
- Unauthorized access
- Case enumeration
- Audit trail
- Sensitive data exposure

---

M8 — ADMINISTRATION & PLATFORM MANAGEMENT

Objective

Provide secure administrative management of the CivicWatch platform.

Tasks

- Admin dashboard.
- User management.
- Role management.
- Civic report management.
- Moderation tools.
- Content management where implemented.
- System configuration.
- Administrative audit logs.
- Administrative authorization.

Acceptance Criteria

Authorized administrators can manage permitted platform resources while ordinary users cannot access administrative functionality.

Verification

Test:

- Admin login
- Admin authorization
- Normal user attempting admin access
- Resource management
- Audit logging
- Unauthorized API requests

---

M9 — PRIVACY & SECURITY IMPROVEMENT

Objective

Strengthen CivicWatch's handling of credentials, private information and sensitive civic data.

Tasks

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

Acceptance Criteria

Sensitive credentials and private information are not unnecessarily exposed through client-side storage or insecure application flows.

Verification

Inspect:

- localStorage
- sessionStorage
- cookies
- API responses
- browser network requests
- source code
- environment configuration
- logs

---

M10 — SECURITY & PRODUCTION HARDENING

Objective

Perform comprehensive production security hardening.

Tasks

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

Acceptance Criteria

The platform has been systematically reviewed for common application security weaknesses and identified issues have been addressed.

Verification

Run:

- Security tests.
- Authentication tests.
- Authorization tests.
- API tests.
- Input validation tests.
- Dependency audit.
- Production build.
- Docker verification where applicable.

---

M11 — CIVIC ALERTS & ADVISORIES

Objective

Create the CivicWatch public alerts and advisories system.

Tasks

Official Alerts

- Official county alerts.
- Government advisories.
- Public safety notices.
- Verified authority announcements.

Utility Alerts

- Electricity downtime.
- Water interruptions.
- Waste/service disruptions.
- Infrastructure/service maintenance.

Community Advisories

- Community advisories.
- Community information.
- Moderated community notices.

Alert Management

- Alert categories.
- Alert severity.
- Geographic targeting.
- Source attribution.
- Verification status.
- Publication.
- Scheduling.
- Expiration.
- Archiving.
- Audit trail.

Citizen Experience

- Alert feed.
- Alert details.
- Search.
- Filtering.
- Location relevance.
- Alert notifications where supported.

Acceptance Criteria

Citizens can view relevant alerts while official information is clearly distinguished from community information.

Only authorized users can publish verified official alerts.

Verification

Test:

- Alert creation.
- Verification.
- Publishing.
- Expiration.
- Geographic filtering.
- Utility outage.
- Community advisory.
- Unauthorized publication.
- Source attribution.
- Audit trail.

---

M12 — CIVIC INTELLIGENCE & INSIGHTS

Objective

Turn aggregated civic information into useful, understandable insights.

Tasks

- Civic issue statistics.
- Report trends.
- Category trends.
- Geographic trends.
- Case status statistics.
- Alert statistics.
- Time-based analysis.
- Administrative dashboards.
- Citizen-facing public statistics where appropriate.
- Privacy-preserving aggregation.

Acceptance Criteria

Aggregated information provides useful civic insights without exposing individual private cases or sensitive information.

Verification

Test:

- Aggregation accuracy.
- Authorization.
- Privacy.
- Filtering.
- Dashboard calculations.
- Large datasets.
- Mobile responsiveness.

---

M13 — CITIZEN NOTIFICATIONS & SUBSCRIPTIONS

Objective

Allow citizens to subscribe to relevant civic information.

Tasks

- Alert subscriptions.
- County subscriptions.
- Sub-county subscriptions where supported.
- Alert-category subscriptions.
- Utility subscriptions.
- Notification preferences.
- In-app notifications.
- Email notifications where configured.
- Other notification channels only where actually implemented.
- Notification history.
- Unsubscribe controls.

Acceptance Criteria

Citizens can control what relevant civic information they receive.

Verification

Test:

- Subscribe.
- Unsubscribe.
- Preference changes.
- Notification delivery.
- Notification authorization.
- Notification privacy.
- Rate limiting.

Do not claim SMS/push functionality unless the required infrastructure actually exists.

---

M14 — VERIFICATION & TRUST LAYER

Objective

Strengthen CivicWatch's ability to distinguish reliable information from unverified community information.

Tasks

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

Acceptance Criteria

Users can clearly understand whether information is:

- Official/verified.
- Community submitted.
- Pending verification.
- Rejected.
- Expired.

Verification

Test:

- Fake source attempt.
- Unauthorized verification.
- Source modification.
- Verification history.
- Community vs official labeling.
- Audit trail.

---

M15 — AI CIVIC ASSISTANT

Objective

Expand CivicWatch's AI functionality into a useful civic information assistant.

Tasks

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

Acceptance Criteria

The AI assistant provides useful civic information while clearly distinguishing AI-generated responses from verified source information.

AI must not fabricate official announcements.

Verification

Test:

- Normal questions.
- Unknown information.
- Source attribution.
- Prompt injection attempts.
- Sensitive information.
- AI service failure.
- Rate limits.
- Incorrect AI output handling.

---

M16 — MONITORING, ANALYTICS & IMPACT

Objective

Provide operational visibility into the platform and measure civic engagement.

Tasks

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

Acceptance Criteria

Administrators can understand platform health and legitimate usage patterns without exposing unnecessary personal information.

Verification

Test:

- Metrics accuracy.
- Privacy.
- Access control.
- Performance.
- Error tracking.
- Dashboard calculations.

---

M17 — FINAL INTEGRATION & RELEASE

Objective

Integrate and validate the complete CivicWatch platform.

This is the final release gate.

Tasks

Functional Verification

- Public workflows.
- Authentication.
- Citizen dashboard.
- Civic reports.
- Community workflows.
- Sensitive cases.
- Administration.
- Alerts.
- Notifications.
- Verification.
- AI.
- Analytics.

Security Verification

- Authentication.
- Authorization.
- API security.
- Data protection.
- Secrets.
- Input validation.
- Rate limiting.
- File handling.
- CORS.
- Security headers.

Technical Verification

- Frontend build.
- Backend build/startup.
- Database.
- Migrations.
- Docker.
- Environment configuration.
- Health checks.
- Logging.

Documentation

- Architecture.
- Security.
- Privacy.
- Deployment.
- API documentation.
- Milestone documentation.
- Recovery/backup documentation.

Release

- Final regression testing.
- Release checklist.
- Known-issues list.
- Deployment preparation.
- Rollback preparation.

Acceptance Criteria

All required milestones are verified, no critical release blockers remain, and a human project owner explicitly approves the final release.

---

9. MILESTONE DEPENDENCY RULE

Milestones are sequential.

The default dependency is:

M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10 → M11 → M12 → M13 → M14 → M15 → M16 → M17

A milestone must not automatically unlock merely because its predecessor has been implemented.

The predecessor must be:

VERIFIED
+
HUMAN_APPROVED

before the next milestone becomes available.

---

10. HARD STOP RULE FOR ANTIGRAVITY

Antigravity MUST stop after completing a milestone.

It must NOT:

- Start the next milestone.
- Generate the next milestone's implementation.
- Modify the next milestone.
- Automatically mark the next milestone as active.
- Assume approval.
- Interpret "verified" as "approved."

Instead, display:

M10 VERIFIED

WAITING FOR HUMAN APPROVAL

The next milestone is:

M11 — Civic Alerts & Advisories

No implementation of M11 will begin until the project owner explicitly approves M10.

The system must then wait.

---

11. APPROVAL COMMAND

Use an explicit human instruction such as:

APPROVE M10

or:

Proceed to M11

Only after receiving an explicit instruction from the human project owner may the next milestone be unlocked.

Do not interpret vague conversation as approval.

Examples that MUST NOT unlock the next milestone:

Looks good.
Nice.
Okay.
Continue.
What is next?

Only explicit milestone approval should unlock it.

---

12. HUMAN REVIEW CHECKLIST

Before approval, display:

Milestone: M10

Implementation:
✓ Complete

Automated verification:
✓ Passed

Manual verification:
✓ Passed

Known issues:
None

Security impact:
Reviewed

Regression impact:
Reviewed

Next milestone:
M11 — Civic Alerts & Advisories

Human approval:
PENDING

Then provide:

[ APPROVE M10 & UNLOCK M11 ]
[ REJECT ]

---

13. NO AUTO-PROGRESSION EVEN AFTER APPROVAL

After human approval, unlock exactly ONE next milestone.

Example:

M10
VERIFIED
     ↓
HUMAN APPROVED
     ↓
M11 UNLOCKED

Do not unlock:

M11
M12
M13

at the same time.

Only the immediate next milestone becomes active.

---

14. CURRENT MILESTONE RULE

At any time there may be only ONE:

CURRENT

milestone.

For the current roadmap:

M11 — Civic Alerts & Advisories

is the milestone that becomes active only after M10 has been explicitly human-approved.

---

15. ROADMAP UI

The roadmap should visually communicate:

✓ VERIFIED
✓ HUMAN APPROVED

● CURRENT

◐ IMPLEMENTED
   Waiting for verification

⏳ WAITING FOR HUMAN APPROVAL

🔒 LOCKED

⚠ BLOCKED

↻ REGRESSION

Do not rely solely on colors.

---

16. PROGRESS CALCULATION

Show separate progress metrics:

Implementation Progress
Verification Progress
Human Approval Progress

Do NOT combine them into one misleading percentage.

For example:

Implementation: 10 / 17
Verified:       9 / 17
Approved:       9 / 17

Calculate dynamically.

---

17. MILESTONE HISTORY

Maintain a history showing:

M9
Implemented
↓
Verified
↓
Human Approved
↓
M10 Unlocked

This creates an auditable project-development history.

---

18. FUTURE MILESTONES MUST REMAIN EDITABLE

The roadmap must be stored in a maintainable structure.

However, changes to milestone definitions should also be protected.

Do not allow normal users to modify the roadmap.

If a milestone needs to be changed after development has started:

- Record the change.
- Preserve the previous definition where practical.
- Require project-owner approval.

---

19. DOCUMENTATION SOURCE OF TRUTH

Create/update:

docs/MILESTONES.md

This document must contain:

- M1–M17
- Objectives
- Tasks
- Acceptance criteria
- Verification requirements
- Dependencies
- Human approval requirement

The application milestone page should reflect this roadmap.

Avoid maintaining contradictory milestone lists.

---

20. FINAL DEVELOPMENT RULE

From this point forward, the development process is:

READ ROADMAP
     ↓
CHECK CURRENT MILESTONE
     ↓
IMPLEMENT ONLY CURRENT MILESTONE
     ↓
TEST CURRENT MILESTONE
     ↓
VERIFY CURRENT MILESTONE
     ↓
STOP
     ↓
WAIT FOR HUMAN APPROVAL
     ↓
HUMAN APPROVES
     ↓
UNLOCK EXACTLY ONE NEXT MILESTONE
     ↓
STOP AGAIN AFTER THAT MILESTONE

NEVER:

Implement M11
   ↓
Automatically start M12
   ↓
Automatically start M13

That behavior is prohibited.

---

21. FINAL SUCCESS CRITERIA

The milestone tracking system is complete when:

- All roadmap milestones are defined.
- Every milestone has objectives.
- Every milestone has tasks.
- Every milestone has acceptance criteria.
- Every milestone has verification requirements.
- Dependencies are defined.
- M11 is correctly defined as Civic Alerts & Advisories.
- Milestone status is tracked.
- Verification status is tracked.
- Human approval is tracked separately.
- Approval history is preserved.
- Future milestones remain locked.
- Only authorized humans can approve milestones.
- Only one next milestone is unlocked after approval.
- Regression can be detected.
- Progress is calculated dynamically.
- "docs/MILESTONES.md" exists.
- The application has a dedicated milestone page.
- No milestone can automatically advance to the next one.

FINAL NON-NEGOTIABLE RULE

HUMAN APPROVAL IS THE GATE.

No matter how complete, tested, verified, or confident the system is:

NEVER proceed to the next milestone without explicit human approval.

The AI/development agent may:

- Implement
- Test
- Verify
- Report
- Recommend

But the human project owner alone decides when the project proceeds to the next milestone.