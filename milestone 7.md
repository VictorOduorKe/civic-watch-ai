CivicWatch AI Kenya — Milestone 7: Incident Management

1. Objective

Implement the OCL Incident Management module.

This milestone transforms the administrative dashboard from an overview-only workspace into a controlled operational workspace where authorized staff can manage citizen-submitted reports.

At the end of M7, authorized administrative users should be able to:

1. Open an administrative incident list.
2. Search and filter reports.
3. Open a complete incident-management view.
4. Review report information.
5. Assign reports to authorized staff where appropriate.
6. Change report status.
7. Add internal notes.
8. Add citizen-visible status updates.
9. Create and manage appropriate referrals.
10. View status history.
11. Clearly distinguish internal information from citizen-visible information.
12. Preserve the citizen's privacy.
13. Maintain a defensible record of report-management actions.

This milestone must build on M5 and M6.

Do not rebuild authentication, reporting, report tracking, or the admin dashboard.

---

2. Existing System

Before making changes, inspect and test:

- M0 — Project Foundation
- M1 — Landing Page
- M2 — Authentication
- Authentication Security Hardening
- OCL visual identity update
- M3 — Citizen Dashboard
- M4 — Incident Reporting
- M5 — Report Tracking
- M6 — OCL Admin Dashboard

Confirm:

- frontend starts
- backend starts
- MySQL works
- authentication uses secure cookies
- role authorization works
- citizen report creation works
- citizens can track their reports
- status history exists
- admin dashboard works
- administrative APIs are protected

Do not replace any of these systems.

---

3. Important Scope Boundary

M7 is specifically about:

Administrative Incident Management

It is NOT:

- AI verification
- notifications
- public map
- civic alerts
- civic participation
- AI assistant
- user management
- analytics redesign
- audit-log system
- system settings

Those remain later milestones.

---

4. Administrative Incident Workflow

The intended workflow is:

Citizen submits report
        ↓
Submitted
        ↓
OCL staff reviews
        ↓
Under Review
        ↓
Optional verification / assessment
        ↓
Verified
        ↓
Assigned
        ↓
In Progress
        ↓
Resolved
        ↓
Closed

Not every report must pass through every state.

For example, a report may be:

Submitted
    ↓
Rejected

if the authorized workflow determines that it should not proceed.

The application must not automatically determine guilt, criminal responsibility, or legal liability.

Use neutral terms such as:

- Report
- Reported concern
- Submitted allegation
- Assessment
- Review
- Referral
- Status
- Resolution

---

5. Existing Statuses

Use the statuses already established:

Submitted
Under Review
Verified
Assigned
In Progress
Resolved
Closed
Rejected

Do not create duplicate status definitions.

Do not introduce arbitrary new statuses.

---

6. Role Permissions

Use the existing role system.

Roles:

Citizen
Admin
Moderator
Analyst

Citizens must never access administrative incident-management endpoints.

Admin

Can perform incident-management operations permitted by the system.

Moderator

Can review/manage incidents according to the configured moderator permissions.

Analyst

Should primarily have read/analysis access.

Do not automatically give Analysts operational modification privileges.

Citizen

Can only view their own citizen-facing report information through M5.

---

7. Permission Matrix

Implement explicit permissions rather than relying only on role names.

A suitable initial policy:

Action| Admin| Moderator| Analyst| Citizen
View incident| Yes| Yes| Yes| Own report only
Search incidents| Yes| Yes| Yes| Own reports only
Change status| Yes| Yes| No| No
Assign incident| Yes| Yes| No| No
Add internal note| Yes| Yes| No| No
Add citizen update| Yes| Yes| No| No
Create referral| Yes| Yes| No| No
View internal notes| Yes| Yes| Controlled| No
View referral details| Yes| Yes| Controlled| No

If the existing M2/M6 role architecture already defines a different permission model, preserve that architecture and implement the least-privilege equivalent.

Do not silently expand permissions.

---

8. Database Changes

Inspect the existing schema before creating migrations.

M5 already introduced:

report_status_history

M7 should extend the schema with only what is necessary for incident management.

Recommended tables:

report_assignments
report_internal_notes
report_updates
report_referrals

Do not create unnecessary duplicate tables.

---

9. Report Assignments

Create:

report_assignments
------------------
id
report_id
assigned_to_user_id
assigned_by_user_id
assignment_note
assigned_at
unassigned_at

Requirements:

- "report_id" references "reports.id"
- "assigned_to_user_id" references "users.id"
- "assigned_by_user_id" references "users.id"
- timestamps must be real
- assignment history should not be overwritten unnecessarily

