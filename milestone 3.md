# CivicWatch AI Kenya — Milestone 3

## Citizen Dashboard & Authenticated Citizen Workspace

You are continuing development of **CivicWatch AI Kenya**, a civic technology platform developed for **Open Civic Lab (OCL)**.

The following milestones are already complete:

* **M0 — Project Foundation**
* **M1 — Public Landing Page**
* **M2 — Authentication & User Identity**

Your task is now to implement **Milestone 3 only: the Citizen Dashboard**.

The dashboard must use the real authentication system from M2 and establish the authenticated citizen workspace that later milestones will extend.

Do not implement Incident Reporting yet. That belongs to M4.

---

# 1. OBJECTIVE

Create a functional, responsive Citizen Dashboard for authenticated CivicWatch users.

The dashboard should allow a logged-in citizen to:

* See a personalized welcome message
* View their basic profile information
* See high-level report statistics
* Access future CivicWatch actions
* View recent activity
* View notifications area structure
* Navigate their authenticated workspace
* Log out
* Access account/profile information
* Understand what CivicWatch can help them do

The dashboard must be structured so that M4 can add real incident reporting without redesigning the entire authenticated application.

---

# 2. EXISTING SYSTEM

Before making changes:

1. Inspect the complete current project.
2. Verify M0 still works.
3. Verify M1 still works.
4. Verify M2 authentication still works.
5. Test login before modifying the dashboard.
6. Confirm `/api/auth/me` works.
7. Confirm `AuthContext` works.
8. Confirm protected routes work.
9. Reuse the existing authentication architecture.

Do not replace working authentication.

Do not create a second authentication system.

Do not create another user table.

Do not duplicate user state unnecessarily.

---

# 3. STRICT SCOPE

Implement only:

* Citizen Dashboard
* Authenticated dashboard layout
* Sidebar/navigation
* Mobile dashboard navigation
* Dashboard overview
* User welcome section
* Profile summary
* Report statistics foundation
* Recent activity foundation
* Quick action area
* Empty states
* Loading states
* Error states
* Logout integration
* Protected dashboard route

Do NOT implement:

* Incident submission
* Report creation
* Report tracking backend
* Admin dashboard
* Notifications backend
* AI verification
* CivicWatch Map
* Civic Alerts
* Civic Participation
* AI Civic Assistant
* Analytics
* User management
* Audit logs

Future functionality can be represented through clearly labelled unavailable/coming-soon states where appropriate.

---

# 4. DASHBOARD ROUTE

Create:

```text
/dashboard
```

This route must be protected.

Unauthenticated users must be redirected to:

```text
/login
```

Authenticated users must be allowed to access the dashboard.

Do not trust frontend state alone for authentication.

The existing M2 authentication mechanism must remain authoritative.

---

# 5. DASHBOARD LAYOUT

Create a dedicated authenticated layout.

For example:

```text
frontend/src/layouts/CitizenLayout.jsx
```

The layout should provide:

```text
┌─────────────────────────────────────────────┐
│ Header / Mobile Navigation                  │
├──────────────┬──────────────────────────────┤
│              │                              │
│ Sidebar      │ Main Dashboard Content       │
│              │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

On mobile, the sidebar should become an appropriate mobile navigation.

Do not create a desktop-only dashboard.

---

# 6. DASHBOARD NAVIGATION

The citizen navigation should contain items such as:

```text
Dashboard
My Reports
Report an Issue
Notifications
Profile
```

Important:

Only **Dashboard** and **Profile** need to be fully functional in M3.

The following belong to future milestones:

```text
My Reports        → M5
Report an Issue   → M4
Notifications     → M8
```

Do not create fake functionality for these features.

Where necessary, show a controlled "Coming Soon" state or route placeholder.

The navigation structure should make it easy for later milestones to activate these items.

---

# 7. BRANDING

Keep the visual identity established in M1.

Use:

* Deep green
* White
* Dark charcoal/black
* Restrained warm neutrals
* Red only for urgent/error states

Do not introduce gradients.

Do not introduce excessive colors.

Do not make the dashboard visually unrelated to the landing page.

---

# 8. HEADER

Create a dashboard header containing:

* CivicWatch AI Kenya branding
* Page/context title where appropriate
* Notification placeholder
* User profile control
* Logout action

The notification control should not pretend notifications already exist.

If clicked before M8, it may display an appropriate empty/coming-soon state.

---

# 9. USER WELCOME SECTION

Display the authenticated user's actual name.

Example:

```text
Welcome back, Victor
```

Use the real user information obtained through M2.

Do not hardcode:

```text
Victor
```

The dashboard should work correctly for any authenticated user.

Include a short supporting message such as:

> Stay informed, participate in civic life, and keep track of the issues you raise.

Do not make unsupported claims about government action.

---

# 10. DASHBOARD SUMMARY CARDS

Create summary cards for:

```text
Reports Submitted
Under Review
In Progress
Resolved
```

However, M3 does not yet have the reporting system.

Therefore:

### IMPORTANT

Do not create fake report counts.

Do not display fake values such as:

```text
12
5
3
4
```

Instead, establish a clean empty-state presentation such as:

```text
Reports Submitted
0

