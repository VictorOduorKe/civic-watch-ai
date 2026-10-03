# CivicWatch AI Kenya — Milestone 15

## Civic Participation & Petitions

### Implementation Mode: Full Repository Implementation

You are implementing **Milestone 15 — Civic Participation & Petitions** for CivicWatch AI Kenya.

This milestone has been explicitly authorized by the human project owner.

M14 has already been completed/approved sufficiently to unlock M15.

Do not implement M16 or any later milestone.

---

# 1. AUTHORITATIVE M15 DEFINITION

## Milestone 15 — Civic Participation & Petitions

Public participation hearings, citizen petitions, and county budget consultation forums belong to Milestone 15.

### Scheduled Capabilities

1. Online petition management with verified signature quorum
2. County budget hearing schedules
3. Citizen legislative feedback

These three capabilities define the official M15 scope.

Do not expand M15 into unrelated civic features.

---

# 2. FIRST STEP — INSPECT THE EXISTING PROJECT

Before changing code:

Read and understand the existing repository.

Inspect:

* `docs/MILESTONES.md`
* M14 implementation
* authentication
* authorization
* user roles
* identity verification
* trust/verification systems
* county relationships
* audit logging
* civic reports
* notifications
* admin dashboard
* database schema
* API structure
* frontend routing
* frontend design system
* existing tests
* existing security middleware

Do not create duplicate systems where an existing implementation can be reused.

Pay particular attention to the M14 functionality.

M15 should integrate with:

* verified users
* roles
* county access
* audit history
* existing authentication
* existing notification infrastructure
* existing civic content
* existing administration tools

---

# 3. M15 ARCHITECTURE

Implement M15 as three connected but independently manageable areas:

```text
M15 Civic Participation & Petitions
│
├── Petition Management
│   ├── Create petition
│   ├── Publish petition
│   ├── View petition
│   ├── Sign petition
│   ├── Verified signatures
│   ├── Quorum calculation
│   ├── Signature integrity
│   └── Petition lifecycle
│
├── County Budget Hearings
│   ├── Hearing creation
│   ├── County association
│   ├── Schedule
│   ├── Venue / participation information
│   ├── Publication
│   ├── Registration where appropriate
│   └── Hearing lifecycle
│
└── Legislative Feedback
    ├── Feedback submission
    ├── Legislative item association
    ├── Public/private handling
    ├── Moderation
    ├── Status
    └── Audit trail
```

Reuse existing architecture wherever possible.

---

# 4. ONLINE PETITION MANAGEMENT

Implement a complete petition lifecycle.

## Petition creation

Authorized users should be able to create petitions according to the existing authorization model.

A petition should support appropriate fields such as:

* title
* description
* purpose
* category
* county
* constituency/sub-county where applicable
* target authority
* requested action
* supporting information
* opening date
* closing date
* quorum requirement
* status
* creator
* creation timestamp
* publication timestamp
* closing timestamp

Use the existing location/county model instead of introducing a second geographic structure.

---

# 5. PETITION LIFECYCLE

Implement clear petition states.

Use existing project conventions if they already exist.

Otherwise use a structure similar to:

```text
DRAFT
PENDING_REVIEW
PUBLISHED
CLOSED
QUORUM_REACHED
REJECTED
ARCHIVED
```

Do not allow invalid state transitions.

For example:

* DRAFT → PENDING_REVIEW
* PENDING_REVIEW → PUBLISHED
* PENDING_REVIEW → REJECTED
* PUBLISHED → CLOSED
* PUBLISHED → QUORUM_REACHED
* CLOSED → ARCHIVED
* QUORUM_REACHED → CLOSED/ARCHIVED

Adapt the exact transitions to the existing moderation architecture.

Server-side validation is required.

---

# 6. PETITION SIGNATURES

Implement petition signing.

A user must authenticate before signing.

Do not rely on a frontend flag such as:

```text
isVerified
verified
canSign
```

