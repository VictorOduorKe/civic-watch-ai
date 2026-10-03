# CivicWatch AI Kenya — Role-Based Workspace Architecture

## Objective

Refactor the current CivicWatch role-management and frontend architecture so that each authenticated role has its own standalone workspace, routes, navigation, dashboard, and role-specific functions.

### Current Problem

At the moment, administrative roles are being redirected to the same Admin page.

This is not acceptable for the final architecture.

For example:

* Moderator → currently redirected to Admin
* Analyst → currently redirected to Admin
* County Liaison → currently redirected to Admin
* Admin → Admin

Instead, each role must have its own standalone workspace.

A Moderator must have a Moderator workspace.

An Analyst must have an Analyst workspace.

A County Liaison must have a County Liaison workspace.

An Admin must have the Admin workspace.

A Citizen must have the Citizen workspace.

The frontend must never treat all administrative roles as one generic `admin` role.

---

# 1. IMPORTANT ARCHITECTURAL RULE

Separate:

```text
ROLE
PERMISSIONS
WORKSPACE
ROUTES
```

These are related but not identical.

For example:

```text
MODERATOR
    ↓
Moderator permissions
    ↓
Moderator workspace
    ↓
/moderator/*
```

and:

```text
ANALYST
    ↓
Analyst permissions
    ↓
Analyst workspace
    ↓
/analyst/*
```

Do not implement the system as:

```text
if user.role !== CITIZEN:
    redirect('/admin')
```

That type of logic must be removed.

---

# 2. AUTHORITATIVE ROLE MODEL

Inspect the existing M14 role system first.

Do not create duplicate role definitions if the backend already has them.

The platform should support the existing roles:

```text
CITIZEN
MODERATOR
ANALYST
ADMIN
```

If the existing implementation already supports:

```text
COUNTY_LIAISON
```

or an equivalent county staff role, preserve and properly support it.

If County Liaison is already part of the approved M14 role model, it must receive its own workspace.

Do not silently rename existing database roles.

---

# 3. ROLE RESPONSIBILITY MODEL

Create a clear responsibility boundary.

## Citizen

Primary purpose:

Citizen-facing civic participation.

Example workspace:

```text
/citizen/*
```

Functions may include:

* Dashboard
* My Reports
* Submit Report
* Petitions
* Public Hearings
* Legislative Feedback
* Notifications
* Profile
* Verification status

A citizen must not see administrative navigation.

---

# 4. MODERATOR WORKSPACE

Create a completely independent Moderator workspace.

Base route:

```text
/moderator/*
```

Suggested structure:

```text
frontend/
└── moderator/
    ├── pages/
    │   ├── ModeratorDashboard
    │   ├── ModerationQueue
    │   ├── Reports
    │   ├── SensitiveCases
    │   ├── Petitions
    │   ├── LegislativeFeedback
    │   └── Profile
    │
    ├── components/
    ├── hooks/
    ├── services/
    └── routes/
```

Use the actual repository structure if it follows another convention.

Do not force this exact directory structure if the project already has a better architecture.

### Moderator dashboard

The Moderator dashboard should focus on moderation work.

Possible sections:

* Pending moderation
* Reports awaiting review
* Sensitive cases requiring authorized attention
* Petition moderation
* Legislative feedback moderation
* Recently moderated items
* Moderation activity

Do not expose:

* user-role administration
* API key management
* platform security settings
* global system configuration
* unrestricted audit logs

unless the backend permission system explicitly grants such access.

---

# 5. ANALYST WORKSPACE

Create an independent Analyst workspace.

Base route:

```text
/analyst/*
```

Suggested structure:

```text
frontend/
└── analyst/
    ├── pages/
    │   ├── AnalystDashboard
    │   ├── CivicInsights
    │   ├── ReportAnalytics
    │   ├── Trends
    │   ├── GeographicInsights
    │   ├── Exports
    │   └── Profile
    │
    ├── components/
    ├── hooks/
    ├── services/
    └── routes/
```

The Analyst dashboard should focus on authorized analytical information.

Possible functions:

* Civic report statistics
* Category trends
* Geographic trends
* Petition statistics
* Public participation statistics
* Alert statistics
* Time-based analysis
* Authorized exports

Do not give analysts unrestricted administrative privileges.

Do not allow analysts to:

* change user roles
* suspend users
* change platform security policies
* manage API keys
* manage webhooks
* modify global categories

unless an explicit backend permission grants it.

---

# 6. COUNTY LIAISON WORKSPACE

If County Liaison exists in the current role model, create a standalone workspace.

Base route:

```text
/county/*
```