No reports yet
```

or another honest representation based on actual available data.

Do not create the reports table yet.

M4 will introduce real reports and M5 will introduce report tracking.

---

# 11. DASHBOARD QUICK ACTIONS

Create a Quick Actions section.

Potential actions:

### Report an Issue

Future M4 feature.

### View My Reports

Future M5 feature.

### Verify Information

Future M9 feature.

### View Civic Alerts

Future M11 feature.

For M3:

* Do not implement these modules.
* Do not create fake submissions.
* Do not call nonexistent APIs.
* Clearly indicate unavailable features where necessary.

You may provide a "Coming Soon" treatment.

The dashboard should visually communicate the future workflow without pretending it is already implemented.

---

# 12. PROFILE SUMMARY

Create a profile section using real M2 user data.

Display appropriate information such as:

```text
Full Name
Email
Phone
County
Ward
Account Role
Account Status
```

Do not expose sensitive backend information.

Do not display:

```text
password_hash
JWT
authentication token
internal database information
```

---

# 13. PROFILE PAGE

Create:

```text
/profile
```

This page must be protected.

Display the authenticated user's profile information.

For M3, profile editing is optional.

If editing is not implemented, display profile data in a clean read-only format.

Do not create a fake "Save Changes" button.

If profile editing is implemented, it must use a real backend endpoint and real database updates.

Prefer read-only profile information for M3 to keep scope controlled.

---

# 14. RECENT ACTIVITY

Create a Recent Activity section.

M3 does not yet have report activity or notifications.

Therefore, do not invent activity.

Use a proper empty state:

```text
No recent activity yet.

Your CivicWatch activity will appear here as you use the platform.
```

This section should be designed so M4/M5/M8 can populate it later.

---

# 15. EMPTY STATES

Create reusable empty-state components where appropriate.

For example:

```text
frontend/src/components/EmptyState.jsx
```

An empty state should include:

* Simple icon or visual
* Clear title
* Short explanation
* Optional action

Do not use empty states as an excuse to create fake functionality.

---

# 16. LOADING STATES

Create appropriate loading states.

When the dashboard is loading authenticated user information:

Show a meaningful loading state.

Do not briefly display:

```text
Welcome back, undefined
```

or an empty dashboard before user information arrives.

Use the authentication context's loading state appropriately.

---

# 17. ERROR STATES

If the authenticated user cannot be loaded:

Show a clear error message.

For example:

```text
We couldn't load your account information.

Please try again.
```

Provide an appropriate retry action.

Do not expose:

```text
SQL errors
JWT errors
stack traces
database connection errors
```

to the user.

---

# 18. SESSION EXPIRATION

If the backend reports that authentication is no longer valid:

1. Clear the frontend authentication state.
2. Redirect the user to `/login`.
3. Optionally preserve a safe return destination.

Do not leave the dashboard visible as if the user is still authenticated.

Do not create a second token/session mechanism.

---

# 19. LOGOUT

The dashboard must provide a real logout action.

Use the M2 logout implementation.

After logout:

```text
Dashboard
   ↓
Logout
   ↓
Authentication cleared
   ↓