The backend must determine whether the authenticated user is eligible.

---

# 7. VERIFIED SIGNATURE QUORUM

The central requirement of M15 is:

**Online petition management with verified signature quorum.**

A signature should only contribute to the verified quorum when it satisfies the project's verification requirements.

Use the existing M14 verification system.

Do not create a second identity verification system.

Conceptually:

```text
Authenticated User
       ↓
Verification Status
       ↓
Eligibility Check
       ↓
Petition Signature
       ↓
Verified Signature Count
       ↓
Quorum Calculation
```

Clearly distinguish:

* total signatures
* eligible signatures
* verified signatures
* invalid/revoked signatures

Only valid eligible signatures should count toward the verified quorum.

---

# 8. DUPLICATE SIGNATURE PROTECTION

A user must not be able to increase the quorum by signing the same petition repeatedly.

Enforce this at the database level where possible.

Use an appropriate unique constraint such as:

```text
petition_id + user_id
```

Do not rely solely on frontend checks.

Handle concurrent signing safely.

Two simultaneous requests from the same user must not produce two valid signatures.

---

# 9. SIGNATURE WITHDRAWAL

If the product requirements allow signature withdrawal, implement it safely.

When a signature is withdrawn:

* preserve the audit history
* remove it from the active verified quorum
* do not silently delete historical records
* record who performed the action
* record when it occurred

If the existing product design does not support withdrawal, document that decision rather than inventing a conflicting workflow.

---

# 10. QUORUM CALCULATION

Quorum must be calculated from authoritative backend data.

Do not trust a frontend-provided signature count.

For example:

```text
verified_signature_count >= required_quorum
```

The backend must determine:

* required quorum
* current verified signatures
* whether quorum has been reached

The frontend only displays the result.

If quorum is reached:

* update the petition state according to the defined lifecycle
* create an audit event
* notify appropriate authorized parties if existing notification infrastructure supports this
* prevent inconsistent repeated quorum events

Do not fabricate government responses or outcomes.

Reaching quorum means the petition reached its configured signature threshold.

It does not mean the requested action was accepted.

---

# 11. PETITION MODERATION

Integrate petitions with the existing moderation and administration systems.

Authorized moderators/admins should be able to:

* review petitions
* approve publication
* reject petitions
* close petitions
* archive petitions where authorized
* inspect signature statistics
* inspect audit history

Do not expose private user information unnecessarily.

---

# 12. PETITION PUBLIC VIEW

Create a public-facing petition experience.

Users should be able to see appropriate information such as:

* petition title
* summary
* description
* purpose
* category
* relevant county
* target authority
* current status
* verified signature count
* required quorum
* progress toward quorum
* opening date
* closing date

Do not publicly expose:

* email addresses
* authentication information
* identity documents
* tokens
* internal moderation notes
* private audit information
* unnecessary personal information of signatories

The petition page should communicate facts clearly without political persuasion.

---

# 13. SIGNATURE PRIVACY

Do not expose a public list containing unnecessary personal information about people who signed a petition.

If the product displays participation information, use privacy-preserving representations where appropriate.

For example:

```text
Verified signatures: 1,284
Required quorum: 2,000
```

rather than exposing private account information.

Follow existing privacy/security architecture.

---

# 14. COUNTY BUDGET HEARING SCHEDULES

Implement county budget consultation/public participation hearing schedules.

Authorized administrators or appropriate county liaison roles should be able to create and manage hearings.

A hearing should support fields such as:

* title
* county
* ward/sub-county where applicable
* description
* date
* start time
* end time
* venue
* participation instructions
* contact information where appropriate
* publication status
* created by
* updated by
* timestamps

Reuse the existing county structure.

---

# 15. HEARING LIFECYCLE

Support appropriate states such as:

```text
DRAFT
PUBLISHED
ONGOING
COMPLETED
CANCELLED
ARCHIVED
```

Do not allow invalid transitions.

