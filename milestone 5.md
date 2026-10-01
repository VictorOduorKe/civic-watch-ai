CivicWatch AI Kenya — Milestone 5: Report Tracking

1. Objective

Implement the Citizen Report Tracking module.

Citizens who have already submitted incident reports must be able to view their own reports and understand the current state of each report.

At the end of this milestone, an authenticated citizen should be able to:

1. Open "My Reports".
2. See reports they personally submitted.
3. Search/filter their reports.
4. Open an individual report.
5. View the report reference.
6. View the current status.
7. View submitted incident information.
8. View uploaded attachments where appropriate.
9. Understand when the report was submitted.
10. See a basic status timeline/history.

This milestone introduces the foundation for future report-management workflows.

Do NOT implement admin review, assignment, referrals, notifications, AI verification, public maps, or alerts.

---

2. Existing System

Before making changes, inspect and test:

- M0 — Project Foundation
- M1 — Landing Page
- M2 — Authentication
- Authentication Security Hardening
- OCL Brand Color Update
- M3 — Citizen Dashboard
- M4 — Incident Reporting

Confirm that:

- frontend starts
- backend starts
- MySQL works
- cookie authentication works
- "/api/auth/me" works
- protected routes work
- citizen dashboard works
- report creation works
- report attachments work
- report references are generated correctly

Do not replace existing systems.

Do not create a second authentication system.

Do not create a second report system.

Reuse the existing report tables and authentication architecture.

---

3. Scope

This milestone includes:

Frontend

- My Reports page
- Report list
- Search
- Filtering
- Pagination
- Empty state
- Report detail page
- Status display
- Basic status timeline
- Attachment display
- Loading states
- Error states
- Mobile responsive layout

Backend

- Citizen report listing endpoint
- Citizen report detail endpoint
- Report status-history endpoint or combined detail response
- Ownership authorization
- Pagination
- Search/filter validation

Database

Add only the database structures required for report tracking.

The major new table should be:

report_status_history

Do not build future notification, admin assignment, referral, analytics, or audit tables.

---

4. Citizen Ownership Rule

This is one of the most important requirements.

A citizen must only be able to access reports associated with their authenticated account.

Never trust a "user_id" supplied by the frontend.

The backend must obtain the authenticated user from the existing cookie-based authentication middleware.

Conceptually:

Authenticated Cookie
        ↓
Authentication Middleware
        ↓
req.user
        ↓
Report Ownership Check
        ↓
Only user's reports

A citizen must never be able to access another citizen's report by changing:

report_id
report_reference
user_id

in the browser.

---

5. Database Changes

Create a new migration.

Do not recreate the existing "reports" table.

Do not modify existing report ownership unnecessarily.

---

6. Report Status History

Create:

report_status_history
---------------------
id
report_id
status
note
visible_to_citizen
created_at

Requirements

"id"

- Primary key
- Auto increment

"report_id"

- Foreign key referencing "reports.id"

"status"

Allowed statuses should remain consistent with the CivicWatch report lifecycle:

Submitted
Under Review
Verified
Assigned
In Progress
Resolved
Closed
Rejected

"note"

Optional text.

"visible_to_citizen"

Boolean.

This field is important because future administrative workflows may contain internal notes that should not be shown to citizens.

For this milestone, citizen-visible history should only expose records where:

visible_to_citizen = true

"created_at"

Timestamp.

Add an index on:

report_id
created_at

---

7. Initial Status History

M4 currently creates reports with:

Submitted

When implementing M5, ensure existing reports have an appropriate initial history entry.

For existing reports that were created before the history table existed, create:

Submitted

history records using the original report creation timestamp where practical.

Do not fabricate historical status changes.

For future reports, the M4 report-creation flow should create the initial history record:

Submitted

with:

visible_to_citizen = true

This is the only status transition that should be automatically created at this stage.

Do not implement administrative status transitions yet.

---

8. Status Lifecycle

Display statuses consistently.

Use:

Submitted
Under Review
Verified
Assigned
In Progress
Resolved
Closed
Rejected

Do not add additional statuses unless there is a genuine architectural reason.

