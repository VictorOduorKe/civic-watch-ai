# M14 — USER & ROLE MANAGEMENT

## OBJECTIVE

Implement Milestone 14 of CivicWatch AI Kenya.

This milestone introduces complete administrative user lifecycle and role management.

M14 must provide administrators with secure controls for:

* role-based access management
* staff onboarding
* county liaison provisioning
* role promotion and demotion
* account suspension and reactivation
* identity verification
* administrative user management
* user lifecycle history
* role-change history
* suspension/activation history
* security-sensitive audit history

The existing authentication and authorization architecture from M4, M9, and M10 must remain the foundation.

IMPORTANT:

* Do NOT start M15.
* Do NOT implement Verification & Trust Layer features from the previously reconstructed roadmap.
* Do NOT implement the AI Civic Assistant.
* Do NOT automatically advance the roadmap.
* Do NOT redesign existing authentication unnecessarily.
* M14 must be implemented, tested, and verified.
* After verification, STOP.
* Only explicit human approval can unlock M15.

---

# 1. AUTHORITATIVE M14 DEFINITION

The authoritative roadmap definition for M14 is:

## Milestone 14 — User & Role Management

Administrative user lifecycle management, role promotion, county liaison onboarding, and account suspension controls belong to M14.

### Scheduled Capabilities

* Role-based access management:

  * Citizen
  * Moderator
  * Analyst
  * Admin
* Staff onboarding and county liaison provisioning
* Account suspension and activation controls
* Identity verification and audit history

Treat this definition as the source of truth for M14.

Do not replace it with an alternative M14 definition.

---

# 2. READ THE EXISTING PROJECT FIRST

Before modifying anything:

1. Inspect the complete repository.
2. Read:

   * `docs/MILESTONES.md`
   * M1–M13 documentation
   * authentication implementation
   * authorization middleware
   * user model
   * role definitions
   * admin dashboard
   * audit logging
   * database schema/migrations
   * API routes
   * frontend routes
   * session/token handling
   * password handling
   * security middleware
   * notification system
   * sensitive-case permissions
   * report permissions
   * alert permissions
   * analytics permissions
3. Identify how users and roles are currently stored.
4. Identify whether staff/county liaison accounts already exist.
5. Identify whether identity verification already exists.
6. Identify whether account suspension already exists.
7. Reuse existing systems wherever possible.

Do not create duplicate authentication, users, roles, or audit systems.

---

# 3. M14 IMPLEMENTATION PRINCIPLES

Follow these principles:

### Security first

User and role management is security-sensitive.

Every administrative action must be authorized server-side.

### Least privilege

Users should receive only the permissions required for their role.

### No privilege escalation

A user must not be able to change their own role or permissions through ordinary profile APIs.

### Auditability

Important administrative actions must be recorded.

### Separation of concerns

Keep:

* authentication
* authorization
* identity verification
* user lifecycle
* role management
* audit history

logically separate.

### Human-controlled administration

The AI/development agent must never automatically promote users or grant administrative privileges.

---

# 4. ROLE MODEL

Implement the following four roles:

```text
CITIZEN
MODERATOR
ANALYST
ADMIN
```

Use the project's existing naming convention if equivalent roles already exist.

Do not create duplicate roles.

---

# 5. ROLE DEFINITIONS

Establish clear responsibilities.

## CITIZEN

Normal CivicWatch user.

May have access to:

* own profile
* own reports
* own notifications
* own subscriptions
* public civic information
* public alerts
* permitted CivicWatch services

Must not have access to:

* administrative user management
* role management
* staff onboarding
* county liaison management
* other users' private records
* administrative analytics unless explicitly authorized

---

## MODERATOR

Responsible for appropriate moderation workflows.

Potential permissions:

* review permitted community content
* moderate permitted submissions
* review reports according to existing M6/M7 permissions
* access moderation tools

Must not automatically receive:

* user role-management privileges
* administrator privileges
* unrestricted sensitive-case access

---

## ANALYST

Responsible for permitted civic analytics.

Potential permissions:

* access M12 analytics
* analyze aggregated civic information
* access approved administrative insights

Must not automatically receive:

* role-management privileges
* user suspension privileges
* unrestricted citizen data
* administrator privileges

Analytics access must continue to respect M12 privacy protections.

---

## ADMIN

Administrative role.

May manage:

* users
* roles
* staff onboarding
* county liaison accounts
* account suspension
* account activation
* identity verification
* administrative audit history

Administrative permissions must still be explicitly enforced.

---

# 6. PERMISSION MODEL

Do not rely exclusively on checking:

```text
role === "ADMIN"
```

if the project already supports granular permissions.

Create or reuse a permission model.

Potential permissions:

```text
USER_VIEW
USER_VIEW_DETAILS
USER_UPDATE
USER_SUSPEND
USER_ACTIVATE

ROLE_VIEW
ROLE_ASSIGN
ROLE_CHANGE

STAFF_ONBOARD
COUNTY_LIAISON_CREATE
COUNTY_LIAISON_MANAGE

IDENTITY_VERIFY
IDENTITY_REVIEW

AUDIT_VIEW
```

Only implement permissions that fit the existing architecture.

If the project already has permissions, extend them rather than creating a second system.

---

# 7. ROLE-PERMISSION MATRIX

Create documentation and, where appropriate, enforce a matrix similar to:

| Capability                  | Citizen |   Moderator |     Analyst | Admin |
| --------------------------- | ------: | ----------: | ----------: | ----: |
| Own profile                 |       ✓ |           ✓ |           ✓ |     ✓ |
| Own reports                 |       ✓ |           ✓ |           ✓ |     ✓ |
| Public civic information    |       ✓ |           ✓ |           ✓ |     ✓ |
| Moderation                  |       — |           ✓ |           — |     ✓ |
| Analytics                   |       — |           — |           ✓ |     ✓ |
| View users                  |       — |           — |           — |     ✓ |
| Change roles                |       — |           — |           — |     ✓ |
| Suspend users               |       — |           — |           — |     ✓ |
| Activate users              |       — |           — |           — |     ✓ |
| Staff onboarding            |       — |           — |           — |     ✓ |
| County liaison provisioning |       — |           — |           — |     ✓ |
| Identity verification       |       — |           — |           — |     ✓ |
| Audit history               |       — | appropriate | appropriate |     ✓ |

Adapt this to actual application requirements.

Do not accidentally grant broader permissions merely because a role exists.

---

# 8. USER MANAGEMENT DASHBOARD

Create or extend an administrative user management page.

Example:

```text
User Management

Search users...

[All] [Citizens] [Moderators] [Analysts] [Admins]
[Active] [Suspended] [Pending Verification]

------------------------------------------------
Name
Email
Role
Status
Identity
Created
Actions
------------------------------------------------
```

Support:

* search
* filtering
* pagination
* role filtering
* status filtering
* identity verification filtering

Do not load the entire user database into the browser.

---

# 9. USER DETAILS

Create a secure administrator user-details view.

Show appropriate information such as:

* display name
* email
* role
* account status
* identity verification status
* county/liaison assignment where applicable
* created date
* last relevant activity
* role history
* account lifecycle history
* verification history

Do NOT expose:

* password hashes
* authentication tokens
* session secrets
* API keys
* sensitive credentials
* unnecessary private information

---

# 10. ROLE ASSIGNMENT

Administrators must be able to change user roles.

Example:

```text
Current role:
Citizen

Change role:
[Moderator ▼]

[Save]
```

Before applying the change:

1. authenticate administrator
2. authorize role-management permission
3. validate target user
4. validate requested role
5. apply role change
6. record previous role
7. record new role
8. record administrator
9. record timestamp
10. invalidate/re-evaluate affected sessions where required

---

# 11. ROLE PROMOTION

Support legitimate promotion:

```text
Citizen → Moderator
Citizen → Analyst
Moderator → Admin
Analyst → Admin
```

However, do not assume every transition should be freely available.

Define allowed transitions according to the project's administrative policy.