Automatically determine time-based states only where this matches the existing architecture.

Do not create fake or automatically invented government hearing information.

The system should manage information entered by authorized users.

---

# 16. HEARING PUBLIC PAGE

Provide a clear public page for published hearings.

Display:

* county
* hearing title
* date
* time
* venue
* purpose
* participation instructions
* relevant consultation information
* current status

Allow appropriate search/filtering.

Useful filters may include:

* county
* date
* status

Do not introduce political recommendations or ranking of hearings.

---

# 17. COUNTY-SCOPED ADMINISTRATION

County liaison users must only be able to manage resources within their authorized geographic scope.

For example:

```text
County Liaison — Mombasa
        ↓
Mombasa resources only
```

Never rely on the frontend to enforce this.

The backend must verify county ownership/scope on every relevant request.

Do not trust:

```text
county_id
role
isCountyAdmin
```

provided by the client.

Use the authenticated user's server-side authorization context.

---

# 18. CITIZEN LEGISLATIVE FEEDBACK

Implement a structured mechanism for citizens to submit feedback on legislative/public-policy items supported by the platform.

A feedback record may include:

* legislative item
* title/reference
* feedback text
* category
* county/location where appropriate
* submission status
* moderation status
* creator
* timestamps

Reuse existing civic content models if applicable.

Do not create duplicate legislative content structures if one already exists.

---

# 19. FEEDBACK MODERATION

Citizen legislative feedback must pass through appropriate validation and moderation controls.

Support statuses such as:

```text
SUBMITTED
UNDER_REVIEW
PUBLISHED
REJECTED
WITHDRAWN
ARCHIVED
```

Use existing project conventions if available.

Moderators/admins should be able to:

* review feedback
* approve appropriate public feedback
* reject inappropriate submissions
* archive records where authorized
* view moderation history

Keep moderation decisions auditable.

---

# 20. FEEDBACK SAFETY AND NEUTRALITY

The system must not be designed to manipulate citizens toward a political position.

Feedback functionality should support participation and collection of viewpoints.

Do not:

* rank political opinions as better/worse
* recommend which political position users should support
* artificially amplify one political position
* fabricate public support
* generate fake citizen comments
* manufacture petition signatures
* alter citizen submissions to change their meaning

AI-assisted features, if already present elsewhere in the platform, must preserve the user's meaning and clearly distinguish generated summaries from original submissions.

---

# 21. DATABASE DESIGN

Inspect the current schema before creating tables.

Create only the necessary M15 entities.

Potential entities include:

```text
petitions
petition_signatures
petition_audit_events

budget_hearings

legislative_items
legislative_feedback
legislative_feedback_audit
```

Use the project's actual naming conventions.

Important constraints should include:

* valid foreign keys
* unique petition/user signature
* valid statuses
* valid user references
* valid county references
* timestamps
* appropriate indexes

Use transactions for operations that update multiple related records.

---

# 22. API DESIGN

Follow the existing API architecture.

Possible endpoints include:

## Petitions

```text
GET    /api/petitions
GET    /api/petitions/:id
POST   /api/petitions
PATCH  /api/petitions/:id
POST   /api/petitions/:id/publish
POST   /api/petitions/:id/sign
DELETE /api/petitions/:id/sign
POST   /api/petitions/:id/close
GET    /api/petitions/:id/signatures
GET    /api/petitions/:id/audit
```

## Budget hearings

```text
GET    /api/budget-hearings
GET    /api/budget-hearings/:id
POST   /api/budget-hearings
PATCH  /api/budget-hearings/:id
POST   /api/budget-hearings/:id/publish
POST   /api/budget-hearings/:id/cancel
```

## Legislative feedback

```text
GET    /api/legislative-items/:id/feedback
POST   /api/legislative-items/:id/feedback
PATCH  /api/legislative-feedback/:id
POST   /api/legislative-feedback/:id/review
```

These are examples only.

If equivalent routes already exist, extend them instead of creating duplicates.

