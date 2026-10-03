CivicWatch AI Kenya — Milestone Tracking & Verification System

OBJECTIVE

Create a dedicated Milestones / Project Progress page inside CivicWatch AI Kenya.

The purpose of this page is to provide a permanent, visible source of truth for the project's development milestones.

The page must:

1. Display all CivicWatch milestones in order.
2. Show which milestones are completed.
3. Show the current milestone.
4. Show upcoming milestones.
5. Show the major functionality associated with each milestone.
6. Allow developers/administrators to inspect milestone verification status.
7. Prevent milestone progress from depending only on manually written text.
8. Cross-check the repository implementation before marking functionality as verified.
9. Preserve the milestone history as the project evolves.

This is a project-management and verification feature, not a citizen-facing political feature.

---

1. IMPORTANT — INSPECT BEFORE IMPLEMENTING

Before making changes:

Inspect the entire existing CivicWatch repository.

Identify:

- Frontend architecture
- Backend architecture
- Database
- Existing admin dashboard
- Existing authentication
- Existing role system
- Existing API structure
- Existing routes
- Existing components
- Existing database tables
- Existing tests
- Existing documentation
- Existing milestone-related files if any

Do NOT create duplicate functionality if an existing implementation can be reused.

Do NOT modify completed CivicWatch features unnecessarily.

---

2. MILESTONE SOURCE OF TRUTH

Create a centralized milestone definition.

Do NOT scatter milestone names and descriptions across multiple components.

Prefer a structure such as:

milestones/
  milestone definitions

or an appropriate existing project location.

The milestone definitions should contain:

id
number
title
description
status
features
verification requirements
dependencies

Example conceptual structure:

M1
Title: Foundation & Platform Setup

M2
Title: Civic Reporting

M3
Title: Civic Information & Engagement

...

M11
Title: Civic Alerts & Advisories

Use the project's actual roadmap where available.

---

3. DO NOT INVENT COMPLETION STATUS

This is extremely important.

The system must NOT automatically mark a milestone as "Completed" merely because:

- A component exists.
- A route exists.
- A database table exists.
- A button exists.
- A developer wrote "completed" in a README.
- A feature name appears in source code.

Completion must be based on defined verification criteria.

---

4. MILESTONE STATUS MODEL

Support at least:

NOT_STARTED
IN_PROGRESS
IMPLEMENTED
VERIFIED
BLOCKED

Use:

NOT_STARTED

No meaningful implementation has begun.

IN_PROGRESS

Work has started but is incomplete.

IMPLEMENTED

The required functionality appears to exist but has not yet been fully verified.

VERIFIED

The required functionality has been inspected and the defined verification checks have passed.

BLOCKED

Implementation or verification cannot currently be completed because of a known blocker.

---

5. MILESTONE PAGE

Create a dedicated page such as:

/milestones

Use the application's existing routing conventions.

The page should contain:

Header

CivicWatch AI Kenya
Project Milestones

Track implementation, verification and project progress.

Then display an overall progress summary.

Example:

Project Progress

11 / 17 Milestones

████████████░░░░░

Verified: 10
Implemented: 1
In Progress: 0
Blocked: 0
Upcoming: 6

Do NOT hardcode these numbers.

Calculate them from the milestone data.

---

6. MILESTONE TIMELINE

Display milestones in chronological order.

Example:

M1  ✓ Verified
Foundation & Platform Setup

M2  ✓ Verified
Civic Reporting

M3  ✓ Verified
Civic Information & Engagement

M4  ✓ Verified
Authentication & Access Control

...

M9  ✓ Verified
Privacy & Security

M10 ✓ Verified
Production Security Hardening

M11 ● Current
Civic Alerts & Advisories

M12 ○ Upcoming
...

M13 ○ Upcoming
...

Use clear visual status indicators.

Do not rely on color alone.

---

7. MILESTONE DETAILS

Clicking a milestone should open a detailed view.

