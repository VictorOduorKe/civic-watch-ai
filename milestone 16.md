# CivicWatch AI Kenya — Milestone 16

## System Audit Logging & Platform Governance Settings

### Implementation Mode: Full Repository Implementation

Implement **Milestone 16 — System Audit Logging & Platform Governance Settings**.

M16 has been explicitly authorized by the human project owner.

Do not implement M17 or any later milestone.

---

# 1. AUTHORITATIVE M16 DEFINITION

M16 combines two functional areas:

## A. System Audit Logging

Scheduled capabilities:

* Immutable action audit trail
* Exportable compliance reports
* Security intrusion monitoring

## B. Platform Governance Settings

Scheduled capabilities:

* Category schema management
* API key & webhook management
* Security policy configurations

These six capabilities together constitute M16.

Do not split them into separate milestones.

Do not move any of them into M17.

---

# 2. FIRST STEP — INSPECT THE EXISTING SYSTEM

Before modifying code, inspect the complete repository.

Read and understand:

* `docs/MILESTONES.md`
* M1–M15 implementation
* existing audit logging
* authentication
* authorization
* user/role management
* verification/trust
* county access
* notifications
* administration
* database schema
* API architecture
* frontend architecture
* security middleware
* logging
* configuration management
* category models
* integration/webhook code
* existing tests

Especially inspect M14 and M15.

Do not create duplicate infrastructure.

If an existing audit system exists, extend it.

If an existing category system exists, extend it.

If an existing integration/credential system exists, extend it.

---

# 3. M16 ARCHITECTURE

Organize the milestone as:

```text
M16
│
├── System Audit Logging
│   ├── Immutable action audit trail
│   ├── Exportable compliance reports
│   └── Security intrusion monitoring
│
└── Platform Governance Settings
    ├── Category schema management
    ├── API key & webhook management
    └── Security policy configurations
```

Keep these areas modular but integrated with the existing platform.

---

# 4. SYSTEM AUDIT LOGGING

## 4.1 Audit Event Model

Create or extend the existing audit event system.

An audit event should capture appropriate information such as:

* event ID
* timestamp
* actor/user ID where available
* action
* resource type
* resource ID
* result/outcome
* source/request context where appropriate
* IP address where appropriate
* user agent where appropriate
* relevant metadata
* correlation/request ID where available

Do not record sensitive secrets.

Never store:

* passwords
* authentication tokens
* API secret values
* private keys
* session secrets
* raw identity documents
* unnecessary sensitive personal data

Follow existing privacy requirements.

---

# 5. IMMUTABLE ACTION AUDIT TRAIL

The audit trail must be tamper-evident.

At minimum:

* normal application users must not be able to modify audit events
* normal administrators must not be able to silently edit historical events
* audit events should be append-only
* deletion must be prevented or tightly controlled
* modifications to audit configuration itself must be audited

Where appropriate, implement integrity protection such as chained hashes or another repository-compatible tamper-evidence mechanism.

For example:

```text
event[n]
    ↓
hash(event[n])
    ↓
event[n+1]
    ↓
hash(event[n+1] + previous_hash)
```

Do not implement cryptography merely for appearance.

Use a sound, documented integrity mechanism.

If the project already has an integrity mechanism, reuse it.

---

# 6. AUDIT COVERAGE

Audit important platform actions.

At minimum cover:

## Authentication

* successful login
* failed login
* logout
* account activation
* account suspension
* password/security changes where applicable

## User Management

* role assignment
* role removal
* permission changes
* staff provisioning
* county liaison provisioning
* identity verification changes

## Civic Content

* report changes
* moderation actions
* sensitive-case actions
* petition actions
* hearing actions
* legislative feedback moderation

## Administration

* configuration changes
* category changes
* integration changes
* webhook changes
* API key lifecycle events
* security policy changes

## Security

* repeated authentication failures
* authorization failures
* suspicious request patterns
* blocked requests
* security alerts

Use the actual application's existing resource types and events.

Do not fabricate events for functionality that does not exist.

---

