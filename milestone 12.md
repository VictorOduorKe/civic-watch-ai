M12 — CIVIC INTELLIGENCE & INSIGHTS

OBJECTIVE

Implement Milestone 12 of CivicWatch AI Kenya.

M12 introduces a privacy-conscious intelligence and analytics layer that transforms existing civic data into useful aggregated insights.

The system should help citizens and authorized administrators understand civic activity, trends, alerts, and service issues without exposing private citizen information.

IMPORTANT:

- Do NOT start M13.
- Do NOT implement features belonging exclusively to M13 or later milestones.
- Do NOT automatically advance the roadmap.
- M12 must be implemented, tested, verified, and reported.
- After M12 verification, STOP and wait for explicit human approval.
- Only the human project owner can authorize progression to M13.

---

1. READ THE EXISTING PROJECT FIRST

Before modifying anything:

1. Inspect the entire repository structure.
2. Read:
   - "docs/MILESTONES.md"
   - existing milestone documentation
   - authentication implementation
   - authorization middleware
   - database schema/migrations
   - report models
   - alert models
   - user models
   - admin functionality
   - API routes
   - frontend routing
   - dashboard components
   - existing analytics/statistics code
   - logging/audit functionality
3. Determine what was actually implemented during M1–M11.
4. Reuse existing architecture instead of creating duplicate systems.
5. Do not replace working authentication, authorization, reporting, alerts, or security systems unnecessarily.

If an expected component does not exist, document the gap before implementing it.

---

2. M12 SCOPE

M12 must provide aggregated civic intelligence and insights from existing CivicWatch data.

The system should support:

- civic activity statistics
- report statistics
- report trends
- category trends
- geographic trends
- status trends
- alert statistics
- alert trends
- time-based analysis
- administrative analytics
- privacy-preserving public statistics
- appropriate dashboard visualizations
- filtering
- date ranges
- geographic filtering
- category filtering
- role-based access

Do not expose private citizen information through analytics.

---

3. CIVIC OVERVIEW STATISTICS

Create aggregated statistics for the platform.

Possible metrics include:

- total reports
- reports submitted during selected period
- open reports
- resolved reports
- pending reports
- escalated reports
- total active alerts
- alerts published during selected period
- reports by category
- reports by status
- reports by geographic area
- reports over time

Only use metrics supported by the actual database.

Do not invent data.

If there is insufficient data, display an appropriate empty state.

---

4. REPORT TREND ANALYTICS

Create analytics showing how civic reports change over time.

Support:

- daily aggregation
- weekly aggregation
- monthly aggregation

depending on the selected date range.

Examples:

- reports per day
- reports per week
- reports per month
- resolved reports over time
- pending reports over time
- escalated reports over time

The frontend should allow the user to change the time period.

Example filters:

- Last 7 days
- Last 30 days
- Last 90 days
- Last 12 months
- Custom range

Do not hard-code statistics.

All statistics must come from backend data.

---

5. REPORT CATEGORY ANALYTICS

Create aggregated category insights.

Examples:

- infrastructure
- sanitation
- roads
- water
- electricity
- public safety
- environment
- other categories actually present in the system

Display:

- number of reports
- percentage where appropriate
- trend over time where supported

Do not create fake categories simply to populate charts.

Use the project's actual category definitions.

---

6. STATUS ANALYTICS

Create aggregated report status statistics.

Support the actual statuses implemented by CivicWatch.

For example:

- submitted
- pending
- under review
- in progress
- resolved
- rejected
- escalated

Only include statuses that actually exist.

Provide:

- total count
- percentage where appropriate
- trend over time where appropriate

---

7. GEOGRAPHIC ANALYTICS

Where the existing report data contains geographic information, provide aggregated geographic insights.

Possible levels:

- county
- sub-county
- ward
- town/area

Use only geographic information already stored by the application.

Support filtering by geographic area.

Example:

"County → Sub-county → Ward"

Do not expose:

- exact private addresses
- personal location information
- private coordinates
- personally identifiable location data

Public analytics must remain sufficiently aggregated.

