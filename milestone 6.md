CivicWatch AI Kenya — Milestone 6: OCL Admin Dashboard

1. Objective

Implement the OCL/Admin Dashboard for authorized administrative users.

The dashboard will become the administrative workspace for CivicWatch AI Kenya.

At the end of this milestone, authorized users should be able to:

1. Access a protected administrative area.
2. See an OCL administration layout.
3. View real system-level overview statistics.
4. See report counts by status.
5. See report counts by category.
6. See report activity over time.
7. See basic user counts.
8. Navigate to future administrative modules.
9. Clearly distinguish administrative functionality from the citizen experience.

This milestone establishes the administrative foundation.

It does not implement incident management.

Actual report review, assignment, status changes, referrals, internal notes, and resolution workflows belong to M7 — Incident Management.

---

2. Existing System

Before changing anything, inspect and test:

- M0 — Project Foundation
- M1 — Landing Page
- M2 — Authentication
- Authentication Security Hardening
- OCL Brand Color Update
- M3 — Citizen Dashboard
- M4 — Incident Reporting
- M5 — Report Tracking

Confirm:

- frontend starts
- backend starts
- MySQL works
- authentication uses secure cookies
- protected routes work
- citizen dashboard works
- citizen report creation works
- My Reports works
- report ownership isolation works

Do not replace existing systems.

Do not create another authentication system.

Do not create another database connection.

Do not create another report system.

Reuse the existing architecture.

---

3. Administrative Roles

The existing authentication system contains:

Citizen
Admin
Moderator
Analyst

For M6, implement administrative dashboard access according to the existing role model.

Admin

Full access to the M6 administrative dashboard.

Moderator

May access administrative dashboard functionality explicitly permitted by the existing role policy.

Do not automatically give Moderator every Admin permission.

Analyst

May access administrative overview/analytics-oriented information where appropriate.

Do not automatically give Analyst operational management permissions.

Citizen

Must never access the administrative dashboard.

---

4. Authorization Principle

Authentication is not authorization.

A logged-in user is not automatically an administrator.

Every administrative backend endpoint must verify:

Authenticated
      ↓
Role authorized
      ↓
Administrative endpoint

Do not rely on frontend route hiding.

The backend must enforce administrative authorization.

---

5. Admin Route

Create a protected route such as:

/admin

or follow the existing routing conventions.

The route must use the existing authentication system.

Recommended flow:

User
 ↓
HttpOnly authentication cookie
 ↓
Authentication middleware
 ↓
Role middleware
 ↓
Admin Dashboard

---

6. Unauthorized Access

If a Citizen attempts:

/admin

the application must prevent access.

Do not simply hide the navigation item.

The API must also reject unauthorized requests.

Use an appropriate response such as:

403 Forbidden

when the user is authenticated but lacks permission.

Do not reveal unnecessary administrative information.

---

7. Administrative Layout

Create a dedicated administrative layout.

Suggested structure:

AdminLayout
├── Sidebar
├── Header
├── Main Content
└── Mobile Navigation

Do not reuse the CitizenLayout as the primary administrative layout.

The administrative workspace has different navigation and information density.

---

8. Admin Navigation

Create navigation items for the administrative system.

For M6, only the Dashboard must be fully functional.

Suggested navigation:

Dashboard
Incidents
Users
Verification
Alerts
Participation
Analytics
Notifications
Audit Logs
Settings

Only:

Dashboard

should be implemented in this milestone.

Future navigation items may display an appropriate "Coming Soon" state, but they must not pretend to work.

Do not create fake pages containing fake data.

---

9. Admin Header

The header should contain:

CivicWatch AI Kenya
OCL Administration

and the authenticated administrator's information.

For example:

Admin Name
Admin

Use the real authenticated user.

Do not hardcode an administrator's name.

---

10. Citizen/Admin Separation

An administrator should have a clear administrative experience.

Do not mix the citizen sidebar with administrative navigation.