# 7. AUDIT EVENT SEVERITY

Use the existing logging conventions if available.

Otherwise establish a clear classification such as:

```text
INFO
NOTICE
WARNING
SECURITY
CRITICAL
```

Do not confuse application errors with security incidents.

Document the meaning of each severity level.

---

# 8. AUDIT ACCESS CONTROL

Audit records contain sensitive operational information.

Create strict access control.

Potential model:

```text
Citizen
    → No administrative audit access

Moderator
    → Only audit information explicitly required for moderation

Analyst
    → Authorized aggregated/analytical information only

County Liaison
    → Authorized county-scoped audit information only

Admin
    → Authorized platform audit access
```

Do not automatically expose all audit records to every administrator if the existing permission model supports finer-grained access.

All audit access itself must be audited.

---

# 9. AUDIT SEARCH AND FILTERING

Provide an administrative audit interface.

Support appropriate filtering by:

* date/time range
* actor
* action
* resource type
* resource ID
* outcome
* severity
* IP/source where appropriate
* security events

Support pagination.

Do not load an unlimited audit history into the browser.

Use server-side filtering and pagination.

---

# 10. AUDIT DETAIL VIEW

Authorized administrators should be able to inspect an individual event.

Display:

* timestamp
* actor
* action
* resource
* outcome
* severity
* request/correlation ID
* relevant safe metadata
* integrity status

Do not display secrets.

If metadata contains sensitive values, redact them.

---

# 11. EXPORTABLE COMPLIANCE REPORTS

Implement authorized export of audit information.

Supported formats should follow existing project conventions.

At minimum consider:

* CSV
* JSON

PDF may be implemented only if there is a genuine existing reporting architecture that makes it appropriate.

Exports must:

* require authorization
* respect date/filter constraints
* respect county/role scope
* exclude secrets
* record export activity in the audit trail
* prevent unauthorized bulk extraction

Do not create a public audit export.

---

# 12. EXPORT SECURITY

Prevent abuse of audit exports.

Apply appropriate:

* rate limits
* maximum date ranges
* pagination/batching
* permission checks
* input validation
* audit logging

The system must record:

```text
who exported
what was exported
when it was exported
filters used
result
```

Do not log the entire exported dataset.

---

# 13. SECURITY INTRUSION MONITORING

Implement a security-event monitoring layer using information already generated by the platform.

The system should identify patterns such as:

* repeated failed logins
* repeated unauthorized API requests
* repeated access to restricted resources
* suspicious privilege changes
* unusual administrative actions
* excessive request failures
* repeated attempts to access invalid resource IDs
* suspicious webhook/API activity

Do not claim that a user is malicious simply because a threshold was reached.

Represent these as:

```text
potential security event
```

or equivalent neutral terminology.

---

# 14. SECURITY EVENT LIFECYCLE

Security events should have a manageable lifecycle.

For example:

```text
DETECTED
REVIEWING
CONFIRMED
DISMISSED
RESOLVED
```

Use existing project terminology if available.

Record:

* detection time
* reason
* source
* related audit events
* review status
* reviewer
* resolution
* timestamps

Do not delete security history merely because an event was dismissed.

---

# 15. SECURITY ALERT THRESHOLDS

Where threshold-based detection is needed, make thresholds configurable through the M16 security policy system.

Examples:

```text
failed login threshold
unauthorized request threshold
request burst threshold
security alert cooldown
```

Do not hard-code values throughout the application.

Avoid overly aggressive thresholds that create constant false alerts.

Document defaults.

---

# 16. CATEGORY SCHEMA MANAGEMENT

Implement centralized management of platform categories.

First inspect existing category structures.

Do not create duplicate category tables if categories already exist.

Authorized administrators should be able to manage appropriate:

* category name
* description
* status
* ordering
* parent category where supported
* applicable module/resource
* metadata where supported

Use existing naming conventions.

---

# 17. CATEGORY SAFETY

Category deletion can break historical records.

Prefer lifecycle management such as:

```text
ACTIVE
INACTIVE
ARCHIVED
```