---

8. ALERT ANALYTICS

Use the Civic Alerts & Advisories system created in M11.

Provide aggregated statistics such as:

- total alerts
- active alerts
- expired alerts
- archived alerts
- alerts by category
- alerts by severity
- alerts by geographic area
- alerts published over time

Use the actual alert categories and severity values from M11.

Do not duplicate the alert management system.

M12 only provides analytics over the existing alert data.

---

9. TIME-BASED ANALYSIS

Provide meaningful time-based filtering.

Supported controls should include:

- start date
- end date
- predefined ranges
- aggregation interval

Backend queries must respect the selected date range.

Validate:

- invalid dates
- future ranges where inappropriate
- start date after end date
- excessively large ranges if necessary

Return clear validation errors.

---

10. ADMIN ANALYTICS

Authorized administrators should have access to deeper analytics.

Possible administrator metrics:

- reports received
- reports resolved
- average resolution time where reliable timestamps exist
- unresolved reports
- escalated cases
- reports by category
- reports by location
- alerts created
- alerts published
- verification activity
- moderation activity where available

Only calculate metrics that can be accurately derived from existing data.

Do not estimate missing values.

If a metric cannot be calculated reliably, omit it or clearly mark it as unavailable.

---

11. PUBLIC CIVIC INSIGHTS

If the architecture supports public analytics, create a privacy-safe public insights section.

Public users may see aggregated information such as:

- number of civic reports
- broad report categories
- broad geographic trends
- public alert statistics
- general civic activity trends

Public analytics must NOT reveal:

- citizen names
- email addresses
- phone numbers
- authentication information
- private report descriptions
- private case notes
- sensitive-case details
- exact private addresses
- private coordinates
- internal administrative notes
- security information
- access tokens
- session information

---

12. SENSITIVE CASE PROTECTION

This requirement is critical.

M7 introduced sensitive-case handling.

M12 analytics MUST NOT accidentally expose sensitive cases.

Review:

- database queries
- API responses
- aggregation logic
- frontend data
- exports
- charts
- filters
- geographic aggregation

Sensitive cases should only contribute to analytics if the existing privacy rules explicitly allow aggregated inclusion.

If necessary, exclude sensitive records from public analytics.

Never expose sensitive-case details through charts, tooltips, API responses, or frontend state.

---

13. PRIVACY-PRESERVING AGGREGATION

Implement safeguards against identifying individual citizens through analytics.

Avoid returning overly granular datasets.

For example, do not expose:

Ward A
1 report

if that could reasonably reveal a particular person's activity.

Where appropriate, implement a minimum aggregation threshold.

Example concept:

MIN_PUBLIC_COUNT = 5

If a public grouping contains fewer records than the configured threshold, do not expose that grouping publicly.

The exact threshold must be configurable and documented.

Do not apply this restriction blindly to authorized internal administrative analytics if the existing authorization model permits the administrator to access aggregated data.

---

14. BACKEND ANALYTICS API

Create clean backend endpoints for analytics.

Follow the project's existing API architecture and naming conventions.

Possible endpoints:

GET /api/analytics/overview
GET /api/analytics/reports
GET /api/analytics/reports/categories
GET /api/analytics/reports/status
GET /api/analytics/reports/geography
GET /api/analytics/alerts
GET /api/analytics/trends

Do not create duplicate endpoints if equivalent endpoints already exist.

All endpoints must have appropriate authorization.

Example:

Public analytics
    ↓
privacy filtering
    ↓
aggregated results

and:

Admin analytics
    ↓
authentication
    ↓
authorization
    ↓
aggregated administrative results

---

15. QUERY SECURITY

All analytics queries must be safely parameterized.

Never construct SQL using direct user input.

Bad:

`SELECT ... WHERE county = '${county}'`

Use the project's existing parameterized database approach.

Validate:

- dates
- categories
- status values
- geographic identifiers
- pagination where applicable

Analytics endpoints must not introduce SQL injection vulnerabilities.

---

16. PERFORMANCE

Analytics queries can become expensive as the database grows.