At minimum:

* only authorized administrators can promote users
* the target user cannot approve their own promotion
* role changes are audited

---

# 12. ROLE DEMOTION

Support role reduction where authorized.

Example:

```text
Moderator → Citizen
Analyst → Citizen
Admin → Moderator
```

Role demotion must:

* be authorized
* be audited
* immediately affect authorization where appropriate
* invalidate stale elevated permissions

Do not allow a demoted administrator to continue using privileged permissions because of an old session.

---

# 13. ADMIN SELF-PROTECTION

Implement safeguards against dangerous administrative actions.

At minimum:

* prevent an administrator from accidentally removing the last active admin
* prevent unauthorized self-promotion
* require appropriate confirmation for high-impact actions
* record administrative role changes

If the system has multiple administrators, consider requiring confirmation for particularly sensitive operations.

Do not create a mechanism that can accidentally leave the platform with zero active administrators.

---

# 14. ACCOUNT STATUS

Implement account lifecycle states appropriate to the existing system.

Possible states:

```text
ACTIVE
SUSPENDED
PENDING_VERIFICATION
```

Use only the statuses actually needed.

Do not create unnecessary account states.

---

# 15. ACCOUNT SUSPENSION

Administrators must be able to suspend accounts.

Example:

```text
Suspend Account

Reason:
[________________________]

[Cancel] [Suspend Account]
```

Suspension must:

* require authorization
* record the administrator
* record timestamp
* record reason where appropriate
* invalidate active sessions where appropriate
* prevent future authenticated access
* preserve the user's historical data according to existing retention rules

Do not delete the user account.

---

# 16. ACCOUNT REACTIVATION

Administrators must be able to reactivate suspended accounts.

Example:

```text
Account:
Suspended

[Reactivate Account]
```

Reactivation must:

* require authorization
* record administrator
* record timestamp
* record action
* preserve suspension history

Do not erase the previous suspension record.

---

# 17. SUSPENSION HISTORY

Maintain account lifecycle history.

Example:

```text
Account History

03 Oct 2026
Account suspended
By: Administrator
Reason: ...

04 Oct 2026
Account reactivated
By: Administrator
```

History must not be silently overwritten.

---

# 18. STAFF ONBOARDING

Implement administrative onboarding for staff accounts.

The workflow should allow an authorized administrator to create or provision a staff account.

Possible workflow:

```text
Create Staff Account
        ↓
Enter required details
        ↓
Select role
        ↓
Optional county assignment
        ↓
Identity verification requirement
        ↓
Create pending account
        ↓
Audit event
        ↓
Staff completes account setup
```

Do not create accounts with a known shared password.

---

# 19. STAFF INVITATION

Prefer an invitation/setup workflow where supported.

Example:

```text
Staff email
Role
County
Invitation
```

The invited staff member should complete account setup securely.

Do not expose:

* temporary passwords
* password hashes
* invitation secrets in frontend responses

Invitation tokens, if used, must:

* be random
* expire
* be single-use
* be stored securely
* not be logged in plaintext

---

# 20. COUNTY LIAISON PROVISIONING

Implement county liaison onboarding.

A county liaison should be associated with an appropriate geographic scope.

Possible structure:

```text
County Liaison
    ↓
County
    ↓
Optional sub-county scope
```

Use actual geographic entities already used by CivicWatch.

Do not hard-code counties if the database already contains geographic data.

---

# 21. COUNTY LIAISON ROLE

Do not create a completely separate authorization system for county liaisons.

Treat county liaison access as an administrative assignment/attribute associated with an appropriate role.

For example:

```text
Role:
MODERATOR

Assignment:
County Liaison

County:
Mombasa
```

or whatever model best fits the existing authorization architecture.

The important requirement is that geographic scope is enforced server-side.

---

# 22. COUNTY-SCOPED ACCESS

If a county liaison is authorized to view or manage county-scoped information:

1. authenticate user
2. verify role
3. verify liaison assignment
4. verify geographic scope
5. return only permitted records

Do not allow a county liaison assigned to one county to access another county's restricted administrative data.