or:

```text
/county-liaison/*
```

Use whichever naming convention best matches the existing project.

Suggested structure:

```text
frontend/
└── county-liaison/
    ├── pages/
    │   ├── CountyDashboard
    │   ├── CountyReports
    │   ├── PublicHearings
    │   ├── Petitions
    │   ├── CountyActivities
    │   └── Profile
    │
    ├── components/
    ├── hooks/
    ├── services/
    └── routes/
```

County Liaison users must only see and manage resources belonging to their authorized county scope.

Example:

```text
County Liaison
      ↓
Mombasa County
      ↓
Mombasa resources
```

The backend must enforce this.

Never rely on:

```text
county_id
```

provided by the frontend.

---

# 7. ADMIN WORKSPACE

Keep a dedicated Admin workspace.

Base route:

```text
/admin/*
```

The Admin workspace should contain genuinely administrative functionality.

Suggested structure:

```text
frontend/
└── admin/
    ├── pages/
    │   ├── AdminDashboard
    │   ├── Users
    │   ├── Roles
    │   ├── Permissions
    │   ├── IdentityVerification
    │   ├── AuditLogs
    │   ├── SecurityMonitoring
    │   ├── Categories
    │   ├── APIKeys
    │   ├── Webhooks
    │   ├── SecurityPolicies
    │   └── Settings
    │
    ├── components/
    ├── hooks/
    ├── services/
    └── routes/
```

Only Admin users with the appropriate permissions should access these areas.

---

# 8. ROLE-SPECIFIC ROUTING

Replace the current generic administrative redirect logic.

Do not use:

```text
if isAdmin:
    redirect('/admin')
```

because this incorrectly groups all administrative users.

Instead use an explicit role-to-workspace resolver.

Conceptually:

```text
CITIZEN
    → /citizen

MODERATOR
    → /moderator

ANALYST
    → /analyst

COUNTY_LIAISON
    → /county-liaison

ADMIN
    → /admin
```

Use the actual role constants from the backend.

Do not duplicate role strings throughout the frontend.

Create one authoritative role mapping.

---

# 9. ROLE WORKSPACE CONFIGURATION

Create a centralized workspace configuration.

Conceptually:

```text
ROLE_WORKSPACES = {
    CITIZEN: '/citizen',
    MODERATOR: '/moderator',
    ANALYST: '/analyst',
    COUNTY_LIAISON: '/county-liaison',
    ADMIN: '/admin'
}
```

Use the project's language/framework conventions.

This configuration should control:

* initial redirect
* navigation
* workspace identity
* protected routes

Do not use it as the security mechanism.

The backend remains authoritative.

---

# 10. FRONTEND ROUTE PROTECTION

Create role-aware route guards.

Examples:

```text
/ admin/*
    → ADMIN

/ moderator/*
    → MODERATOR

/ analyst/*
    → ANALYST

/ county-liaison/*
    → COUNTY_LIAISON

/ citizen/*
    → CITIZEN
```

If a user attempts to access another role's route:

```text
403 Forbidden
```

or redirect them to their own workspace where that matches the existing UX pattern.

Do not simply hide the page and assume that provides security.

---

# 11. BACKEND AUTHORIZATION

This is critical.

Frontend route separation is not security.

The backend must independently verify:

```text
authenticated user
+
role
+
permission
+
resource scope
```

For every protected operation.

For example:

```text
POST /api/admin/users/:id/role
```

must verify Admin authorization on the server.

A Moderator must not gain access by manually entering:

```text
/admin/users
```

into the browser.

Similarly, an Analyst must not gain access to an Admin API by manually calling the endpoint.

---

# 12. PERMISSION MODEL

Inspect the existing M14 permission implementation.

If the project already has granular permissions, reuse it.

If permissions are currently based almost entirely on:

```text
role === ADMIN
```

refactor carefully toward permission-based authorization where appropriate.

Example permission groups:

```text
USER_VIEW
USER_MANAGE

ROLE_VIEW
ROLE_MANAGE

REPORT_VIEW
REPORT_MODERATE

SENSITIVE_CASE_VIEW
SENSITIVE_CASE_MANAGE

ANALYTICS_VIEW
ANALYTICS_EXPORT

PETITION_MODERATE

HEARING_MANAGE

FEEDBACK_MODERATE

AUDIT_VIEW
AUDIT_EXPORT

CATEGORY_MANAGE

API_KEY_MANAGE
WEBHOOK_MANAGE

SECURITY_POLICY_MANAGE
```

Do not blindly implement every permission above.

Inspect the existing application and create permissions that match actual functionality.

---