rather than destructive deletion when existing records reference a category.

Existing records should remain historically understandable.

Do not silently change the meaning of old records when a category is edited.

Audit all category changes.

---

# 18. CATEGORY MANAGEMENT UI

Provide an administrative category management interface.

Support:

* search
* filtering
* creation
* editing
* activation/deactivation
* ordering where applicable
* dependency/reference visibility
* audit history

Prevent unauthorized users from modifying category definitions.

---

# 19. API KEY MANAGEMENT

Implement secure API key lifecycle management for platform integrations where required.

Support appropriate operations such as:

* create
* identify
* rotate
* revoke
* deactivate
* inspect metadata

Never expose the full secret after creation if the security architecture does not require it.

Prefer showing:

```text
key name
key ID
prefix/fingerprint
created at
last used
status
expiration
```

rather than the secret itself.

---

# 20. API KEY STORAGE

API secrets must never be stored in:

* localStorage
* frontend source code
* Git repositories
* public configuration
* audit logs
* browser URLs

Store secrets using the existing secure backend configuration/secret-storage architecture.

If encryption at rest is required by the existing architecture, implement it appropriately.

Never return secret values in normal API responses.

---

# 21. API KEY PERMISSIONS

Where supported, API keys should have scoped permissions.

Examples:

```text
read
write
webhook
reports
integration-specific scopes
```

Do not grant full administrative privileges by default.

API key usage must be auditable.

---

# 22. WEBHOOK MANAGEMENT

Implement centralized webhook management.

Support appropriate fields:

* name
* endpoint
* event subscriptions
* status
* creation date
* last delivery
* failure count
* secret configuration
* owner
* retry state where applicable

Never expose webhook secrets unnecessarily.

---

# 23. WEBHOOK SECURITY

Webhook implementation must support appropriate security controls.

At minimum consider:

* HTTPS enforcement
* signed payloads
* secret rotation
* delivery timestamps
* replay protection
* retry controls
* timeout controls
* failure tracking
* disable/re-enable controls

Do not send secrets through query parameters.

Do not log full signed payloads if they contain sensitive information.

---

# 24. WEBHOOK TESTING

Provide an authorized webhook test mechanism if appropriate.

Test deliveries must be clearly identified as test events.

Do not allow arbitrary users to use the server as an unrestricted HTTP request proxy.

Validate:

* destination
* protocol
* authorization
* timeout
* response handling

Protect against SSRF and internal network access.

Do not allow requests to arbitrary internal addresses.

---

# 25. SECURITY POLICY CONFIGURATIONS

Create centralized platform security settings.

First inspect existing hard-coded security configuration.

Where appropriate, move configurable policies into a controlled settings system.

Potential settings include:

* login attempt thresholds
* account lockout behavior
* session lifetime
* API rate limits
* audit retention settings
* security alert thresholds
* password/security requirements where applicable
* webhook retry limits

Only expose settings that are genuinely safe and appropriate to configure dynamically.

---

# 26. SECURITY POLICY PROTECTION

Security settings are high-impact.

Therefore:

* only authorized administrators may change them
* every change must be audited
* validation must occur server-side
* dangerous values must be rejected
* reasonable minimum/maximum bounds must exist
* configuration changes should use transactions where necessary

Do not allow a client to bypass restrictions by submitting arbitrary configuration keys.

Use an allowlist of supported settings.

---

# 27. CONFIGURATION VERSIONING

Where practical, preserve configuration history.

A security-policy change should be traceable to:

```text
previous value
new value
actor
timestamp
reason where appropriate
```

Do not expose sensitive configuration values unnecessarily.

---

# 28. GOVERNANCE DASHBOARD

Create an administrative Platform Governance area.

Possible structure:

```text
Administration
│
├── Audit Logs
├── Security Monitoring
├── Compliance Reports
│
├── Categories
├── API Keys
├── Webhooks
└── Security Policies
```

Use the existing administration UI.

Do not create a separate administration application.

---

# 29. FRONTEND DESIGN