Display:

Milestone

M11 — Civic Alerts & Advisories

Objective

Explain what the milestone is intended to accomplish.

Features

Display the major functionality.

Verification Requirements

Show what must be checked before the milestone can become VERIFIED.

Dependencies

Show previous milestones that this milestone depends upon.

Current Status

Display:

Not Started
In Progress
Implemented
Verified
Blocked

Verification

Display:

Last verified:
Date/time

Verified by:
System / Administrator

Verification result:
PASS / PARTIAL / BLOCKED

---

8. FEATURE CHECKLIST

Every milestone should have a checklist.

For example:

M11 — Civic Alerts & Advisories

☐ Official county alerts
☐ Government advisories
☐ Utility downtime broadcasts
☐ Community advisories
☐ Alert categories
☐ Alert severity
☐ Geographic targeting
☐ Verification status
☐ Alert expiration
☐ Alert administration
☐ Audit trail
☐ Citizen alert feed

The actual checklist must come from the milestone definition.

Do NOT create fake completed checkboxes.

---

9. AUTOMATED VERIFICATION

Where technically possible, the milestone system should inspect the actual application.

Examples:

Frontend checks

Check whether expected routes/components exist.

Backend checks

Check whether required API routes exist.

Database checks

Check whether required tables/migrations exist.

Tests

Check whether relevant tests exist and pass.

Configuration checks

Check whether required environment variables/configuration exists.

Security checks

Check whether required security controls exist where applicable.

Do NOT use superficial filename matching as the only verification mechanism.

---

10. VERIFICATION ENGINE

Create a reusable verification mechanism.

Conceptually:

verifyMilestone(milestoneId)

It should return something like:

{
  milestone: "M11",
  status: "IMPLEMENTED",
  checks: [
    {
      name: "Alert API",
      status: "PASS"
    },
    {
      name: "Alert database model",
      status: "PASS"
    },
    {
      name: "Admin alert management",
      status: "PASS"
    },
    {
      name: "Automated tests",
      status: "FAIL"
    }
  ]
}

Use the project's actual architecture.

Do not expose internal implementation details to normal public users.

---

11. MANUAL VERIFICATION

Some requirements cannot reliably be verified automatically.

For those, support manual verification.

Example:

Manual verification required

☐ Mobile layout verified
☐ User workflow verified
☐ Accessibility verified
☐ External source attribution verified

Only an authorized administrator/developer should be able to mark these as verified.

---

12. ADMIN CONTROLS

The milestone verification controls should be restricted.

Normal citizens should NOT be able to:

- Change milestone status
- Mark milestones completed
- Modify verification results
- Modify milestone definitions

Only authorized project administrators should have access.

---

13. IMMUTABLE VERIFICATION HISTORY

When a milestone changes to VERIFIED, record the event.

Store:

milestone
previous_status
new_status
verified_by
timestamp
verification_summary

Do not silently overwrite the previous verification history.

This allows the project team to understand how progress changed over time.

---

14. REGRESSION DETECTION

A particularly important feature:

A milestone that was previously VERIFIED should be able to become:

REGRESSION

if a later code change causes its required functionality to fail.

Do NOT automatically remove the historical record.

Example:

M7
Previously: VERIFIED

Current verification:
FAILED

Status:
REGRESSION

Display:

⚠ Regression detected

This prevents us from assuming that a previously completed milestone will always remain functional.

---

15. MILESTONE DEPENDENCIES

Represent dependencies.

Example:

M4
  ↓
M5
  ↓
M7
  ↓
M9

If a milestone depends on another milestone that is not verified, display:

Dependency not verified

Do not automatically prevent development unless the dependency is actually required.

---

16. CURRENT MILESTONE

The system should identify the current milestone.

For the current CivicWatch roadmap:

M11 — Civic Alerts & Advisories

The page should clearly indicate:

CURRENT MILESTONE