Do not allow the citizen to change their own report status.

A citizen cannot mark a report:

Resolved
Closed
Verified
Rejected

The citizen is only viewing status information.

---

9. API Design

Use the existing report route architecture.

Suggested endpoints:

GET /api/reports/my
GET /api/reports/my/:reference

The exact URL can follow the existing route conventions if M4 established a different structure.

The important requirement is that the endpoint clearly represents citizen-owned reports.

---

10. List My Reports

Implement:

GET /api/reports/my

Authentication required.

Return only reports belonging to the authenticated user.

Support pagination.

Example query parameters:

?page=1
&limit=10
&status=Submitted
&category_id=1
&search=road

All parameters must be validated.

Do not trust:

user_id

from query parameters.

The backend must determine the user from the authentication cookie.

---

11. Pagination

Do not return every report at once.

Use pagination.

Example response:

{
  "success": true,
  "reports": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3
  }
}

Set a reasonable maximum limit.

For example:

limit <= 50

Do not allow a client to request thousands of records.

Use parameterized SQL.

---

12. Report List Data

The report list should contain only information needed for the citizen's overview.

Example:

Reference
Title
Category
County
Status
Submitted Date
Updated Date

Do not display unnecessary internal database information.

Do not expose:

- internal IDs unnecessarily
- internal notes
- staff identities
- private referral information
- internal administrative metadata

---

13. Search

Allow the citizen to search their own reports.

Search fields may include:

- report reference
- title
- description

Do not perform unrestricted database-wide searching.

The SQL query must always be scoped to:

authenticated user's reports

For example conceptually:

WHERE reports.user_id = authenticatedUserId

before applying search conditions.

Use parameterized queries.

---

14. Status Filtering

Allow filtering by status.

Example:

All
Submitted
Under Review
Verified
Assigned
In Progress
Resolved
Closed
Rejected

The default should be:

All

Do not hardcode report counts.

If counts are displayed, they must come from the database.

---

15. Category Filtering

Allow filtering by category using the existing:

report_categories

table.

Do not duplicate the category list in frontend code.

Retrieve active categories from the backend.

---

16. Sorting

Default order:

Most recently updated first

or, if the existing UX has a stronger reason:

Most recently submitted first

Choose one and use it consistently.

Do not allow arbitrary SQL column names from the client.

If sorting options are added, use a backend whitelist.

---

17. Report Detail Endpoint

Implement:

GET /api/reports/my/:reference

The endpoint must:

1. authenticate the user
2. locate the report by reference
3. verify ownership
4. return only citizen-safe information
5. return citizen-visible status history
6. return permitted attachment metadata

If the report belongs to another user, do not return its contents.

Prefer a generic response such as:

Report not found

rather than revealing that a report with that reference exists for another account.

---

18. Report Detail Response

A suitable response structure:

{
  "success": true,
  "report": {
    "reference": "CWK-2026-000001",
    "title": "Damaged road near market",
    "description": "...",
    "category": {
      "name": "Infrastructure"
    },
    "county": "Mombasa",
    "sub_county": "...",
    "ward": "...",
    "location_text": "...",
    "latitude": null,
    "longitude": null,
    "incident_date": "...",
    "incident_time": "...",
    "is_anonymous": false,
    "preferred_contact": "none",
    "status": "Submitted",
    "created_at": "...",
    "updated_at": "...",
    "attachments": [],
    "status_history": []
  }
}

Adapt the exact response to the existing API conventions.

Do not expose internal fields.

---

19. Anonymous Reports

Respect the M4 anonymous-report design.

If:

is_anonymous = true

the citizen should still be able to see their own report from their authenticated account.

The detail view should not incorrectly state that the report is anonymous from the platform itself.

Use wording such as:

Submitted anonymously

rather than:

Nobody knows who submitted this report

The account association remains an internal security/platform relationship.

---

20. Attachments

Display citizen-owned report attachments where appropriate.

Show safe metadata such as:

Filename
File type
File size
Uploaded date

Do not expose:

storage_path
server filesystem path
internal filename

unless required.

If the existing M4 upload system stores files privately, do not make the upload directory public merely to display files.