Review query performance.

Where appropriate:

- add indexes
- aggregate in SQL
- avoid fetching thousands of records unnecessarily
- avoid calculating large statistics entirely in the browser
- select only required columns
- use efficient date filtering
- avoid N+1 queries

Do not introduce caching unless it fits the existing architecture.

If caching is implemented, document:

- cache duration
- invalidation strategy
- privacy implications

---

17. FRONTEND INSIGHTS DASHBOARD

Create a professional CivicWatch Insights interface.

Follow the existing CivicWatch branding and logo.

Important design rules:

- no gradients
- use the established CivicWatch color system
- clean solid colors
- readable typography
- professional civic/public-service appearance
- responsive design
- accessible contrast
- mobile-friendly layout

Do not redesign unrelated pages.

---

18. DASHBOARD STRUCTURE

A possible structure:

Civic Insights

[Date Range] [Location] [Category] [Status]

Overview
--------------------------------
Total Reports
Active Reports
Resolved Reports
Active Alerts

Report Trends
--------------------------------
[Trend visualization]

Reports by Category
--------------------------------
[Visualization]

Reports by Status
--------------------------------
[Visualization]

Geographic Activity
--------------------------------
[Aggregated visualization]

Alert Activity
--------------------------------
[Visualization]

Adapt this to the existing UI rather than blindly copying it.

---

19. DATA VISUALIZATION

Use the project's existing charting library if one exists.

If none exists, select a lightweight suitable library compatible with the current frontend.

Possible visualizations:

- line charts
- bar charts
- doughnut/pie charts where appropriate
- tables
- KPI cards

Do not create unnecessary charts.

Every visualization must have a clear purpose.

Charts must have:

- readable labels
- useful empty states
- loading states
- error states
- accessible text alternatives where appropriate

---

20. FILTER SYNCHRONIZATION

Filters should be consistent across the dashboard.

At minimum support:

date range
geographic area
category
status

Only show filters that apply to the selected analytics.

Changing a filter should refresh the relevant data.

Avoid unnecessary duplicate API requests.

---

21. LOADING AND ERROR STATES

Every analytics section must handle:

Loading

Display a clear loading state.

Empty data

Example:

No civic activity found for the selected period.

Error

Example:

Unable to load civic insights.
Please try again.

Do not expose:

- stack traces
- SQL errors
- internal paths
- tokens
- database credentials
- sensitive server information

---

22. ROLE-BASED ACCESS

Review the existing role system.

Possible access levels:

Public
Citizen
Moderator
Administrator

Do not assume these exact roles exist.

Use the actual roles implemented by CivicWatch.

The backend must enforce authorization.

Never rely only on frontend route protection.

A user who manually calls the API must still be denied unauthorized analytics.

---

23. AUDIT LOGGING

Where the existing audit system supports analytics access, record appropriate administrative actions.

For example:

admin accessed analytics
admin exported analytics
admin viewed sensitive administrative statistics

Do not log unnecessary personal data.

Do not place authentication tokens or passwords into audit logs.

Follow the existing M9/M10 logging rules.

---

24. EXPORTS

Only implement analytics export if the existing project already has an appropriate export pattern or if it is clearly within M12.

If exports are implemented:

- respect authorization
- apply the same privacy protections
- exclude sensitive fields
- prevent unauthorized access
- do not expose raw database records
- log administrative exports where appropriate

Do not build a separate reporting platform.

---

25. API RESPONSE DESIGN

Return predictable response structures.

Example:

{
  "success": true,
  "data": {
    "totalReports": 120,
    "resolvedReports": 75,
    "activeReports": 45
  },
  "filters": {
    "startDate": "2026-01-01",
    "endDate": "2026-10-01"
  }
}

Adapt this to the project's existing API response conventions.

Do not introduce a second response format if one already exists.

---

26. TESTING

Create or update tests for:

Backend

- overview statistics
- date filtering
- category filtering
- status filtering
- geographic filtering
- alert statistics
- authorization
- invalid parameters
- SQL injection attempts
- sensitive-case protection
- minimum aggregation threshold
- empty datasets

