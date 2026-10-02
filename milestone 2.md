# CivicWatch AI Kenya — Milestone 2

## Authentication & User Identity

You are continuing development of **CivicWatch AI Kenya**, a civic technology platform developed for **Open Civic Lab (OCL)**.

**Milestone 0 — Project Foundation is complete.**

**Milestone 1 — Public Landing Page is complete.**

Your task is now to implement **Milestone 2 only: Authentication and User Identity**.

Do not implement the Citizen Dashboard, Incident Reporting, Admin Dashboard, Notifications, AI Verification, Maps, Alerts, Civic Participation, or any other future module.

The authentication system created here will become the foundation for Milestone 3 and later protected features.

---

# 1. OBJECTIVE

Build a secure, functional authentication system that allows users to:

* Create an account
* Verify required registration information
* Log in
* Remain authenticated across page navigation and refreshes
* Log out
* Retrieve their authenticated profile
* Access protected frontend routes
* Receive appropriate authorization based on their role

The system must use real MySQL data.

Do not use mock users.

Do not use hardcoded credentials.

Do not store plaintext passwords.

---

# 2. EXISTING SYSTEM

Before changing anything:

1. Inspect the current project.
2. Confirm M0 foundation is still working.
3. Confirm M1 landing page is still working.
4. Understand the existing frontend architecture.
5. Understand the existing backend architecture.
6. Reuse the existing API service.
7. Reuse existing security middleware.
8. Reuse existing database connection pool.
9. Reuse the existing routing structure where appropriate.

Do not rewrite working M0/M1 code unnecessarily.

If M0 or M1 is broken, fix the issue before continuing with M2.

---

# 3. TECHNOLOGY

Continue using:

## Frontend

* React
* Vite
* JavaScript
* JSX
* React Router
* Tailwind CSS
* Existing API client

## Backend

* Node.js
* Express.js
* JavaScript
* mysql2
* bcrypt
* JWT
* Zod
* Helmet
* CORS
* express-rate-limit

## Database

* MySQL 8+

Do not introduce TypeScript.

Do not use Docker.

---

# 4. AUTHENTICATION ARCHITECTURE

Use this architecture:

```text
React
   |
   | HTTP
   ↓
Express API
   |
   ├── Authentication Middleware
   |
   ├── Controllers
   |
   ├── Services
   |
   └── MySQL
```

The authentication flow should be:

```text
Registration
    ↓
Validate input
    ↓
Check existing account
    ↓
Hash password
    ↓
Create user
    ↓
Return safe user information
```

Login:

```text
Email + Password
       ↓
Validate input
       ↓
Find user
       ↓
Compare password hash
       ↓
Generate authentication token
       ↓
Return authenticated session/token
```

Protected request:

```text
Client
  ↓
Authentication token
  ↓
Authentication middleware
  ↓
Identify user
  ↓
Protected controller
```

---

# 5. DATABASE CHANGES

This milestone is the first milestone that should introduce actual application data tables.

Create an incremental migration for the users table.

Do not create tables for future modules.

---

## Users table

Create a `users` table containing appropriate fields such as:

```text
id
full_name
email
phone
password_hash
county
ward
role
is_active
email_verified
created_at
updated_at
last_login_at
```

You may adjust field names/types if there is a strong technical reason.

Use appropriate MySQL data types.

---

# 6. USER ID

Use an appropriate primary key.

A numeric auto-incrementing ID is acceptable for the MVP.

Do not expose unnecessary internal database details to users.

If a UUID strategy is selected instead, use it consistently.

Do not introduce unnecessary complexity.

---

# 7. EMAIL

Email must be unique.

Normalize email addresses before storage and authentication.

At minimum:

* Trim whitespace.
* Convert to lowercase.

For example:

```text
Victor@example.com
```

should be treated consistently with:

```text
victor@example.com
```

Do not store duplicate accounts because of email casing.

---

# 8. PHONE

Phone should be stored in a consistent format.

For the MVP, accept a reasonable phone format and validate it.

Do not make phone verification part of this milestone.

Do not send SMS.

Do not integrate WhatsApp.

Do not build OTP functionality.

---

# 9. COUNTY AND WARD

Registration should include:

* County
* Optional ward

Do not create a complicated geographic database yet.

