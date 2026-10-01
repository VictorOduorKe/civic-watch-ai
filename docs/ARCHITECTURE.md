# Architecture Documentation — CivicWatch AI Kenya

## Overview

CivicWatch AI Kenya is an AI-powered civic engagement and public accountability platform developed for the **Open Civic Lab (OCL)**.

This document details the architectural foundation established in **Milestone 0 (Project Foundation)**.

---

## High-Level Architecture Flow

```text
React 18 + Vite (Frontend)
       │
       │ HTTP / REST API (Axios, JSON)
       ▼
Node.js + Express (Backend)
  ├── Security Middleware (Helmet, CORS, Rate Limiting)
  ├── Request Logging (Sensitive-data safe)
  ├── Validation Layer (Zod Foundation)
  ├── Centralized Error Handling
  ├── Routing Layer (/api/health)
  ├── Controller & Service Layer
       │
       │ mysql2 Connection Pool
       ▼
MySQL 8+ Database (civic_ai_watch-db)
```

---

## Directory Structure & Architectural Purpose

```text
civicwatch-ai-kenya/
├── frontend/                     # Client application (React + Vite + Tailwind)
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── assets/               # Local icons and static media
│   │   ├── components/           # Reusable UI component building blocks
│   │   ├── context/              # React Context state providers (future milestones)
│   │   ├── features/             # Feature-specific components and logic
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layouts/              # Shell layouts (Navbar, Sidebar, Footer)
│   │   ├── pages/                # Route-level page components (HealthStatusPage)
│   │   ├── services/             # HTTP clients & API abstraction (api.js)
│   │   ├── utils/                # Client utility and formatting functions
│   │   ├── App.jsx               # Client router setup (react-router-dom)
│   │   ├── index.css             # Tailwind base & utilities
│   │   └── main.jsx              # Application bootstrap & DOM root render
│   ├── index.html                # HTML entrypoint
│   ├── package.json              # Frontend dependencies and scripts
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   └── vite.config.js            # Vite build and dev server config
│
├── backend/                      # Server application (Node.js + Express)
│   ├── src/
│   │   ├── config/               # Environment configuration & database pool setup
│   │   ├── controllers/          # HTTP request handlers and response formatters
│   │   ├── database/             # Database access helpers and utilities
│   │   ├── middleware/           # Express middleware (CORS, Helmet, RateLimit, Loggers, ErrorHandlers)
│   │   ├── models/               # Data access models and query abstractions (Milestone 2+)
│   │   ├── routes/               # Modular Express API routers
│   │   ├── services/             # Business logic layer
│   │   ├── utils/                # Server helper functions
│   │   ├── validators/           # Zod request validation schemas
│   │   ├── app.js                # Express app configuration & middleware pipeline
│   │   └── server.js             # HTTP server bootstrap, port binding & graceful shutdown
│   ├── uploads/                  # User uploads directory (gitignored)
│   ├── package.json              # Backend dependencies and scripts
│   └── .env.example              # Sample backend environment configuration
│
├── database/                     # Database infrastructure
│   ├── migrations/               # Incremental SQL migration scripts (001_*.sql)
│   ├── seeds/                    # Development seed scripts
│   └── migrate.js                # Migration runner tracking migrations in _migrations
│
├── docs/                         # Technical documentation
│   ├── ARCHITECTURE.md           # Architecture and directory documentation
│   ├── DATABASE.md               # Database setup, migrations, and schema guide
│   └── API.md                    # REST API specifications and contracts
│
├── .env.example                  # Root environment variable template
├── .gitignore                    # Git ignore file excluding sensitive files & build output
├── package.json                  # Root npm workspace orchestrator
└── README.md                     # Project overview and getting started guide
```

---

## Architectural Separation of Concerns

1. **Separation of App and Server (`app.js` vs `server.js`)**:
   - `app.js` configures the Express application pipeline: HTTP security headers, CORS origin whitelisting, rate limiting, request logging, JSON body parsing, route mounting, and centralized error handling.
   - `server.js` manages runtime lifecycle: reading environment variables, verifying database connectivity on boot, binding the HTTP listener, and intercepting `SIGINT`/`SIGTERM` for graceful shutdown.

2. **Layered Request Flow**:
   - **Route**: Declares endpoints and connects middleware (`routes/healthRoutes.js`).
   - **Validator**: Enforces schema validation using Zod before business execution (`middleware/validate.js`).
   - **Controller**: Extracts request data, calls services, and serializes HTTP responses (`controllers/healthController.js`).
   - **Service**: Implements business rules and orchestrates database interactions (`services/healthService.js`).
   - **Database**: Reusable connection pool with connection pooling and resource cleanup (`config/database.js`).

3. **Graceful Shutdown**:
   - When the process receives `SIGTERM` or `SIGINT`, it stops accepting new HTTP connections, closes the active HTTP listener, drains the `mysql2` connection pool, and cleanly terminates the process without leaking open sockets or connections.

4. **Security Hardening**:
   - `helmet` adds HTTP security headers (`X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`, etc.).
   - `cors` is locked to the configured `FRONTEND_URL` (`http://localhost:5173` by default).
   - `express-rate-limit` prevents brute-force floods while keeping thresholds suitable for development.
   - Sensitive fields (passwords, tokens, database credentials) are strictly stripped from logs and error responses.