Do not rely on frontend filters for this protection.

---

# 23. IDENTITY VERIFICATION

Implement an identity verification workflow appropriate to the project's requirements.

Possible statuses:

```text
UNVERIFIED
PENDING
VERIFIED
REJECTED
```

Use only statuses actually required.

Identity verification must be separate from authentication.

A user being able to log in does not automatically mean their identity is verified.

---

# 24. IDENTITY VERIFICATION RECORD

Maintain verification history.

Conceptual structure:

```text
identity_verification_records
-----------------------------
id
user_id
status
verified_by
verified_at
reason
created_at
```

Adapt this to the project's database.

Never store unnecessary identity documents or highly sensitive information merely because it may be useful later.

---

# 25. IDENTITY VERIFICATION UI

Administrator view:

```text
Identity Verification

User:
[User Name]

Status:
Pending

Verification information:
...

[Verify]
[Reject]
```

If documents are supported by the existing application, inspect the existing secure file-storage system before adding anything.

Do not introduce insecure local storage of identity documents.

---

# 26. IDENTITY VERIFICATION SECURITY

Identity-related data is highly sensitive.

Do NOT:

* expose identity documents publicly
* put identity documents in public URLs
* store them in browser localStorage
* log document contents
* expose identity information through normal public APIs
* send unnecessary identity data to third-party AI services
* include identity documents in analytics

Use strict access control.

---

# 27. AUDIT HISTORY

M14 must provide comprehensive administrative audit history.

Audit important events such as:

* role assignment
* role removal
* role promotion
* role demotion
* account suspension
* account reactivation
* staff onboarding
* county liaison provisioning
* county assignment changes
* identity verification
* identity rejection
* administrative user updates

Each audit event should record appropriate metadata:

```text
actor
action
target
previous state
new state
timestamp
reason where applicable
```

Do not store unnecessary secrets or sensitive content.

---

# 28. IMMUTABLE AUDIT HISTORY

Administrators should not be able to casually edit or delete audit records.

Use an append-only approach where practical.

If the project already has an audit-log system from earlier milestones:

* extend it
* do not create a second audit system

---

# 29. SESSION INVALIDATION

Review the authentication implementation from M4/M9.

When a user's security-sensitive state changes:

* role changes
* suspension
* deactivation

ensure stale sessions cannot continue to use privileges they no longer have.

Depending on the authentication architecture, this may require:

* session invalidation
* token revocation
* session versioning
* permission re-checking

Use the mechanism already implemented by CivicWatch.

Do not introduce conflicting authentication behavior.

---

# 30. PASSWORD SECURITY

M14 must not weaken existing password security.

Verify:

* passwords remain hashed
* password hashes are never returned through APIs
* staff onboarding does not create shared passwords
* password reset mechanisms remain secure
* administrator user management cannot reveal passwords

Do not change working password hashing without a documented reason.

---

# 31. USER SEARCH

Administrator user search should support appropriate fields.

Possible fields:

* name
* email
* role
* account status
* county
* verification status

Protect search endpoints against:

* SQL injection
* excessive data exposure
* unauthorized access
* enumeration risks where applicable

Use pagination.

---

# 32. USER ENUMERATION PROTECTION

Consider whether public authentication endpoints reveal whether an account exists.

Do not introduce new account-enumeration vulnerabilities.

For administrative interfaces, authenticated administrators may search users according to their permissions.

Do not expose the full user database through public endpoints.

---

# 33. ADMIN API

Follow existing API conventions.

Possible endpoints:

```text
GET    /api/admin/users
GET    /api/admin/users/:id

PATCH  /api/admin/users/:id/role
PATCH  /api/admin/users/:id/status

POST   /api/admin/staff/invitations
POST   /api/admin/county-liaisons

PATCH  /api/admin/users/:id/identity

GET    /api/admin/users/:id/history
GET    /api/admin/audit/user-management
```

These are conceptual examples.

Reuse existing routes where appropriate.

Do not create duplicate APIs.

---

# 34. BACKEND AUTHORIZATION

