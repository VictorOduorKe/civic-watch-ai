CivicWatch AI Kenya — Authentication Security Hardening

1. Objective

Before proceeding to Milestone 5, harden the existing authentication implementation.

The current implementation stores sensitive authentication credentials such as the JWT/token in browser "localStorage".

This must be changed.

The primary objective is:

«Sensitive authentication credentials must no longer be stored in "localStorage", "sessionStorage", React state that persists credentials unnecessarily, URL parameters, or other JavaScript-accessible browser storage.»

The preferred architecture is:

Browser
   │
   │ HttpOnly Secure Cookie
   ▼
Express API
   │
   ▼
JWT verification
   │
   ▼
Authenticated user

The frontend should not need direct access to the JWT.

---

2. Important Scope

This is a security hardening milestone, not a new application feature.

Do not redesign the entire authentication system.

Do not rebuild M0–M4.

Do not create a second authentication mechanism.

Do not introduce OAuth unless the existing architecture already requires it.

Do not change the application's user roles.

Do not change report functionality except where authentication transport affects it.

Do not proceed to Milestone 5 until this security migration has been tested.

---

3. Inspect Existing Authentication First

Before modifying anything, inspect the complete authentication implementation.

Check:

Frontend

Search for:

localStorage
sessionStorage
localStorage.setItem
localStorage.getItem
localStorage.removeItem
token
accessToken
jwt
Authorization
Bearer

Inspect:

- AuthContext
- authentication hooks
- login page
- registration flow
- logout flow
- protected routes
- Axios/fetch configuration
- API service
- token persistence
- token retrieval
- token removal

Backend

Inspect:

- login controller
- registration controller
- logout controller
- "/api/auth/me"
- authentication middleware
- JWT creation
- JWT verification
- cookie configuration
- CORS
- security middleware
- environment variables

Determine exactly how authentication currently works before changing it.

---

4. Target Authentication Architecture

Change the system to use an HttpOnly cookie.

The intended flow should be:

User submits login
        ↓
POST /api/auth/login
        ↓
Backend verifies credentials
        ↓
Backend creates JWT/session credential
        ↓
Backend sends HttpOnly cookie
        ↓
Browser stores cookie
        ↓
Frontend never reads the token
        ↓
Frontend requests /api/auth/me
        ↓
Browser automatically sends cookie
        ↓
Backend authenticates request

The frontend should only receive safe user information.

For example:

{
  "success": true,
  "user": {
    "id": 12,
    "full_name": "Example User",
    "email": "example@example.com",
    "role": "Citizen"
  }
}

Do not return the JWT to JavaScript.

---

5. Cookie Requirements

Configure the authentication cookie securely.

The cookie should use:

HttpOnly
Secure
SameSite
Path=/

The exact "SameSite" value must match the actual frontend/backend deployment architecture.

For example, for a same-site deployment:

SameSite=Lax

may be appropriate.

If the frontend and backend are deployed on genuinely cross-site origins, determine the required configuration before choosing "SameSite=None".

Do not blindly use:

SameSite=None

without understanding the deployment requirement.

When "SameSite=None" is required, "Secure=true" must also be used.

---

6. Cookie Name

Use a clear cookie name such as:

civicwatch_auth

or another project-consistent name.

Do not use a name that exposes sensitive information.

Do not include the JWT itself in the cookie name.

---

7. Cookie Lifetime

Configure the cookie expiration consistently with the JWT expiration.

For example:

JWT expiration
        ↓
Cookie expiration

Avoid situations where:

JWT remains valid

while:

cookie has expired

or the reverse, unless that behavior is intentional.

Store the configuration in environment variables where appropriate.

Example:

JWT_EXPIRES_IN=...
AUTH_COOKIE_NAME=civicwatch_auth
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=lax

Do not place secrets in ".env" files committed to Git.

---

8. JWT Secret

Verify that the JWT secret is only stored on the backend.

Example:

JWT_SECRET=...

The frontend must never receive:

JWT_SECRET

or any other signing secret.

Verify that the following are not present in the frontend environment:

JWT_SECRET
DATABASE_PASSWORD
GEMINI_API_KEY
PRIVATE_API_KEYS
SIGNING_KEYS

Do not expose backend environment variables through Vite.

---

9. Login Endpoint

Update:

POST /api/auth/login

The backend should:

1. Validate credentials.
2. Verify the password.
3. Create the JWT.
4. Set the JWT in the HttpOnly cookie.
5. Return safe user information.
6. Never return the token in JSON.

The response must not contain:

{
  "token": "..."
}

or:

{
  "accessToken": "..."
}

or any equivalent JavaScript-readable credential.

---

10. Registration

Inspect:

POST /api/auth/register

If registration automatically authenticates the user, apply the same cookie-based authentication flow.

If registration requires a separate login, preserve the existing behavior.

Do not introduce a second token storage mechanism.

---

11. "/api/auth/me"

The existing endpoint:

GET /api/auth/me

should authenticate using the HttpOnly cookie.

The frontend should call:

/api/auth/me

to determine the current authenticated user.

The endpoint should return safe user information.

Never return:

password_hash
JWT
JWT secret
internal authentication credentials

---

12. Authentication Middleware

Update the existing authentication middleware.

The middleware should retrieve the credential from the secure cookie.

Conceptually:

Request
   ↓
Cookie
   ↓
JWT verification
   ↓
Authenticated user
   ↓
req.user

Do not require the frontend to manually construct:

Authorization: Bearer <token>

if the project is fully migrated to cookie authentication.

Do not keep two competing authentication systems unless there is a clearly documented technical reason.

---

13. Frontend AuthContext

Refactor the existing AuthContext.

The frontend must no longer do:

localStorage.getItem("token")

or:

localStorage.setItem("token", token)

Remove token persistence from:

- AuthContext
- login page
- API services
- hooks
- protected routes
- logout logic

The AuthContext should manage the user state, not the raw authentication credential.

For example:

user
loading
isAuthenticated
login()
logout()
refreshUser()

It should not expose:

token
accessToken
jwt

to React components.

---

14. Axios / Fetch Configuration

Inspect the existing API client.

For cookie authentication, configure requests to include credentials when required.

For Axios:

withCredentials: true

For Fetch:

credentials: "include"

Apply this consistently through the central API client rather than manually adding it to every component.

Do not duplicate API configuration across the application.

---

15. CORS

Because cookies are now involved, review the backend CORS configuration carefully.

Do NOT use:

origin: "*"

together with credentialed requests.

Configure an explicit frontend origin.

For example:

FRONTEND_URL=http://localhost:5173

The exact production configuration should come from environment variables.

Enable credentials:

credentials: true

Make sure the configured origin exactly matches the frontend origin.

---

16. CSRF Protection

Because authentication is now cookie-based, evaluate CSRF protection.

This is important because browsers automatically send cookies with qualifying requests.

Protect state-changing endpoints such as:

POST
PUT
PATCH
DELETE

Use an appropriate CSRF strategy compatible with the application's architecture.

Do not simply disable CSRF protection.

Do not invent a custom security mechanism if an established package/approach already fits the project.

The implementation should be consistent across:

- authentication
- report creation
- future report updates
- future admin actions

Document the chosen approach.

---

17. Do Not Store CSRF Secrets in localStorage

If a CSRF token is required, do not confuse it with the authentication token.

The authentication credential must remain HttpOnly.

If the selected CSRF architecture requires a client-readable CSRF token, implement that mechanism intentionally and document why it is safe.

Do not store the JWT itself in browser storage.

---

18. Logout

Update:

POST /api/auth/logout

The backend should clear the authentication cookie.

The frontend should:

1. Call logout.
2. Clear the local user state.
3. Redirect appropriately.

Do not depend on:

localStorage.removeItem("token")

because the token should no longer exist there.

The server must invalidate/clear the authentication cookie.

---

19. Session Expiration

If "/api/auth/me" or another protected endpoint returns:

401 Unauthorized

the frontend should:

1. Clear the current user state.
2. Treat the session as expired.
3. Redirect to login when appropriate.

Do not attempt to recover the JWT from localStorage.

Do not automatically create a new token on the client.

