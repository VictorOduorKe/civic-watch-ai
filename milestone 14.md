# M14 — VERIFICATION & TRUST LAYER

## OBJECTIVE

Implement Milestone 14 of CivicWatch AI Kenya.

M14 introduces a structured verification and trust layer for civic information, reports, alerts, and sources.

The purpose is to make it clear:

* where civic information came from
* whether a source has been verified
* who verified information
* when verification occurred
* what evidence or references support the information
* whether information has been corrected, disputed, or withdrawn

The system must distinguish between:

1. verified information
2. unverified information
3. disputed information
4. corrected information
5. withdrawn information

IMPORTANT:

* Do NOT start M15.
* Do NOT implement the AI Civic Assistant.
* Do NOT automatically advance the roadmap.
* M14 must be implemented, tested, verified, and reported.
* After M14 verification, STOP.
* Only explicit human approval can unlock M15.

---

# 1. INSPECT THE EXISTING PROJECT FIRST

Before making changes:

1. Inspect the complete repository.
2. Read:

   * `docs/MILESTONES.md`
   * M1–M13 documentation
   * report models
   * alert models
   * user/authentication models
   * administrator functionality
   * moderation functionality
   * sensitive-case handling
   * notification system
   * audit logging
   * database migrations
   * API routes
   * frontend routes/components
   * existing source/reference fields
3. Identify any existing verification functionality.
4. Reuse existing systems wherever possible.
5. Do not create duplicate user, role, alert, report, or audit systems.

---

# 2. M14 SCOPE

Implement:

* source attribution
* source records
* source verification
* verification status
* verification workflows
* evidence/reference records
* verifier identity
* verification timestamps
* correction workflows
* dispute status
* withdrawal status
* trust indicators
* provenance information
* verification history
* audit logging
* role-based verification permissions
* citizen-facing verification information
* administrative verification management

The system must remain factual and transparent.

Do not present verification as proof that every claim in a source is universally true.

---

# 3. TRUST MODEL

Create a clear trust model.

At minimum support statuses such as:

```text
UNVERIFIED
VERIFIED
DISPUTED
CORRECTED
WITHDRAWN
```

Use enums or constants consistent with the existing project.

Do not use vague labels such as:

```text
100% TRUE
FAKE
TRUSTWORTHY PERSON
```

unless there is a documented, independently justified workflow supporting those labels.

The platform should describe what was verified rather than making broad judgments about a person or organization.

---

# 4. SOURCE ATTRIBUTION

Civic information should identify its source where appropriate.

Possible source types:

```text
GOVERNMENT
COUNTY
PUBLIC_UTILITY
CIVIL_SOCIETY
COMMUNITY
OFFICIAL_ORGANIZATION
USER_SUBMITTED
OTHER
```

Use actual source types appropriate to the project.

Each source may contain:

* source name
* organization
* source type
* official website/reference
* contact information where appropriate
* verification status
* verification date
* verifier
* notes

Do not expose private source contact information unnecessarily.

---

# 5. SOURCE RECORD

Create a reusable source entity where appropriate.

Conceptual structure:

```text id="z6a3l7"
sources
-------
id
name
organization
type
website
description
verification_status
verified_at
verified_by
created_at
updated_at
```

Adapt this to the existing database.

Do not duplicate source information across every report or alert if a reusable source relationship is appropriate.

---

# 6. SOURCE VERIFICATION

Authorized users should be able to verify a source.

A verification workflow should include:

1. identify source
2. inspect available information
3. review references
4. determine verification status
5. record verifier
6. record verification date
7. optionally record verification notes
8. preserve verification history

Do not allow ordinary citizens to mark an official source as verified without authorization.

---

# 7. VERIFICATION RECORD

Maintain historical verification records.

Conceptual structure:

```text id="o9w6s7"
verification_records
--------------------
id
source_id
status
verified_by
reason
evidence_summary
verified_at
created_at
```

If verification applies to reports or alerts directly, use appropriate relationships.

Do not overwrite the complete historical record whenever status changes.

---

# 8. VERIFICATION HISTORY

The system must preserve historical changes.

Example:

```text id="4f1xcr"
Source
County Water Department

History
--------------------------------
2026-09-10
Verified
By: Administrator

2026-09-18
Corrected source information
By: Administrator

2026-09-25
Verification reviewed
By: Moderator
```

Do not allow administrators to silently erase verification history.

Historical records should be append-only wherever practical.

---

# 9. REPORT VERIFICATION

Integrate verification with civic reports where appropriate.

A report may have:

```text id="k6qg31"
Unverified
Under review
Verified
Disputed
Resolved
```

Do not confuse:

**Verification status**

with:

**Case/report status**

For example:

```text
Report status:
IN_PROGRESS

Verification status:
VERIFIED
```