Every administrative endpoint must enforce authorization server-side.

Never trust:

```text
role
user_id
county_id
isAdmin
```

provided by the frontend.

Determine authorization from the authenticated server-side identity and database state.

Example:

```text
Request
  ↓
Authentication
  ↓
Identify current user
  ↓
Check permission
  ↓
Check geographic scope if applicable
  ↓
Perform action
  ↓
Audit action
```

---

# 35. TRANSACTION SAFETY

Security-sensitive operations should use database transactions where appropriate.

For example, a role change should ideally ensure:

```text
Role updated
+
Audit event created
```

are handled consistently.

Similarly:

```text
User suspended
+
Sessions invalidated/revocation state updated
+
Audit event created
```

should not leave the database in a misleading partial state.

Use the existing transaction/database architecture.

---

# 36. CONCURRENCY PROTECTION

Consider simultaneous administrative actions.

Example:

Administrator A:

```text
suspends user
```

Administrator B:

```text
changes same user's role
```

Use appropriate database constraints or transaction handling to avoid inconsistent state.

Do not over-engineer if the existing application does not require it.

---

# 37. FRONTEND ADMIN USER MANAGEMENT

Create a clean administrative interface.

Possible navigation:

```text
Administration
├── Dashboard
├── Users
├── Staff
├── County Liaisons
├── Identity Verification
└── Audit History
```

Reuse the existing admin layout.

Do not duplicate the administration shell.

---

# 38. USER ACTION CONFIRMATIONS

High-impact operations should require confirmation.

For example:

```text
Suspend this account?

User:
Example User

Reason:
...

[Cancel]
[Suspend Account]
```

And:

```text
Change role?

Current:
Citizen

New:
Moderator

[Cancel]
[Confirm]
```

Do not use confirmation dialogs as the only security mechanism.

Backend authorization remains mandatory.

---

# 39. ADMIN UI STATES

Handle:

### Loading

Clearly show that data is loading.

### Empty

Example:

```text
No users match the selected filters.
```

### Error

Example:

```text
Unable to load users.
Please try again.
```

Do not display:

* SQL errors
* stack traces
* internal server paths
* credentials

---

# 40. RESPONSIVE DESIGN

The administrative interface should work on:

* desktop
* tablet
* mobile where practical

Large user tables should support:

* horizontal scrolling
* responsive cards
* pagination

Do not sacrifice usability for unnecessary visual effects.

---

# 41. CIVICWATCH BRANDING

Follow the existing CivicWatch branding.

Requirements:

* use the current logo
* use established brand colors
* solid colors
* no gradients
* professional civic/public-service appearance
* consistent buttons
* consistent status indicators

Do not redesign the entire application.

---

# 42. ACCESSIBILITY

Ensure:

* keyboard navigation
* accessible form labels
* accessible tables
* clear focus states
* readable contrast
* status text not represented only by color
* confirmation dialogs accessible to keyboard/screen readers

Example:

Do not use only:

```text
green = active
red = suspended
```

Use:

```text
ACTIVE
SUSPENDED
```

with color as supporting information.

---

# 43. DATABASE CONSTRAINTS

Where appropriate, enforce:

* valid roles
* valid account statuses
* unique email addresses
* valid county references
* valid user references
* foreign keys
* appropriate indexes

Do not rely only on frontend validation.

---

# 44. PROTECT THE LAST ADMIN

Implement protection against accidentally removing the final active administrator.

Before:

* demoting an admin
* suspending an admin
* deactivating an admin

verify that the platform will still have an authorized active administrator.

If the action would leave zero active administrators:

```text
Reject action.
```

Return a safe, understandable error.

Example:

```text
This action cannot be completed because the system requires at least one active administrator.
```

---

# 45. AUDIT ADMIN ACTIONS

All M14 administrative actions must be auditable.

At minimum:

```text
USER_ROLE_CHANGED
USER_SUSPENDED
USER_REACTIVATED
STAFF_INVITED
STAFF_CREATED
COUNTY_LIAISON_CREATED
COUNTY_ASSIGNMENT_CHANGED
IDENTITY_VERIFIED
IDENTITY_REJECTED
```

