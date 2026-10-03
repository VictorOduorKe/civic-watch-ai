M11 — Civic Alerts & Advisories

Objective

Build a centralized Civic Alerts & Advisories system for CivicWatch AI Kenya.

The system should allow verified authorities and authorized CivicWatch administrators to publish important public information such as:

- Official county alerts
- Government advisories
- Public safety notices
- Utility/service interruptions
- Water interruptions
- Electricity interruptions
- Road closures
- Planned infrastructure maintenance
- Weather-related advisories
- Health/public-service advisories
- Community advisories
- Emergency information
- Other verified civic announcements

The feature must distinguish between information published by an official authority and information submitted by community members.

Do NOT present an unverified community submission as an official government alert.

---

1. INSPECT EXISTING IMPLEMENTATION FIRST

Before writing code:

Inspect the existing CivicWatch architecture and identify:

- Existing users
- Existing roles
- Existing authentication
- Existing admin system
- Existing civic reports
- Existing locations/counties
- Existing notifications
- Existing database structure
- Existing API structure
- Existing frontend components
- Existing security middleware
- Existing audit logging

Reuse existing components and utilities where appropriate.

Do NOT create duplicate authentication, user, notification, or location systems if they already exist.

---

2. ALERT TYPES

Create a controlled alert classification system.

At minimum support:

Official County Alert

Information published by an authorized county/government source.

Government Advisory

Official guidance, notices, warnings, or public information from an authorized authority.

Utility Downtime

Service interruptions affecting citizens.

Examples:

- Electricity
- Water
- Internet
- Waste collection
- Sewerage
- Other configured public/essential services

Community Advisory

Important information submitted or published through an authorized community workflow.

Community advisories must NOT automatically receive official status.

Public Safety

Important information concerning:

- Roads
- Traffic disruptions
- Infrastructure
- Public hazards
- Emergency situations

Weather / Environmental

Examples:

- Heavy rainfall
- Flooding
- Strong winds
- Drought
- Coastal conditions
- Other environmental warnings

Use the existing application architecture where possible.

---

3. ALERT DATA MODEL

Create an appropriate alert entity/table.

Use the project's existing database conventions.

A conceptual structure should support:

id
title
summary
description
alert_type
severity
status
source_type
source_name
source_reference
county
sub_county
ward
location
start_time
end_time
published_at
updated_at
created_by
verified_by
verification_status
is_public
created_at
updated_at

Do NOT blindly copy this schema.

Adapt it to the actual existing database architecture.

---

4. ALERT SEVERITY

Support clear severity levels.

For example:

INFO
LOW
MODERATE
HIGH
CRITICAL

Severity should be descriptive rather than sensational.

Use severity consistently across:

- Backend
- Database
- API
- Frontend
- Notifications

Do not allow ordinary community posts to arbitrarily declare themselves "critical."

---

5. VERIFICATION STATUS

Support explicit verification states.

Example:

PENDING
VERIFIED
REJECTED
EXPIRED

The exact names may be adapted to the existing architecture.

Important:

A verified official alert must have a traceable source.

Store:

- Source organization
- Source name
- Reference where applicable
- Verification timestamp
- Verifying user

Do not fabricate official sources.

---

6. OFFICIAL SOURCE MODEL

Allow alerts to identify their source.

Examples:

County Government
National Government Agency
Utility Provider
Emergency/Disaster Authority
Verified Civic Organization
Community Source

The actual organization name must be stored separately.

For example:

source_type: OFFICIAL
source_name: Example County Government

Do not use "official" merely because a user selected an official-looking category.

---

7. COUNTY AND LOCATION TARGETING

Alerts should support geographic targeting.

At minimum support:

National
County
Sub-county
Ward
Specific locality

Users should be able to see alerts relevant to their selected location.

Do not require precise GPS tracking.

Where possible, allow users to manually select:

- County
- Sub-county
- Ward

Respect user privacy.

---

8. ALERT FEED

Create a citizen-facing alerts page.

The interface should allow users to:

- View active alerts
- View recent alerts
- Filter alerts
- Open alert details
- See alert severity
- See alert type
- See affected location
- See source
- See publication time
- See expiration time
- See verification status where appropriate

Example:

Civic Alerts

[All] [Official] [Utilities] [Safety] [Weather] [Community]

HIGH
Water Service Interruption

Affected area:
[Location]

Source:
[Verified organization]

Published:
[Date/time]

Expected restoration:
[Date/time]

[View Details]

Do not use excessive visual effects.

Maintain CivicWatch's established branding.

---

9. ALERT DETAIL PAGE

Create a dedicated alert detail view.

Display:

- Title
- Alert type
- Severity
- Full description
- Affected area
- Source
- Verification state
- Published date/time
- Updated date/time
- Expiry date/time
- Recommended action where provided
- Related links/references where available

If the alert has expired, clearly indicate that it is no longer active.

Do not silently modify historical alert content.

---

10. OFFICIAL ALERT BADGE

Create a clear distinction between verified official information and community information.

Example labels:

✓ Verified Official

and:

Community Advisory

The exact UI can follow the existing design system.

Do not use government logos or seals unless the platform has permission to use them.

---

11. ADMIN ALERT MANAGEMENT

Authorized administrators should be able to:

- Create alert
- Save draft
- Submit for verification
- Verify
- Reject
- Publish
- Edit
- Schedule
- Expire
- Archive

Do not allow ordinary users to publish official alerts.

---

12. ALERT CREATION FORM

Create an administration form containing:

Basic information

- Title
- Summary
- Description
- Alert type
- Severity

Source

- Source type
- Organization
- Reference/link
- Verification information

Location

- County
- Sub-county
- Ward
- Affected area

Timing

- Start time
- Expiration time

Publication

- Draft
- Publish immediately
- Schedule publication

Validate everything server-side.

---

13. UTILITY DOWNTIME BROADCASTS

Create a dedicated workflow for service interruptions.

Support:

Service
Provider
Affected area
Reason
Status
Start time
Expected restoration
Actual restoration
Additional information

Statuses may include:

PLANNED
ONGOING
RESTORED
CANCELLED

Examples:

Water interruption
Electricity interruption
Waste collection disruption
Road/infrastructure service disruption

Do not claim a service outage is confirmed unless the source is verified.

---

14. COMMUNITY ADVISORIES

Allow appropriate community information to be surfaced without confusing it with official information.

A community advisory should contain:

- Title
- Description
- Location
- Category
- Submitted by
- Submission time
- Verification state

Community content should pass through moderation/verification before becoming widely promoted.

Do not automatically classify community reports as official alerts.

---

15. ALERT EXPIRATION

Implement automatic expiration where appropriate.

For example:

Published
    ↓
Active
    ↓
Expiration time reached
    ↓
Expired

Expired alerts should:

- Stop appearing as active alerts.
- Remain available in historical records where appropriate.
- Display their expired state.

Do not delete historical alerts simply because they expired.

---

16. ALERT PRIORITIZATION

The feed should prioritize alerts based on useful factual properties such as:

1. Active status
2. Relevance to user's selected location
3. Severity
4. Publication time

Do NOT create a political ranking system.

Do not prioritize alerts based on political affiliation, party, candidate, or political viewpoint.

---

17. NOTIFICATIONS

If the existing CivicWatch notification infrastructure supports it, integrate alerts into notifications.

Support notification categories such as:

- Critical alerts
- Official alerts
- Utility interruptions
- Weather/environmental alerts
- Community advisories

Users should be able to control non-essential notification preferences.

Critical public-safety behavior should follow the actual capabilities of the platform.

Do not claim emergency SMS delivery unless an actual SMS provider is configured.

---

18. ALERT SUBSCRIPTIONS

Allow users to subscribe to relevant categories/locations where appropriate.

Examples:

My County
My Sub-county
Utilities
Weather
Public Safety
Community

Do not require continuous precise location tracking.

Allow users to change their preferences.

---

19. SOURCE REFERENCES

Where an alert originates from an external official source, provide a source/reference field.

Examples could include:

- Official county notice
- Government bulletin
- Utility provider notice
- Meteorological advisory

The system must not invent or alter source information.

The platform should make it clear when CivicWatch is reproducing or summarizing information from another source.

---

20. ADMIN DASHBOARD

Add an Alerts management section.

Display:

Alerts
-----------------------------
Draft       5
Pending     3
Active      8
Scheduled   2
Expired     21
Rejected    4

Use actual database counts.

Allow filtering by:

- Status
- Type
- Severity
- County
- Source
- Date

---

21. ALERT SEARCH

Allow authorized users and citizens to search alerts where appropriate.

Support:

- Keyword
- Category
- Location
- Date
- Severity
- Status

Prevent search from exposing private moderation information.

---

22. API

Create or extend API routes following the existing API architecture.

Conceptually:

GET    /api/alerts
GET    /api/alerts/:id

POST   /api/admin/alerts
PUT    /api/admin/alerts/:id
DELETE /api/admin/alerts/:id

POST   /api/admin/alerts/:id/verify
POST   /api/admin/alerts/:id/publish
POST   /api/admin/alerts/:id/archive

These are examples only.

Use the actual project's route conventions.

Protect administrative routes server-side.

---