These are different concepts.

A verified report does not automatically mean that the underlying civic issue has been resolved.

---

# 10. ALERT VERIFICATION

Integrate verification with M11 Civic Alerts.

An alert may have:

```text id="t8m8ce"
source
verification status
verification date
verifier
references
```

Public-facing alerts should clearly indicate their verification/source status where appropriate.

Do not modify the M11 publication workflow unnecessarily.

Verification should complement publication controls rather than replace them.

---

# 11. COMMUNITY-SUBMITTED INFORMATION

Community submissions should be clearly distinguished from officially sourced information.

For example:

```text id="a9f5pm"
Source:
Community submission

Verification:
Unverified
```

Do not make an unverified citizen submission appear to be an official government communication.

Similarly, do not automatically mark community information as false simply because it is unverified.

---

# 12. EVIDENCE & REFERENCES

Allow authorized users to associate supporting references with verification records.

References may include:

* official public documents
* official websites
* public notices
* public reports
* public datasets
* other appropriate sources

Store appropriate metadata such as:

```text id="f85j7c"
title
reference_url
description
source_type
created_at
```

Use the project's existing URL validation/security mechanisms.

Do not allow unsafe URL schemes.

Reject or sanitize:

```text id="qkq2o9"
javascript:
data:
```

where they are not appropriate.

---

# 13. SOURCE PROVENANCE

Provide provenance information.

For relevant civic information, users should be able to understand:

```text id="9s8l7r"
Where did this information come from?
Who verified it?
When was it verified?
What references were reviewed?
Has it been corrected?
```

Keep the interface understandable to ordinary citizens.

Avoid unnecessary technical terminology.

---

# 14. TRUST INDICATORS

Create clear visual indicators.

Example:

```text id="8aywtu"
✓ Verified source
```

or:

```text id="k0sl2z"
Unverified
```

or:

```text id="5eq0yq"
Verification disputed
```

or:

```text id="nj8lpo"
Corrected
```

Use accessible labels and text.

Do not rely solely on color.

Do not use trust scores such as:

```text
Trust Score: 87/100
```

unless there is a documented and transparent methodology approved for the project.

Avoid creating a misleading numerical authority score.

---

# 15. VERIFICATION DETAILS UI

When users open verification details, show information appropriate to their access level.

Example:

```text id="8y8q0b"
Verification

Status:
Verified

Source:
Mombasa County Government

Verified:
03 October 2026

Verified by:
Authorized CivicWatch administrator

References:
2 public references

Last reviewed:
03 October 2026
```

Do not expose private administrator information beyond what the project's privacy rules allow.

---

# 16. DISPUTE WORKFLOW

Allow appropriate users to flag information for review.

A dispute should NOT automatically change verified information to false.

Instead:

```text id="y6k0a3"
VERIFIED
    ↓
DISPUTED / UNDER REVIEW
    ↓
REVIEW
    ↓
VERIFIED / CORRECTED / WITHDRAWN
```

The exact workflow should follow the project's roles and moderation architecture.

---

# 17. CORRECTION WORKFLOW

If information is found to require correction:

1. preserve original record/history
2. record correction
3. identify what changed
4. record who made the correction
5. record correction time
6. optionally attach supporting reference
7. display appropriate correction information publicly

Do not silently edit verified information without preserving the history.

---

# 18. WITHDRAWAL WORKFLOW

Support withdrawal when information should no longer be presented as active/valid.

Withdrawal should:

* preserve historical records
* record reason where appropriate
* record authorized actor
* record timestamp
* update public status appropriately

Do not permanently destroy historical verification information merely because a record was withdrawn.

---

# 19. ADMIN VERIFICATION DASHBOARD

Create an administration interface for verification.

Possible structure:

```text id="yl3tbi"
Verification Management

[All] [Unverified] [Verified] [Disputed] [Corrected] [Withdrawn]

Search:
[________________]

--------------------------------
Source
Status
Last Verified
Verified By
Actions
--------------------------------
```

Allow authorized users to:

* inspect
* verify
* dispute
* correct
* withdraw
* review history
* inspect references

Do not provide these actions to unauthorized roles.

---

# 20. VERIFICATION QUEUE

Create a queue for information requiring review.

Possible items:

* new sources
* disputed information
* community submissions requiring verification
* alerts requiring source review
* corrected information requiring confirmation

The queue should show enough context for an authorized reviewer to act.

Do not expose sensitive case details unnecessarily.

---

# 21. ROLE-BASED ACCESS

Use the existing roles.

Do not invent new roles if current roles can support the workflow.

Potential permissions:

```text
VIEW_VERIFICATION
REVIEW_VERIFICATION
VERIFY_SOURCE
CORRECT_INFORMATION
WITHDRAW_INFORMATION
MANAGE_REFERENCES
```