# 13. ROLE/PERMISSION SEPARATION

Do not hard-code permission checks everywhere like:

```text
if role === ADMIN
```

Prefer:

```text
hasPermission('USER_MANAGE')
```

where the existing architecture supports it.

Roles should provide permissions.

Conceptually:

```text
ADMIN
    → administrative permissions

MODERATOR
    → moderation permissions

ANALYST
    → analytics permissions

COUNTY_LIAISON
    → county-scoped management permissions

CITIZEN
    → citizen permissions
```

This makes future roles possible without rewriting the entire frontend.

---

# 14. NAVIGATION

Each workspace gets its own navigation.

## Admin

```text
Dashboard
Users
Roles & Permissions
Verification
Audit Logs
Security Monitoring
Categories
API Keys
Webhooks
Security Policies
Settings
```

## Moderator

```text
Dashboard
Moderation Queue
Reports
Sensitive Cases
Petitions
Legislative Feedback
Profile
```

## Analyst

```text
Dashboard
Civic Insights
Reports
Trends
Geographic Analysis
Exports
Profile
```

## County Liaison

```text
Dashboard
County Reports
Public Hearings
County Petitions
County Activities
Profile
```

## Citizen

```text
Dashboard
My Reports
Petitions
Public Hearings
Legislative Feedback
Notifications
Profile
```

These are starting points.

Only expose functions that are actually implemented and authorized.

---

# 15. SHARED COMPONENTS

Do not duplicate the entire UI system for every role.

Keep shared components centralized.

For example:

```text
components/
├── Button
├── DataTable
├── Modal
├── Form
├── StatusBadge
├── Pagination
├── ErrorState
└── LoadingState
```

Role workspaces should compose these shared components.

Do not create five copies of the same button, table, modal, etc.

---

# 16. ROLE-SPECIFIC BUSINESS UI

While shared UI components should remain centralized, business pages should belong to their relevant workspace.

For example:

```text
ModeratorModerationQueue
```

belongs to Moderator.

```text
AnalystCivicInsights
```

belongs to Analyst.

```text
AdminUserManagement
```

belongs to Admin.

Do not put all of these under a generic Admin pages directory.

---

# 17. DASHBOARD SEPARATION

Each role must have a different dashboard.

Do not render:

```text
AdminDashboard
```

for Moderator, Analyst, or County Liaison users.

The dashboard must be based on the authenticated workspace.

Example:

```text
Moderator → ModeratorDashboard
Analyst → AnalystDashboard
County Liaison → CountyDashboard
Admin → AdminDashboard
Citizen → CitizenDashboard
```

---

# 18. ROLE-SPECIFIC DATA

Dashboard APIs should return only the data required by that role.

Do not call the entire Admin dashboard API and hide sections on the frontend.

For example:

```text
GET /api/moderator/dashboard
GET /api/analyst/dashboard
GET /api/county-liaison/dashboard
GET /api/admin/dashboard
GET /api/citizen/dashboard
```

If the backend architecture already has a different pattern, reuse it.

The principle is:

**role-specific data access, not just role-specific rendering.**

---

# 19. ADMINISTRATIVE API SEPARATION

Review current administrative API routes.

Separate them logically where useful:

```text
/api/admin/*
/api/moderator/*
/api/analyst/*
/api/county-liaison/*
```

Do not blindly duplicate endpoints.

Shared resources may remain under common routes when appropriate.

For example:

```text
/api/petitions/:id
```

may remain shared while permissions determine what each role can do.

---

# 20. API RESPONSE SECURITY

Do not return unnecessary administrative data to lower-privileged roles.

For example, an Analyst response should not include:

* password hashes
* authentication tokens
* API keys
* webhook secrets
* private user information
* security-policy secrets

Apply data minimization server-side.

---

# 21. ROLE SWITCHING

Do not provide a frontend role switcher that lets a user pretend to be another role.

If impersonation is ever required, it must be a separate highly controlled administrative feature with:

* explicit permission
* audit logging
* strong safeguards
* clear UI indication

Do not implement impersonation as part of this task unless it already exists and needs to be preserved.

---

# 22. LOGIN REDIRECT

After authentication:

1. Load authenticated user.
2. Determine authoritative role.
3. Determine workspace.
4. Verify account status.
5. Redirect to the correct workspace.

Example:

```text
Login
 ↓
Authenticated user
 ↓
Account status
 ↓
Role
 ↓
Permission context
 ↓
Workspace
 ↓
Role dashboard
```

Never determine role from:

```text
localStorage.role
```

or another client-controlled value.

---

# 23. TOKEN AND SESSION SECURITY