---

# 23. AUTHORIZATION

Apply the existing M14 authorization model.

Possible access model:

```text
Citizen
  → View public participation information
  → Sign eligible petitions
  → Submit legislative feedback

Moderator
  → Moderate participation content
  → Review petitions/feedback according to permissions

Analyst
  → Access authorized participation statistics/insights

County Liaison
  → Manage authorized county hearing information

Admin
  → Full authorized management
```

Do not automatically grant permissions just because a user has a role.

Use the project's permission model.

---

# 24. AUDITING

All high-impact administrative actions must be auditable.

Record events such as:

* petition created
* petition published
* petition rejected
* petition closed
* petition signed
* signature withdrawn
* quorum reached
* hearing created
* hearing published
* hearing changed
* hearing cancelled
* feedback submitted
* feedback moderated
* feedback rejected
* feedback archived

Audit records should include appropriate:

* actor
* action
* resource
* timestamp
* relevant metadata
* outcome

Never log:

* passwords
* tokens
* API keys
* identity documents
* unnecessary sensitive personal information

---

# 25. NOTIFICATIONS

Inspect the existing M13 notification system.

Reuse it where appropriate.

Potential notifications include:

* petition quorum reached
* published hearing
* hearing update/cancellation
* relevant participation updates

Do not create a second notification system.

Respect existing subscription and notification preferences.

Do not spam users.

---

# 26. FRONTEND

Integrate M15 into the existing CivicWatch UI.

Possible navigation:

```text
Participation
├── Petitions
├── Public Hearings
└── Legislative Feedback
```

Administrative navigation may include:

```text
Administration
├── Petitions
├── Hearings
└── Legislative Feedback
```

Use the existing CivicWatch branding.

Important visual requirements:

* no gradients
* professional civic design
* clear typography
* strong readability
* responsive layouts
* mobile-friendly
* accessible controls
* consistent buttons/forms/cards
* clear status indicators
* existing logo/colors

Do not redesign unrelated parts of the application.

---

# 27. ACCESSIBILITY

Ensure M15 interfaces support:

* keyboard navigation
* visible focus states
* semantic headings
* accessible form labels
* useful error messages
* sufficient contrast
* screen-reader-friendly controls
* responsive mobile layouts

---

# 28. SECURITY

Perform security review specifically for M15.

Test for:

* broken access control
* privilege escalation
* IDOR
* duplicate signatures
* concurrent signature requests
* unauthorized county access
* unauthorized petition editing
* unauthorized hearing editing
* unauthorized feedback moderation
* SQL injection
* XSS
* CSRF where applicable
* mass assignment
* parameter tampering
* invalid state transitions
* quorum manipulation
* fake verification claims
* sensitive information exposure
* audit bypass

Never trust client-provided:

```text
role
user_id
county_id
verified
signature_count
quorum_reached
status
```

The server must calculate and enforce authoritative values.

---

# 29. TESTING

Implement automated tests appropriate to the existing project.

At minimum test:

## Petitions

* creation
* validation
* publication
* public retrieval
* authorized signing
* duplicate signing prevention
* verified signature counting
* quorum calculation
* closing
* authorization

## Hearings

* creation
* publication
* public retrieval
* county scoping
* update authorization
* cancellation
* status transitions

## Legislative feedback

* submission
* validation
* moderation
* publication
* authorization
* audit

## Security

* unauthenticated access
* unauthorized access
* privilege escalation
* county boundary violations
* IDOR
* mass assignment
* duplicate signatures
* quorum manipulation

---

# 30. REGRESSION TESTING

Do not only test M15.

Run regression tests for M1–M14.

Pay particular attention to:

* authentication
* role management
* verification
* county access
* reports
* sensitive cases
* alerts
* intelligence
* notifications
* audit logging
* administration

M15 must not break existing functionality.

---

# 31. DOCUMENTATION

Update:

```text
docs/MILESTONES.md
```