Do not make "/admin" depend on the citizen dashboard layout.

However, shared components such as:

- buttons
- inputs
- cards
- typography
- notifications/toasts
- modal components

may be reused.

---

11. Database Changes

Do not create unnecessary new tables.

M6 should primarily use existing:

users
reports
report_categories
report_status_history

for dashboard statistics.

Do not create:

admin_dashboard
analytics
admin_statistics

tables merely to store calculated statistics.

The dashboard should calculate statistics from actual application data.

---

12. Dashboard Statistics

Create real backend endpoints for administrative overview statistics.

A possible endpoint:

GET /api/admin/dashboard/summary

The endpoint must require appropriate administrative authorization.

It should return actual database information.

Possible summary:

{
  "success": true,
  "summary": {
    "total_reports": 0,
    "submitted_reports": 0,
    "under_review_reports": 0,
    "verified_reports": 0,
    "assigned_reports": 0,
    "in_progress_reports": 0,
    "resolved_reports": 0,
    "closed_reports": 0,
    "rejected_reports": 0,
    "total_users": 0,
    "active_users": 0
  }
}

Use the actual database values.

Do not create fake numbers for demonstration.

---

13. Report Status Statistics

Calculate report counts using the existing report status values:

Submitted
Under Review
Verified
Assigned
In Progress
Resolved
Closed
Rejected

If there are zero reports:

0

is the correct value.

Do not replace zero with sample data.

---

14. Category Statistics

Provide report counts grouped by category.

Example response:

{
  "category": "Infrastructure",
  "count": 12
}

Use:

report_categories

rather than hardcoding category names in SQL.

Include categories with zero reports if that makes the chart/list easier to understand.

---

15. County Statistics

If the existing report data contains county information, provide a basic county breakdown.

Example:

Mombasa       10
Nairobi        8
Kisumu         4

These must represent actual database records.

Do not add fake county records.

Do not create a geographic map in M6.

The public CivicWatch map belongs to M10.

---

16. Report Activity Over Time

Create a basic report-creation trend.

For example:

Reports submitted by month

Use actual:

reports.created_at

data.

The backend should return structured data suitable for Recharts.

Example:

[
  {
    "period": "2026-08",
    "count": 5
  },
  {
    "period": "2026-09",
    "count": 12
  },
  {
    "period": "2026-10",
    "count": 7
  }
]

Do not create artificial activity.

---

17. User Statistics

Use the existing "users" table to calculate basic administrative counts.

Potential statistics:

Total Users
Active Users
Citizens
Admins
Moderators
Analysts

Only display information that can be accurately derived from the current schema.

Do not create additional user metrics without a clear database source.

---

18. Dashboard Cards

Create summary cards such as:

Total Reports
Submitted
Under Review
In Progress
Resolved
Total Users

The exact cards can be adjusted according to the available data.

Every number must come from the backend.

Do not hardcode:

1,240 reports
845 users

or similar values.

---

19. Charts

Use the existing Recharts dependency.

Implement a small number of useful charts.

Recommended:

Reports Over Time

Line or area-style chart.

Reports by Category

Bar chart.

Reports by Status

Bar or donut/pie chart.

Reports by County

Bar chart if the data is sufficiently useful.

Do not create charts merely to fill space.

Avoid excessive dashboards.

---

20. Chart Data

Charts must consume API data.

Do not create:

const fakeReports = [...]

for production dashboard rendering.

Do not generate random chart values.

If there is no data, show an honest empty state:

No report data available yet.

---

21. Dashboard Summary Endpoint Design

Prefer a small number of efficient API calls.

For example:

GET /api/admin/dashboard/summary
GET /api/admin/dashboard/reports
GET /api/admin/dashboard/users

or one well-designed dashboard endpoint if the response remains manageable.

Avoid making dozens of requests for every dashboard card.

Do not create unnecessary API complexity.

---

22. Recommended Dashboard Response

A combined response may look like:

{
  "success": true,
  "summary": {
    "total_reports": 0,
    "submitted": 0,
    "under_review": 0,
    "verified": 0,
    "assigned": 0,
    "in_progress": 0,
    "resolved": 0,
    "closed": 0,
    "rejected": 0,
    "total_users": 0,
    "active_users": 0
  },
  "reports_over_time": [],
  "reports_by_category": [],
  "reports_by_status": [],
  "reports_by_county": []
}

Adapt this to the existing API conventions.

Do not expose unnecessary database information.

---

23. Date Range

The dashboard should use a clearly defined time range for time-series data.

For the initial implementation, a reasonable default can be:

Last 30 days

or:

Current year

Choose one and document it.

If implementing a date filter, validate:

from
to

on the backend.

Do not allow arbitrary SQL expressions through date parameters.

---

24. Dashboard Date Filter

A date filter is optional.

If implemented, allow something like:

Last 7 days
Last 30 days
Last 90 days
This year
All time

The backend must translate these choices into safe date conditions.

Do not accept raw SQL or arbitrary database expressions from the client.

---

25. Admin API Security

Every endpoint under:

/api/admin/*

must use authentication and authorization.

Conceptually:

/api/admin/*
      ↓
authenticate
      ↓
require administrative role
      ↓
controller

Do not depend on the frontend to enforce this.

---

26. Role Authorization

Use the role middleware created in M2.

Do not create:

isAdmin()

in every controller if a reusable authorization middleware already exists.

Use the existing RBAC architecture.

If M2's role middleware needs a small improvement, improve it centrally rather than creating duplicates.

---

27. Admin Dashboard Access Matrix

Implement the following basic access policy:

Role| Admin Dashboard
Citizen| No
Admin| Yes
Moderator| Yes, subject to permitted administrative scope
Analyst| Yes, subject to permitted analytical scope

For M6, dashboard access does not automatically mean operational permissions.

M7 will define incident-management permissions.

---

28. Moderator and Analyst Restrictions

Do not give Moderator or Analyst unrestricted Admin privileges merely because they can open the dashboard.

The dashboard itself may display different information based on role if necessary.

For example:

Moderator
→ operational overview

Analyst
→ analytical overview

However, do not overbuild role-specific dashboards.

The important requirement is that role boundaries remain explicit.

---

29. No Incident Management

M6 must NOT implement:

Assign Report
Change Status
Verify Report
Reject Report
Resolve Report
Close Report
Add Internal Note
Add Citizen Update
Create Referral

These belong to M7.

The dashboard may show counts of these statuses because those records already exist.

But administrators must not change them from M6.

---

30. No Report List

Do not build the full admin incident list in M6.

Do not create:

/admin/incidents

as a working incident-management page.

M7 will introduce:

Incident Management

with search, filters, details, assignment, status changes and referrals.

---

31. No User Management

Do not implement:

- suspend user
- restore user
- change role
- delete user
- inspect detailed user activity

M14 will handle User Management.

M6 may show basic user counts.

---

32. No Notifications

Do not implement notification management.

M8 will introduce notifications.

Do not create:

/admin/notifications

as a working feature.

---

33. No AI Verification

Do not call Gemini.

Do not display AI verification statistics unless actual M9 data exists.

M9 will introduce AI Information Verification.

---

34. No Civic Map

Do not implement Leaflet or the public CivicWatch map in M6.

M10 will handle the map.

Do not display report locations on a map.

---

35. No Alerts

Do not create the administrative alert-management system.

M11 will handle Civic Alerts.

---

36. No Participation

Do not implement surveys, consultations or petitions.

M12 will handle Civic Participation.

---

37. No AI Assistant

Do not implement the AI Civic Assistant.

M13 will handle that feature.

---

38. Admin Dashboard UI

Use the OCL visual identity established previously.

Primary:

Deep Navy
#141F35

Accent:

Gold
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

The dominant combination should remain:

Navy + White + Gold

Do not introduce gradients.

---

39. Admin Sidebar

Recommended structure:

CIVICWATCH AI KENYA
OCL ADMINISTRATION

Dashboard

OPERATIONS
Incidents
Users

INTELLIGENCE
Verification
Analytics

ENGAGEMENT
Alerts
Participation
Notifications

SYSTEM
Audit Logs
Settings

Future sections may be shown as disabled/coming soon if useful.

Do not create fake functionality.

---

40. Dashboard Header

Example:

Administration Dashboard

Overview of CivicWatch activity and platform data.

Display the current authenticated administrator's name.

Do not hardcode it.

---

41. Responsive Design

The administrative dashboard must work on:

- desktop
- laptop
- tablet
- mobile

On small screens:

- collapse sidebar
- provide accessible navigation
- make charts horizontally manageable
- avoid overflowing tables
- preserve readable cards

Do not simply shrink desktop UI until it becomes unusable.

---

42. Empty State

When the system has no reports:

No civic reports yet

Report activity will appear here once citizens begin submitting reports.

Do not create sample statistics.

When there are no users beyond the administrative account:

No additional user activity yet.

Use honest language.

---

43. Loading State

The dashboard should have a proper loading state.

Do not show:

0

while data is still loading if that could be confused with actual zero.

Use skeleton cards or a clear loading indicator.

---

44. Error State

If the dashboard API fails:

Unable to load dashboard data.

Please try again.

Provide a working:

Retry

button.

Do not silently display zero statistics when the backend failed.

Zero and failed are different states.

---

45. Partial Data Failure

If dashboard sections use separate endpoints and one fails, do not make unrelated sections appear broken.

However, avoid unnecessary endpoint fragmentation.

If using one combined endpoint, display an appropriate general error.

---

46. Data Privacy

Administrative statistics may contain aggregate information.

Do not expose individual citizen information through the dashboard summary.

Do not include:

- citizen email addresses
- phone numbers
- private report descriptions
- private attachments
- precise private locations
- internal notes

in M6 dashboard summaries.

M7 will introduce controlled report access.

---

47. Aggregation Queries

Use efficient SQL aggregation.

Examples conceptually:

COUNT(*)
GROUP BY status
GROUP BY category_id
GROUP BY county

Use joins where appropriate.

Do not load every report into Node.js and calculate all statistics in JavaScript if MySQL can safely perform the aggregation.

---

48. Indexing

Inspect existing indexes.

The dashboard may benefit from indexes on:

reports.status
reports.category_id
reports.county
reports.created_at
users.role
users.is_active

Only add indexes that are justified.

Do not create duplicate indexes.

---

49. API Validation

Validate all administrative API query parameters.

For example:

date range
limit
period

Use the existing Zod validation architecture.

Do not trust query parameters.

---

50. Error Security

Administrative APIs must not expose:

- SQL errors
- stack traces
- database structure
- filesystem paths
- secrets
- authentication credentials

Return safe error responses.

Log technical details server-side where appropriate.

---

51. Audit Consideration

M16 will introduce full audit logging.

Do not build the complete audit-log system in M6.

However, administrative dashboard access should not introduce an architecture that prevents future audit logging.

Keep controllers/services structured so that M16 can add audit events cleanly.

---

52. Performance

The dashboard should remain responsive as data grows.

Use:

- SQL aggregation
- appropriate indexes
- pagination where lists are eventually introduced
- bounded date ranges
- efficient joins
- minimal API requests

Do not query every report row merely to display a count.

---

53. Caching

Caching is optional.

Do not introduce Redis or another infrastructure dependency solely for M6.

For the MVP, efficient MySQL aggregation is sufficient.

If caching is already part of the project, reuse it appropriately.

Do not introduce Docker.

---

54. Frontend Structure

Follow the existing architecture.

A possible structure:

frontend/src/
├── layouts/
│   └── AdminLayout.jsx
├── pages/
│   └── admin/
│       └── AdminDashboard.jsx
├── components/
│   └── admin/
│       ├── AdminSidebar.jsx
│       ├── AdminHeader.jsx
│       ├── AdminStatCard.jsx
│       ├── ReportStatusChart.jsx
│       ├── ReportCategoryChart.jsx
│       ├── ReportTrendChart.jsx
│       └── AdminEmptyState.jsx
└── services/
    └── adminService.js

Adapt this to the existing project.

Do not duplicate generic components unnecessarily.

---

55. Backend Structure

Follow the existing backend architecture.

Possible structure:

backend/src/
├── controllers/
│   └── adminDashboardController.js
├── routes/
│   └── adminRoutes.js
├── services/
│   └── adminDashboardService.js
└── validators/
    └── adminDashboardValidators.js

Reuse:

- database pool
- authentication middleware
- role middleware
- error handling
- validation utilities

---

56. API Example

A dashboard request:

GET /api/admin/dashboard/summary

must use the existing authentication cookie.

The frontend should not manually send a JWT.

The backend should verify:

authenticated user
+
authorized role

before querying dashboard data.

---

57. Frontend Authentication

The admin dashboard must use the same cookie-based authentication introduced during the security hardening.

Do not introduce:

adminToken
adminJwt
admin_access_token

or any separate client-side credential.

---

58. Route Protection

Implement frontend route protection for usability.

For example:

/admin

should check authentication state.

But remember:

«Frontend protection is not security.»

The backend must independently enforce authorization.

---

59. Direct API Test

Test:

GET /api/admin/dashboard/summary

as:

Citizen

Expected:

403 Forbidden

Authorized administrative user

Expected:

200 OK

with real dashboard data.

Unauthenticated user

Expected:

401 Unauthorized

---

60. Testing — Dashboard Statistics

Create test data only in a controlled development/test environment.

Verify:

- total reports
- reports by status
- reports by category
- reports by county
- reports over time
- total users
- active users
- role counts

Match API results against direct database queries.

Do not assume the chart is correct merely because it renders.

---

61. Testing — Zero Data

Test a database with no reports.

Expected:

Total Reports = 0

Charts should show an honest empty state.

Do not display fake chart bars.

---

62. Testing — Role Isolation

Test with:

Citizen

Attempt:

/admin

and:

GET /api/admin/dashboard/summary

Both must be denied.

Admin

Both should work.

Moderator

Verify access according to the defined role policy.

Analyst

Verify access according to the defined role policy.

---

63. Testing — Cookie Authentication

Verify the admin dashboard continues to work when the JWT is stored only in the HttpOnly cookie.

Confirm:

- frontend does not read JWT
- API request includes credentials
- backend identifies the user
- role middleware identifies the correct role

---

64. Testing — Data Leakage

Verify that dashboard responses do not contain:

password_hash
JWT
email lists
phone lists
private report descriptions
private attachments
internal notes

unless explicitly required.

The summary endpoint should be aggregate-focused.

---

65. Testing — SQL Injection

Test appropriate harmless input against administrative query parameters.

Verify:

- parameterized queries
- no SQL errors exposed
- no unauthorized data returned

---

66. Testing — XSS

Any future user-controlled dashboard labels or values must be rendered safely.

Do not inject raw HTML into charts or dashboard components.

---

67. Testing — Regression

After M6, re-test:

M1

Landing page.

M2

Registration.

Login.

Logout.

Roles.

Security Hardening

HttpOnly cookie.

No localStorage JWT.

CORS.

CSRF.

M3

Citizen dashboard.

M4

Report creation.

M5

My Reports.

Report detail.

Ownership isolation.

Attachment access.

The new admin functionality must not break citizen functionality.

---

68. Documentation

Update:

README.md
docs/API.md
docs/ARCHITECTURE.md
docs/DATABASE.md

Document:

- admin route
- admin authorization
- dashboard endpoint
- dashboard data sources
- role access
- dashboard statistics
- chart data
- empty/error behavior

Do not document secrets.

---

69. Definition of Done

M6 is complete only when:

- [ ] Admin layout exists.
- [ ] Admin dashboard route exists.
- [ ] Admin route is protected.
- [ ] Backend admin endpoints are protected.
- [ ] Citizen cannot access admin APIs.
- [ ] Administrative role authorization works.
- [ ] Existing cookie authentication is reused.
- [ ] No admin token is created.
- [ ] Dashboard statistics come from the database.
- [ ] Total report count is real.
- [ ] Status counts are real.
- [ ] Category counts are real.
- [ ] County counts are real where implemented.
- [ ] Report trend data is real.
- [ ] User counts are real.
- [ ] Charts consume API data.
- [ ] No fake statistics exist.
- [ ] Zero-data states work.
- [ ] Loading states work.
- [ ] Error states work.
- [ ] Retry works.
- [ ] Dashboard is responsive.
- [ ] OCL colors are used.
- [ ] No gradients are introduced.
- [ ] No individual citizen data is unnecessarily exposed.
- [ ] SQL queries are parameterized.
- [ ] Existing M0–M5 functionality still works.
- [ ] Documentation is updated.

---

70. Strict Do-Not-Do List

Do NOT:

- build incident management
- change report status from the dashboard
- assign reports
- verify reports
- reject reports
- resolve reports
- close reports
- add internal notes
- create referrals
- manage users
- suspend users
- change user roles
- create notifications
- create AI verification
- create the public map
- create civic alerts
- create participation features
- create the AI assistant
- create audit logs
- create system settings
- create fake statistics
- hardcode dashboard numbers
- use localStorage for authentication
- create a second authentication system
- create a second database connection
- expose private citizen data
- expose private report attachments
- use gradients
- introduce Docker
- introduce unnecessary infrastructure
- automatically continue to M7

---

71. Development Sequence

Follow this order:

1. Inspect M0–M5
        ↓
2. Test existing cookie authentication
        ↓
3. Test citizen report functionality
        ↓
4. Inspect existing role middleware
        ↓
5. Define admin authorization boundary
        ↓
6. Create admin dashboard backend service
        ↓
7. Create protected admin routes
        ↓
8. Implement summary queries
        ↓
9. Implement status aggregation
        ↓
10. Implement category aggregation
        ↓
11. Implement county aggregation
        ↓
12. Implement time-series aggregation
        ↓
13. Implement user aggregation
        ↓
14. Test APIs directly
        ↓
15. Create AdminLayout
        ↓
16. Create AdminDashboard
        ↓
17. Connect real API data
        ↓
18. Add charts
        ↓
19. Add responsive navigation
        ↓
20. Test role isolation
        ↓
21. Test data accuracy
        ↓
22. Test security
        ↓
23. Run M0–M5 regression
        ↓
24. Update documentation
        ↓
25. Verify definition of done

After each major stage:

- start frontend
- start backend
- check compilation
- check browser console
- check backend logs
- test the affected API
- inspect database results
- fix errors before continuing

---

72. Final Implementation Report

After completing M6, provide:

Implemented

List the actual admin dashboard features.

Authorization

Document which roles can access the dashboard and APIs.

Database

List any migrations or indexes added.

API

List administrative endpoints.

Frontend

List administrative pages/components.

Statistics

Explain where each displayed statistic comes from.

Security

Document:

- authentication
- authorization
- cookie handling
- SQL protection
- data privacy

Testing

List tests actually executed and their results.

Regression

Confirm M0–M5 functionality was tested.

Known Issues

Only list genuine remaining issues.

Not Implemented

Explicitly confirm that:

- incident management
- assignment
- referrals
- notifications
- AI verification
- map
- alerts
- participation
- user management
- audit logs
- settings

remain for later milestones.

Do not claim a test passed unless it was actually performed.

---

73. Stop Point

When M6 is complete and verified:

STOP.

Do not automatically begin M7.

M7 will build the actual Incident Management workflow on top of the administrative foundation established here.