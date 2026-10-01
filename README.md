# CivicWatch AI Kenya

CivicWatch AI Kenya is an AI-powered civic engagement and public accountability platform built for the **Open Civic Lab (OCL)**.

---

## Current Milestone: Milestone 4 (Incident Reporting Module)

This repository contains the completed public presentation layer, database foundation, real authentication system, citizen workspace, and authenticated incident reporting workflow for CivicWatch AI Kenya:
* **Incident Reporting Module (M4)**: Authenticated intake flow at `/reports/new`, dynamic category loading from database (12 categories with icons and descriptions), location metadata (47 Kenyan counties, sub-county, ward, landmark, GPS auto-detection), incident date/time, optional file attachments (up to 5 files, 5MB each, JPG/PNG/WEBP/PDF), anonymous submission privacy toggle, preferred contact selection, emergency 999/112 advisory, atomic database transactions with rollback cleanup, and server-side reference generation (`CWK-YYYY-XXXXXX`).
* **Citizen Dashboard & Workspace (M3)**: Authenticated dashboard at `/dashboard` and profile at `/profile`, responsive sidebar & mobile navigation drawer, real user identity welcome banner, live report counters from database, quick action workflow triggers, recent activity empty states, and educational guidance cards.
* **Authentication & Identity (M2)**: Registration with Kenyan county selection, secure login, profile inspection, JWT token lifecycle, persistent authentication context (`AuthContext`), password hashing with bcrypt, Zod validation, and protected routing.
* **Landing Page (M1)**: Public website at `/` with responsive navigation, hero section, planned capabilities, workflow overview, responsible civic-tech principles, Open Civic Lab introduction, and transparent roadmap modals.
* **M0 Foundation**: React 18 + Vite frontend, Express backend, MySQL connection pool, database migrations, security middleware, and real-time health verification endpoint (`GET /api/health` and `/status`).

---

## Technology Stack

* **Frontend**: React 18, Vite, React Router v6, Tailwind CSS v3, Axios
* **Backend**: Node.js v20+, Express.js v4, mysql2, dotenv, cors, helmet, express-rate-limit, zod, bcryptjs, jsonwebtoken
* **Database**: MySQL 8+ / MariaDB 10.5+
* **Language**: JavaScript (ES Modules, JSX) — *No TypeScript*

---

## Requirements

1. **Node.js**: `v20.0.0` or newer (Tested on Node `v24.15.0`)
2. **npm**: `v10.0.0` or newer
3. **MySQL / MariaDB**: `v8.0+` or `v10.5+` running locally on port 3306

---

## Installation

Clone the repository and install all dependencies:

```bash
# 1. Install root orchestrator dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Install frontend dependencies
cd frontend && npm install && cd ..
```

---

## MySQL Setup

Create the local database:

```sql
CREATE DATABASE IF NOT EXISTS `civic_ai_watch-db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## Environment Variables

Copy the example environment files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure your MySQL credentials in `backend/.env`:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=civic_ai_watch-db
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=development_jwt_secret_change_in_production_min32chars
JWT_EXPIRES_IN=1d
GEMINI_API_KEY=
```

---

## Database Migrations

Run database migrations to initialize tracking tables:

```bash
npm run migrate
```

---

## Development Workflow

### Starting Frontend and Backend Concurrently

From the root project directory:

```bash
npm run dev
```

This starts:
* **Backend API**: `http://localhost:5000`
* **Frontend App**: `http://localhost:5173`

### Starting Individually

To start the backend only:
```bash
npm run dev:backend
# or: cd backend && npm run dev
```

To start the frontend only:
```bash
npm run dev:frontend
# or: cd frontend && npm run dev
```

---

## Application & Verification Routes
 
* **Backend Health API**: `http://localhost:5000/api/health`
* **Public Landing Page**: `http://localhost:5173/`
* **Citizen Login Page**: `http://localhost:5173/login`
* **Citizen Registration Page**: `http://localhost:5173/register`
* **Citizen Workspace (M3)**: `http://localhost:5173/dashboard` (Protected)
* **Citizen Incident Report (M4)**: `http://localhost:5173/reports/new` (Protected)
* **Citizen Profile (M3)**: `http://localhost:5173/profile` (Protected)
* **System Status Page**: `http://localhost:5173/status`

### Key API Endpoints

* **Authentication**:
  * `POST /api/auth/register` — Register a new citizen account
  * `POST /api/auth/login` — Sign in and obtain JWT
  * `GET /api/auth/me` — Retrieve active profile (requires Bearer token or cookie)
  * `POST /api/auth/logout` — Invalidate session cookie
* **Incident Reports (M4)**:
  * `GET /api/reports/categories` — Retrieve all active incident categories
  * `POST /api/reports` — Submit new incident report (multipart/form-data)
  * `GET /api/reports/stats/me` — Retrieve current citizen report count stats

---

## Documentation

* [Architecture Overview](file:///home/alpha/projects/civic-watch-ai/docs/ARCHITECTURE.md)
* [Database Guide & Migrations](file:///home/alpha/projects/civic-watch-ai/docs/DATABASE.md)
* [API Specification](file:///home/alpha/projects/civic-watch-ai/docs/API.md)

---

## Next Milestone

* **Milestone 5**: Incident Tracking & Citizen Report Status (Reference Search, Timeline, Feedback)