Use simple validated fields for now.

A future milestone can introduce more structured location data if required.

---

# 10. ROLES

Create the initial roles:

```text
Citizen
Admin
Moderator
Analyst
```

However, do not build administrative features yet.

The default role for public registration must always be:

```text
Citizen
```

A user must never be able to select:

```text
Admin
Moderator
Analyst
```

during public registration.

Do not accept a client-supplied role as authoritative.

For example, never trust:

```json
{
  "role": "Admin"
}
```

from a registration request.

The backend must determine the initial role.

---

# 11. ROLE AUTHORIZATION FOUNDATION

Create reusable authorization middleware.

For example:

```text
requireAuth
requireRole
```

The middleware should make it possible for future milestones to protect routes.

Example concept:

```text
requireAuth
```

means:

> The user must be authenticated.

And:

```text
requireRole("Admin")
```

means:

> The user must be authenticated and have the required role.

Do not create an Admin dashboard yet.

---

# 12. PASSWORD SECURITY

Passwords must never be stored as plaintext.

Use:

```text
bcrypt
```

or bcryptjs if required by the environment.

Hash passwords before database insertion.

Use an appropriate work factor.

Do not log:

* Passwords
* Password hashes
* Login credentials

Do not return `password_hash` from any API response.

---

# 13. PASSWORD REQUIREMENTS

Create reasonable password validation.

Require at least:

* Minimum length
* Confirmation password during registration

Avoid unnecessarily complicated password rules that users cannot realistically remember.

Do not store password confirmation.

The confirmation field exists only for validation.

---

# 14. REGISTRATION API

Create:

```text
POST /api/auth/register
```

Expected information should include:

```text
fullName
email
phone
password
confirmPassword
county
ward
```

Validate using Zod.

The backend must independently validate all values.

Never rely only on frontend validation.

---

# 15. REGISTRATION PROCESS

The backend should:

1. Validate request body.
2. Normalize email.
3. Validate password.
4. Check whether email already exists.
5. Hash password.
6. Set role to `Citizen`.
7. Set account active state appropriately.
8. Create user.
9. Return safe user information.

Never return:

```text
password
password_hash
JWT secret
internal security information
```

---

# 16. DUPLICATE ACCOUNT HANDLING

If an email already exists:

Return a clear error.

Do not create another account.

Do not expose unnecessary information about the existing user's account.

Use a consistent API error structure.

---

# 17. LOGIN API

Create:

```text
POST /api/auth/login
```

Accept:

```text
email
password
```

Process:

1. Validate input.
2. Normalize email.
3. Find user.
4. Check account status.
5. Compare password hash.
6. Update last login timestamp.
7. Generate authentication token.
8. Return safe user information.

---

# 18. LOGIN SECURITY

Do not reveal whether a specific email exists.

Avoid responses such as:

```text
Email does not exist
```

Use a generic authentication error such as:

```text
Invalid email or password
```

This reduces account enumeration.

---

# 19. ACCOUNT STATUS

If:

```text
is_active = false
```

the user must not be able to authenticate normally.

Do not delete inactive users automatically.

Future admin functionality will handle account management.

---

# 20. JWT

Use JWT for the MVP authentication mechanism.

Create tokens containing only the information required to identify the user.

Do not place sensitive personal information inside the token.

Do not put:

* Password
* Password hash
* Phone number
* Private report information
* API keys

inside the JWT.

Use a configured secret from environment variables.

Never hardcode:

```text
JWT_SECRET
```

in source code.

---

# 21. JWT EXPIRATION

Use an explicit token expiration period.

Use the existing environment configuration:

```text
JWT_EXPIRES_IN
```

or an equivalent configuration.

Do not create tokens that never expire.

---

# 22. TOKEN STORAGE

Choose a secure strategy appropriate for the MVP.

Prefer an architecture that allows the authentication token to be stored in a secure, HttpOnly cookie when practical.

If the existing frontend/API architecture requires bearer tokens, implement the strategy consistently and document the security trade-offs.

Do not store authentication credentials in insecure places unnecessarily.

Do not expose tokens in URLs.

Do not place tokens in query parameters.

---

# 23. AUTHENTICATED USER ENDPOINT

Create:

```text
GET /api/auth/me
```

This endpoint must require authentication.