---

20. Protected Routes

Review the existing:

ProtectedRoute

It should rely on the authentication state obtained from the backend.

Conceptually:

Application starts
       ↓
GET /api/auth/me
       ↓
Authenticated?
   /          \
 yes           no
 ↓             ↓
Dashboard     Login

Do not determine authentication merely by checking:

localStorage.getItem("token")

---

21. Browser Storage Audit

After migration, search the entire frontend codebase for:

localStorage
sessionStorage
token
accessToken
jwt
Bearer

Remove authentication-token storage.

It is acceptable for localStorage to be used for genuinely non-sensitive UI preferences if the application needs it.

However, do not store:

- JWTs
- access tokens
- refresh tokens
- passwords
- API keys
- session credentials
- authentication secrets

in browser storage.

---

22. Existing M4 Report Submission

The authentication migration must preserve the existing M4 report functionality.

Test:

Login
   ↓
Dashboard
   ↓
Report an Issue
   ↓
Submit Report

The report request must authenticate using the new cookie-based system.

Do not add a second report-specific token.

Do not send the JWT manually from React.

---

23. File Upload Compatibility

M4 uses:

multipart/form-data

Confirm that report uploads still work with cookie authentication.

The request must include credentials.

Verify:

- authentication cookie is sent
- report is created
- attachment validation still works
- unauthorized upload is rejected

Do not expose the authentication cookie to JavaScript.

---

24. Sensitive Response Audit

Review every authentication response.

Make sure responses do not contain:

password_hash
password
JWT
accessToken
refreshToken
JWT secret
database credentials
API keys

unless a credential is intentionally required by the architecture.

For this migration, the JWT should not be returned to frontend JavaScript.

---

25. Logging Audit

Search backend logs for:

token
jwt
authorization
cookie
password

Make sure sensitive credentials are never logged.

Do not log:

Authorization: Bearer ...

Do not log the complete authentication cookie.

Do not log passwords.

Do not log JWT secrets.

If request logging is enabled, sanitize sensitive headers/cookies.

---

26. Error Handling

Do not return sensitive authentication information through errors.

For example, avoid responses such as:

Invalid JWT: eyJhbGciOi...

Use:

Unauthorized

or another appropriate generic message.

Do not expose:

- JWT internals
- signing secrets
- stack traces
- database errors
- cookie contents

to the browser.

---

27. Environment Configuration

Review:

frontend/.env*
backend/.env*
.env.example

The frontend should only receive configuration that is intentionally public.

For example:

VITE_API_URL=http://localhost:5000/api

may be acceptable.

But never expose:

JWT_SECRET
DB_PASSWORD
GEMINI_API_KEY
PRIVATE_KEY

through a "VITE_" variable.

Remember that Vite frontend environment variables are bundled into client-side code.

---

28. Git Security Audit

Before continuing to M5, inspect Git history and current tracked files.

Check for accidentally committed:

.env
.env.local
JWT secrets
database passwords
API keys
private credentials

At minimum run appropriate searches such as:

git status
git ls-files | grep -E '(^|/)\.env'

Search the repository for obvious credential patterns.

Do not print real secrets into the terminal output unnecessarily.

If an actual secret has previously been committed to Git, changing the code is not enough.

The secret should be considered compromised and rotated.

Do not merely delete the file from the working tree while leaving the credential valid.

---

29. Existing Credentials

If the current project has already exposed a real JWT secret or other credential through Git, browser storage, screenshots, logs, or another public location:

1. Replace/rotate the affected secret.
2. Update the backend environment.
3. Restart the backend.
4. Confirm old credentials are no longer accepted where appropriate.
5. Remove accidental credential exposure from the repository if necessary.

Do not paste actual secrets into the project documentation or chat.

---

30. Cookie Development Configuration

For local development, configure cookies so they work correctly with the existing local architecture.

Do not blindly copy production settings into development.

The configuration should account for:

HTTP localhost development
HTTPS production
frontend origin
backend origin
SameSite policy
Secure flag

Use environment-controlled configuration where appropriate.

Do not weaken production security merely to make local development convenient.

---

31. Production Configuration