If the system only needs one current assignment, it can still preserve previous assignment records with "unassigned_at".

Do not delete historical assignment records merely because a report is reassigned.

---

10. Assignment Rules

Only authorized administrative users can assign reports.

The client must never be able to arbitrarily specify an administrator as the assigning user.

The backend must obtain:

assigned_by_user_id

from the authenticated administrator.

The client may provide:

assigned_to_user_id

but the backend must validate that the target user is eligible for assignment.

Do not allow:

Citizen

to become an administrative assignee.

---

11. Assignment Target

Initially, assignment should support authorized internal users.

Use the existing:

Admin
Moderator
Analyst

roles according to the permission policy.

Do not create external organization accounts in M7.

External referral organizations belong in the referral system.

---

12. Assignment API

Implement an endpoint following the existing route structure.

For example:

POST /api/admin/incidents/:reference/assign

Request:

{
  "assigned_to_user_id": 12,
  "assignment_note": "Please review the reported infrastructure issue."
}

The backend must:

1. authenticate the user
2. verify administrative permission
3. locate the report
4. validate the target user
5. create the assignment
6. update the report's status if appropriate
7. create a status-history event when a status changes
8. return the updated management state

Do not allow the client to directly set:

assigned_by_user_id

---

13. Reassignment

Authorized staff may reassign a report.

When reassigned:

- preserve the previous assignment
- create a new assignment record
- record the new administrator
- record the timestamp
- optionally record the reason

Do not erase historical assignment information.

---

14. Unassignment

Provide a controlled way to remove an active assignment.

For example:

POST /api/admin/incidents/:reference/unassign

Only authorized users may perform this action.

Do not silently delete assignment history.

Set the appropriate:

unassigned_at

timestamp.

---

15. Internal Notes

Create:

report_internal_notes
---------------------
id
report_id
author_user_id
note
created_at
updated_at

Internal notes are administrative information.

They must NEVER be returned through:

/api/reports/my
/api/reports/my/:reference

or any citizen-facing endpoint.

---

16. Internal Note Rules

Authorized administrative users may add internal notes.

Example:

«Reviewed the submitted information and requested additional assessment.»

Internal notes may contain operational information that is not appropriate for citizen display.

However, staff should still avoid unnecessary sensitive personal information.

Do not encourage staff to store:

- passwords
- authentication tokens
- financial credentials
- unnecessary personal data
- unrelated private information

---

17. Internal Note API

Example:

POST /api/admin/incidents/:reference/internal-notes

Request:

{
  "note": "Report requires additional review."
}

The backend must automatically determine:

author_user_id

from the authenticated administrator.

Never accept it as a trusted client value.

---

18. Citizen-Visible Updates

Create a separate table:

report_updates
--------------
id
report_id
author_user_id
message
created_at
updated_at

These are messages intentionally made visible to the citizen.

This must remain separate from internal notes.

---

19. Why Separate Internal Notes and Citizen Updates?

Do not implement a single table with a fragile frontend-only visibility switch.

The architecture should make the distinction explicit:

Internal Note
    ↓
Administrative users only

Citizen Update
    ↓
Administrative users create
    ↓
Citizen may view

This reduces the risk of accidentally exposing internal information.

---

20. Citizen Update API

Example:

POST /api/admin/incidents/:reference/updates

Request:

{
  "message": "Your report has been received and is currently under review."
}

The backend automatically records:

author_user_id
report_id
created_at

---

21. Citizen Update Visibility

Citizen-facing report details from M5 may now include:

report_updates

alongside the existing:

status_history

However, only explicitly citizen-visible updates should be returned.

Internal notes must never appear.

---

22. Status Changes

Authorized staff can change report status.

Example endpoint:

PATCH /api/admin/incidents/:reference/status

Request:

{
  "status": "Under Review",
  "note": "The submitted concern is now being reviewed."
}

The backend must:

1. validate the status
2. validate the user's permission
3. fetch the current report
4. determine whether the transition is permitted
5. update the report
6. create a "report_status_history" record
7. optionally create a citizen-visible update when explicitly requested
8. return the new status

---

23. Status Transition Rules

Implement reasonable transition validation.

For example:

Submitted
 → Under Review
 → Rejected

Under Review
 → Verified
 → Rejected
 → Submitted

Verified
 → Assigned
 → Under Review

Assigned
 → In Progress
 → Under Review

In Progress
 → Resolved
 → Under Review

Resolved
 → Closed
 → In Progress

Closed
 → no normal further transition

These are workflow safeguards, not legal rules.