It should return the currently authenticated user's safe profile.

Example:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullName": "Example User",
    "email": "user@example.com",
    "phone": "...",
    "county": "...",
    "ward": "...",
    "role": "Citizen"
  }
}
```

Do not return:

```text
password_hash
```

---

# 24. LOGOUT API

Create:

```text
POST /api/auth/logout
```

The logout mechanism must actually invalidate the client's authentication state according to the chosen token strategy.

If using HttpOnly cookies:

* Clear the authentication cookie.

If using another strategy:

* Ensure the frontend removes its local authentication state securely.

Do not pretend logout happened while leaving the authentication token active in the frontend.

---

# 25. FRONTEND PAGES

Create:

```text
/login
/register
```

Use the existing CivicWatch visual language from M1.

Do not redesign the entire application.

---

# 26. REGISTRATION PAGE

Create a clean registration form containing:

* Full name
* Email
* Phone
* Password
* Confirm password
* County
* Optional ward
* Terms acceptance

Include:

```text
Create Account
```

button.

Include a link:

```text
Already have an account? Log in
```

---

# 27. TERMS CHECKBOX

Require the user to acknowledge the platform's terms/privacy notice before registration.

The backend must validate the acceptance.

Do not create a complex legal document during this milestone.

Use concise placeholder wording that can be replaced later.

Do not claim that acceptance constitutes legal advice.

---

# 28. LOGIN PAGE

Create:

* Email
* Password
* Login button

Include:

```text
Don't have an account? Create one
```

Do not implement password reset yet.

You may display:

```text
Forgot password?
```

only if it clearly indicates the functionality is not yet available.

Prefer not to show a non-functional control.

---

# 29. FORM UX

Forms must provide:

* Clear labels
* Validation messages
* Loading state
* Disabled submit button while processing
* Success/error feedback
* Accessible focus states
* Keyboard support

Do not clear the entire form unexpectedly after validation errors.

---

# 30. PASSWORD VISIBILITY

Provide a simple show/hide password control.

It should:

* Be accessible by keyboard.
* Have a meaningful accessible label.
* Not expose the password unnecessarily.

Do not log password input.

---

# 31. AUTHENTICATION CONTEXT

Create a reusable frontend authentication context/provider.

For example:

```text
frontend/src/context/AuthContext.jsx
```

It should manage:

* Current user
* Authentication state
* Loading state
* Login
* Register
* Logout
* Fetch current user

Do not duplicate authentication state across individual pages.

---

# 32. AUTH HOOK

Create a reusable hook if appropriate:

```text
useAuth()
```

It should allow components to access authentication state without directly manipulating storage or API calls.

---

# 33. PROTECTED ROUTE

Create a reusable protected-route mechanism.

For example:

```text
ProtectedRoute.jsx
```

Behavior:

```text
Not authenticated
        ↓
Redirect to /login
```

Authenticated:

```text
Authenticated
        ↓