Redirect to /login
```

Verify that the user cannot simply navigate back to `/dashboard` and access it without authentication.

---

# 20. USER ROLE DISPLAY

Display the user's role where appropriate.

For example:

```text
Citizen
```

Do not create admin-specific controls.

Even if a database user has the Admin role, M3 should not expose Admin Dashboard functionality.

Admin functionality belongs to later milestones.

---

# 21. CITIZEN-ONLY DASHBOARD

The `/dashboard` route is intended for citizens.

Implement clean role-aware routing.

If a future user with another role attempts to use the citizen dashboard:

Do not create complex role routing now.

At minimum, structure the route protection so future milestones can introduce:

```text
Citizen → Citizen Dashboard
Admin → Admin Dashboard
Moderator → Moderator workspace
Analyst → Analyst workspace
```

without rebuilding authentication.

---

# 22. DASHBOARD COMPONENT ARCHITECTURE

Use reusable components.

A reasonable structure:

```text
frontend/src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardHeader.jsx
│   │   ├── DashboardSidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── QuickActionCard.jsx
│   │   ├── EmptyState.jsx
│   │   └── RecentActivity.jsx
│   │
│   └── ...
│
├── layouts/
│   ├── CitizenLayout.jsx
│   └── ...
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   └── ...
```

You may adjust the structure to match the existing project.

Do not create unnecessary component fragmentation.

---

# 23. DASHBOARD PAGE STRUCTURE

The dashboard should generally contain:

```text
Dashboard
│
├── Welcome section
│
├── Overview statistics
│
├── Quick actions
│
├── Recent activity
│
└── CivicWatch information / helpful section
```

The layout should prioritize the most important information.

Do not overcrowd the page.

---

# 24. CIVICWATCH INFORMATION CARD

Include a small educational/help section explaining what the citizen can use CivicWatch for.

For example:

```text
Use CivicWatch to:

• Raise civic concerns
• Follow issues you submit
• Access civic information
• Participate in consultations
• Receive relevant alerts
```

Clearly distinguish available functionality from upcoming functionality.

---

# 25. RESPONSIVE DESIGN

The dashboard must be mobile-first.

Test at:

```text
320px+
768px+
1024px+
1440px+
```

Check:

* Sidebar
* Header
* Cards
* Text
* Buttons
* Profile
* Empty states
* Tables if any
* Mobile navigation

There must be no horizontal scrolling.

---

# 26. MOBILE SIDEBAR

On small screens:

* Hide the permanent desktop sidebar.
* Provide a menu button.
* Allow users to open/close navigation.
* Close navigation after selecting a route.
* Maintain keyboard accessibility.

Do not make the mobile menu difficult to close.

---

# 27. ACCESSIBILITY

Use:

* Semantic HTML
* Proper headings
* Accessible buttons
* Keyboard navigation
* Visible focus states
* Proper labels
* Accessible navigation
* Meaningful icon labels
* Sufficient color contrast

Do not rely only on colors to communicate status.

For example, do not make:

```text
green = resolved
red = unresolved
```

without also providing text.

---

# 28. ICONS

Use the existing icon library from M1 if available.

If an icon library is already installed, reuse it.

Do not introduce another icon library unnecessarily.

Icons should support understanding, not replace text.

---

# 29. BACKEND CHANGES

Keep backend changes minimal.

M3 should primarily use:

```text
GET /api/auth/me
```

from M2.

Do NOT create the reports API.

Do NOT create notifications APIs.

Do NOT create analytics APIs.

Do NOT create admin APIs.

Do NOT create dashboard statistics endpoints backed by nonexistent data.

If the current `/api/auth/me` response lacks information required by the dashboard, make the smallest safe modification necessary.

---

# 30. DATABASE CHANGES

Do not create report-related tables.

Do not create notification tables.

Do not create analytics tables.

Do not create activity tables.

The existing `users` table from M2 remains the primary database dependency.

If no database changes are necessary, make none.

---

# 31. API SERVICE

Reuse the existing frontend API service.

Do not create multiple competing API clients.

If necessary, add methods such as:

```text
getCurrentUser()
logout()
```

to the existing service.

Do not hardcode URLs.

---

# 32. AUTH CONTEXT

Reuse the existing M2 `AuthContext`.

The dashboard should obtain user information through the authentication context.

Do not directly read JWT payloads from arbitrary components.

Do not duplicate authentication logic inside Dashboard.jsx.

---

# 33. ROUTING STRUCTURE

Create:

```text
/dashboard
/profile
```

Both must be protected.

Structure routing so future routes can easily be added:

```text
/reports
/reports/new
/notifications
/alerts
/verify
```

But do not implement them now.

---

# 34. DASHBOARD URL BEHAVIOR

If an unauthenticated user visits:

```text
/dashboard
```

redirect to:

```text
/login
```

If an authenticated user visits:

```text
/login
```

they should not unnecessarily remain on the login page.

Use appropriate authenticated redirect behavior.

Avoid redirect loops.

---

# 35. LANDING PAGE INTEGRATION

Update M1 navigation only where necessary.

When the user is authenticated:

The landing page may display:

```text
Dashboard
Logout
```

instead of:

```text
Login
Get Started
```

If this behavior is implemented, it must use the real authentication context.

Do not hardcode the state.

When logged out:

```text
Login
Get Started
```

should continue working.

---

# 36. SECURITY

Maintain all M0/M2 security controls.

Do not:

* Disable authentication middleware.
* Trust client-provided user IDs.
* Expose tokens.
* Expose password hashes.
* Expose internal errors.
* Bypass protected routes.
* Create fake authentication.
* Add insecure local authentication shortcuts.

The backend must remain the authority for authenticated identity.

---

# 37. DATA PRIVACY

Only show the authenticated user's own profile information.

Do not create public endpoints that expose users.

Do not allow a user to request another user's profile through a client-supplied ID.

The current-user endpoint should derive identity from authentication.

---

# 38. FUTURE REPORTING INTEGRATION

M4 will introduce incident reporting.

Design the dashboard so the following future flow fits naturally:

```text
Dashboard
   ↓