Use the existing audit naming conventions if available.

---

# 46. PRIVACY

User management must protect personal information.

Do not expose user information to unauthorized users.

Admin interfaces should only display the minimum information needed.

Avoid displaying:

* passwords
* password hashes
* authentication tokens
* session tokens
* API keys
* private identity documents
* unnecessary personal data

Do not send the complete user record to the frontend when only a subset is needed.

---

# 47. SECURITY TESTING

Test:

### Authentication

* unauthenticated user cannot access admin endpoints

### Authorization

* citizen cannot manage users
* moderator cannot manage roles unless explicitly authorized
* analyst cannot manage users unless explicitly authorized
* admin can perform permitted operations

### Privilege escalation

Test attempts to:

* change own role
* change another user's role without permission
* submit `role=ADMIN`
* modify permission fields
* modify county assignment

### Account suspension

* suspended users cannot authenticate/use protected services
* sessions are invalidated appropriately
* suspension is audited

### Role changes

* privilege changes take effect correctly
* stale sessions cannot retain removed privileges

### Identity verification

* unauthorized users cannot verify identities
* sensitive identity information is protected

### Injection

* SQL injection
* XSS
* malicious input

### Audit

* administrative actions generate audit events
* audit records cannot be casually modified

---

# 48. TESTING

Create/update automated tests for:

## Users

* user listing
* search
* filtering
* pagination
* user details

## Roles

* role assignment
* promotion
* demotion
* invalid role rejection
* unauthorized role changes
* last-admin protection

## Staff

* staff invitation
* staff provisioning
* invalid invitation
* expired invitation
* duplicate invitation

## County Liaison

* creation
* county assignment
* scope enforcement
* assignment changes

## Account Lifecycle

* suspension
* reactivation
* history
* session invalidation

## Identity

* pending
* verified
* rejected
* history
* authorization

## Audit

* event creation
* actor recording
* target recording
* previous/new state recording
* timestamp

---

# 49. REGRESSION TESTING

Verify M1–M13 functionality after implementing M14.

At minimum check:

* authentication
* registration
* login
* logout
* role-based access
* civic reporting
* citizen dashboard
* community features
* sensitive-case handling
* administration
* security hardening
* civic alerts
* civic insights
* notifications
* subscriptions
* Milestones page

Pay particular attention to role changes because M14 modifies the authorization layer.

A role-management change must not accidentally:

* remove citizen access
* grant citizens admin access
* expose sensitive cases
* expose analytics
* bypass M9/M10 security controls
* break M11 alerts
* break M13 notifications

---

# 50. DOCUMENTATION

Update:

```text
docs/MILESTONES.md
```

M14 must be represented as:

```text
M14 — User & Role Management

Implementation: COMPLETE
Verification: COMPLETE/PENDING
Human Approval: PENDING
M15: LOCKED
```

Also create/update documentation covering:

* role definitions
* permission model
* staff onboarding
* county liaison model
* account lifecycle
* identity verification
* audit events
* session invalidation
* last-admin protection
* security controls
* API endpoints
* testing

---

# 51. M14 VERIFICATION CHECKLIST

## Roles

* [ ] Citizen role implemented
* [ ] Moderator role implemented
* [ ] Analyst role implemented
* [ ] Admin role implemented
* [ ] Permissions documented
* [ ] Permissions enforced server-side
* [ ] No privilege escalation

## User Management

* [ ] User listing
* [ ] User search
* [ ] User filtering
* [ ] User details
* [ ] Pagination
* [ ] Secure user data exposure

## Role Management

* [ ] Role promotion
* [ ] Role demotion
* [ ] Role assignment
* [ ] Role validation
* [ ] Role history
* [ ] Last-admin protection
* [ ] Role changes audited

## Staff

* [ ] Staff onboarding
* [ ] Secure invitation
* [ ] Invitation expiration
* [ ] Invitation single-use protection
* [ ] No shared passwords
* [ ] Staff lifecycle audit

