M10 — Final Security, QA & Production Hardening

Objective

Complete the final production-hardening milestone for CivicWatch AI Kenya.

M1–M9 have already been implemented. Do NOT rebuild completed functionality or introduce unrelated features.

The goal of M10 is to perform a complete security, reliability, usability, and production-readiness pass across the existing application.

---

1. FULL PROJECT AUDIT

Inspect the entire repository before making changes.

Review:

- Frontend
- Backend
- API routes
- Authentication
- Authorization
- Database access
- File uploads
- Anonymous-user functionality
- Sensitive-case routing
- Admin functionality
- Notifications
- AI functionality
- Error handling
- Logging
- Environment variables
- Docker configuration
- Production configuration
- Dependencies
- API communication
- Local storage usage
- Cookies
- Session handling

Do not assume existing implementations are secure simply because they work.

Identify and fix actual issues found during the audit.

---

2. AUTHENTICATION SECURITY

Verify that authentication follows secure practices.

Ensure:

- Passwords are never stored as plaintext.
- Passwords are hashed using an appropriate password hashing algorithm.
- Authentication tokens/secrets are NOT stored in "localStorage".
- Sensitive authentication material is not exposed to JavaScript unnecessarily.
- Prefer secure, HTTP-only cookies for session/authentication tokens where applicable.
- Cookies use appropriate:
  - "HttpOnly"
  - "Secure" in production
  - "SameSite"
    attributes.
- Authentication expiration is handled correctly.
- Logout invalidates the relevant session/token.
- Protected API endpoints actually require authentication.
- Authentication cannot be bypassed by manipulating frontend state.

Do not simply hide protected UI elements.

Authorization must always be enforced on the backend.

---

3. ROLE-BASED ACCESS CONTROL

Audit all protected functionality.

Verify that roles and permissions are enforced server-side.

At minimum, carefully review:

- Regular users
- Anonymous users
- Administrators
- Advocates/civil society users
- Other existing specialized roles

A user must not be able to access another role's functionality by manually calling an API endpoint.

Test:

- Unauthorized request
- Authenticated but unauthorized request
- Expired session
- Invalid token/session
- Modified user ID
- Modified resource ID

Return appropriate HTTP status codes.

---

4. LOCAL STORAGE & CLIENT-SIDE DATA

Perform a complete search for sensitive information stored in:

- "localStorage"
- "sessionStorage"
- IndexedDB
- URL parameters
- browser-accessible JavaScript variables

Sensitive credentials must not be stored there.

Pay particular attention to:

- Access tokens
- Refresh tokens
- Passwords
- API keys
- Admin credentials
- Private user information
- Sensitive civic-case information

Non-sensitive UI preferences may remain client-side if appropriate.

---

5. API SECURITY

Audit every backend endpoint.

Check for:

- Authentication requirements
- Authorization
- Input validation
- Output validation
- Rate limiting
- Proper HTTP methods
- Correct status codes
- Error handling
- Request size limits
- Parameter validation
- ID validation
- Resource ownership checks

Prevent:

- IDOR
- Mass assignment
- Unauthorized data access
- Injection attacks
- Excessive data exposure
- Enumeration where inappropriate

Never trust IDs, roles, permissions, or ownership information supplied by the frontend.

---

6. INPUT VALIDATION

Review every user-controlled input.

This includes:

- Registration
- Login
- Civic reports
- Comments
- Case descriptions
- Contact forms
- Search
- Profile information
- Administrative forms
- File uploads
- AI prompts
- Sensitive-case submissions

Use server-side validation as the source of truth.

Validate:

- Required fields
- Data types
- Length
- Allowed formats
- Maximum sizes
- IDs
- Enumerated values

Reject malformed requests cleanly.

---

7. SQL / DATABASE SECURITY

Audit all database queries.

Ensure:

- Parameterized queries are used.
- User input is never directly concatenated into SQL.
- Database credentials come from environment variables.
- Production database credentials are not committed to Git.
- Database errors do not expose credentials or internal implementation details.

Search the repository for:

- Hardcoded database passwords
- API keys
- JWT secrets
- Gemini keys
- SMTP credentials
- Other secrets

If any secrets are found, remove them from source code and move them into environment configuration.

---

8. XSS & OUTPUT SECURITY

Audit frontend rendering.

Look for unsafe patterns such as:

- "dangerouslySetInnerHTML"
- Raw HTML injection
- Unsanitized user-generated content
- Unsanitized AI-generated content

User-generated content must be safely rendered.

AI output must also be treated as untrusted content.

Do not assume AI-generated text is safe.

---

9. CSRF PROTECTION

Review state-changing requests.