23. SECURITY

Apply existing CivicWatch security controls.

Verify:

- Authentication
- Authorization
- Input validation
- Rate limiting
- CSRF protection where applicable
- SQL injection protection
- XSS protection
- Audit logging

Do not trust:

- "created_by"
- "source_type"
- "verification_status"
- "severity"
- "role"
- "organization"

from frontend requests.

These must be controlled by backend authorization logic.

---

24. AUDIT TRAIL

Record important alert lifecycle actions.

Examples:

Alert created
Alert edited
Alert submitted for verification
Alert verified
Alert rejected
Alert published
Alert scheduled
Alert expired
Alert archived

Record:

- User
- Action
- Timestamp
- Alert ID

Do not log sensitive content unnecessarily.

---

25. FALSE / MISLEADING ALERT PROTECTION

Build safeguards against unauthorized publishing.

At minimum:

- Official alerts require authorized publishing.
- Verification state is server-controlled.
- Community submissions cannot impersonate official sources.
- Editing a verified alert should be restricted.
- Significant changes to verified alerts should require re-verification where appropriate.

Do not create a system that allows any registered user to create a "government alert."

---

26. ALERT EDITING

When an official alert has already been published:

If significant information changes, preserve an audit record.

Do not silently alter important historical information.

Where practical, maintain:

Original publication
Updated publication
Updated by
Updated at
Change summary

---

27. FRONTEND DESIGN

Keep the established CivicWatch visual language.

Use:

- Existing logo
- Existing brand colors
- Existing typography
- Existing components

Avoid:

- Gradients
- Excessive animations
- Generic dashboard templates
- Excessive card decoration
- Unnecessary color combinations

Severity colors should remain accessible and should not be the only way information is communicated.

---

28. MOBILE EXPERIENCE

The alert system must work well on phones.

Ensure:

- Alerts are readable.
- Filters are usable.
- Detail pages are responsive.
- Important information appears first.
- Buttons are touch-friendly.
- Long descriptions wrap correctly.

---

29. ACCESSIBILITY

Ensure:

- Alert severity has text labels.
- Icons have accessible labels.
- Color is not the only severity indicator.
- Keyboard navigation works.
- Forms have labels.
- Errors are understandable.
- Focus states remain visible.

---

30. TESTING

Test:

Citizen

- View alerts
- Filter alerts
- Search alerts
- Open alert
- View source
- View location
- View expired alert

Administrator

- Create draft
- Edit draft
- Submit for verification
- Verify
- Reject
- Publish
- Schedule
- Expire
- Archive

Security

- Normal user attempting admin action
- Unauthenticated API request
- Modified alert ID
- Modified verification state
- Modified source
- Modified severity
- Unauthorized edit

---

31. EDGE CASES

Test:

- Alert with no expiration
- Alert that has already expired
- Scheduled alert
- Cancelled alert
- Duplicate alert
- Invalid location
- Missing source
- Invalid severity
- Very long title
- Very long description
- Malicious HTML
- Invalid timestamps
- End time before start time

Handle these safely.

---

32. DATABASE MIGRATION

If schema changes are required:

- Create proper migrations.
- Preserve existing data.
- Do not drop existing tables unnecessarily.
- Do not reset production data.
- Add indexes where justified.

Verify migrations on a development database before considering production use.

---

33. DOCUMENTATION

Update the project documentation to explain:

- Alert types
- Verification workflow
- Official vs community information
- Administrative permissions
- Alert lifecycle
- Location targeting
- Utility downtime workflow
- Notification behavior

Do not claim that CivicWatch itself is an official government communication channel unless that relationship actually exists.

---

34. SUCCESS CRITERIA

M11 is complete when:

- Citizens can view civic alerts.
- Alerts can be categorized.
- Alerts can be geographically targeted.
- Official sources are distinguishable from community sources.
- Official alerts require appropriate authorization.
- Alerts can be verified.
- Alerts can be published.
- Alerts can expire.
- Utility downtime broadcasts are supported.
- Community advisories are supported.
- Alert history is preserved appropriately.
- Administrative actions are audited.
- Unauthorized users cannot publish official alerts.
- Notifications integrate correctly where supported.
- Mobile UI works.
- Accessibility requirements are addressed.
- Existing M1–M10 functionality remains intact.
- Tests pass.

---

35. IMPORTANT IMPLEMENTATION RULE

Do NOT fabricate real alerts during development and present them as real government information.

Use clearly marked development/test data such as:

DEMO ALERT — NOT AN OFFICIAL NOTICE

until a real verified source is configured.

The production system must distinguish clearly between:

Official verified information

and:

Community information

This distinction is fundamental to CivicWatch.