---

21. Secure Attachment Access

If citizens need to open/download their own attachments, create a protected endpoint such as:

GET /api/reports/my/:reference/attachments/:attachmentId

The endpoint must verify:

authenticated user
        ↓
owns report
        ↓
attachment belongs to report

Only then should the file be served.

Do not create:

/public/uploads/reports/...

for private citizen attachments.

Never trust a client-provided filesystem path.

---

22. Attachment Authorization

A user must not be able to:

change attachmentId

and retrieve another citizen's file.

Always verify the complete ownership chain:

User
 ↓
Report
 ↓
Attachment

before serving the file.

---

23. Status Timeline

Create a citizen-friendly status timeline.

Example:

✓ Submitted
  1 Oct 2026, 10:20

○ Under Review
  Waiting for review

○ Verified
  Waiting for review

○ Assigned
  Waiting for review

○ In Progress
  Waiting for review

○ Resolved
  Waiting for resolution

Only show actual historical events.

Do not show fake future timestamps.

Do not pretend that future statuses have occurred.

---

24. Current Status

The current report status should be visually prominent.

Example:

Status
Submitted

Use the OCL color system.

Suggested semantic mapping:

Submitted       Navy
Under Review    Gold
Verified        Navy
Assigned        Gold
In Progress     Gold
Resolved        Green
Closed          Navy
Rejected        Red

Do not rely only on color.

Always display the status text.

---

25. Citizen-Visible Notes

If a status history record contains:

visible_to_citizen = false

do not return it from the citizen API.

Do not merely hide it with CSS.

It must never be included in the API response.

This distinction will become important when admin workflows are introduced.

---

26. Status Notes

For citizen-visible status updates, display the note when one exists.

Example:

Under Review

Your report has been received and is currently being reviewed.

Do not invent notes.

For M5, most reports may only have:

Submitted

with no additional note.

That is acceptable.

---

27. My Reports Page

Create:

/reports

or follow the existing routing convention.

The page should be protected.

The navigation item from M3:

My Reports

must now become functional.

---

28. Page Layout

Use the existing CitizenLayout.

The page should include:

Header

My Reports

Supporting text:

«View the reports you have submitted and check their current status.»

Search

Search your reports...

Filters

Status
Category

Report List

Display report cards or a responsive table depending on the existing design system.

---

29. Desktop Report List

For larger screens, a table can be used:

Reference| Title| Category| Status| Updated

Each row should have:

View Report

or make the row itself accessible/clickable.

---

30. Mobile Report List

On small screens, do not force a wide table.

Use cards:

CWK-2026-000001
Damaged road near market

Infrastructure

Status
Submitted

Updated
1 Oct 2026

Provide:

View Report

---

31. Empty State

If the citizen has no reports:

No reports yet

You haven't submitted any CivicWatch reports.

[ Report an Issue ]

The button should navigate to the existing M4 report form.

Do not create fake sample reports.

---

32. Loading State

While reports are loading, display a proper loading state.

Use:

- skeletons
- loading indicators
- appropriate accessible status text

Do not display fake reports while waiting for the API.

---

33. Error State

If loading fails:

We couldn't load your reports.

Please try again.

Include:

Retry

The retry button must actually repeat the API request.

Do not hide API failures.

---

34. Search UX

Search should not create unnecessary API requests for every keystroke.

Use a small debounce where appropriate.

For example:

User types
   ↓
short delay
   ↓
API request

Do not create an uncontrolled request loop.

Clear filters should restore the default list.

---

35. Pagination UI

Display pagination only when necessary.

Example:

Previous
1
2
3
Next

Disable:

Previous

on the first page.

Disable:

Next

on the last page.

Do not create pagination buttons that do nothing.

---

36. Report Detail Page

Create a protected route such as:

/reports/:reference

The exact path may follow existing conventions.

The page should contain:

Report Header

CWK-2026-000001
Damaged road near market

Current Status

Submitted

Report Information

Show:

- category
- county
- sub-county
- ward
- location description
- incident date
- incident time
- submission date

Only display fields that actually contain information.

