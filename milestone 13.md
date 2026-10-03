# M13 — CITIZEN NOTIFICATIONS & SUBSCRIPTIONS

## OBJECTIVE

Implement Milestone 13 of CivicWatch AI Kenya.

M13 introduces a notification and subscription system that allows citizens to receive relevant CivicWatch alerts and advisories based on their selected preferences.

The system must integrate with the existing M11 Civic Alerts & Advisories system and existing authentication/user system.

IMPORTANT:

* Do NOT start M14.
* Do NOT implement verification/trust features belonging to M14.
* Do NOT automatically advance the roadmap.
* M13 must be implemented, tested, verified, and reported.
* After M13 verification, STOP.
* Only explicit human approval can unlock M14.

---

# 1. INSPECT THE EXISTING PROJECT FIRST

Before making changes:

1. Inspect the complete repository.
2. Read:

   * `docs/MILESTONES.md`
   * M11 implementation
   * M12 implementation
   * user/authentication models
   * roles and permissions
   * alert models
   * alert APIs
   * alert frontend
   * notification-related code
   * database migrations
   * email configuration, if already implemented
   * audit logging
   * security middleware
3. Identify existing notification functionality.
4. Reuse existing architecture.
5. Do not create duplicate user, alert, authentication, or messaging systems.

If an expected component does not exist, document the gap and implement only what M13 requires.

---

# 2. M13 SCOPE

Implement:

* citizen notification preferences
* alert subscriptions
* geographic subscriptions
* category subscriptions
* severity preferences
* notification history
* in-app notifications
* notification read/unread state
* unsubscribe functionality
* notification delivery rules
* notification deduplication
* notification authorization
* administrative visibility where appropriate
* optional email notification integration if an existing email system is available

The system must be privacy-conscious and secure.

---

# 3. NOTIFICATION TYPES

Use the actual alert categories from M11.

The system should support notification types such as:

* official county alerts
* government advisories
* utility downtime broadcasts
* community advisories
* public safety notices

Do not hard-code categories if M11 already stores them dynamically.

Notifications should reference the original alert instead of duplicating the entire alert record.

---

# 4. SUBSCRIPTION PREFERENCES

Authenticated citizens should be able to configure what they receive.

Possible preferences:

```text
Alert category
Geographic area
Severity
Delivery channel
Notification frequency
```

Use only options supported by the existing alert system.

Example:

```text
Categories
[ ] Public Safety
[ ] Utility
[ ] Government
[ ] Community
```

Example:

```text
Areas
[ ] County
[ ] Sub-county
[ ] Ward
```

The interface must clearly explain what each subscription controls.

---

# 5. GEOGRAPHIC SUBSCRIPTIONS

Allow users to subscribe to relevant geographic areas.

Where supported by M11, allow selection of:

* county
* sub-county
* ward
* other supported geographic area

A user may have multiple subscriptions.

Example:

```text
My Areas

Mombasa County
Likoni
Nyali
```

Do not expose a user's subscription list publicly.

Do not expose exact private user locations.

---

# 6. CATEGORY SUBSCRIPTIONS

Allow citizens to subscribe to specific alert categories.

Example:

```text
Alert Categories

Public Safety
Utilities
Government Advisories
Community
County Alerts
```

Use the actual categories configured in the application.

Users should be able to:

* subscribe
* unsubscribe
* view active subscriptions

Avoid duplicate subscriptions.

---

# 7. SEVERITY PREFERENCES

Integrate with the M11 alert severity system.

If M11 contains severity levels such as:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

allow users to choose which levels should generate notifications.

Do not invent severity values if M11 uses different values.

Example:

```text
Notify me for:

[✓] Critical
[✓] High
[ ] Medium
[ ] Low
```

The backend must enforce the preference.

Do not rely on the frontend to filter notifications.

---

# 8. NOTIFICATION CHANNELS

Implement in-app notifications as the primary channel.

If the project already has a properly configured email service, support email notifications where appropriate.

Do NOT introduce an external paid messaging provider unless the project already uses one or the human explicitly requests it.

Possible channels:

```text
IN_APP
EMAIL
```

Only enable channels that are actually configured.

Do not pretend an email was delivered when no email provider is configured.

---

# 9. NOTIFICATION PREFERENCES MODEL

Create or extend the database structure to support notification preferences.

Possible conceptual structure:

```text
notification_preferences
------------------------
id
user_id
in_app_enabled
email_enabled
created_at
updated_at
```

Adapt naming and structure to the existing database conventions.