Document the expected production requirements:

HTTPS
Secure cookies
HttpOnly cookies
appropriate SameSite configuration
explicit CORS origin
credentialed requests
CSRF protection where applicable
strong JWT secret

Do not hardcode production domains.

---

32. Password Handling

Do not change the working password hashing system unless the inspection reveals a security problem.

Passwords must remain:

hashed

not encrypted for later recovery.

Never store plaintext passwords.

Never place passwords in localStorage.

Never return password hashes to the frontend.

---

33. Refresh Tokens

Do not automatically introduce refresh tokens as part of this milestone.

First migrate the existing authentication model correctly.

Only introduce refresh tokens if the current architecture genuinely requires them.

If refresh tokens are later introduced, they must also be handled securely and must not be stored in localStorage.

---

34. Testing

Perform security-focused tests.

Test 1 — Login

Login normally.

Verify:

- authentication succeeds
- cookie is created
- cookie is HttpOnly
- frontend cannot read the JWT through JavaScript
- no JWT appears in the response JSON

---

Test 2 — Browser Storage

Open browser developer tools.

Inspect:

Application
→ Local Storage

Verify that no authentication token exists.

Inspect:

Session Storage

Verify that no authentication token exists.

---

Test 3 — Cookie

Inspect the authentication cookie.

Verify appropriate attributes:

HttpOnly
Secure
SameSite
Path
Expiration

The exact Secure/SameSite behavior should match the environment.

---

Test 4 — "/api/auth/me"

While logged in:

GET /api/auth/me

must return the authenticated user.

The frontend should not need to know the JWT.

---

Test 5 — Logout

Logout.

Verify:

- authentication cookie is cleared/invalidated
- "/api/auth/me" returns unauthorized
- protected pages redirect appropriately
- localStorage does not contain a replacement token

---

Test 6 — Direct API Access

Without authentication:

POST /api/reports

must fail.

With valid cookie:

POST /api/reports

should work.

---

Test 7 — Expired Session

Allow/use an expired authentication credential.

Verify:

401

is handled correctly.

The frontend must not attempt to retrieve an old token from localStorage.

---

Test 8 — CSRF

If cookie authentication is used, verify that an unauthorized cross-origin state-changing request cannot successfully perform protected actions.

Test the chosen CSRF protection according to its documented implementation.

---

Test 9 — XSS

Verify that authentication credentials cannot be obtained through ordinary application-controlled HTML/script injection.

Do not weaken output encoding merely to make user content render as HTML.

---

Test 10 — Report Submission

After migration:

Login
→ Dashboard
→ Report an Issue
→ Fill form
→ Submit

must continue to work.

---

35. Browser DevTools Verification

Use browser developer tools to inspect:

Application → Local Storage

Expected:

No JWT
No access token
No refresh token

Application → Session Storage

Expected:

No JWT
No access token
No refresh token

Application → Cookies

Expected:

Authentication cookie
HttpOnly
appropriate Secure/SameSite configuration

Network → Login

Verify:

- no token returned to frontend JavaScript
- Set-Cookie is used appropriately
- response contains only safe user information

Network → Protected Request

Verify the browser sends the authentication cookie automatically.

---

36. Regression Testing

After the migration, verify:

M0

- backend starts
- frontend starts
- database connection works
- health endpoint works

M1

- landing page works
- navigation works

M2

- registration works
- login works
- logout works
- "/api/auth/me" works
- role information works
- protected routes work

M3

- citizen dashboard works
- profile works
- user information displays correctly

M4

- report form works
- categories load
- report submission works
- attachments work
- report reference is generated
- report starts as "Submitted"

No existing functionality should be broken by the authentication migration.

---

37. Documentation

Update:

README.md
docs/ARCHITECTURE.md
docs/API.md

Document:

- authentication architecture
- HttpOnly cookie strategy
- frontend authentication flow
- CORS configuration
- CSRF strategy
- cookie configuration
- local development requirements
- production HTTPS requirement
- environment variables

Do not document real secrets.

---

38. Definition of Done

Do not proceed to Milestone 5 until all of these are true:

- [ ] JWT is no longer stored in localStorage.
- [ ] JWT is no longer stored in sessionStorage.
- [ ] JWT is not exposed to React components.
- [ ] Login sets the authentication credential using a secure cookie strategy.
- [ ] Authentication cookie is HttpOnly.
- [ ] Cookie configuration is environment appropriate.
- [ ] "/api/auth/me" authenticates correctly.
- [ ] Logout clears the authentication cookie.
- [ ] Protected routes still work.
- [ ] Backend authentication middleware reads the new authentication mechanism.
- [ ] Frontend API requests include credentials where required.
- [ ] CORS is configured correctly for credentialed requests.
- [ ] CSRF protection is implemented where required by the cookie architecture.
- [ ] Authentication tokens are not returned in login JSON.
- [ ] Authentication credentials are not logged.
- [ ] Passwords remain securely hashed.
- [ ] Backend secrets remain backend-only.
- [ ] M4 report submission still works.
- [ ] M4 file uploads still work.
- [ ] Unauthorized report submission fails.
- [ ] Browser storage contains no authentication credential.
- [ ] Repository has been checked for accidentally committed secrets.
- [ ] Any previously exposed real secrets have been rotated.
- [ ] Documentation has been updated.
- [ ] M0–M4 regression tests pass.

---

39. Strict Do-Not-Do List

Do NOT:

- store JWTs in localStorage
- store JWTs in sessionStorage
- put JWTs in URLs
- put JWTs in React local state unnecessarily
- return JWTs in login JSON
- expose JWT secrets to Vite
- expose database credentials to the frontend
- log JWTs
- log passwords
- log authentication cookies
- create a second authentication system
- create a second user table
- rebuild M0–M4
- change report ownership rules
- create report tracking
- create notifications
- create admin report management
- create AI verification
- introduce refresh tokens unnecessarily
- disable security protections just to make development easier
- use wildcard CORS with credentialed requests
- skip CSRF analysis for cookie-based authentication
- claim the system is secure without actually testing it

---

40. Development Sequence

Follow this exact workflow:

1. Inspect current M2 authentication
        ↓
2. Identify every place the token is stored/read
        ↓
3. Inspect backend JWT creation/verification
        ↓
4. Inspect CORS configuration
        ↓
5. Inspect frontend API client
        ↓
6. Implement HttpOnly cookie authentication
        ↓
7. Update authentication middleware
        ↓
8. Update frontend AuthContext
        ↓
9. Remove browser token storage
        ↓
10. Configure credentialed API requests
        ↓
11. Implement/verify CSRF protection
        ↓
12. Update logout
        ↓
13. Test /api/auth/me
        ↓
14. Test protected routes
        ↓
15. Test M4 report submission
        ↓
16. Audit browser storage
        ↓
17. Audit logs
        ↓
18. Audit Git/repository secrets
        ↓
19. Run complete M0–M4 regression test
        ↓
20. Update documentation

After each major change:

- start the backend
- start the frontend
- check for compilation errors
- check browser console
- check backend logs
- test the affected authentication flow
- fix errors before continuing

---

41. Final Implementation Report

After completing the hardening work, provide:

Authentication Changes

Explain exactly what changed.

Cookie Configuration

Document the actual cookie settings used.

Frontend Changes

List files/components/services modified.

Backend Changes

List middleware/controllers/routes/services modified.

CSRF

Explain the actual protection implemented and where it applies.

Storage Audit

Confirm what was removed from:

localStorage
sessionStorage

Secret Audit

Report whether any credentials were found in tracked files or Git history.

Do not print actual credentials.

Testing

List tests actually executed and their results.

Remaining Issues

Only report genuine unresolved issues.

M0–M4 Regression

Confirm which existing milestones were re-tested.

Do not claim a test passed unless it was actually performed.

---

42. Stop Point

When this security hardening milestone is complete and verified:

STOP.

Do not automatically implement Milestone 5.

Milestone 5 should only begin after confirming that:

M0
 ↓
M1
 ↓
M2
 ↓
Authentication Hardening
 ↓
M3
 ↓
M4

remain functional with the new cookie-based authentication architecture.