Use the existing CivicWatch design system.

Requirements:

* no gradients
* existing logo/branding
* professional civic appearance
* responsive
* accessible
* clear status indicators
* confirmation dialogs for destructive/high-impact actions
* clear validation errors
* loading states
* empty states
* pagination
* search/filter controls

Do not redesign unrelated pages.

---

# 30. DATABASE DESIGN

Inspect the current schema before adding tables.

Potential entities may include:

```text
audit_events
security_events
audit_export_jobs

platform_categories
api_keys
webhooks
webhook_deliveries

security_policies
security_policy_history
```

Use existing table names/models if they already exist.

Add appropriate:

* foreign keys
* indexes
* unique constraints
* status constraints
* timestamps
* ownership relationships

Audit records should be append-only.

---

# 31. API DESIGN

Follow existing API conventions.

Possible endpoints:

## Audit

```text
GET /api/admin/audit
GET /api/admin/audit/:id
GET /api/admin/audit/export
GET /api/admin/security-events
PATCH /api/admin/security-events/:id
```

## Categories

```text
GET    /api/admin/categories
POST   /api/admin/categories
PATCH  /api/admin/categories/:id
POST   /api/admin/categories/:id/archive
```

## API keys

```text
GET    /api/admin/api-keys
POST   /api/admin/api-keys
POST   /api/admin/api-keys/:id/rotate
POST   /api/admin/api-keys/:id/revoke
```

## Webhooks

```text
GET    /api/admin/webhooks
POST   /api/admin/webhooks
PATCH  /api/admin/webhooks/:id
POST   /api/admin/webhooks/:id/test
POST   /api/admin/webhooks/:id/disable
```

## Security policies

```text
GET   /api/admin/security-policies
PATCH /api/admin/security-policies/:key
GET   /api/admin/security-policies/history
```

These are conceptual.

Reuse existing routes and conventions wherever possible.

---

# 32. SERVER-SIDE AUTHORIZATION

Never trust client-provided:

```text
role
user_id
permissions
scope
category_owner
api_key_owner
security_policy_permission
```

Every governance operation must be authorized on the server.

Test for:

* IDOR
* privilege escalation
* cross-county access
* unauthorized configuration changes
* unauthorized exports
* unauthorized API key access
* unauthorized webhook access

---

# 33. AUDIT THE AUDIT SYSTEM

A critical M16 requirement:

Actions involving the audit system itself must be audited.

Examples:

* audit configuration changed
* audit export generated
* audit retention changed
* security monitoring configuration changed
* security event reviewed
* category changed
* API key created
* API key revoked
* webhook changed
* security policy changed

Do not allow governance operations to become invisible.

---

# 34. TESTING

Create automated tests for:

## Audit

* event creation
* append-only behavior
* integrity verification
* access control
* filtering
* pagination
* export
* export authorization

## Security monitoring

* event detection
* threshold handling
* false-positive dismissal
* security event lifecycle
* audit integration

## Categories

* create
* update
* archive
* authorization
* historical reference protection

## API keys

* creation
* secure storage
* secret non-disclosure
* rotation
* revocation
* authorization
* audit

## Webhooks

* creation
* update
* signing
* delivery
* retry behavior
* disable
* SSRF protection
* authorization

## Security policies

* allowed settings
* validation
* bounds
* authorization
* history
* audit

---

# 35. SECURITY TESTING

Perform targeted security tests for:

* IDOR
* privilege escalation
* SQL injection
* XSS
* CSRF where applicable
* SSRF
* mass assignment
* API key leakage
* webhook secret leakage
* audit tampering
* audit deletion
* unauthorized export
* unauthorized configuration changes
* path/query manipulation
* rate-limit bypass
* sensitive log exposure

Use safe local test data.

---

# 36. REGRESSION TESTING

Run the existing M1–M15 regression suite.

Pay particular attention to:

* authentication
* roles
* verification
* civic reports
* sensitive cases
* alerts
* intelligence
* notifications
* petitions
* budget hearings
* legislative feedback
* administration