Implement these through the existing authorization system.

Backend authorization is mandatory.

Do not rely only on hiding buttons in the frontend.

---

# 22. AUDIT LOGGING

Every important verification action should be auditable.

Log:

* source verification
* status changes
* disputes
* corrections
* withdrawals
* reference changes
* verification reviews

Example:

```text id="7kjw9o"
VERIFICATION_STATUS_CHANGED

Actor:
authorized user

Object:
source

Previous:
UNVERIFIED

New:
VERIFIED

Timestamp:
...

Reason:
...
```

Do not log:

* passwords
* authentication tokens
* unnecessary private data
* secret keys

---

# 23. API DESIGN

Follow existing API conventions.

Possible endpoints:

```text id="lj1v3g"
GET    /api/verification/sources
GET    /api/verification/sources/:id
POST   /api/verification/sources
PATCH  /api/verification/sources/:id

GET    /api/verification/:entityType/:entityId
POST   /api/verification/:entityType/:entityId/review
POST   /api/verification/:entityType/:entityId/verify
POST   /api/verification/:entityType/:entityId/dispute
POST   /api/verification/:entityType/:entityId/correct
POST   /api/verification/:entityType/:entityId/withdraw

GET    /api/verification/:entityType/:entityId/history
```

These are conceptual examples.

Reuse existing endpoints if appropriate.

Do not create a second API architecture.

---

# 24. API VALIDATION

Validate:

* entity IDs
* status values
* source types
* URLs
* reference information
* correction reasons
* dispute reasons
* verification notes

Reject malformed requests.

Use parameterized database queries.

Prevent:

* SQL injection
* XSS
* unsafe URLs
* unauthorized status manipulation

---

# 25. PUBLIC VERIFICATION API

Public endpoints should return only information appropriate for public users.

Example:

```json id="z5u7i4"
{
  "status": "VERIFIED",
  "source": {
    "name": "Example Public Organization",
    "type": "OFFICIAL_ORGANIZATION"
  },
  "verifiedAt": "2026-10-03",
  "references": 2
}
```

Do not expose:

* internal notes
* private reviewer data
* sensitive-case information
* internal IDs unnecessarily
* authentication information
* security metadata

---

# 26. SENSITIVE CASE PROTECTION

M7 remains authoritative.

Verification must never expose sensitive cases to unauthorized users.

Review:

* verification APIs
* public source pages
* history endpoints
* administrator interfaces
* references
* notifications
* search
* filters
* audit logs

Do not allow verification metadata to become an information leak.

---

# 27. NOTIFICATION INTEGRATION

M13 notification functionality may use verification changes where appropriate.

For example, if an already-published alert is materially corrected, the system may need to update or notify relevant users according to existing M13 rules.

However:

* do not redesign M13
* do not create a second notification system
* do not send notifications automatically for every minor verification change

Only integrate where the existing architecture supports it and where the event is appropriate.

---

# 28. SEARCH & FILTERING

The verification management interface should support:

* source
* status
* entity type
* date
* geographic area where appropriate
* reviewer
* disputed items

Use server-side filtering for large datasets.

Avoid loading the entire verification database into the browser.

---

# 29. PERFORMANCE

Review:

* verification history queries
* source queries
* administrative queues
* filtering
* search
* references

Add appropriate database indexes where necessary.

Avoid N+1 queries.

Do not fetch unnecessary private information.

---

# 30. FRONTEND DESIGN

Follow existing CivicWatch branding.

Requirements:

* no gradients
* solid colors
* existing logo
* clear verification indicators
* accessible contrast
* responsive layout
* simple language
* mobile-friendly

Do not redesign unrelated application areas.

---

# 31. ACCESSIBILITY

Verification status must not rely solely on color.

Use:

* text labels
* icons where appropriate
* accessible names
* keyboard navigation
* readable contrast
* screen-reader-friendly status information

Example:

Instead of only:

```text
[green circle]
```

use:

```text
✓ Verified
```

---

# 32. SECURITY REVIEW

Perform a security review of the new verification functionality.

Check:

### Authentication

* protected endpoints require authentication

### Authorization

* only authorized roles can verify/change status

### Input validation

* all user input validated

### SQL injection

* parameterized queries

### XSS

* safe rendering of source/reference content

### URL security

* safe URL validation

### CSRF

* follow the existing M9/M10 protections

### Rate limiting

* apply where appropriate

### Secrets

* no secrets in source code

### Logging

* no credentials/tokens in logs

---

# 33. TESTING

Create/update tests for:

### Source

* create source
* update source
* retrieve source
* source verification

### Verification

* verify
* dispute
* correct
* withdraw
* history

### Permissions

* authorized reviewer
* unauthorized citizen
* unauthorized API access
* cross-user access

### References