## County Liaison

* [ ] County liaison provisioning
* [ ] County assignment
* [ ] County-scoped authorization
* [ ] County assignment changes audited
* [ ] Cross-county access prevented

## Account Lifecycle

* [ ] Account suspension
* [ ] Suspension reason
* [ ] Suspension history
* [ ] Account reactivation
* [ ] Reactivation history
* [ ] Session invalidation
* [ ] Suspended users blocked from protected access

## Identity

* [ ] Identity verification workflow
* [ ] Verification status
* [ ] Verification history
* [ ] Authorized verification only
* [ ] Identity data protected
* [ ] Identity documents protected if supported

## Audit

* [ ] Role changes audited
* [ ] User suspension audited
* [ ] User activation audited
* [ ] Staff onboarding audited
* [ ] County liaison actions audited
* [ ] Identity verification audited
* [ ] Audit history protected

## Security

* [ ] Authentication enforced
* [ ] Authorization enforced
* [ ] SQL injection protection
* [ ] XSS protection
* [ ] CSRF protection
* [ ] Rate limiting where appropriate
* [ ] No tokens exposed
* [ ] No password hashes exposed
* [ ] No secrets exposed
* [ ] Privilege escalation tested
* [ ] Last-admin protection tested

## UX

* [ ] Admin user management UI
* [ ] Staff management UI
* [ ] County liaison UI
* [ ] Identity verification UI
* [ ] Audit history UI
* [ ] Confirmation dialogs
* [ ] Loading states
* [ ] Empty states
* [ ] Error states
* [ ] Responsive design
* [ ] Accessibility
* [ ] CivicWatch branding preserved
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
* [ ] M13 verified

---

# 52. M14 COMPLETION REQUIREMENTS

M14 is NOT complete merely because the UI exists.

It is complete only when:

1. User management works.
2. Role management works.
3. Permissions are enforced server-side.
4. Staff onboarding works.
5. County liaison provisioning works.
6. County-scoped authorization works where applicable.
7. Account suspension works.
8. Account activation works.
9. Identity verification works.
10. Audit history works.
11. Last-admin protection works.
12. Session/authorization changes behave correctly.
13. Security tests pass.
14. Regression tests pass.
15. Documentation is updated.

---

# 53. HUMAN APPROVAL GATE

This rule is mandatory.

After M14 implementation and verification:

STOP.

Do NOT:

* start M15
* implement Verification & Trust Layer
* implement the AI Civic Assistant
* unlock M15
* automatically continue
* assume approval

The final roadmap state must be:

```text
M14 — User & Role Management

Implementation: COMPLETE
Verification: COMPLETE
Human Approval: PENDING

M15 — LOCKED

Waiting for explicit human approval.
```

Only an explicit human command such as:

```text
APPROVE M14
```

or:

```text
Proceed to M15
```

may unlock M15.

The following do NOT count as approval:

```text
Looks good
Okay
Continue
Done
What's next?
```

The development agent must stop after completing M14.

---

# 54. FINAL M14 REPORT

When implementation is complete, provide a concise report containing:

## 1. Implementation

What was implemented.

## 2. Roles

Final roles and permissions.

## 3. User Management

User lifecycle functionality.

## 4. Staff

Staff onboarding implementation.

## 5. County Liaisons

Provisioning and geographic scope.

## 6. Account Lifecycle

Suspension and activation.

## 7. Identity Verification

Verification workflow and security.

## 8. Audit

Administrative events recorded.

## 9. Security

Security tests and findings.

## 10. Regression

M1–M13 test results.

## 11. Database

Migrations/schema changes.

## 12. Backend

New/modified APIs.

## 13. Frontend

New/modified pages/components.

## 14. Known Issues

Clearly list anything unresolved.

## 15. Milestone State

Use exactly:

```text
M14 Implementation: COMPLETE
M14 Verification: COMPLETE/PENDING
M14 Human Approval: PENDING
M15: LOCKED
```

Then STOP.

DO NOT proceed to M15 without explicit human approval.
