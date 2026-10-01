# CivicWatch AI Kenya — Milestone 0

## Project Foundation

You are working on a completely fresh project called **CivicWatch AI Kenya**, developed for **Open Civic Lab (OCL)**.

This is **Milestone 0 only**.

The purpose of this milestone is to create a clean, maintainable foundation that all future CivicWatch modules will build on.

Do not implement future modules during this milestone.

---

## 1. OBJECTIVE

Create the initial CivicWatch AI Kenya development environment with:

* React + Vite frontend
* JavaScript only, NOT TypeScript
* Node.js + Express backend
* MySQL database
* REST API foundation
* Environment configuration
* Database connection pool
* Database migration structure
* Basic API error handling
* Security middleware foundation
* CORS configuration
* Request validation foundation
* Rate limiting foundation
* Frontend routing foundation
* Frontend API service foundation
* Basic application shell
* Health-check endpoint
* Development documentation
* Git configuration

The final result must be a clean project that can be started locally and verified before moving to Milestone 1.

---

# 2. IMPORTANT PROJECT RULES

Follow these rules throughout this milestone.

### Fresh project

Assume the project is completely new.

Do not reuse:

* Previous CivicWatch source code
* Previous CivicWatch database
* Previous authentication code
* Previous routes
* Previous controllers
* Previous React components
* Previous styling
* Previous environment files
* Previous configuration

Only reuse the **product requirements**, not previous implementation.

If the directory is empty, initialize the project from scratch.

---

### No Docker

Do NOT use:

* Docker
* Docker Compose
* Containers
* Kubernetes
* Docker-based MySQL

MySQL must run directly on the development machine.

The application should run locally using normal Node.js, npm/pnpm, and MySQL commands.

---

### Language

Use:

* JavaScript
* JSX

Do NOT introduce TypeScript.

Do not create:

* `.ts`
* `.tsx`

---

### Database

Use:

**MySQL 8+**

Use the `mysql2` Node.js package.

Use a connection pool instead of creating a new database connection for every request.

---

### Architecture

Use this basic architecture:

```text
React + Vite
      |
      | HTTP / REST API
      ↓
Express.js API
      |
      | mysql2 connection pool
      ↓
MySQL
```

Keep the architecture simple and easy to extend.

---

# 3. TECHNOLOGY STACK

## Frontend

Use:

* React
* Vite
* JavaScript
* React Router
* Tailwind CSS
* Axios or Fetch

Choose one API client and use it consistently.

---

## Backend

Use:

* Node.js
* Express.js
* JavaScript
* mysql2
* dotenv
* cors
* helmet
* express-rate-limit
* zod
* bcrypt
* jsonwebtoken

Authentication packages may be installed now if useful for the foundation, but **do not implement authentication yet**.

JWT and bcrypt belong to Milestone 2.

---

## Database

Use:

* MySQL 8+
* Incremental SQL migrations

Do NOT create the complete CivicWatch database schema yet.

Only establish the migration system.

---

# 4. PROJECT STRUCTURE

Create the project using this general structure:

```text
civicwatch-ai-kenya/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── API.md
│
├── .env.example
├── .gitignore
└── README.md
```

You may adjust the structure slightly if there is a strong technical reason, but preserve the same architectural separation.

---

# 5. FRONTEND FOUNDATION

Create the React + Vite application.

Configure:

* React
* Vite
* Tailwind CSS
* React Router

Create a minimal application shell.

The frontend should be able to start successfully.

Create a basic route such as:

```text
/
```

The page should clearly indicate:

```text
CivicWatch AI Kenya

Development Environment
Milestone 0
```

This is only a development placeholder.

Do NOT design the actual CivicWatch landing page yet.

---

## Frontend service layer

Create a reusable API service.

For example:

```text
frontend/src/services/api.js
```

Configure the API base URL through an environment variable.

Example:

```text
VITE_API_URL=http://localhost:5000/api
```

Do not hardcode API URLs throughout components.

---

# 6. BACKEND FOUNDATION

Create an Express application.

Separate:

```text
app.js
server.js
```

`app.js` should configure:

* Express
* JSON parsing
* CORS
* Helmet
* rate limiting
* routes
* error handling

`server.js` should handle:

* environment loading
* server startup
* database initialization/check
* graceful shutdown

Keep application configuration separate from server startup.

---

# 7. ENVIRONMENT CONFIGURATION

Create:

```text
.env.example
```

Do not commit real secrets.

Include variables similar to:

```text
NODE_ENV=development
PORT=5000

FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=civicwatch_ai_kenya
DB_USER=root
DB_PASSWORD=

JWT_SECRET=
JWT_EXPIRES_IN=1d

GEMINI_API_KEY=
```

Do not create or commit a real `.env` file containing secrets.

Add `.env` to `.gitignore`.

The Gemini variable is only being reserved for future milestones.

Do NOT implement Gemini functionality in Milestone 0.

---

# 8. DATABASE CONNECTION

Create a MySQL connection pool.

For example:

```text
backend/src/config/database.js
```