Allow protected route
```

Do not create the actual Citizen Dashboard yet.

You may create a temporary protected test page only if necessary to verify the mechanism, but do not leave a fake dashboard behind.

Prefer testing protection through a minimal development route or clearly documented test path.

---

# 34. REDIRECT BEHAVIOR

After successful login:

Do not send users to a fake dashboard.

Use a controlled placeholder destination or a temporary protected route that clearly states:

```text
Authentication successful.
Citizen Dashboard will be implemented in Milestone 3.
```

This temporary page must not pretend to be the final dashboard.

If possible, structure the router so M3 can replace this cleanly.

---

# 35. AUTHENTICATION STATE ON REFRESH

A user who is legitimately authenticated should remain authenticated after a browser refresh according to the selected token/session strategy.

On application startup:

1. Determine whether authentication exists.
2. Request `/api/auth/me` when appropriate.
3. Restore the user state.
4. Display loading state while checking.

Do not immediately redirect to login before the authentication check completes.

---

# 36. LANDING PAGE INTEGRATION

Update M1's navigation so authentication links now work.

For example:

```text
Login
```

should navigate to:

```text
/login
```

And:

```text
Get Started
```

should navigate to:

```text
/register
```

Do not redesign the landing page unnecessarily.

Keep the M1 visual identity.

---

# 37. AUTHENTICATED NAVIGATION

Once logged in, the navigation can display appropriate authenticated information.

For example:

```text
Welcome, Victor
Logout
```

Do not implement a full user dashboard.

Keep this integration minimal.

---

# 38. SECURITY MIDDLEWARE

Create reusable authentication middleware in the backend.

For example:

```text
backend/src/middleware/authMiddleware.js
```

Responsibilities:

1. Read authentication credentials.
2. Verify token.
3. Extract user identity.
4. Attach authenticated user information to the request.
5. Reject invalid/expired authentication.

Do not trust client-supplied user IDs.

For example, do not rely on:

```json
{
  "userId": 42
}
```

to determine the authenticated user.

The authenticated identity must come from the verified authentication mechanism.

---

# 39. ROLE MIDDLEWARE

Create a reusable role-checking middleware.

Example:

```text
requireRole("Admin")
```

It should:

1. Require authentication.
2. Check the authenticated user's role.
3. Reject unauthorized roles.
4. Return an appropriate HTTP status.

Do not expose unnecessary role information.

---

# 40. AUTH ROUTES

Use a clean route structure such as:

```text
backend/src/routes/authRoutes.js
```

Possible endpoints:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Keep authentication controllers separate from services.

---

# 41. SERVICE LAYER

Do not put all authentication logic directly inside route handlers.

Use a service layer.

For example:

```text
backend/src/services/authService.js
```

Responsibilities can include:

* Registration logic
* Login logic
* Password verification
* Token generation
* User retrieval

Controllers should primarily handle:

* Request
* Response
* Calling services
* Error propagation

---

# 42. VALIDATION

Create authentication validators.

For example:

```text
backend/src/validators/authValidators.js
```

Use Zod for:

### Registration

Validate:

* Full name
* Email
* Phone
* Password
* Confirm password
* County
* Ward
* Terms acceptance

### Login

Validate:

* Email
* Password

Do not trust frontend validation.

---

# 43. DATABASE SECURITY

Use parameterized SQL queries.

Never construct SQL using raw user input.

Bad:

```javascript
`SELECT * FROM users WHERE email = '${email}'`
```

Good:

Use parameterized queries supported by `mysql2`.

---

# 44. DATABASE INDEXES

Add an appropriate unique index for email.

Consider indexes for fields that will be frequently queried.

Do not create excessive indexes during this milestone.

---

# 45. API RESPONSE FORMAT

Use a consistent response structure.

Success:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "..."
}
```

Do not expose internal stack traces in production-style responses.

---

# 46. RATE LIMITING

Authentication endpoints need stronger rate limiting than general public API requests.

Apply appropriate limits to:

```text
POST /api/auth/login
POST /api/auth/register
```

The goal is to reduce:

* brute-force attempts
* credential stuffing
* registration abuse

Do not create limits so aggressive that normal testing becomes impossible.

Document the configuration.

---

# 47. ACCOUNT ENUMERATION

Avoid revealing whether an account exists.

Registration may need to indicate that an email cannot be reused, but login should use a generic authentication failure.

Do not provide attackers with detailed account-state information.

---

# 48. USER DATA PRIVACY

Do not display user information publicly.

Do not place registered users on the public landing page.

Do not expose:

* Email
* Phone
* Ward
* Private profile data

through public endpoints.

---

# 49. AUDIT LOGGING

Do not implement the complete audit-log module yet.

However, structure authentication code so that M16 can later record events such as:

```text
USER_REGISTERED
USER_LOGIN
USER_LOGOUT
LOGIN_FAILED
```

Do not create the full audit system now unless required by the existing architecture.

---

# 50. EMAIL VERIFICATION

Do not implement real email verification in M2 unless the existing architecture already requires it.

Do not add:

* SMTP
* Email provider
* Verification emails
* Verification tokens
* Email queues

unless specifically necessary.

The database may contain an `email_verified` field for future use.

Document that full email verification is a future enhancement.

---

# 51. PASSWORD RESET

Do not implement password reset in this milestone.

Do not create:

* reset tokens
* email reset workflow
* password reset pages
* email provider integration

Document it as future work if necessary.

---

# 52. SESSION / TOKEN SECURITY

If cookies are used:

Configure appropriate security attributes such as:

* HttpOnly
* Secure where appropriate
* SameSite