Continue the security improvements from M9/M10/M14/M16.

Do not store sensitive authentication credentials unnecessarily in localStorage.

Never allow the client to modify its own:

```text
role
permissions
isAdmin
county
verification status
```

The backend must be authoritative.

---

# 24. ACCOUNT STATUS HANDLING

Workspace access must respect account status.

For example:

```text
ACTIVE
    → normal workspace

SUSPENDED
    → no protected workspace access

PENDING_VERIFICATION
    → verification-aware restricted experience

DEACTIVATED
    → no normal workspace access
```

Use the existing M14 lifecycle implementation.

Do not create another account-status system.

---

# 25. COUNTY LIAISON SCOPE

For County Liaison:

```text
Authenticated User
       ↓
County Liaison role
       ↓
Authorized county scope
       ↓
County workspace
```

The backend must enforce county scope on:

* reports
* hearings
* petitions
* activities
* statistics
* any future county-specific resource

Never trust the browser to determine the county.

---

# 26. AUDITING ROLE ACTIONS

Integrate with the M16 audit system.

Audit:

* role changes
* permission changes
* workspace-sensitive actions
* failed authorization attempts
* administrative access
* moderation actions
* analyst exports
* county-scope violations
* attempted access to unauthorized workspaces

Do not log passwords, tokens, or secrets.

---

# 27. ERROR HANDLING

Create consistent handling for:

```text
401 Unauthorized
403 Forbidden
404 Not Found
```

A user should not receive misleading errors such as:

```text
Admin page not found
```

when the actual issue is:

```text
You do not have permission to access this workspace.
```

Do not reveal sensitive information through authorization errors.

---

# 28. TESTING

Create/extend tests for every role.

## Citizen

* login
* citizen redirect
* citizen dashboard
* protected citizen routes
* cannot access Admin
* cannot access Moderator
* cannot access Analyst

## Moderator

* login
* Moderator redirect
* Moderator dashboard
* moderation functions
* cannot access Admin functions
* cannot access Analyst-only functions
* cannot modify roles

## Analyst

* login
* Analyst redirect
* Analyst dashboard
* analytics functions
* authorized exports
* cannot manage users
* cannot manage roles
* cannot modify security policies

## County Liaison

* login
* county workspace redirect
* county dashboard
* county-scoped data
* cross-county access blocked
* cannot access global Admin functions

## Admin

* login
* Admin redirect
* Admin dashboard
* user management
* role management
* governance functions

---

# 29. SECURITY TESTING

Specifically test:

* manually entering `/admin`
* manually entering `/moderator`
* manually entering `/analyst`
* manually entering `/county-liaison`
* changing role values in browser storage
* modifying role fields in API requests
* modifying `user_id`
* modifying `county_id`
* modifying permission fields
* calling Admin APIs directly
* calling Moderator APIs directly
* calling Analyst APIs directly
* cross-county access
* privilege escalation
* IDOR
* mass assignment

Expected behavior:

```text
Frontend route protection
+
Backend authorization
=
secure role separation
```

Never rely only on frontend route guards.

---

# 30. MIGRATION / BACKWARD COMPATIBILITY

Inspect existing users before changing role behavior.

Do not break existing accounts.

If the current database uses values such as:

```text
admin
moderator
analyst
```

while the frontend uses:

```text
ADMIN
MODERATOR
ANALYST
```

establish one authoritative mapping.

Do not create duplicate users.

Do not silently change existing user roles.

If a database migration is required, create it safely and document it.

---

# 31. FILE AND FOLDER ORGANIZATION

Use the project's existing framework conventions.

The final frontend architecture should clearly communicate workspace ownership.

For example:

```text
src/
├── app/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── services/
│
├── citizen/
│   ├── pages/
│   ├── components/
│   ├── routes/
│   └── services/
│
├── moderator/
│   ├── pages/
│   ├── components/
│   ├── routes/
│   └── services/
│
├── analyst/
│   ├── pages/
│   ├── components/
│   ├── routes/
│   └── services/
│
├── county-liaison/
│   ├── pages/
│   ├── components/
│   ├── routes/
│   └── services/
│
└── admin/
    ├── pages/
    ├── components/
    ├── routes/
    └── services/
```

Adapt this to the existing application rather than forcing a rewrite.

---

# 32. NO DUPLICATION OF BACKEND LOGIC

Role-specific frontend folders do NOT mean separate backend implementations of the same business logic.

For example, do not create:

```text
moderatorPetitionService
adminPetitionService
analystPetitionService
```

when a shared petition service is sufficient.

Instead:

```text
PetitionService
       ↓
Permission checks
       ↓
Role-specific allowed operations
```

Keep business logic reusable.

---

# 33. DOCUMENTATION

Update:

```text
docs/MILESTONES.md
```

only if the role architecture belongs to the existing M14 User & Role Management scope.

Also update appropriate developer documentation describing:

* role definitions
* permissions
* workspace routes
* authorization rules
* county scope
* role-specific navigation
* authentication redirect behavior

Do not incorrectly move this work into M16.

This work is a correction/strengthening of the existing M14 User & Role Management architecture.

---

# 34. ACCEPTANCE CRITERIA

M14 role management should not be considered properly implemented until:

### Role separation

* [ ] Citizen has its own workspace
* [ ] Moderator has its own workspace
* [ ] Analyst has its own workspace
* [ ] County Liaison has its own workspace where supported
* [ ] Admin has its own workspace

### Routing

* [ ] Each role redirects to its own dashboard
* [ ] No generic administrative redirect remains
* [ ] Unauthorized workspace routes are blocked
* [ ] Direct URL access is protected

### Permissions

* [ ] Roles have defined permissions
* [ ] Backend enforces permissions
* [ ] Frontend uses permissions for UI visibility
* [ ] Client cannot modify its own role
* [ ] Client cannot modify its own permissions

### Administration

* [ ] Only authorized Admin users access user management
* [ ] Only authorized Admin users manage roles
* [ ] Moderators cannot become Admins through frontend manipulation
* [ ] Analysts cannot access Admin functions
* [ ] County Liaisons cannot cross county boundaries

### UX

* [ ] Each role has an appropriate dashboard
* [ ] Each role has appropriate navigation
* [ ] No irrelevant Admin navigation appears for other roles
* [ ] Responsive UI
* [ ] Existing CivicWatch branding preserved
* [ ] No gradients

### Security

* [ ] Server-side authorization
* [ ] IDOR protection
* [ ] Privilege escalation protection
* [ ] Role tampering protection
* [ ] County-scope enforcement
* [ ] Authorization events audited
* [ ] Existing M16 audit infrastructure reused

### Regression

* [ ] Existing M1–M16 functionality remains operational
* [ ] Authentication still works
* [ ] Verification still works
* [ ] Notifications still work
* [ ] Civic participation still works
* [ ] Administration still works

---

# 35. IMPORTANT: DO NOT CREATE A SECOND ROLE SYSTEM

Before implementation, search the repository for all existing:

* role enums
* role constants
* permission definitions
* authorization middleware
* route guards
* admin checks
* user-role database fields
* workspace logic

Consolidate where necessary.

There must be one authoritative role model.

Do not create:

```text
FrontendRole
BackendRole
AdminRole
DashboardRole
```

as independent competing systems.

There should be one authoritative role/permission model with frontend workspace mapping.

---

# 36. MILESTONE STATE

This work is an architectural strengthening of the existing role-management functionality.

Do not automatically create or unlock another milestone.

After implementation:

```text
M14 Role Management:
    Implementation: COMPLETE / INCOMPLETE
    Verification: COMPLETE / PENDING
    Human Approval: preserve existing state

M16:
    preserve existing status
```

If the current milestone system treats this as a correction to M14, update M14 documentation appropriately.

Do not silently alter human approval history.

---

# 37. FINAL REPORT

Return a concise report covering:

1. Existing role architecture discovered
2. Roles supported
3. New workspace structure
4. Routing changes
5. Permission changes
6. Moderator workspace
7. Analyst workspace
8. County Liaison workspace
9. Admin workspace
10. Citizen workspace
11. Backend authorization
12. County-scope enforcement
13. Audit integration
14. Security testing
15. Regression testing
16. Documentation changes
17. Known issues

Include:

```text
Role Management Architecture: COMPLETE / INCOMPLETE

Citizen Workspace: COMPLETE / INCOMPLETE
Moderator Workspace: COMPLETE / INCOMPLETE
Analyst Workspace: COMPLETE / INCOMPLETE
County Liaison Workspace: COMPLETE / INCOMPLETE
Admin Workspace: COMPLETE / INCOMPLETE

Frontend Role Routing: COMPLETE / INCOMPLETE
Backend Authorization: COMPLETE / INCOMPLETE
Permission Separation: COMPLETE / INCOMPLETE
County Scope Enforcement: COMPLETE / INCOMPLETE
Security Testing: COMPLETE / INCOMPLETE
Regression Testing: COMPLETE / INCOMPLETE
```

Do not claim completion for anything that was not actually tested.

Stop after implementation and verification and report the resulting state.