The connection should use environment variables.

Use a pool rather than:

```text
mysql.createConnection()
```

for every request.

Create a reusable database module that future controllers and services can import.

The application should be able to verify that MySQL is reachable.

---

# 9. DATABASE MIGRATION FOUNDATION

Create a migration system under:

```text
database/migrations/
```

The migration system should support incremental database changes.

Do NOT create all CivicWatch tables.

Do NOT create:

* users
* reports
* alerts
* notifications
* verification records
* participation tables
* audit tables
* map tables

Those belong to later milestones.

At most, create the minimum infrastructure necessary for migration tracking.

For example, a migration tracking table can be introduced if required.

Document how migrations will be:

```text
created
executed
tracked
rolled back
```

If a migration library is used, document it clearly.

If a lightweight custom migration runner is used, keep it simple and reliable.

---

# 10. DATABASE INITIALIZATION

Document how the developer creates the database.

For example:

```sql
CREATE DATABASE civicwatch_ai_kenya;
```

Do not automatically destroy or recreate databases.

Never use destructive commands such as:

```sql
DROP DATABASE
```

as part of normal startup.

The application must not wipe existing data during startup.

---

# 11. HEALTH CHECK API

Create:

```text
GET /api/health
```

The endpoint should verify that:

1. The backend is running.
2. The database connection is available.

Return structured JSON.

Example:

```json
{
  "success": true,
  "message": "CivicWatch AI Kenya API is running",
  "database": "connected"
}
```

If the database is unavailable, return an appropriate HTTP status and clear machine-readable information.

Do not expose database passwords, credentials, stack traces, or sensitive configuration.

---

# 12. API STRUCTURE

Create a clean route structure.

For example:

```text
backend/src/routes/
```

Create a health route.

Do not create routes for future features yet.

Do NOT create:

```text
/auth
/reports
/admin
/alerts
/verification
/participation
/notifications
```

Those will be added during their respective milestones.

---

# 13. ERROR HANDLING

Create centralized API error handling.

The API should return consistent responses.

For example:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Development errors may provide useful debugging information, but production responses must not expose:

* stack traces
* SQL queries
* passwords
* tokens
* environment variables
* internal secrets

Create reusable error-handling middleware.

---

# 14. SECURITY FOUNDATION

Add the basic security middleware required by the architecture.

Configure:

### Helmet

Use Helmet for HTTP security headers.

### CORS

Allow only the configured frontend origin during normal development.

Do not use:

```text
origin: "*"
```

when credentials or authenticated requests will eventually be involved.

### Rate limiting

Create a basic API rate limiter.

Keep the limits reasonable for development.

Do not create aggressive limits that make normal development difficult.

### Input validation

Establish Zod as the validation library.

Do not build feature-specific validators yet.

The architecture should make it easy for future modules to create validators.

---

# 15. REQUEST LOGGING

Add simple development-friendly request logging.

Do not log sensitive information.

Never log:

* passwords
* authentication tokens
* API keys
* database passwords
* private report contents
* sensitive citizen information

A lightweight logger is sufficient for Milestone 0.

---

# 16. GRACEFUL SHUTDOWN

Implement graceful shutdown for the Express server.

When the server receives signals such as:

```text
SIGTERM
SIGINT
```

it should:

1. Stop accepting new requests.
2. Close the HTTP server.
3. Close the MySQL pool.
4. Exit cleanly.

Avoid leaving open database connections.

---

# 17. FRONTEND ↔ BACKEND TEST

Connect the frontend to:

```text
GET /api/health
```

Create a simple development page that displays the API/database status.

For example:

```text
CivicWatch AI Kenya
Milestone 0

Frontend: Running

Backend API: Connected

Database: Connected
```

The status must come from the real API.

Do not hardcode:

```text
Database: Connected
```

---

# 18. RESPONSIVE FOUNDATION

The actual design system will be implemented later.

For now, establish a clean Tailwind foundation.

Use:

* readable typography
* simple spacing
* accessible contrast
* responsive layout

Do NOT spend significant time designing the final landing page.

Do NOT add:

* gradients
* unnecessary animations
* decorative effects
* excessive colors

The final CivicWatch visual identity will be developed in Milestone 1.

---

# 19. GIT CONFIGURATION

Create a proper `.gitignore`.

It must exclude at minimum:

```text
node_modules/
.env
.env.*
!.env.example
uploads/*
logs/
dist/
coverage/
```

Do not commit:

* real API keys
* database passwords
* JWT secrets
* uploaded files
* generated build files

If the repository is initialized during this milestone, make a clean initial commit after verifying the project.

---

# 20. DOCUMENTATION

Create:

```text
README.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/API.md
```

---

## README.md

Document:

* Project name
* Purpose
* Current milestone
* Technology stack
* Requirements
* Installation
* MySQL setup
* Environment variables
* Frontend startup
* Backend startup
* Migration commands
* Health check
* Development workflow

Include commands such as:

```text
npm install
npm run dev
```

using the package manager selected for the project.

---

## ARCHITECTURE.md

Document:

```text
Frontend
↓
REST API
↓
Express
↓
Services / Controllers
↓
MySQL
```

Explain the purpose of the major directories.

---

## DATABASE.md

Document:

* MySQL requirements
* Database creation
* Environment variables
* Migration strategy
* Migration naming
* How future milestones should add tables

Make it clear that database tables will be introduced incrementally.

---

## API.md

Document:

```text
GET /api/health
```

Include:

* method
* URL
* purpose
* response
* possible failure response

---

# 21. FUTURE MILESTONE CONTRACT

The foundation must make the following future milestones easy to implement.

### Milestone 1

Landing Page.

It should be possible to add the public CivicWatch website without restructuring the foundation.

### Milestone 2

Authentication.

It should be possible to add:

* users
* roles
* registration
* login
* logout
* password hashing
* JWT/session handling
* protected routes

without replacing the existing backend architecture.

### Milestone 3+

Future features should follow the same structure:

```text
route
↓
controller
↓
service
↓
database/model layer
```

Do not place large amounts of business logic directly inside route files.

---

# 22. TESTING

Before considering Milestone 0 complete, test all of the following.

### Backend

* Backend starts successfully.
* Environment variables load correctly.
* MySQL connection works.
* Connection pool works.
* `/api/health` works.
* Invalid API routes return a controlled 404.
* Server errors use centralized error handling.
* CORS works as configured.
* Helmet is active.
* Rate limiting is active.
* Server shuts down cleanly.

### Frontend

* Vite starts successfully.
* React application loads.
* React Router works.
* Tailwind works.
* API service can reach the backend.
* Health page displays the actual API/database state.

### Database

* Database can be created.
* Migration mechanism works.
* Migration tracking works if implemented.
* No destructive database operations occur automatically.

---

# 23. DEFINITION OF DONE

Milestone 0 is complete only when all of the following are true:

* [ ] Fresh CivicWatch project created.
* [ ] No previous CivicWatch source code reused.
* [ ] No Docker used.
* [ ] React + Vite configured.
* [ ] JavaScript/JSX only.
* [ ] Tailwind configured.
* [ ] React Router configured.
* [ ] Express backend configured.
* [ ] MySQL connection pool configured.
* [ ] Environment variables configured.
* [ ] `.env` excluded from Git.
* [ ] Database migration foundation created.
* [ ] Health API created.
* [ ] Frontend communicates with backend.
* [ ] Backend verifies database connectivity.
* [ ] Centralized error handling exists.
* [ ] CORS configured.
* [ ] Helmet configured.
* [ ] Rate limiting configured.
* [ ] Zod validation foundation exists.
* [ ] Graceful shutdown implemented.
* [ ] README created.
* [ ] Architecture documentation created.
* [ ] Database documentation created.
* [ ] API documentation created.
* [ ] Frontend starts without errors.
* [ ] Backend starts without errors.
* [ ] MySQL connects successfully.
* [ ] Health check works.
* [ ] No future CivicWatch feature has been prematurely implemented.

---

# 24. STRICT DO-NOT-DO LIST

Do NOT implement:

* Landing page
* Citizen registration UI
* Login UI
* Authentication
* JWT authentication logic
* User roles
* Citizen dashboard
* Incident reporting
* Report tracking
* Admin dashboard
* Admin users
* Notifications
* AI verification
* Gemini integration
* CivicWatch map
* Leaflet functionality
* Civic alerts
* Surveys
* Consultations
* Petitions
* AI Civic Assistant
* Analytics
* Audit logs
* Production deployment
* Payment systems
* Email systems
* SMS systems
* WhatsApp integration
* Docker
* Kubernetes

Do not create placeholder versions of these features just to say they exist.

The purpose of this milestone is the **technical foundation only**.

---

# 25. DEVELOPMENT WORKFLOW

Follow this process instead of generating everything blindly.

### Step 1

Inspect the current directory.

Determine whether it is empty or already contains the newly initialized CivicWatch project.

Do not reuse unrelated old projects.

### Step 2

Create the project structure.

### Step 3

Install and configure dependencies.

### Step 4

Configure frontend.

### Step 5

Configure backend.

### Step 6

Configure MySQL.

### Step 7

Create migration foundation.

### Step 8

Implement health API.

### Step 9

Connect frontend to health API.

### Step 10

Run the complete application.

### Step 11

Test frontend, backend, and database.

### Step 12

Fix all errors before declaring the milestone complete.

### Step 13

Update documentation.

Do not proceed into Milestone 1 automatically.

Stop after Milestone 0 is working.

---

# 26. FINAL OUTPUT REQUIRED

When finished, provide a concise implementation report containing:

```text
Milestone:
M0 — Project Foundation

Frontend:
...

Backend:
...

Database:
...

API:
...

Security:
...

Files created:
...

Commands used:
...

Health check:
...

Known issues:
...

Ready for:
M1 — Landing Page
```

Only report features that were actually implemented and tested.

Do not claim something works if it was not tested.
Do not hide errors.

The project must be left in a clean state ready for the next milestone.