Do not duplicate user records.

---

# 10. SUBSCRIPTIONS MODEL

Create a subscription structure appropriate to the existing database.

Possible conceptual structure:

```text
alert_subscriptions
-------------------
id
user_id
alert_category
geographic_area
severity
created_at
updated_at
```

If the existing database supports normalized category/location tables, use relationships instead.

Avoid storing the same information in multiple inconsistent formats.

---

# 11. NOTIFICATION MODEL

Create a notification record for delivered/in-app notifications.

Possible structure:

```text
notifications
-------------
id
user_id
alert_id
type
title
message
read_at
created_at
```

Adapt this to the actual architecture.

Important:

* link notifications to their source alert
* avoid duplicating sensitive alert information
* support unread/read state
* support notification history

---

# 12. NOTIFICATION DEDUPLICATION

A citizen must not receive the same alert repeatedly because of duplicate subscription rules.

Example:

A user subscribes to:

```text
Mombasa County
Public Safety
```

and an alert matches both subscriptions.

The user should receive one notification, not two.

Implement server-side deduplication.

A suitable uniqueness strategy should be considered around:

```text
user_id + alert_id + notification_type
```

Adapt to the actual schema.

---

# 13. NOTIFICATION MATCHING ENGINE

When an M11 alert is published:

1. Determine whether the alert is active/publishable.
2. Determine its category.
3. Determine its severity.
4. Determine its geographic target.
5. Find users whose subscriptions match.
6. Check user notification preferences.
7. Create appropriate notification records.
8. Prevent duplicates.
9. Deliver through configured channels.
10. Record delivery status where supported.

Do not notify users about unpublished or unauthorized alerts.

---

# 14. ALERT LIFECYCLE INTEGRATION

Integrate carefully with M11.

Notifications should respect:

```text
Draft
↓
Published
↓
Active
↓
Expired
↓
Archived
```

Only the appropriate alert lifecycle state should trigger citizen notifications.

Do not notify citizens simply because an administrator saved a draft.

If an existing M11 publication workflow already has an event/hook/service, reuse it.

---

# 15. NOTIFICATION HISTORY

Create a citizen-facing notification history.

Example:

```text
Notifications

Unread
----------------
New public safety advisory

Earlier
----------------
Water service advisory
County government notice
```

Each notification should show appropriate information.

Allow users to:

* open notification
* mark as read
* mark all as read where appropriate
* navigate to the source alert

Do not expose alerts the user is not authorized to access.

---

# 16. READ/UNREAD STATE

Support:

* unread count
* read notification
* mark all as read

Unread counts should come from the backend.

Do not store authoritative unread state only in browser local storage.

The server must remain the source of truth.

---

# 17. CITIZEN NOTIFICATION UI

Add a notification area to the existing CivicWatch interface.

Possible structure:

```text
🔔 Notifications

Unread: 3

------------------------------------------------
Public Safety Advisory
Mombasa County
2 hours ago

[View Alert]
------------------------------------------------
```

Follow existing CivicWatch branding.

Design requirements:

* no gradients
* solid professional colors
* existing logo/branding
* accessible contrast
* responsive
* mobile-friendly
* clear unread state

Do not redesign unrelated pages.

---

# 18. NOTIFICATION SETTINGS PAGE

Create a citizen notification settings page.

Possible structure:

```text
Notification Settings

Delivery
[✓] In-app notifications
[ ] Email notifications

Alert Categories
[✓] Public Safety
[✓] Government
[ ] Utilities

Severity
[✓] Critical
[✓] High
[ ] Medium
[ ] Low

My Areas
[✓] Mombasa County
[✓] Selected Sub-county

[Save Preferences]
```

Adapt this to the existing UI.

---

# 19. SUBSCRIPTION MANAGEMENT

Citizens should be able to:

* create subscription
* view subscriptions
* edit subscription
* delete subscription
* temporarily disable subscription if supported
* unsubscribe from a category
* unsubscribe from a geographic area

All changes must be authenticated.

Users must only be able to modify their own subscriptions.

---

# 20. UNSUBSCRIBE

Provide a clear unsubscribe mechanism.

For in-app subscriptions:

```text
Unsubscribe
```

For email notifications, if email delivery exists:

* provide an unsubscribe option
* authenticate or securely identify the user
* prevent unauthorized preference changes

Do not expose subscription-management endpoints without proper authorization.

---

# 21. BACKEND API

Follow the existing API architecture.

Possible endpoints:

```text
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all

GET    /api/notification-preferences
PUT    /api/notification-preferences

GET    /api/alert-subscriptions
POST   /api/alert-subscriptions
PUT    /api/alert-subscriptions/:id
DELETE /api/alert-subscriptions/:id
```

Do not create duplicates if equivalent routes already exist.

Every protected endpoint must use the existing authentication and authorization system.

---

# 22. SERVER-SIDE AUTHORIZATION

Verify:

* anonymous users cannot access private notification history
* users cannot access another user's notifications
* users cannot modify another user's preferences
* users cannot modify another user's subscriptions
* administrators cannot accidentally expose citizen notification data through public endpoints

Never trust:

```text
user_id
```

provided by the frontend when determining ownership.

Derive the authenticated user from the existing secure authentication mechanism.

---

# 23. TOKEN SECURITY

Follow the security improvements from M9.

Do NOT:

* store authentication tokens in localStorage if M9 removed that pattern
* expose tokens in notification data
* include credentials in API responses
* place secrets in frontend source code
* log authentication credentials

Use the project's current secure authentication mechanism.

---

# 24. RATE LIMITING

Review existing M10 rate limiting.

Apply appropriate limits to:

* subscription creation
* subscription updates
* notification preference changes
* notification retrieval
* mark-read operations

Do not make normal notification usage unnecessarily difficult.

---

# 25. EMAIL DELIVERY

If an existing email provider is configured:

* integrate with the existing provider
* use existing environment variables
* do not hard-code credentials
* handle delivery failure
* avoid blocking the main alert publication request unnecessarily if the architecture supports background jobs

If email infrastructure does not exist:

* implement the preference/data model
* keep email delivery disabled
* clearly document that email delivery is not configured

Do not fabricate successful delivery.

---

# 26. BACKGROUND PROCESSING

Inspect whether the project already has:

* BullMQ
* Redis
* workers
* queues
* cron jobs
* event processing

If available and appropriate, use the existing infrastructure for notification delivery.

Do not introduce a second queue system.

If notifications can be generated synchronously without performance problems, keep the implementation simple.

---

# 27. FAILED DELIVERY

Where external delivery exists, record appropriate delivery state.

Possible states:

```text
PENDING
SENT
FAILED
```

Use the project's existing conventions.

Do not repeatedly retry indefinitely.

If retry functionality is implemented, use controlled retries and log failures safely.

Never place sensitive credentials in failure logs.

---

# 28. NOTIFICATION PRIVACY

Notification content must not expose unnecessary personal information.

Do not include:

* another citizen's identity
* private report information
* private case details
* internal administrative notes
* authentication data
* sensitive case information

Notifications should contain only the information necessary to direct the citizen to the relevant public alert.

---

# 29. SENSITIVE ALERTS

M7 sensitive-case rules remain authoritative.

M13 must not turn a sensitive case into a citizen notification accidentally.

Before creating a notification, verify:

* alert visibility
* publication status
* sensitivity classification
* geographic visibility
* user authorization

If an alert is restricted, do not send it through the general citizen notification system.

---

# 30. NOTIFICATION RETENTION

Determine an appropriate retention strategy based on the existing database and privacy rules.

Avoid keeping unnecessary notification records indefinitely.

If a retention period is introduced:

* document it
* make it configurable where appropriate
* do not delete audit information that must legally or operationally remain

Do not delete user data merely because a notification was marked read.

---

# 31. FRONTEND SECURITY

Review the notification UI for:

* XSS
* unsafe HTML rendering
* untrusted alert titles/descriptions
* URL manipulation
* unauthorized notification access

Treat notification content as untrusted data.

Do not render administrator-provided HTML directly unless the application already has a safe sanitization mechanism.

---

# 32. ACCESSIBILITY

Ensure:

* notification icon has an accessible label
* unread status is not represented by color alone
* keyboard navigation works
* buttons have clear labels
* notification state is understandable to screen readers
* sufficient contrast exists

---

# 33. TESTING

Create/update tests for:

### Subscription

* create subscription
* update subscription
* delete subscription
* duplicate subscription prevention
* ownership enforcement

### Notifications

* notification creation
* alert matching
* category matching
* geographic matching
* severity matching
* notification deduplication
* read state
* unread count
* mark all as read

### Security

* unauthorized notification access
* cross-user access attempt
* unauthorized subscription modification
* XSS payloads
* SQL injection attempts
* rate limiting
* sensitive alert protection

### Delivery

If email is configured:

* successful delivery
* failed delivery
* invalid email handling
* unsubscribe handling

If email is not configured:

* verify no false delivery status is reported

---

# 34. REGRESSION TESTING

Verify M1–M12 still work.

At minimum test:

* authentication
* authorization
* civic reporting
* citizen dashboard
* community features
* sensitive-case handling
* administration
* security controls
* civic alerts
* civic insights
* milestones page

Fix M13 integration regressions where necessary.

Do not rewrite previous milestones unnecessarily.

---

# 35. DOCUMENTATION

Update:

```text
docs/MILESTONES.md
```

M13 should eventually show:

```text
M13 — Citizen Notifications & Subscriptions

Implementation: COMPLETE
Verification: COMPLETE
Human Approval: PENDING
```

Also document:

* notification architecture
* subscription model
* supported channels
* matching rules
* deduplication
* privacy protections
* retention
* delivery failure handling
* API endpoints
* tests

---

# 36. M13 VERIFICATION CHECKLIST

## Notifications

* [ ] In-app notifications implemented
* [ ] Notification history implemented
* [ ] Read/unread state implemented
* [ ] Unread count implemented
* [ ] Mark-as-read implemented
* [ ] Mark-all-as-read implemented

## Subscriptions

* [ ] Category subscriptions
* [ ] Geographic subscriptions
* [ ] Severity preferences
* [ ] Create subscription
* [ ] Edit subscription
* [ ] Delete subscription
* [ ] Duplicate prevention
* [ ] Unsubscribe

## Alert Integration

* [ ] M11 alerts integrated
* [ ] Published alerts trigger notifications correctly
* [ ] Draft alerts do not trigger notifications
* [ ] Expired/archived behavior is correct
* [ ] Restricted alerts are protected
* [ ] Notification deduplication works

## Security

* [ ] Authentication enforced
* [ ] Authorization enforced server-side
* [ ] Cross-user access blocked
* [ ] No sensitive tokens exposed
* [ ] XSS protection verified
* [ ] SQL injection protection verified
* [ ] Rate limiting verified

## Privacy

* [ ] Private notification history protected
* [ ] Sensitive cases excluded where required
* [ ] Notification content minimized
* [ ] User subscriptions remain private

## UX

* [ ] Notification UI implemented
* [ ] Notification settings implemented
* [ ] Responsive design
* [ ] Accessible controls
* [ ] Loading states
* [ ] Empty states
* [ ] Error states
* [ ] Existing CivicWatch branding preserved
* [ ] No gradients

## Regression

* [ ] M1 verified
* [ ] M2 verified
* [ ] M3 verified
* [ ] M4 verified
* [ ] M5 verified
* [ ] M6 verified
* [ ] M7 verified
* [ ] M8 verified
* [ ] M9 verified
* [ ] M10 verified
* [ ] M11 verified
* [ ] M12 verified

---

# 37. HUMAN APPROVAL GATE

This rule is mandatory.

When M13 implementation and verification are complete:

STOP.

Do NOT:

* start M14
* implement the Verification & Trust Layer
* unlock M14
* automatically continue
* assume human approval

The final state must be:

```text
M13 — Citizen Notifications & Subscriptions

Implementation: COMPLETE
Verification: COMPLETE
Human Approval: PENDING

Next milestone:
M14 — Verification & Trust Layer

Status:
LOCKED

Waiting for explicit human approval.
```

Only an explicit command such as:

```text
APPROVE M13
```

or:

```text
Proceed to M14
```

may unlock M14.

These phrases must NOT unlock the next milestone automatically:

```text
Looks good
Okay
Continue
Done
What's next?
```

The AI/development agent may report the implementation and verification results, but the human remains the only authority that can advance the roadmap.

---

# 38. FINAL M13 REPORT

After implementation, provide:

## Summary

What was implemented.

## Database

Tables/migrations changed.

## Backend

Endpoints/services added.

## Frontend

Pages/components added.

## Notifications

How alert-to-notification matching works.

## Subscriptions

How category/location/severity subscriptions work.

## Security

Security checks performed.

## Privacy

How citizen and sensitive information is protected.

## Testing

Tests executed and results.

## Regression

M1–M12 verification results.

## Known Issues

Any remaining issues.

## Milestone State

```text
M13 Implementation: COMPLETE
M13 Verification: COMPLETE/PENDING
M13 Human Approval: PENDING
M14: LOCKED
```

Then STOP.

DO NOT proceed to M14 without explicit human approval.