M15 must be documented exactly as:

```text
Milestone 15 — Civic Participation & Petitions

Public participation hearings, citizen petitions, and county budget consultation forums belong to Milestone 15.

Scheduled Capabilities:

- Online petition management with verified signature quorum
- County budget hearing schedules
- Citizen legislative feedback
```

Document the implemented technical details separately without changing the authoritative three-capability definition.

Update relevant API/developer documentation.

Do not rewrite unrelated milestone definitions.

---

# 32. MILESTONE STATUS

Maintain the project's milestone state model.

M15 has separate states for:

```text
Implementation
Verification
Human Approval
```

Successful implementation does not automatically mean human approval.

Successful automated verification does not automatically mean human approval.

---

# 33. M15 VERIFICATION CHECKLIST

Before declaring M15 implementation complete, verify:

### Petition Management

* [ ] Petition creation works
* [ ] Petition validation works
* [ ] Petition lifecycle works
* [ ] Petition publication works
* [ ] Authenticated signing works
* [ ] Duplicate signatures are prevented
* [ ] Verified signatures are correctly counted
* [ ] Quorum is calculated server-side
* [ ] Quorum state is auditable
* [ ] Petition privacy is enforced

### Budget Hearings

* [ ] Hearing creation works
* [ ] County association works
* [ ] County scoping works
* [ ] Hearing publication works
* [ ] Public hearing page works
* [ ] Scheduling information is accurate
* [ ] Status transitions work
* [ ] Unauthorized county modification is blocked

### Legislative Feedback

* [ ] Feedback submission works
* [ ] Feedback validation works
* [ ] Moderation works
* [ ] Publication controls work
* [ ] Audit history works
* [ ] Privacy controls work

### Security

* [ ] Server-side authorization
* [ ] IDOR protection
* [ ] Privilege escalation protection
* [ ] Duplicate signature protection
* [ ] Quorum manipulation protection
* [ ] County boundary enforcement
* [ ] Input validation
* [ ] XSS protection
* [ ] SQL injection protection
* [ ] CSRF protection where applicable
* [ ] No sensitive credentials exposed
* [ ] No sensitive information in logs

### Integration

* [ ] M14 verification reused
* [ ] M14 role system reused
* [ ] M13 notifications reused where appropriate
* [ ] Existing audit system reused
* [ ] Existing county model reused
* [ ] M1–M14 regression tests pass

### UX

* [ ] Responsive
* [ ] Accessible
* [ ] No gradients
* [ ] Existing CivicWatch branding preserved
* [ ] Clear status indicators
* [ ] Clear error handling

---

# 34. HARD STOP RULE

After implementation and verification:

STOP.

Do not start M16.

Do not implement features belonging to later milestones.

Do not automatically approve M15.

Do not automatically unlock M16.

The final state must be:

```text
M15 — Civic Participation & Petitions

Implementation: COMPLETE
Verification: COMPLETE
Human Approval: PENDING

M16 — LOCKED

Waiting for explicit human approval.
```

If verification is incomplete, report:

```text
M15 Implementation: COMPLETE
M15 Verification: PENDING
M15 Human Approval: PENDING
M16: LOCKED
```

---

# 35. FINAL REPORT

Provide a concise implementation report containing:

1. Petition management
2. Verified signature/quorum system
3. Petition moderation
4. Budget hearing schedules
5. County-scoped access
6. Legislative feedback
7. Moderation
8. Database changes
9. API changes
10. Frontend changes
11. Authorization
12. Audit logging
13. Notifications
14. Security testing
15. Regression testing
16. Documentation updates
17. Known issues

Then provide:

```text
M15 Implementation: COMPLETE / INCOMPLETE
M15 Verification: COMPLETE / PENDING
M15 Human Approval: PENDING
M16: LOCKED
```

Finally:

```text
WAITING FOR EXPLICIT HUMAN APPROVAL OF M15.
```

Do not continue automatically.