Do not show empty fields unnecessarily.

---

37. Description

Display the citizen's original description as plain text.

Do not render it as raw HTML.

This protects against stored XSS.

---

38. Location

Display:

County
Sub-county
Ward
Location description

If GPS coordinates exist, display them appropriately.

Do not expose additional location data that was not submitted.

Do not build the public CivicWatch map yet.

If a map preview is implemented, keep it restricted to the citizen's own report and reuse the existing mapping architecture planned for M10.

A simple text coordinate display is acceptable for M5.

Do not introduce unnecessary map dependencies solely for this milestone.

---

39. Anonymous Indicator

If applicable:

Submitted anonymously

Use a clear privacy indicator.

Do not reveal the citizen's account details.

---

40. Attachments Section

If attachments exist:

Supporting Files

Show safe filenames and metadata.

Provide secure access only through the protected backend endpoint.

If there are no attachments:

No supporting files attached.

---

41. Status History Section

Show:

Report Progress

with chronological status events.

Example:

Submitted
1 Oct 2026, 14:20

Your report has been received.

Do not fabricate additional events.

---

42. Report Reference Copy

Provide a convenient copy action:

Copy Reference

The button must copy only the report reference.

Example:

CWK-2026-000001

Show a small confirmation:

Reference copied

Do not copy sensitive report contents.

---

43. Back Navigation

Provide:

← Back to My Reports

It should return to the report list.

Preserve search/filter/page state where practical.

Do not make navigation confusing on mobile.

---

44. Dashboard Integration

Update the M3 Citizen Dashboard.

The:

My Reports

quick action/navigation item must now open the real report list.

The:

Reports Submitted

summary card should now use the real authenticated user's database count.

If implementing additional status summary cards:

Under Review
In Progress
Resolved

they must use real database values.

Do not hardcode any number.

Do not create duplicate queries if a single summary endpoint is more appropriate.

A suitable endpoint could be:

GET /api/reports/my/summary

if needed.

Keep it simple.

---

45. Dashboard Summary

If implementing summary statistics, return only the current user's counts.

Example:

{
  "success": true,
  "summary": {
    "total": 4,
    "submitted": 2,
    "under_review": 1,
    "in_progress": 1,
    "resolved": 0
  }
}

The exact response may follow existing conventions.

Do not expose global CivicWatch statistics through this endpoint.

---

46. Performance

Use efficient queries.

For report listing:

- filter by authenticated "user_id"
- paginate
- use appropriate indexes
- avoid N+1 queries
- only select required columns

For detail:

- fetch the report
- fetch category
- fetch citizen-visible history
- fetch attachment metadata

Avoid repeatedly querying the same report.

---

47. Security

Preserve the authentication hardening completed before M5.

All report-tracking endpoints must use the secure cookie authentication architecture.

Do not reintroduce:

localStorage token
Authorization Bearer token stored in browser

The frontend should rely on the existing cookie-based authentication.

---

48. CSRF

If the application uses cookie authentication and the existing security-hardening milestone established CSRF protection, preserve it.

GET requests should not modify state.

Any future state-changing report endpoint must use the established CSRF strategy.

Do not disable the existing protection for convenience.

---

49. SQL Security

All database queries must use parameterized queries.

Never construct SQL using:

user input
search input
reference input
status input
category input

directly.

Do not allow arbitrary SQL column names through query parameters.

---

50. Report Reference Security

Do not assume that knowing:

CWK-2026-000001

is enough to access a report.

The backend must still verify:

authenticated user owns report

before returning it.

Report references are identifiers, not authorization credentials.

---

51. Information Leakage

If a citizen requests another user's report reference, return a generic:

Report not found

or equivalent safe response.

Do not reveal:

This report exists but belongs to another user.

This prevents unnecessary information leakage.

---

52. Rate Limiting

Apply appropriate rate limiting to report-reading endpoints if consistent with the existing API security design.

Especially protect:

GET /api/reports/my/:reference

from excessive automated enumeration.

Do not create a rate limit so aggressive that normal citizen use becomes difficult.

---

53. No Admin Functionality

Do NOT implement:

- admin report list
- report assignment
- admin status changes
- internal notes
- referrals
- moderation
- staff comments
- resolution controls

These belong to later milestones.

---

54. No Notifications

Do NOT implement:

- email notifications
- SMS
- push notifications
- WhatsApp notifications
- notification center

Notifications belong to M8.

The citizen will manually check report status in M5.

---

55. No AI

Do NOT:

- send reports to Gemini
- classify reports using AI
- determine report credibility
- determine guilt
- determine criminal responsibility
- generate legal conclusions

AI features remain separate.

---

56. No Public Reports

Do NOT expose citizen reports publicly.

Do not create:

/public/reports

Do not place reports on the public map.

M10 will handle public civic visualization with separate privacy rules.

---

57. OCL Visual Identity

Use the updated Open Civic Lab branding from the previous milestone.

Primary:

Deep Navy
#141F35

Accent:

OCL Gold
#D99A00

Background:

#F8F8F6

Supporting semantic colors:

Green
#168A45

Red
#C62828

Black
#111111

Use:

Navy + White + Gold

as the dominant interface combination.

Use red/green sparingly for semantic states.

Do not introduce gradients.

Do not create a new color palette.

---

58. Accessibility

Ensure:

- keyboard navigation
- visible focus states
- semantic headings
- accessible buttons
- accessible filters
- labels for search inputs
- status text readable without color
- screen-reader-friendly loading states
- accessible pagination
- accessible error messages
- sufficient color contrast

Do not rely solely on:

green = good
red = bad

Use text as well.

---

59. Testing

Perform the following tests.

Authentication

- logged-out user cannot access "/reports"
- logged-out user cannot access "/reports/:reference"
- logged-in citizen can access reports
- expired session is handled correctly

---

Ownership

Create reports under two different test users.

Verify:

User A

can only see:

User A reports

and:

User B

can only see:

User B reports

Attempt to access User B's report using User A's browser.

It must fail.

---

60. Report Listing Tests

Test:

- no reports
- one report
- multiple reports
- pagination
- search
- category filter
- status filter
- clearing filters
- invalid page
- invalid limit
- empty search result

---

61. Detail Tests

Test:

- valid report
- invalid reference
- another user's reference
- report with attachments
- report without attachments
- anonymous report
- report with GPS
- report without GPS
- missing optional fields

---

62. Status History Tests

Verify:

- initial "Submitted" event exists
- only citizen-visible history is returned
- internal history is never exposed
- timestamps are correct
- events are ordered consistently
- no fake events appear

---

63. Attachment Security Tests

Verify:

- owner can access own attachment
- another user cannot access it
- invalid attachment ID fails
- attachment belonging to another report fails
- filesystem paths are never accepted from client
- private upload directory remains private

---

64. XSS Testing

Use harmless test payloads such as:

<script>alert('test')</script>

inside a test report title/description.

Verify that the content is displayed as text and is not executed.

Do not weaken output escaping to make it render as HTML.

---

65. SQL Injection Testing

Test appropriate harmless injection strings against:

- search
- reference
- category filter
- status filter

Verify the API continues to use parameterized queries and does not expose database errors.

---

66. Regression Testing

After implementing M5, verify:

M1

Landing page works.

M2

Registration works.

Login works.

Logout works.

Cookie authentication works.

M3

Dashboard works.

Profile works.

M4

Report creation works.

Attachments work.

Report references work.

Security Hardening

No authentication tokens return to localStorage.

No authentication tokens return to sessionStorage.

Cookie authentication remains functional.

M5

My Reports works.

Report details work.

Status history works.

Ownership isolation works.

---

67. Documentation

Update:

README.md
docs/API.md
docs/DATABASE.md
docs/ARCHITECTURE.md

Document:

- My Reports endpoint
- report detail endpoint
- pagination
- filtering
- status history
- ownership rules
- attachment access
- citizen-visible vs internal history

Do not document internal secrets.

---

68. Definition of Done

M5 is complete only when:

- [ ] Authenticated citizens can access My Reports.
- [ ] Unauthenticated users cannot access My Reports.
- [ ] Citizens only see their own reports.
- [ ] Report ownership is enforced server-side.
- [ ] No client-provided "user_id" is trusted.
- [ ] Reports are paginated.
- [ ] Search works.
- [ ] Status filtering works.
- [ ] Category filtering works.
- [ ] Empty states work.
- [ ] Loading states work.
- [ ] Error states work.
- [ ] Individual report details work.
- [ ] Report reference is displayed.
- [ ] Current status is displayed.
- [ ] Status history exists.
- [ ] Existing reports receive an accurate initial Submitted history entry.
- [ ] New M4 reports create their initial Submitted history entry.
- [ ] Citizen-visible history is separated from internal history.
- [ ] Attachments can be safely displayed/accessed by the owner.
- [ ] Other users cannot access attachments.
- [ ] Anonymous reports are handled correctly.
- [ ] Dashboard My Reports navigation works.
- [ ] Dashboard report counts use real database data.
- [ ] No fake statistics exist.
- [ ] Cookie-based authentication remains intact.
- [ ] No JWT is stored in browser storage.
- [ ] No public report endpoint exists.
- [ ] No admin workflow has been added.
- [ ] No notifications have been added.
- [ ] No AI functionality has been added.
- [ ] OCL colors are used.
- [ ] No gradients have been introduced.
- [ ] Accessibility checks pass.
- [ ] Security tests pass.
- [ ] M0–M4 regression tests pass.
- [ ] Documentation is updated.

---

69. Strict Do-Not-Do List

Do NOT:

- use localStorage for authentication
- use sessionStorage for authentication
- reintroduce bearer-token storage
- trust client-supplied user IDs
- expose another citizen's report
- expose another citizen's attachments
- expose internal status history
- expose internal notes
- create admin review
- create report assignment
- create referrals
- create notifications
- create AI verification
- create public reports
- create the public CivicWatch map
- create civic alerts
- create fake status events
- create fake report statistics
- hardcode report counts
- automatically change report statuses
- allow citizens to change statuses
- create duplicate authentication logic
- create duplicate report tables
- introduce Docker
- introduce gradients
- redesign working functionality unnecessarily

---

70. Development Sequence

Follow this order:

1. Inspect M4 reports implementation
        ↓
2. Inspect authentication hardening
        ↓
3. Test existing report creation
        ↓
4. Create report_status_history migration
        ↓
5. Add initial history for existing reports
        ↓
6. Update M4 creation transaction to create Submitted history
        ↓
7. Implement GET /api/reports/my
        ↓
8. Implement pagination
        ↓
9. Implement search/filtering
        ↓
10. Implement GET /api/reports/my/:reference
        ↓
11. Implement citizen-visible status history
        ↓
12. Implement secure attachment access
        ↓
13. Test API ownership isolation
        ↓
14. Build My Reports frontend
        ↓
15. Build report detail frontend
        ↓
16. Integrate dashboard
        ↓
17. Test mobile layout
        ↓
18. Test accessibility
        ↓
19. Test security
        ↓
20. Run M0–M4 regression
        ↓
21. Update documentation
        ↓
22. Verify definition of done

After each major implementation stage:

- start the frontend
- start the backend
- check compilation
- check browser console
- check backend logs
- test the relevant API
- inspect database records
- fix errors before continuing

---

71. Final Implementation Report

After completing M5, provide:

Implemented

List the actual features completed.

Database

List migrations/tables changed.

API

List endpoints implemented.

Frontend

List pages/components implemented.

Security

Explain:

- ownership enforcement
- cookie authentication
- attachment authorization
- input validation
- SQL protection
- XSS protection

Testing

List tests actually performed and their results.

Regression

Confirm which earlier milestones were re-tested.

Known Issues

Only list genuine unresolved issues.

Not Implemented

Explicitly confirm that:

- admin review
- assignment
- referrals
- notifications
- AI verification
- public map
- civic alerts

remain for later milestones.

Do not claim a test passed unless it was actually run.

---

72. Stop Point

When M5 is complete:

STOP.

Do not automatically begin M6.

The next milestone should only begin after M5 has been fully tested and verified.