Ensure local development still works.

If bearer tokens are used instead, document the storage strategy and its limitations.

Do not put tokens into:

* URLs
* query strings
* page content

---

# 53. FRONTEND SECURITY

Never expose:

```text
JWT_SECRET
DB_PASSWORD
GEMINI_API_KEY
```

through Vite frontend variables.

Remember that `VITE_*` variables are exposed to browser code.

Only expose values that are intentionally public.

---

# 54. TESTING — BACKEND

Test at minimum:

### Registration

* Valid registration
* Missing full name
* Invalid email
* Weak password
* Password mismatch
* Missing county
* Duplicate email
* Invalid phone
* Terms not accepted
* Attempt to submit Admin role

### Login

* Correct credentials
* Wrong password
* Unknown account
* Inactive account
* Missing fields
* Malformed input

### Authentication

* Valid token
* Missing token
* Invalid token
* Expired token
* Protected endpoint without authentication

### Authorization

* Citizen accessing authenticated endpoint
* Incorrect role accessing restricted endpoint
* Correct role accessing restricted endpoint

### Security

* SQL injection attempts in input fields
* Oversized input
* Repeated login attempts
* Malformed JWT
* Missing environment secrets

Do not perform destructive database tests against production data.

---

# 55. TESTING — FRONTEND

Verify:

* Registration page loads.
* Login page loads.
* Registration validation works.
* Login validation works.
* Loading states work.
* API errors display correctly.
* Successful registration works.
* Successful login works.
* Authentication persists after refresh.
* Logout works.
* Protected route redirects unauthenticated users.
* Authenticated users can access the protected test destination.
* Landing page navigation still works.
* Mobile navigation still works.

---

# 56. RESPONSIVE DESIGN

Authentication pages must work on:

* Mobile
* Tablet
* Desktop

Check:

* Form width
* Input sizes
* Buttons
* Error messages
* Password controls
* Navigation
* Keyboard accessibility

Do not create a completely different design language from M1.

---

# 57. ACCESSIBILITY

Authentication forms must have:

* Proper `<label>` elements
* Clear input names
* Accessible error messages
* Keyboard navigation
* Visible focus states
* Accessible password visibility control
* Clear submit buttons
* Appropriate autocomplete attributes where useful

Do not rely solely on red borders to communicate errors.

---

# 58. USER EXPERIENCE

Use human, clear messages.

Examples:

```text
Your account has been created successfully.
```

```text
Invalid email or password.
```

```text
Please correct the highlighted fields.
```

Avoid technical messages such as:

```text
SQLSTATE[23000]
JWT verification failed
ECONNREFUSED
```

These may be logged internally but should not be shown directly to normal users.

---

# 59. NO MOCK AUTHENTICATION

Do not use:

```text
localStorage.setItem("isLoggedIn", "true")
```

as the authentication system.

Do not create fake users in frontend code.

Do not bypass the backend.

The frontend authentication state must be based on real backend authentication.

---

# 60. NO HARDCODED USER

Do not create:

```text
admin@example.com
password123
```

as a permanent demo credential.

If a development test account is needed, create it through a documented seed process and clearly label it as development-only.

Never commit real passwords.

---

# 61. DOCUMENTATION

Update the project documentation.

Update:

```text
README.md
docs/API.md
docs/DATABASE.md
docs/ARCHITECTURE.md
```

Document:

### Authentication endpoints

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

Document:

* Request structure
* Response structure
* Authentication mechanism
* Role system
* Database user table
* Local development process
* Security considerations

---

# 62. DATABASE MIGRATION DOCUMENTATION

Document the new migration.

Explain:

* users table
* role values
* account status
* email uniqueness
* password hashing
* timestamps

Do not document future tables as if they already exist.

---

# 63. M3 INTEGRATION CONTRACT

Milestone 3 will build the Citizen Dashboard.

M2 must provide M3 with:

```text
Authenticated user
       ↓
AuthContext
       ↓
Current user
       ↓
Protected route
       ↓
Citizen Dashboard
```

The dashboard must be able to obtain:

```text
id
fullName
email
phone
county
ward
role
```

through the authenticated user mechanism.

M3 must not need to rebuild authentication.

---

# 64. FUTURE ADMIN INTEGRATION