Report an Issue
   ↓
Incident Reporting
   ↓
Report Created
   ↓
Dashboard statistics update
```

Do not implement this flow yet.

The current dashboard should use empty states honestly.

---

# 39. FUTURE REPORT TRACKING INTEGRATION

M5 will introduce:

```text
My Reports
```

The navigation and dashboard should be ready for:

* Report count
* Recent reports
* Status summaries
* Latest report activity

Do not implement these backend features in M3.

---

# 40. FUTURE NOTIFICATIONS INTEGRATION

M8 will introduce notifications.

Leave a clear place for:

* Unread notification count
* Notification center
* Recent notifications

Do not create fake unread counts.

For now:

```text
0
```

or a clean "No notifications yet" state is acceptable only if clearly representing actual absence rather than pretending a notification backend exists.

Prefer a "No notifications yet" state until M8.

---

# 41. NO FAKE DATA

This is a strict requirement.

Do not use fake:

* Report counts
* Notification counts
* Activity
* Resolved cases
* Citizen statistics
* Civic impact numbers

The dashboard should look complete through good design and honest empty states, not invented data.

---

# 42. NO ADMIN FEATURES

Do not add:

* Admin navigation
* User management
* Report management
* Analytics charts
* System settings
* Moderation tools

Those belong to later milestones.

---

# 43. UI QUALITY

The dashboard should feel like a real product.

Use:

* Consistent spacing
* Clear cards
* Good hierarchy
* Responsive grid
* Appropriate borders
* Subtle shadows
* Strong typography
* Clear interactive states

Do not use:

* Gradients
* Excessive glass effects
* Excessive rounded containers
* Neon colors
* Excessive animation
* Generic "AI dashboard" decoration

Keep it professional and human.

---

# 44. LOADING SKELETONS

Use skeleton loading only where it improves perceived performance.

At minimum, handle the initial authenticated-user loading state cleanly.

Do not build an elaborate skeleton system if the dashboard loads quickly.

---

# 45. ERROR RECOVERY

If `/api/auth/me` fails:

Provide a clear retry mechanism.

If authentication is invalid:

Redirect to login.

If the API is temporarily unavailable:

Do not crash the entire React application.

Show a controlled error state.

---

# 46. TESTING — AUTHENTICATION

Before declaring M3 complete, verify:

### Logged out

* `/dashboard` redirects to `/login`.
* `/profile` redirects to `/login`.

### Logged in

* `/dashboard` loads.
* `/profile` loads.
* Correct user name appears.
* Correct user information appears.
* Logout works.

### Refresh

* Refreshing `/dashboard` does not incorrectly log the user out.
* Authentication state is restored correctly.

### Logout

* Logout clears authentication.
* `/dashboard` becomes inaccessible.
* `/profile` becomes inaccessible.

---

# 47. TESTING — USER DATA

Verify that:

* User name comes from the backend.
* Email comes from the backend.
* County comes from the backend.
* Ward comes from the backend.
* Role comes from the backend.
* No password/hash appears in the frontend.
* No token is displayed in the UI.

Test with more than one development account if practical.

---

# 48. TESTING — RESPONSIVE

Test:

### Mobile

* Sidebar/menu
* Header
* Cards
* Profile
* Buttons

### Tablet

* Layout
* Navigation
* Cards

### Desktop

* Sidebar
* Main content
* Card grid
* Profile

Check for horizontal overflow.

---

# 49. TESTING — ACCESSIBILITY

Test:

* Keyboard navigation
* Tab order
* Focus visibility
* Mobile menu keyboard behavior
* Button labels
* Heading hierarchy
* Screen-reader-friendly navigation where practical

---

# 50. TESTING — REGRESSION

After M3:

### M0

Confirm:

```text
GET /api/health
```

still works.

### M1

Confirm:

```text
/
```

still works.

### M2

Confirm:

```text
/login
/register
/api/auth/me
```

still work.

Do not break previous milestones.

---

# 51. DOCUMENTATION

Update documentation where appropriate.

Document:

```text
/dashboard
/profile
```

in the relevant API/architecture or frontend documentation.

Explain:

* Citizen dashboard
* Protected routes
* Authentication dependency
* Future module integration points

Do not document future modules as implemented.

---

# 52. DEVELOPMENT WORKFLOW

Follow this order:

### Step 1

Inspect the existing M0–M2 implementation.

### Step 2

Run the application.

### Step 3

Verify login.

### Step 4

Verify `/api/auth/me`.

### Step 5

Create the CitizenLayout.

### Step 6

Create dashboard route.

### Step 7

Create Dashboard page.

### Step 8

Create Profile page.

### Step 9

Create responsive navigation.

### Step 10

Add honest empty states.

### Step 11

Integrate logout.

### Step 12

Integrate M1 navigation.

### Step 13

Test authentication boundaries.

### Step 14

Test mobile and desktop layouts.

### Step 15

Test previous milestones.

### Step 16

Fix all errors.

### Step 17

Update documentation.

Do not automatically start M4.

---

# 53. DEFINITION OF DONE

M3 is complete only when:

* [ ] `/dashboard` exists.
* [ ] `/dashboard` is protected.
* [ ] `/profile` exists.
* [ ] `/profile` is protected.
* [ ] CitizenLayout exists.
* [ ] Responsive dashboard navigation exists.
* [ ] Authenticated user's real name appears.
* [ ] Real user profile information appears.
* [ ] Logout works.
* [ ] Authentication persists across refresh.
* [ ] Unauthenticated users are redirected.
* [ ] Session expiration is handled.
* [ ] Dashboard summary cards exist.
* [ ] No fake report statistics exist.
* [ ] Quick actions exist.
* [ ] Future actions are clearly unavailable/coming soon.
* [ ] Recent activity has an honest empty state.
* [ ] Profile has an honest implementation.
* [ ] Loading states work.
* [ ] Error states work.
* [ ] Mobile layout works.
* [ ] Desktop layout works.
* [ ] Accessibility basics work.
* [ ] No gradients are introduced.
* [ ] M0 health check still works.
* [ ] M1 landing page still works.
* [ ] M2 authentication still works.
* [ ] No report tables were created.
* [ ] No incident reporting was implemented.
* [ ] No admin features were implemented.
* [ ] Documentation is updated.
* [ ] No console errors remain.

---

# 54. FINAL VERIFICATION

Verify this flow:

```text
Public Landing Page
       ↓
Login
       ↓
M2 Authentication
       ↓
Authenticated User
       ↓
Citizen Dashboard
       ↓
Profile
       ↓
Logout
       ↓
Login
```

Also verify:

```text
Unauthenticated
       ↓
/dashboard
       ↓
/login
```

and:

```text
Authenticated
       ↓
Refresh /dashboard
       ↓
Still authenticated
```

All of these must use the real M2 implementation.

---

# 55. FINAL IMPLEMENTATION REPORT

When finished, provide:

```text
Milestone:
M3 — Citizen Dashboard

Frontend:
...

Components:
...

Routes:
...

Backend changes:
...

Database changes:
...

Authentication integration:
...

Protected routes:
...

Responsive testing:
...

Accessibility:
...

Regression testing:
...

Known issues:
...

M0:
Working / Not working

M1:
Working / Not working

M2:
Working / Not working

M3 status:
Complete / Incomplete

Ready for:
M4 — Incident Reporting
```

Only report functionality that was actually implemented and tested.

Do not claim future features are operational.

Stop after M3.

Do not begin M4 automatically.