Frontend

- dashboard rendering
- loading state
- empty state
- error state
- filters
- responsive layout
- unauthorized access handling

Security

Verify that analytics cannot expose:

- tokens
- credentials
- private citizen information
- sensitive-case information
- internal database details

---

27. REGRESSION TESTING

Before declaring M12 complete, verify that M1–M11 functionality still works.

At minimum check:

- authentication
- authorization
- citizen reporting
- citizen dashboard
- community functionality
- sensitive-case handling
- administration
- security protections
- civic alerts
- existing Milestones page

Do not modify previous milestone functionality unless required to integrate M12 safely.

If a regression is discovered:

1. document it
2. fix it if it belongs to M12 integration
3. retest
4. report it

---

28. DOCUMENTATION

Update:

docs/MILESTONES.md

M12 should show:

M12 — Civic Intelligence & Insights
Status: IMPLEMENTED
Verification: PENDING
Human Approval: PENDING

Do NOT mark human approval as complete.

Also document:

- analytics endpoints
- supported filters
- privacy rules
- aggregation rules
- access control
- minimum public aggregation threshold
- data sources
- limitations
- testing performed

---

29. M12 VERIFICATION CHECKLIST

Create a verification checklist covering:

Data

- [ ] Overview statistics work
- [ ] Report statistics work
- [ ] Category statistics work
- [ ] Status statistics work
- [ ] Geographic statistics work
- [ ] Alert statistics work
- [ ] Time trends work

Filtering

- [ ] Date filtering
- [ ] Category filtering
- [ ] Status filtering
- [ ] Geographic filtering

Security

- [ ] Authorization enforced server-side
- [ ] SQL injection protections verified
- [ ] Sensitive cases protected
- [ ] Private citizen data protected
- [ ] No credentials exposed
- [ ] No tokens exposed

Privacy

- [ ] Public aggregation rules implemented
- [ ] Minimum aggregation threshold applied where required
- [ ] Private geographic information protected
- [ ] Sensitive records handled correctly

UX

- [ ] Responsive dashboard
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Accessible charts
- [ ] Existing CivicWatch branding preserved

Regression

- [ ] M1 functionality verified
- [ ] M2 functionality verified
- [ ] M3 functionality verified
- [ ] M4 functionality verified
- [ ] M5 functionality verified
- [ ] M6 functionality verified
- [ ] M7 functionality verified
- [ ] M8 functionality verified
- [ ] M9 functionality verified
- [ ] M10 functionality verified
- [ ] M11 functionality verified

---

30. HUMAN APPROVAL GATE

This is mandatory.

After completing and verifying M12:

STOP.

Do not:

- start M13
- implement notifications
- implement subscriptions
- unlock M13
- automatically continue
- assume approval

The system must display:

M12 — Civic Intelligence & Insights

Implementation: COMPLETE
Verification: COMPLETE
Human Approval: PENDING

Next milestone: M13 — Citizen Notifications & Subscriptions

Waiting for human approval.

The AI/development agent may report:

- what was implemented
- files changed
- APIs added
- database changes
- tests performed
- verification results
- known issues
- recommended next step

But it must not advance the roadmap.

Only an explicit human instruction such as:

APPROVE M12

or:

Proceed to M13

may unlock M13.

Statements such as:

Looks good
Okay
Continue
Done
What's next?

must NOT automatically unlock the next milestone.

---

31. FINAL M12 REPORT

When implementation is complete, provide a concise final report containing:

Implementation

What was added.

Database

Any migrations/schema changes.

Backend

New or modified endpoints.

Frontend

New dashboard/components/pages.

Privacy

How analytics protects citizen information.

Security

Security checks performed.

Testing

Tests executed and results.

Regression

M1–M11 verification results.

Known Issues

Any remaining problems.

Milestone State

M12 Implementation: COMPLETE
M12 Verification: COMPLETE/PENDING
M12 Human Approval: PENDING
M13: LOCKED

Then STOP.

DO NOT proceed to M13 without explicit human approval.