Although Admin exists as a role, do not implement the Admin Dashboard.

M6/M7 will use the role system.

The authentication architecture must allow:

```text
Citizen
Admin
Moderator
Analyst
```

to share the same authentication mechanism.

---

# 65. STRICT DO-NOT-DO LIST

Do NOT implement:

* Citizen Dashboard
* Admin Dashboard
* Incident Reporting
* Report Tracking
* Notifications
* AI Verification
* Gemini integration
* CivicWatch Map
* Civic Alerts
* Surveys
* Consultations
* Petitions
* AI Civic Assistant
* Analytics
* Audit Logs module
* Password reset
* Email verification service
* SMS verification
* WhatsApp integration
* Payment systems
* Docker
* TypeScript

Do not create future database tables.

Do not build fake versions of future modules.

---

# 66. DEFINITION OF DONE

M2 is complete only when:

* [ ] Users table migration exists.
* [ ] Database migration runs successfully.
* [ ] Email uniqueness is enforced.
* [ ] Passwords are securely hashed.
* [ ] Public registration works.
* [ ] Public registration always creates a Citizen.
* [ ] Client cannot assign itself Admin.
* [ ] Login works.
* [ ] Logout works.
* [ ] `/api/auth/me` works.
* [ ] Authentication middleware works.
* [ ] Role middleware exists.
* [ ] JWT/token expiration is configured.
* [ ] Authentication state survives page refresh appropriately.
* [ ] Protected route works.
* [ ] Login page works.
* [ ] Registration page works.
* [ ] Landing page Login button works.
* [ ] Landing page Get Started button works.
* [ ] Authentication errors are handled cleanly.
* [ ] Rate limiting is applied to authentication endpoints.
* [ ] Passwords/tokens/secrets are not logged.
* [ ] SQL queries are parameterized.
* [ ] Frontend does not expose backend secrets.
* [ ] Responsive authentication UI works.
* [ ] Accessibility basics are implemented.
* [ ] M0 health check still works.
* [ ] M1 landing page still works.
* [ ] Backend starts without errors.
* [ ] Frontend starts without errors.
* [ ] MySQL connection works.
* [ ] Documentation is updated.

---

# 67. DEVELOPMENT WORKFLOW

Follow this order.

### Step 1

Inspect M0 and M1.

### Step 2

Run the existing application before making changes.

### Step 3

Create the users migration.

### Step 4

Run and verify the migration.

### Step 5

Create authentication validators.

### Step 6

Create authentication service.

### Step 7

Create authentication controllers.

### Step 8

Create authentication routes.

### Step 9

Create authentication middleware.

### Step 10

Test backend authentication independently.

### Step 11

Create Login page.

### Step 12

Create Registration page.

### Step 13

Create AuthContext.

### Step 14

Create protected-route mechanism.

### Step 15

Connect authentication to M1 navigation.

### Step 16

Test the complete frontend/backend flow.

### Step 17

Test refresh persistence.

### Step 18

Test logout.

### Step 19

Test authorization foundation.

### Step 20

Update documentation.

### Step 21

Fix all errors.

Do not proceed to M3 automatically.

---

# 68. FINAL VERIFICATION

Before declaring M2 complete, verify this complete flow:

```text
Landing Page
     ↓
Get Started
     ↓
Registration
     ↓
MySQL users table
     ↓
Account created
     ↓
Login
     ↓
JWT/session created
     ↓
Authenticated state
     ↓
Protected route
     ↓
Current user loaded
     ↓
Logout
     ↓
Protected route blocked
```

Every stage must use the real implementation.

No mock authentication.

No fake users.

No hardcoded credentials.

---

# 69. FINAL IMPLEMENTATION REPORT

When finished, provide:

```text
Milestone:
M2 — Authentication & User Identity

Database:
...

Migration:
...

Backend:
...

Authentication:
...

Authorization:
...

Frontend:
...

Routes:
...

Security:
...

Testing:
...

M0 health check:
Working / Not working

M1 landing page:
Working / Not working

Known issues:
...

M2 status:
Complete / Incomplete

Ready for:
M3 — Citizen Dashboard
```

Only report functionality that was actually implemented and tested.

Do not claim a feature is working if it was not tested.

Stop after M2.

Do not begin M3 automatically.