* valid URL
* invalid URL
* unsafe URL
* reference creation
* reference access

### Security

* SQL injection
* XSS
* CSRF
* authorization bypass
* malformed requests

### Privacy

* sensitive-case protection
* private notes protection
* internal reviewer information protection

---

# 34. REGRESSION TESTING

Verify M1–M13 still function.

At minimum check:

* authentication
* authorization
* civic reporting
* citizen dashboard
* community functionality
* sensitive-case handling
* administration
* security controls
* civic alerts
* civic insights
* notifications
* subscriptions
* milestones page

Fix M14 integration regressions where necessary.

Do not unnecessarily rewrite earlier milestones.

---

# 35. DOCUMENTATION

Update:

```text id="qj49lf"
docs/MILESTONES.md
```

M14 should eventually show:

```text id="iy2h1n"
M14 — Verification & Trust Layer

Implementation: COMPLETE
Verification: COMPLETE
Human Approval: PENDING
```

Document:

* trust statuses
* source model
* verification workflow
* dispute workflow
* correction workflow
* withdrawal workflow
* evidence/references
* permissions
* audit logging
* privacy protections
* API endpoints
* tests

---

# 36. M14 VERIFICATION CHECKLIST

## Sources

* [ ] Source records implemented
* [ ] Source attribution implemented
* [ ] Source types supported
* [ ] Source verification implemented
* [ ] Source history preserved

## Verification

* [ ] Unverified status
* [ ] Verified status
* [ ] Disputed status
* [ ] Corrected status
* [ ] Withdrawn status
* [ ] Verification timestamps
* [ ] Verification actor recorded
* [ ] Verification history preserved

## Evidence

* [ ] References supported
* [ ] URLs validated
* [ ] Unsafe URL schemes rejected
* [ ] Evidence associated with verification records

## Reports & Alerts

* [ ] Report verification integrated
* [ ] Alert verification integrated
* [ ] Verification status separated from report/case status
* [ ] Community submissions clearly identified

## Corrections

* [ ] Correction workflow
* [ ] Correction history
* [ ] Correction actor
* [ ] Correction timestamp

## Disputes

* [ ] Dispute workflow
* [ ] Review queue
* [ ] Dispute history
* [ ] No automatic false classification

## Withdrawal

* [ ] Withdrawal workflow
* [ ] Historical record preserved
* [ ] Public status updated correctly

## Security

* [ ] Authentication
* [ ] Authorization
* [ ] SQL injection protection
* [ ] XSS protection
* [ ] CSRF protection
* [ ] URL validation
* [ ] Rate limiting
* [ ] Secure logging

## Privacy

* [ ] Sensitive cases protected
* [ ] Private reviewer information protected
* [ ] Internal notes protected
* [ ] No credentials exposed

## UX

* [ ] Citizen-facing trust indicators
* [ ] Verification details
* [ ] Admin verification dashboard
* [ ] Verification queue
* [ ] Search/filtering
* [ ] Responsive interface
* [ ] Accessibility
* [ ] No gradients
* [ ] CivicWatch branding preserved

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

# 37. HUMAN APPROVAL GATE

This is mandatory.

When M14 implementation and verification are complete:

STOP.

Do NOT:

* start M15
* implement the AI Civic Assistant
* unlock M15
* automatically continue
* assume human approval

The final state must be:

```text id="4j8l0s"
M14 — Verification & Trust Layer

Implementation: COMPLETE
Verification: COMPLETE
Human Approval: PENDING

Next milestone:
M15 — Advanced AI Civic Assistant

Status:
LOCKED

Waiting for explicit human approval.
```

Only an explicit human command such as:

```text id="8qj4le"
APPROVE M14
```

or:

```text id="l1m7cx"
Proceed to M15
```

may unlock M15.

These phrases must NOT unlock the next milestone:

```text id="8m5v0k"
Looks good
Okay
Continue
Done
What's next?
```

The development agent may report:

* implementation results
* files changed
* database changes
* API changes
* frontend changes
* verification results
* tests
* security findings
* known issues

But the development agent must stop after M14.

---

# 38. FINAL M14 REPORT

Provide a final report containing:

## Implementation

What was implemented.

## Database

Tables/migrations changed.

## Backend

Endpoints/services added.

## Frontend

Pages/components added.

## Verification

How source and information verification works.

## Trust

How verification status is presented without misleading users.

## Security

Security checks performed.

## Privacy

How sensitive information is protected.

## Testing

Tests executed and results.

## Regression

M1–M13 verification results.

## Known Issues

Any remaining issues.

## Milestone State

```text id="x3d0nr"
M14 Implementation: COMPLETE
M14 Verification: COMPLETE/PENDING
M14 Human Approval: PENDING
M15: LOCKED
```

Then STOP.

DO NOT proceed to M15 without explicit human approval.