If cookie-based authentication is used, implement appropriate CSRF protection for:

- POST
- PUT
- PATCH
- DELETE

requests where required.

Ensure the implementation works correctly with the existing authentication architecture.

Do not introduce CSRF mechanisms that break legitimate API requests.

---

10. RATE LIMITING

Review rate limiting on sensitive endpoints.

Prioritize:

- Login
- Registration
- Password-related endpoints
- Report submission
- Contact forms
- AI requests
- File uploads
- Administrative endpoints

Rate limits should prevent abuse without making normal usage difficult.

Return a clear "429 Too Many Requests" response when appropriate.

---

11. FILE UPLOAD SECURITY

If the application supports file uploads, perform a complete security review.

Validate:

- File extension
- MIME type
- File size
- Filename
- Storage location

Do not trust the extension supplied by the user.

Prevent:

- Executable uploads
- Path traversal
- Dangerous filenames
- Oversized files
- Unrestricted file types

Uploaded files should not automatically become executable server-side content.

---

12. SENSITIVE CIVIC CASES

Because CivicWatch handles potentially sensitive civic information, perform an additional privacy review.

Ensure sensitive cases are not unnecessarily exposed through:

- Public APIs
- Public search
- Client-side state
- Browser storage
- Logs
- Error messages
- Notifications
- Analytics
- Debug output

Only authorized users/services should access sensitive case information.

Review sensitive-case routing implemented in previous milestones and ensure that routing decisions do not accidentally expose private information.

---

13. LOGGING & ERROR HANDLING

Review backend logging.

Logs must be useful for debugging and security monitoring without exposing:

- Passwords
- Authentication tokens
- API keys
- Sensitive civic reports
- Personal information unnecessarily

Production API errors should not expose:

- Stack traces
- SQL queries
- Internal filesystem paths
- Environment variables
- Secrets

Return safe user-facing error messages while keeping useful internal logs.

---

14. SECURITY HEADERS

Configure appropriate security headers for production.

Review and implement where compatible:

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security in HTTPS production environments
- Frame protection / clickjacking protection

Do not blindly add headers that break the application.

Test the application after configuration.

---

15. CORS

Audit CORS configuration.

Do NOT use unrestricted production configuration such as:

Access-Control-Allow-Origin: *

when credentials are involved.

Production origins should be explicitly configured through environment variables.

Development origins may remain configurable separately.

---

16. ENVIRONMENT VARIABLES

Separate:

Development

from:

Production

Review all environment variables.

Ensure secrets are never committed.

Update ".env.example" so it contains variable names but NEVER real credentials.

Examples:

DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
SMTP_USER=
SMTP_PASSWORD=

Do not place actual values in ".env.example".

---

17. DEPENDENCY SECURITY

Inspect project dependencies.

Look for:

- Deprecated packages
- Unused packages
- Known vulnerable dependencies
- Duplicate packages
- Unnecessary dependencies

Use the project's existing package manager and audit tooling.

Do not perform major dependency upgrades blindly.

Only upgrade packages when compatibility can be maintained.

---

18. FRONTEND SECURITY & UX

Perform a final frontend review.

Verify:

- Protected pages cannot be accessed without authorization.
- Loading states work.
- Error states work.
- Empty states work.
- Forms prevent accidental duplicate submissions.
- API failures are handled gracefully.
- Session expiration is handled correctly.
- Users are redirected appropriately after logout/session expiration.

Do not expose technical errors to normal users.

---

19. ACCESSIBILITY REVIEW

Perform a practical accessibility pass.

Check:

- Button labels
- Form labels
- Keyboard navigation
- Focus states
- Image alt text
- Color contrast
- Error messages
- Form validation messages
- Modal accessibility
- Navigation accessibility

Do not redesign the existing interface unnecessarily.

---

20. RESPONSIVE DESIGN

Test the major interfaces at:

- Mobile
- Tablet
- Desktop

Ensure there are no:

- Horizontal overflow issues
- Broken navigation
- Overlapping elements
- Unusable forms
- Hidden critical actions
- Broken tables

Keep the existing CivicWatch visual identity.

---

21. CIVICWATCH BRANDING

Maintain the existing CivicWatch branding established in previous milestones.

Use the approved logo and its visual identity consistently.

Avoid introducing gradients or unrelated colors.

Keep the interface professional, trustworthy, accessible, and suitable for a civic technology platform.

Do not replace the existing branding with a generic template.

---

22. SECURITY TESTING

After implementation, perform practical tests.

Test:

Authentication

- Valid login
- Invalid login
- Logout
- Expired session
- Unauthorized API request

Authorization