If the existing implementation requires a different transition model, preserve consistency.

Do not allow arbitrary status jumping without a documented reason.

---

24. Closed Reports

A "Closed" report should normally be treated as finalized.

Do not provide ordinary editing controls for closed reports.

If reopening is genuinely required, implement a deliberate authorized action rather than allowing a generic status dropdown to change anything.

Do not silently reopen reports.

---

25. Rejected Reports

A rejected report should require a meaningful administrative explanation.

The reason should be stored through:

report_status_history.note

and/or a citizen-visible update when appropriate.

Do not expose internal reasoning automatically.

---

26. Resolution Information

When a report is moved to:

Resolved

require an appropriate resolution note.

The exact wording should remain neutral.

Example:

«The reported issue has been addressed according to the available information.»

Do not automatically claim that an allegation was proven or disproven.

---

27. Status History

Every genuine status change must create:

report_status_history

record.

Example:

Submitted
↓
Under Review
↓
Verified
↓
Assigned
↓
In Progress
↓
Resolved

Each event should contain:

- report
- status
- note
- visibility
- timestamp

Do not create status history records merely because the report was opened.

---

28. History Actor

M5's existing status-history schema may not have an actor field.

Inspect it.

If necessary, extend it with:

changed_by_user_id

This allows the system to record which authorized user performed a status change.

Do not fabricate historical actors for existing status records.

For existing M5 records, leave the actor unknown/null if no historical actor can be established.

---

29. Citizen Visibility

A status-history event may be:

visible_to_citizen = true

or:

visible_to_citizen = false

Administrative users can see appropriate internal history.

Citizens must only receive:

visible_to_citizen = true

records.

Do not rely on frontend filtering.

---

30. Referral System

M7 introduces the foundation for controlled referrals.

A referral represents a decision to send a reported concern to an appropriate organization or service for further assessment or response.

Possible referral types:

OCL Review
Civil Society Organization
Authorized Advocate
Public Service Authority
Police Administration
Emergency Organization
Human Rights Organization
Other Approved Referral

These are routing categories, not automatic determinations of wrongdoing.

---

31. Referral Table

Create:

report_referrals
---------------
id
report_id
referral_type
organization_name
reason
status
referred_by_user_id
created_at
updated_at

Possible referral statuses:

Pending
Sent
Accepted
Declined
Completed
Cancelled

Keep the status list controlled.

---

32. Referral Rules

A referral must never automatically mean:

Guilty
Criminal
Confirmed corruption
Confirmed abuse
Confirmed drug activity

The platform should use neutral terminology:

Reported concern
Submitted allegation
Referral for assessment
Request for review

The purpose is routing, not making legal conclusions.

---

33. Referral API

Example:

POST /api/admin/incidents/:reference/referrals

Request:

{
  "referral_type": "Human Rights Organization",
  "organization_name": "Example Organization",
  "reason": "The submitted concern may require specialist review."
}

The backend must automatically record:

referred_by_user_id

from the authenticated user.

---

34. Referral Visibility

Referral information can contain sensitive operational information.

Do not expose referral records to citizens in M7 unless there is an explicit, safe citizen-facing representation.

For now:

report_referrals

remain administrative information.

Do not include them in M5 citizen responses.

---

35. Sensitive Report Handling

Some categories may require additional care:

- Corruption Concern
- Safety Concern
- Missing Person
- Drug Activity
- Public Health
- Human Rights Concern
- Emergency

M7 must NOT automatically determine that these reports are genuine.

The system should identify them by their submitted category and allow authorized staff to review them.

Do not automatically accuse an individual, organization, or institution.

---

36. Emergency Reports

If a report is categorized as:

Emergency

display an administrative warning:

«Emergency reports may require immediate action outside CivicWatch. CivicWatch is not a replacement for emergency response services.»

Do not pretend that creating or assigning the report automatically contacts emergency services.

Actual emergency notification integrations are outside M7.

---

37. Incident List

Create:

/admin/incidents

or follow the existing admin routing convention.

This becomes the administrative incident-management list.

The page should include:

Search

Search by:

- report reference
- title
- description where appropriate

Filters

- status
- category
- county
- date range
- assignment state

Sorting

Default:

Recently updated

---

38. Pagination

Do not load every incident.

Use pagination.

Example:

?page=1
&limit=20

Enforce a reasonable maximum.

For example:

limit <= 50

The backend must validate pagination parameters.

---

39. Incident List Columns

Desktop view may show:

Reference| Title| Category| County| Status| Assigned To| Updated

Do not expose sensitive report descriptions directly in the table.