M16 must not break earlier milestones.

---

# 37. DOCUMENTATION

Update:

```text
docs/MILESTONES.md
```

The authoritative M16 definition must remain:

```text
Milestone 16 — System Audit Logging & Platform Governance Settings

System audit logging and global platform governance controls belong to Milestone 16.

Scheduled Capabilities:

System Audit Logging
- Immutable action audit trail
- Exportable compliance reports
- Security intrusion monitoring

Platform Governance Settings
- Category schema management
- API key & webhook management
- Security policy configurations
```

Also update relevant developer/API documentation.

Document security architecture decisions, especially:

* audit integrity
* API key handling
* webhook security
* policy configuration
* security monitoring

Do not alter M17's definition.

---

# 38. M16 VERIFICATION CHECKLIST

## System Audit Logging

* [ ] Audit events are generated
* [ ] Important administrative actions are covered
* [ ] Authentication events are covered
* [ ] Audit records are append-only
* [ ] Tamper-evidence works
* [ ] Audit integrity can be checked
* [ ] Audit access is authorized
* [ ] Audit search works
* [ ] Audit filtering works
* [ ] Audit pagination works
* [ ] Audit detail view works
* [ ] Audit exports work
* [ ] Export access is controlled
* [ ] Export actions are audited

## Security Intrusion Monitoring

* [ ] Security events are detected
* [ ] Thresholds work
* [ ] Events are reviewable
* [ ] Events are auditable
* [ ] False positives can be dismissed
* [ ] No unsupported claims of malicious behavior are made

## Category Governance

* [ ] Categories can be managed
* [ ] Category changes are audited
* [ ] Historical references remain valid
* [ ] Unauthorized changes are blocked

## API Keys

* [ ] Keys can be created
* [ ] Secrets are protected
* [ ] Secrets are never exposed unnecessarily
* [ ] Rotation works
* [ ] Revocation works
* [ ] Usage is auditable

## Webhooks

* [ ] Webhooks can be configured
* [ ] HTTPS/security validation works
* [ ] Payload signing works where applicable
* [ ] Secrets are protected
* [ ] Delivery tracking works
* [ ] Retry behavior works
* [ ] SSRF protections work
* [ ] Disable/re-enable works

## Security Policies

* [ ] Policies are centrally managed
* [ ] Only supported settings are accepted
* [ ] Values are validated
* [ ] Dangerous values are rejected
* [ ] Changes are audited
* [ ] History is preserved where supported

## Regression

* [ ] M1–M15 tests pass
* [ ] No authentication regressions
* [ ] No authorization regressions
* [ ] No notification regressions
* [ ] No civic participation regressions
* [ ] No privacy regressions

---

# 39. HARD STOP RULE

After M16 implementation and verification:

STOP.

Do not begin M17.

Do not implement future milestone functionality.

Do not automatically approve M16.

Do not automatically unlock M17.

The final state must be:

```text
M16 — System Audit Logging & Platform Governance Settings

Implementation: COMPLETE
Verification: COMPLETE
Human Approval: PENDING

M17 — LOCKED

Waiting for explicit human approval.
```

If verification is incomplete:

```text
M16 Implementation: COMPLETE
M16 Verification: PENDING
M16 Human Approval: PENDING
M17: LOCKED
```

---

# 40. FINAL REPORT

Return a concise implementation report covering:

1. Audit architecture
2. Immutable/tamper-evident audit trail
3. Audit search and filtering
4. Compliance exports
5. Security intrusion monitoring
6. Category management
7. API key management
8. Webhook management
9. Security policy configuration
10. Database changes
11. API changes
12. Frontend changes
13. Authorization
14. Security testing
15. Regression testing
16. Documentation updates
17. Known issues

Then provide:

```text
M16 Implementation: COMPLETE / INCOMPLETE
M16 Verification: COMPLETE / PENDING
M16 Human Approval: PENDING
M17: LOCKED
```

Finally:

```text
WAITING FOR EXPLICIT HUMAN APPROVAL OF M16.
```

Do not continue automatically.