- Normal user accessing admin endpoint
- User accessing another user's resource
- Anonymous user accessing protected resource

Input validation

- Empty values
- Oversized values
- Invalid IDs
- Invalid formats
- Malicious input

API

- Missing authentication
- Invalid authentication
- Invalid HTTP methods
- Excessive requests

File upload

- Valid file
- Invalid file
- Oversized file
- Dangerous filename

Frontend

- Refresh protected page
- Logout
- Session expiration
- Mobile layout
- API failure

---

23. AUTOMATED TESTS

Inspect the existing test suite.

Do not delete working tests.

Add or improve tests for critical security paths where appropriate.

Prioritize:

- Authentication
- Authorization
- Sensitive-case access
- API validation
- Report submission
- Admin access
- Database operations

Run:

- Existing unit tests
- Integration tests
- Build
- Lint
- Type checking where applicable

Fix failures caused by M10 changes.

---

24. PRODUCTION BUILD

Perform a complete production build.

Verify:

- Frontend builds successfully.
- Backend starts successfully.
- Database connection works.
- Required environment variables are detected.
- API routes respond correctly.
- Authentication works.
- Major user workflows work.

Do not silently ignore build warnings or runtime errors.

---

25. DOCKER / DEPLOYMENT REVIEW

If Docker is used, inspect:

- Dockerfiles
- Docker Compose
- Environment configuration
- Exposed ports
- Volumes
- Container permissions
- Health checks
- Production commands

Avoid running application containers as root where practical.

Do not expose unnecessary ports.

Do not embed secrets in Dockerfiles.

---

26. FINAL CLEANUP

Remove:

- Debug statements
- Temporary files
- Test credentials
- Hardcoded secrets
- Unused imports
- Dead code created during M10
- Development-only logging
- Temporary security bypasses

Do NOT remove legitimate project functionality.

---

27. FINAL REGRESSION TEST

Run through the major CivicWatch workflows from beginning to end.

Public user

- Open platform
- Browse public information
- Register/login if applicable
- Submit permitted civic information
- View permitted status/information
- Logout

Anonymous user

- Access allowed anonymous functionality
- Submit permitted anonymous information
- Verify privacy protections

Authorized user

- Access permitted case information
- Verify ownership/authorization restrictions

Specialized/sensitive workflow

- Submit sensitive case
- Verify correct routing
- Verify restricted visibility

Administrator

- Login
- View authorized dashboard
- Manage authorized resources
- Verify audit/security protections

---

28. DO NOT CHANGE

Do NOT:

- Rewrite the entire application.
- Replace the existing stack.
- Replace completed milestones.
- Remove existing features without a demonstrated security reason.
- Change database architecture unnecessarily.
- Introduce unrelated features.
- Replace CivicWatch branding.
- Add unnecessary dependencies.
- Store secrets in frontend code.
- Store authentication credentials in localStorage.

Make targeted, production-quality improvements.

---

29. FINAL M10 REPORT

When implementation is complete, provide a concise report containing:

Security fixes

List the important vulnerabilities or weaknesses discovered and fixed.

Authentication

Explain how authentication is now handled.

Authorization

Explain how role and resource access are protected.

Sensitive data

Explain how sensitive civic information is protected.

Secrets

Confirm that secrets are not committed or exposed in frontend code.

Testing

Report:

- Tests passed
- Build status
- Lint status
- Type-check status
- Security checks performed

Remaining Issues

Clearly list anything that could not be fixed or verified.

Do not claim a security check passed unless it was actually tested.

---

M10 SUCCESS CRITERIA

M10 is complete only when:

- Authentication is secure.
- Authorization is enforced server-side.
- Sensitive credentials are not stored in localStorage.
- Secrets are not committed.
- Sensitive civic information is appropriately protected.
- API endpoints validate authentication and authorization.
- User input is validated.
- SQL injection protections are verified.
- XSS protections are verified.
- CSRF protections are appropriate to the authentication architecture.
- Rate limiting exists on important abuse-prone endpoints.
- File uploads are restricted where applicable.
- Production errors do not expose sensitive implementation details.
- Security headers are configured appropriately.
- CORS is correctly restricted.
- Frontend and backend production builds succeed.
- Existing functionality continues working.
- Critical workflows pass regression testing.
- No unnecessary architecture changes are introduced.

IMPORTANT

Before modifying anything:

1. Inspect the existing implementation.
2. Identify the actual current architecture.
3. Reuse existing security utilities where they are correct.
4. Make minimal targeted changes.
5. Test every security-related change.
6. Do not claim completion without verification.

M10 should leave CivicWatch AI Kenya in a clean, secure, production-ready state without disrupting functionality completed in M1–M9.