Keep the list concise.

---

40. Mobile Incident Cards

On mobile, convert rows into cards.

Example:

CWK-2026-000001

Infrastructure
Damaged road near market

Status
Under Review

Assigned
Moderator Name

Updated
1 Oct 2026

Provide:

View Incident

---

41. Incident Detail Page

Create:

/admin/incidents/:reference

The page should contain:

Header

CWK-2026-000001
Damaged road near market

Current Status

Under Review

Category

Infrastructure

Location

Show:

- county
- sub-county
- ward
- location description
- coordinates if available and appropriate

Incident Information

Show:

- incident date
- incident time
- description
- submission date
- anonymous indicator
- attachments

---

42. Citizen Identity and Anonymous Reports

If:

is_anonymous = true

administrative users should not automatically see the citizen's identity merely because they are viewing the report.

Follow the privacy policy established by the project.

Only authorized roles/functions that genuinely require identity access should be able to access it.

Do not display citizen identity prominently on every incident page.

For M7, preserve the anonymous flag and clearly show:

Submitted anonymously

---

43. Private Information

Do not unnecessarily expose:

- citizen phone
- citizen email
- private address
- authentication information
- password data
- unrelated account data

The incident-management page should only display information necessary for handling the report.

---

44. Attachment Access

Reuse the secure attachment authorization from M5.

Do not create a second upload/download mechanism.

Administrative users must still be authorized before accessing report attachments.

Do not make private attachments publicly accessible.

---

45. Assignment Panel

The incident detail page should contain an assignment section.

Example:

Assignment

Currently assigned to:
Moderator Name

[ Reassign ]
[ Unassign ]

If unassigned:

No staff member assigned.

Authorized staff can assign/reassign.

---

46. Status Management Panel

Provide an administrative status control.

Example:

Current Status
Under Review

Change status
[ Select status ]

Note
[................................]

[ Update Status ]

The backend remains authoritative.

Do not allow invalid transitions.

---

47. Internal Notes Panel

Create:

Internal Notes

Display notes chronologically.

Example:

Moderator Name
1 Oct 2026, 15:30

The submitted information requires additional review.

Provide:

Add Internal Note

Only authorized staff should see this panel.

---

48. Citizen Updates Panel

Create a separate section:

Citizen Updates

Display updates that have been explicitly published to the citizen.

Example:

Published Update
1 Oct 2026, 15:45

Your report is currently being reviewed.

Provide:

Add Citizen Update

Make it visually obvious that this message will be visible to the citizen.

---

49. Referral Panel

Create:

Referrals

Show existing referrals.

Authorized users can create a referral.

Display:

- referral type
- organization
- reason
- status
- created date
- referring staff member where appropriate

Do not expose this panel to citizens.

---

50. Status Timeline

The administrative detail page should show the complete status history appropriate to the viewer.

Example:

Submitted
1 Oct 2026

Under Review
1 Oct 2026
Reason: Initial review started.

Assigned
1 Oct 2026
Assigned to Moderator.

Administrative users may see internal notes/history that citizens cannot.

---

51. Administrative Activity

Do not implement the complete M16 audit system yet.

However, the incident-management service should be structured so that later audit logging can record:

REPORT_ASSIGNED
REPORT_UNASSIGNED
REPORT_STATUS_CHANGED
REPORT_INTERNAL_NOTE_ADDED
REPORT_UPDATE_PUBLISHED
REPORT_REFERRED

Do not create a separate audit implementation in M7.

---

52. Transaction Safety

Operations that change multiple records must use database transactions where appropriate.

For example, changing status should safely perform:

Update report status
+
Insert status history

as one logical operation.

If one operation fails, do not leave the report in a partially updated state.

Similarly, assignment operations should be transaction-safe where multiple records are changed.

---

53. Status Update Transaction

Conceptually:

BEGIN
    ↓
Validate current status
    ↓
Update reports.status
    ↓
Insert report_status_history
    ↓
COMMIT

If an error occurs:

ROLLBACK

Do not create history entries for failed status changes.

---

54. Assignment Transaction

Conceptually:

BEGIN
    ↓
Validate assignee
    ↓
Close previous assignment if needed
    ↓
Create new assignment
    ↓
Optionally update status
    ↓
Create status history if status changed
    ↓
COMMIT

Do not leave contradictory assignment state.

---

55. Input Validation

Use the existing Zod architecture.

Validate:

- report reference
- status
- assignment user ID
- note
- citizen update
- referral type
- organization name
- referral reason
- pagination
- search
- filters

Do not trust client input.