Do not automatically advance to M12 simply because some M11 features exist.

M11 should only move to VERIFIED when its defined verification criteria pass.

---

17. COMPLETED MILESTONES

Based on the current project development history, inspect the actual repository and compare implementation against the roadmap.

The currently expected completed milestones are:

M1
M2
M3
M4
M5
M6
M7
M8
M9
M10

However:

IMPORTANT:

Do not blindly mark them VERIFIED.

Inspect the implementation and verification evidence.

If a milestone cannot be verified, use:

IMPLEMENTED

or:

PARTIALLY VERIFIED

rather than falsely claiming completion.

---

18. CURRENT M11

M11 is:

Civic Alerts & Advisories

Its intended functionality includes:

- Official county alerts
- Government advisories
- Utility downtime broadcasts
- Public safety notices
- Community advisories
- Alert categories
- Severity
- Geographic targeting
- Source attribution
- Verification
- Expiration
- Alert feed
- Administrative publishing
- Audit trail
- Appropriate notifications

Inspect what is actually implemented.

Do not assume all of these are already complete.

---

19. UPCOMING MILESTONES

The page must support future milestones without requiring the component to be rewritten.

Do not hardcode the UI around M11.

New milestones should be able to be added to the centralized milestone definition.

---

20. PROJECT DASHBOARD SUMMARY

At the top of the page display:

Total Milestones
Verified
Implemented
In Progress
Blocked
Regressions
Current Milestone

Calculate these dynamically.

---

21. PROGRESS CALCULATION

Do NOT simply calculate progress based on the number of milestones that contain code.

Use verified milestone status.

Example:

Verified milestones / Total milestones × 100

Display the result clearly.

If a milestone is merely IMPLEMENTED, it should NOT count as VERIFIED progress.

---

22. SEARCH & FILTERING

Allow administrators to filter:

All
Verified
Implemented
In Progress
Blocked
Regression
Upcoming

Allow milestone search.

---

23. RESPONSIVE DESIGN

The milestone page must work on:

- Mobile
- Tablet
- Desktop

The timeline and checklists must remain readable on small screens.

---

24. ACCESSIBILITY

Ensure:

- Status is not represented only through color.
- Icons have accessible labels.
- Keyboard navigation works.
- Buttons have clear labels.
- Progress information is readable by assistive technologies.
- Checklists are accessible.

---

25. BRANDING

Use the existing CivicWatch branding.

Do NOT introduce:

- Gradients
- Generic SaaS dashboard styling
- Unrelated colors
- Excessive animation

Use the established CivicWatch logo, typography and color system.

---

26. SECURITY

Milestone information itself is not highly sensitive, but administrative verification controls are sensitive.

Ensure:

- Only authorized administrators can modify milestone state.
- Verification endpoints require authentication.
- Backend authorization is enforced.
- Users cannot modify "verified_by".
- Users cannot forge verification timestamps.
- Verification history cannot be modified through normal API requests.

Never trust frontend-supplied verification information.

---

27. API

If the existing architecture uses APIs for administrative functionality, implement appropriate endpoints.

Conceptually:

GET    /api/milestones
GET    /api/milestones/:id
GET    /api/milestones/:id/verification
POST   /api/admin/milestones/:id/verify
POST   /api/admin/milestones/:id/status
GET    /api/admin/milestones/history

These are conceptual examples.

Follow existing CivicWatch API conventions.

Do not create duplicate APIs.

---

28. DATABASE

Only create database tables if the existing architecture requires persistent milestone state.

Possible conceptual entities:

milestones
milestone_checks
milestone_verifications
milestone_history

Do NOT create unnecessary database complexity.

If milestone definitions can safely remain version-controlled configuration while verification history is stored separately, prefer that architecture.

---

29. DOCUMENTATION

Create/update:

docs/MILESTONES.md

This document must contain the authoritative milestone roadmap.

It should explain:

- What each milestone means.
- Its major objectives.
- Verification requirements.
- Current status.
- Dependencies.

The application milestone page should use the same source of truth.

Do not maintain two conflicting milestone lists.

---

30. MILESTONE ROADMAP

Populate the roadmap with the project's actual milestone definitions.

At minimum ensure the system supports:

M1
M2
M3
M4
M5
M6
M7
M8
M9
M10
M11 — Civic Alerts & Advisories

For M12 onward, use the project's actual roadmap if it already exists.

DO NOT invent future milestones simply to fill a number.

---

31. VERIFICATION REPORT

The administrator should be able to generate/view a verification summary:

CivicWatch AI Kenya
Milestone Verification Report

M1  VERIFIED
M2  VERIFIED
M3  VERIFIED
M4  VERIFIED
M5  VERIFIED
M6  VERIFIED
M7  VERIFIED
M8  VERIFIED
M9  VERIFIED
M10 VERIFIED
M11 IN PROGRESS

Include failed checks beneath the relevant milestone.

---

32. IMPORTANT — NO FALSE COMPLETION

The system must prioritize accuracy over a visually impressive progress percentage.

Never mark:

100% complete

unless every required milestone is actually verified.

Never mark a feature complete merely because:

"the code exists."

Completion means the implementation meets its defined acceptance criteria and has been verified.

---

33. TESTING

Test:

Citizen

- Can view milestone progress if the page is public.
- Cannot modify milestones.

Administrator

- Can inspect milestone details.
- Can run verification.
- Can review failed checks.
- Can perform manual verification where authorized.
- Can view verification history.

Security

Test:

- Unauthenticated verification request.
- Normal user verification request.
- Modified milestone ID.
- Forged verification status.
- Forged verifier identity.
- Forged timestamp.

All must be handled securely.

---

34. REGRESSION TEST

After implementation:

Run the existing CivicWatch test suite.

Verify that:

- Authentication still works.
- Authorization still works.
- Civic reporting still works.
- Sensitive-case workflows still work.
- Admin functionality still works.
- M9 security changes remain intact.
- M10 hardening remains intact.
- M11 functionality is not broken.

Do not sacrifice existing functionality to build the milestone page.

---

35. FINAL DELIVERABLE

At the end of implementation provide:

Milestone Page

URL/route:

/milestones

Documentation

docs/MILESTONES.md

Verification

Report:

M1: ...
M2: ...
M3: ...
M4: ...
M5: ...
M6: ...
M7: ...
M8: ...
M9: ...
M10: ...
M11: ...

For every milestone state:

- VERIFIED
- IMPLEMENTED
- IN PROGRESS
- BLOCKED
- REGRESSION

Do not claim VERIFIED without evidence.

Current Milestone

Clearly identify:

M11 — Civic Alerts & Advisories

if M11 remains the current milestone.

---

SUCCESS CRITERIA

This milestone is complete when:

- A dedicated Milestones page exists.
- The roadmap is centralized.
- M1–M11 can be tracked.
- Completed milestones are verified against actual implementation.
- M11 is correctly identified as Civic Alerts & Advisories.
- The page clearly distinguishes verified from merely implemented work.
- Verification checks are visible.
- Failed checks are visible.
- Verification history is preserved.
- Regression detection is supported.
- Only authorized administrators can modify verification status.
- Progress is calculated dynamically.
- The page is responsive.
- Existing CivicWatch functionality remains intact.
- "docs/MILESTONES.md" exists as project documentation.
- No milestone is falsely marked as completed.

FINAL RULE

From this point forward, the Milestones page and "docs/MILESTONES.md" must be treated as the project's single source of truth for milestone progress.

Before beginning any future milestone:

1. Open the Milestones page.
2. Confirm the previous milestone is VERIFIED.
3. Review its failed/remaining checks.
4. Confirm the next milestone.
5. Only then begin implementation.

This prevents milestone drift and prevents the development roadmap from being lost as the project grows.