---

56. SQL Security

All queries must use parameterized SQL.

Never concatenate:

- search input
- report reference
- status
- user ID
- organization name
- notes
- filters

into SQL.

---

57. XSS Protection

Internal notes and citizen updates are user-controlled text.

Never render them as raw HTML.

Store plain text unless rich text is explicitly required.

Do not use unsafe HTML rendering for notes.

A test string such as:

<script>alert('test')</script>

must display as text.

---

58. Authentication Security

Continue using the security architecture established before M5.

Do not:

- store JWTs in localStorage
- store JWTs in sessionStorage
- create an admin-specific token
- expose tokens to React unnecessarily

Administrative requests must use the existing secure cookie authentication.

---

59. CSRF

If the authentication cookie requires CSRF protection, preserve the existing CSRF strategy.

All state-changing administrative operations must comply:

POST assignment
POST note
POST update
POST referral
PATCH status
POST unassign

Do not disable CSRF protection for administrative endpoints.

---

60. Authorization at Every Mutation

Never rely on the incident page being protected.

Each mutation endpoint must independently verify authorization.

For example:

PATCH /api/admin/incidents/:reference/status

must still reject an unauthorized request even if someone manually sends it from another client.

---

61. Object-Level Authorization

Verify the requested report exists and is accessible to the administrative role.

Do not assume that:

/admin

access automatically means every report operation is permitted.

Permission checks should occur at the action level.

---

62. Administrative Search Security

Search must be restricted to reports that the authenticated administrative role is permitted to view.

Do not expose citizen data through search results beyond the user's permission.

---

63. Error Handling

Return safe errors.

Examples:

401 Unauthorized
403 Forbidden
404 Report Not Found
422 Validation Error
409 Conflict
500 Internal Server Error

Do not expose stack traces or SQL errors.

---

64. Conflict Handling

Handle situations such as:

- report already closed
- report assigned to another user
- invalid status transition
- deleted/deactivated assignee
- duplicate referral
- stale status update

Return a clear conflict response instead of silently overwriting state.

---

65. Deactivated Users

If an administrator/moderator becomes inactive later, do not allow them to receive new assignments.

Existing assignment history should remain intact.

Do not delete historical assignment records because a user becomes inactive.

---

66. Citizen Experience Integration

Update M5 citizen report details to show appropriate new information.

Citizens may see:

Current Status
Status History
Citizen Updates

They must NOT see:

Internal Notes
Internal Assignment Notes
Administrative Referral Details
Staff-only information

---

67. Status Update Visibility

When an administrator changes status, do not automatically create a citizen message containing internal reasoning.

Instead provide an explicit option:

Publish citizen update

If selected, the supplied citizen-facing message is stored separately.

This prevents accidental information disclosure.

---

68. Citizen Update Confirmation

Before publishing a citizen update, show clear UI text:

«This message will be visible to the citizen who submitted the report.»

The user must deliberately submit it.

Do not make the confirmation misleading.

---

69. Assignment and Status Independence

Do not automatically assign every report.

Do not automatically change every report to:

Assigned

simply because an administrator opens it.

Opening a report is not an assignment.

---

70. No Automatic Legal Conclusions

The incident-management interface must not contain automated statements such as:

This person is guilty.
This is confirmed corruption.
This organization committed a crime.

The system should describe what has actually happened in the workflow:

Report submitted
Report under review
Report referred
Report resolved

---

71. Sensitive Categories

For sensitive categories, display an appropriate caution:

Sensitive report
Handle information according to applicable access and privacy rules.

Do not automatically make the report public.

Do not automatically publish its contents.

---

72. Emergency Category

For Emergency reports:

Emergency Report

show a prominent but professional notice:

«If immediate danger remains, appropriate emergency services should be contacted. CivicWatch does not replace emergency response services.»

Do not automatically claim that emergency services have been contacted.

---

73. Admin Incident List Filters

Implement:

Status
Category
County
Assignment
Date

Possible assignment filter:

All
Assigned
Unassigned

Use actual database state.

---

74. Search Debouncing

For frontend search:

User types
    ↓
Short debounce
    ↓
API request

Do not send an API request for every keystroke without a reason.

---

75. URL State

Where practical, preserve filters in the URL:

/admin/incidents?status=Under%20Review&page=2

This allows administrators to refresh or share an internal navigation state without losing their position.

Do not put sensitive report content in URLs.

---

76. Incident Detail Navigation

Provide:

← Back to Incidents

Preserve the previous filter/page state where practical.

---

77. OCL Visual Identity

Use the established OCL palette:

Deep Navy
#141F35

Gold
#D99A00

Background
#F8F8F6

Green
#168A45

Red
#C62828

Black
#111111

Dominant combination:

Navy + White + Gold

Use green/red for semantic status where appropriate.

Do not introduce gradients.

Do not introduce another color system.

---

78. Status Styling

Use text plus semantic styling.

Example:

Submitted       Navy
Under Review    Gold
Verified        Navy
Assigned        Gold
In Progress     Gold
Resolved        Green
Closed          Navy
Rejected        Red

Never communicate status through color alone.

---

79. Accessibility

Ensure:

- keyboard navigation
- focus indicators
- accessible form labels
- semantic headings
- accessible dialogs
- accessible dropdowns
- accessible status controls
- accessible tables
- accessible mobile navigation
- screen-reader-friendly errors
- confirmation messages

Confirmation dialogs must have clear focus handling.

---

80. Confirmation Dialogs

Use confirmation for consequential actions such as:

- rejecting a report
- closing a report
- unassigning
- publishing a citizen update
- creating a referral

Example:

«Publish this update to the citizen?»

Buttons:

Cancel
Publish Update

Do not use confirmation dialogs for every minor action.

---

81. Incident Management Service

Keep business logic out of route files where possible.

Suggested architecture:

routes
   ↓
controllers
   ↓
incidentManagementService
   ↓
database

This makes future audit logging and notification integration easier.

---

82. Suggested Backend Structure

Adapt to the existing project:

backend/src/
├── controllers/
│   └── adminIncidentController.js
├── routes/
│   └── adminIncidentRoutes.js
├── services/
│   └── incidentManagementService.js
├── validators/
│   └── incidentManagementValidators.js
└── models/
    ├── reportAssignmentModel.js
    ├── reportInternalNoteModel.js
    ├── reportUpdateModel.js
    └── reportReferralModel.js

Do not duplicate existing report models unnecessarily.

---

83. Suggested Frontend Structure

Adapt to the existing project:

frontend/src/
├── pages/
│   └── admin/
│       ├── IncidentList.jsx
│       └── IncidentDetail.jsx
├── components/
│   └── admin/
│       ├── IncidentFilters.jsx
│       ├── IncidentTable.jsx
│       ├── IncidentCard.jsx
│       ├── IncidentStatusPanel.jsx
│       ├── AssignmentPanel.jsx
│       ├── InternalNotesPanel.jsx
│       ├── CitizenUpdatesPanel.jsx
│       ├── ReferralPanel.jsx
│       └── StatusTimeline.jsx
└── services/
    └── adminIncidentService.js

Reuse existing UI components where possible.

---

84. API Endpoints

Implement endpoints according to existing route conventions.

A reasonable API set is:

GET    /api/admin/incidents
GET    /api/admin/incidents/:reference

PATCH  /api/admin/incidents/:reference/status

POST   /api/admin/incidents/:reference/assign
POST   /api/admin/incidents/:reference/unassign

POST   /api/admin/incidents/:reference/internal-notes

POST   /api/admin/incidents/:reference/updates

POST   /api/admin/incidents/:reference/referrals
PATCH  /api/admin/incidents/:reference/referrals/:referralId

Do not implement every endpoint if an equivalent existing structure already exists.

Avoid duplicate endpoints.

---

85. Incident List Response

Example:

{
  "success": true,
  "incidents": [
    {
      "reference": "CWK-2026-000001",
      "title": "Damaged road near market",
      "category": "Infrastructure",
      "county": "Mombasa",
      "status": "Under Review",
      "assigned_to": {
        "id": 12,
        "name": "Staff Member"
      },
      "updated_at": "2026-10-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}

Adapt to existing API conventions.

Do not expose unnecessary user information.

---

86. Incident Detail Response

The administrative response may include:

Report
Category
Location
Description
Attachments
Current status
Status history
Assignment
Internal notes
Citizen updates
Referrals

but must still respect role permissions.

Do not return every database field simply because it exists.

---

87. Citizen API Regression

After M7, verify that:

GET /api/reports/my
GET /api/reports/my/:reference

still exclude:

internal_notes
referrals
private administrative information

They may now include:

citizen_updates

and appropriate visible status history.

---

88. Database Transactions

Use transactions for:

Status changes

reports
+
report_status_history

Assignment changes

assignment records
+
optional status/history

Referral operations

Use transactions where multiple related records are changed.

---

89. Testing — Incident List

Test:

- no incidents
- one incident
- many incidents
- pagination
- search
- status filter
- category filter
- county filter
- assignment filter
- date filter
- invalid filters
- empty search results

---

90. Testing — Incident Detail

Test:

- valid report
- nonexistent report
- closed report
- rejected report
- anonymous report
- report with attachments
- report without attachments
- sensitive category
- emergency category

---

91. Testing — Status

Test:

Submitted → Under Review
Under Review → Verified
Verified → Assigned
Assigned → In Progress
In Progress → Resolved
Resolved → Closed

Also test invalid transitions.

Confirm that failed transitions do not modify the database.

---

92. Testing — Assignment

Test:

- assign report
- reassign report
- unassign report
- invalid assignee
- citizen as assignee
- inactive user as assignee
- unauthorized assignment
- assignment history preservation

---

93. Testing — Internal Notes

Test:

- authorized staff can create note
- unauthorized role cannot create note
- note appears to authorized staff
- note does not appear to citizen
- XSS content is escaped
- note author is derived from authentication

---

94. Testing — Citizen Updates

Test:

- authorized staff can publish update
- update appears to citizen
- internal notes do not appear
- update author is recorded
- XSS is escaped
- confirmation UI works

---

95. Testing — Referrals

Test:

- authorized user can create referral
- referral type validation
- organization name validation
- reason validation
- referral status changes
- unauthorized user cannot create referral
- referral does not appear in citizen API

---

96. Testing — Authorization

Test each role.

Citizen

Must not:

- access admin incident list
- open admin incident details
- change status
- assign reports
- add notes
- publish updates
- create referrals

Analyst

Must not perform actions outside analytical permissions.

Moderator

Can perform only explicitly permitted operational actions.

Admin

Can perform authorized administrative operations.

---

97. Testing — Cookie Security

Confirm:

- authentication remains cookie-based
- JWT is not in localStorage
- JWT is not in sessionStorage
- frontend does not need to read the token
- admin endpoints work through the secure cookie

---

98. Testing — Data Isolation

Create multiple users and reports.

Verify:

Citizen A
↓
Own report only

Citizen B
↓
Own report only

Administrative access must not accidentally change citizen ownership.

---

99. Testing — SQL Injection

Test safe injection strings against:

- incident search
- report reference
- status
- category
- county
- notes
- referral fields

Verify parameterized SQL.

---

100. Testing — XSS

Test:

<script>alert('test')</script>

in:

- internal notes
- citizen updates
- report title
- report description
- referral reason

Verify no script executes.

---

101. Testing — CSRF

If the existing cookie authentication uses CSRF protection, verify all state-changing administrative endpoints reject invalid CSRF requests.

Test:

- status change
- assignment
- note
- update
- referral

Do not disable protection simply to make testing easier.

---

102. Testing — Transaction Integrity

Force controlled failures during development.

Verify that:

status update failure

does not leave:

reports.status

changed without corresponding history.

Similarly verify assignment operations.

---

103. Testing — Regression

After M7, re-test:

M1

Landing page.

M2

Registration.

Login.

Logout.

Roles.

Security Hardening

Cookies.

CSRF.

No localStorage token.

M3

Citizen dashboard.

M4

Report creation.

M5

My Reports.

Report details.

Status history.

Attachments.

M6

Admin dashboard.

Administrative authorization.

Dashboard statistics.

M7 must not break any previous milestone.

---

104. Documentation

Update:

README.md
docs/API.md
docs/DATABASE.md
docs/ARCHITECTURE.md

Document:

- incident-management endpoints
- role permissions
- status transitions
- assignments
- internal notes
- citizen updates
- referrals
- privacy boundaries
- transaction behavior

Do not document real credentials.

---

105. Definition of Done

M7 is complete only when:

- [ ] Admin incident list exists.
- [ ] Incident search works.
- [ ] Incident filtering works.
- [ ] Pagination works.
- [ ] Admin incident detail exists.
- [ ] Role authorization works.
- [ ] Citizens cannot access admin incident APIs.
- [ ] Admins can perform permitted incident actions.
- [ ] Moderators have only permitted operational access.
- [ ] Analysts cannot perform unauthorized operational mutations.
- [ ] Report status changes work.
- [ ] Invalid status transitions are rejected.
- [ ] Status history is recorded.
- [ ] Status-change transactions are safe.
- [ ] Assignment works.
- [ ] Reassignment preserves history.
- [ ] Unassignment works.
- [ ] Internal notes work.
- [ ] Internal notes remain private.
- [ ] Citizen-visible updates work.
- [ ] Citizen updates appear through M5.
- [ ] Internal notes do not appear through M5.
- [ ] Referrals work.
- [ ] Referral information remains appropriately restricted.
- [ ] Anonymous reports retain privacy protections.
- [ ] Emergency reports display the appropriate warning.
- [ ] Attachments remain protected.
- [ ] SQL queries are parameterized.
- [ ] XSS protection works.
- [ ] CSRF protection remains intact where applicable.
- [ ] Authentication remains cookie-based.
- [ ] No JWT is stored in localStorage.
- [ ] No JWT is stored in sessionStorage.
- [ ] No fake workflow data exists.
- [ ] No automatic legal conclusions are generated.
- [ ] OCL colors are used.
- [ ] No gradients are introduced.
- [ ] Responsive design works.
- [ ] Accessibility checks pass.
- [ ] M0–M6 regression tests pass.
- [ ] Documentation is updated.

---

106. Strict Do-Not-Do List

Do NOT:

- create a second authentication system
- store tokens in localStorage
- store tokens in sessionStorage
- expose authentication tokens
- trust client-provided actor IDs
- trust client-provided ownership IDs
- allow citizens to modify status
- allow citizens to assign reports
- expose internal notes
- expose internal referrals to citizens
- make private attachments public
- automatically contact emergency services
- automatically determine guilt
- automatically determine criminal responsibility
- automatically label an allegation as proven
- automatically publish internal notes
- create notifications
- send SMS
- send email
- integrate WhatsApp
- implement AI verification
- implement AI decision-making
- implement the public map
- implement civic alerts
- implement participation
- implement AI assistant
- implement full user management
- implement the audit-log module
- implement system settings
- create fake reports
- create fake assignments
- create fake status changes
- create fake referrals
- create fake statistics
- introduce Docker
- introduce gradients
- redesign unrelated M0–M6 features
- automatically proceed to M8

---

107. Development Sequence

Follow this order:

1. Inspect M0–M6
        ↓
2. Test authentication and RBAC
        ↓
3. Test M5 citizen report access
        ↓
4. Inspect existing report/status-history schema
        ↓
5. Design M7 migrations
        ↓
6. Create assignment table
        ↓
7. Create internal notes table
        ↓
8. Create citizen updates table
        ↓
9. Create referrals table
        ↓
10. Extend status history if actor tracking is required
        ↓
11. Implement incident-management service
        ↓
12. Implement incident list API
        ↓
13. Implement incident detail API
        ↓
14. Implement status transitions
        ↓
15. Implement assignments
        ↓
16. Implement internal notes
        ↓
17. Implement citizen updates
        ↓
18. Implement referrals
        ↓
19. Test APIs directly
        ↓
20. Build admin incident list
        ↓
21. Build admin incident detail
        ↓
22. Build status management UI
        ↓
23. Build assignment UI
        ↓
24. Build internal notes UI
        ↓
25. Build citizen updates UI
        ↓
26. Build referral UI
        ↓
27. Integrate citizen-visible updates into M5
        ↓
28. Test authorization
        ↓
29. Test privacy boundaries
        ↓
30. Test transactions
        ↓
31. Test security
        ↓
32. Test responsive UI
        ↓
33. Run M0–M6 regression
        ↓
34. Update documentation
        ↓
35. Verify definition of done

After each major implementation stage:

- start frontend
- start backend
- check compilation
- check browser console
- check backend logs
- test the affected API
- inspect database records
- fix errors before continuing

---

108. Final Implementation Report

When M7 is complete, provide:

Implemented

List the actual incident-management functionality implemented.

Database

List:j

- migrations
- tables
- indexes
- schema changes

API

List all implemented endpoints.

Permissions

Explain what each role can actually do.

Status Workflow

List the implemented status transitions.

Privacy

Explain:

- anonymous reports
- internal notes
- citizen updates
- referrals
- attachment protection

Security

Explain:

- cookie authentication
- RBAC
- object-level authorization
- CSRF
- SQL injection protection
- XSS protection

Testing

List tests actually performed and their results.

Regression

Confirm M0–M6 functionality was re-tested.

Known Issues

Only list genuine unresolved issues.

Not Implemented

Explicitly confirm that:

- notifications
- AI verification
- public map
- civic alerts
- civic participation
- AI assistant
- user management
- audit logs
- settings

remain for later milestones.

Do not claim a test passed unless it was actually performed.

---

109. Stop Point

When M7 is complete and fully tested:

STOP.

Do not automatically begin M8.

The next milestone will be:

M8 — Notifications

M8 will build notification delivery on top of the report events, status changes, citizen updates, and alert infrastructure established by the previous milestones.