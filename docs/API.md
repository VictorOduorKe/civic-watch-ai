# API Documentation — CivicWatch AI Kenya

All API endpoints are prefixed with `/api` and return standardized JSON responses.

---

## Health Check Endpoint

### `GET /api/health`

Verifies that the backend API is operating and actively probes the MySQL connection pool.

#### Request

* **Method**: `GET`
* **URL**: `/api/health`
* **Authentication**: None (Public)
* **Headers**: `Accept: application/json`

#### Success Response (API & Database Healthy)

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`

```json
{
  "success": true,
  "message": "CivicWatch AI Kenya API is running",
  "database": "connected",
  "timestamp": "2026-10-01T10:05:57.035Z"
}
```

#### Degraded Response (Database Unavailable)

When the backend server is running but MySQL is offline or cannot authenticate:

* **HTTP Status**: `503 Service Unavailable`
* **Content-Type**: `application/json`

```json
{
  "success": false,
  "message": "CivicWatch AI Kenya API is running (database unavailable)",
  "database": "disconnected",
  "timestamp": "2026-10-01T10:05:57.035Z"
}
```

#### Error Response (Unmatched Endpoint / 404)

* **HTTP Status**: `404 Not Found`
* **Content-Type**: `application/json`

```json
{
  "success": false,
  "message": "Resource not found: GET /api/unregistered-path"
}
```

#### Rate Limit Exceeded

* **HTTP Status**: `429 Too Many Requests`
* **Content-Type**: `application/json`

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth` and protected by a dedicated rate limiter (50 requests per 15-minute window).

### `POST /api/auth/register`

Registers a new citizen account with county and contact details.

#### Request

* **Method**: `POST`
* **URL**: `/api/auth/register`
* **Authentication**: None (Public)
* **Headers**: `Content-Type: application/json`

```json
{
  "fullName": "Victor Oduor",
  "email": "victor@example.com",
  "phone": "+254712345678",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "county": "Nairobi",
  "ward": "Kilimani",
  "termsAccepted": true
}
```

#### Validation Rules

* `fullName`: 2–100 characters, required
* `email`: Valid email format, normalized to lower case, unique in database
* `phone`: Valid format, 9–20 characters, digits and symbols
* `password`: Minimum 8 characters
* `confirmPassword`: Must match `password`
* `county`: Non-empty string, up to 100 characters
* `ward`: Optional string, up to 100 characters
* `termsAccepted`: Boolean, must be `true`
* *Note: Any `role` field sent in the request body is intentionally ignored and defaulted to `Citizen` to prevent privilege escalation.*

#### Success Response

* **HTTP Status**: `201 Created`
* **Content-Type**: `application/json`
* **Set-Cookie**:
  * `civicwatch_auth=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`
  * `XSRF-TOKEN=<csrf_token>; SameSite=Lax; Path=/; Max-Age=86400`

```json
{
  "success": true,
  "message": "Account created successfully.",
  "user": {
    "id": 1,
    "fullName": "Victor Oduor",
    "email": "victor@example.com",
    "phone": "+254712345678",
    "county": "Nairobi",
    "ward": "Kilimani",
    "role": "Citizen",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2026-10-01T11:12:31.000Z"
  }
}
```

*Note: In compliance with authentication hardening standards, raw JWT credentials are never returned in JSON and are stored exclusively in HttpOnly cookies.*

#### Error Responses

* **400 Bad Request** (Validation Error):
  ```json
  {
    "success": false,
    "message": "Validation error: Passwords do not match"
  }
  ```
* **409 Conflict** (Email Already Registered):
  ```json
  {
    "success": false,
    "message": "An account with this email address already exists."
  }
  ```

---

### `POST /api/auth/login`

Authenticates an existing user and establishes an HttpOnly session cookie.

#### Request

* **Method**: `POST`
* **URL**: `/api/auth/login`
* **Authentication**: None (Public)
* **Headers**:
  * `Content-Type: application/json`
  * `X-XSRF-TOKEN: <token>` (if CSRF cookie present)

```json
{
  "email": "victor@example.com",
  "password": "Password123!"
}
```

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`
* **Set-Cookie**:
  * `civicwatch_auth=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`
  * `XSRF-TOKEN=<csrf_token>; SameSite=Lax; Path=/; Max-Age=86400`

```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": 1,
    "fullName": "Victor Oduor",
    "email": "victor@example.com",
    "phone": "+254712345678",
    "county": "Nairobi",
    "ward": "Kilimani",
    "role": "Citizen",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2026-10-01T11:12:31.000Z",
    "lastLoginAt": "2026-10-01T11:46:19.640Z"
  }
}
```

#### Error Responses

* **401 Unauthorized** (Invalid credentials):
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```
* **403 Forbidden** (Deactivated account):
  ```json
  {
    "success": false,
    "message": "Your account is currently inactive. Please contact support."
  }
  ```

---

### `GET /api/auth/me`

Retrieves the currently authenticated user's profile using the HttpOnly cookie.

#### Request

* **Method**: `GET`
* **URL**: `/api/auth/me`
* **Authentication**: Automatic HttpOnly cookie (`civicwatch_auth`)

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`

```json
{
  "success": true,
  "user": {
    "id": 1,
    "fullName": "Victor Oduor",
    "email": "victor@civicwatch.ke",
    "phone": "+254712345678",
    "county": "Nairobi",
    "ward": "Kilimani",
    "role": "Citizen",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2026-10-01T11:15:32.000Z",
    "lastLoginAt": "2026-10-01T11:40:00.000Z"
  }
}
```

#### Error Response

* **401 Unauthorized** (Missing, expired, or invalid cookie):
  ```json
  {
    "success": false,
    "message": "Authentication required. Please log in."
  }
  ```

---

### `GET /api/auth/csrf-token`

Issues a Double-Submit CSRF token cookie (`XSRF-TOKEN`) for client requests.

#### Request

* **Method**: `GET`
* **URL**: `/api/auth/csrf-token`
* **Authentication**: None (Public)

#### Success Response

* **HTTP Status**: `200 OK`
* **Set-Cookie**: `XSRF-TOKEN=<token>; SameSite=Lax; Path=/`

```json
{
  "success": true,
  "csrfToken": "4f9b8c2e..."
}
```

---

### `POST /api/auth/logout`

Clears both authentication and CSRF cookies, revoking the client session.

#### Request

* **Method**: `POST`
* **URL**: `/api/auth/logout`
* **Headers**: `X-XSRF-TOKEN: <token>`

#### Success Response

* **HTTP Status**: `200 OK`
* **Clear-Cookie**:
  * `civicwatch_auth=; Path=/; Max-Age=0`
  * `XSRF-TOKEN=; Path=/; Max-Age=0`

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```


---

## Incident Reporting Endpoints (Milestone 4)

All incident reporting endpoints are prefixed with `/api/reports`. Report submission requires an active authenticated session and is rate limited (25 requests per 15-minute window).

### `GET /api/reports/categories`

Retrieves all active incident categories for public and citizen reporting forms.

#### Request

* **Method**: `GET`
* **URL**: `/api/reports/categories`
* **Authentication**: None (Public / Authenticated)

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`

```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Infrastructure",
      "description": "Issues involving roads, potholes, drainage, bridges, street lighting, and public buildings."
    },
    {
      "id": 2,
      "name": "Public Services",
      "description": "Challenges with water supply, power outages, municipal garbage collection, sanitation, and sewer systems."
    },
    {
      "id": 3,
      "name": "Corruption Concern",
      "description": "Reports of bribery, extortion, embezzlement, misuse of public funds, or procurement irregularities."
    }
  ]
}
```

---

### `POST /api/reports`

Submits a new incident report with location details, preferences, and optional attachments.

#### Request

* **Method**: `POST`
* **URL**: `/api/reports`
* **Authentication**: Bearer Token or Cookie (`requireAuth`)
* **Headers**: `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`

#### Multipart Form Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `category_id` | Integer | Yes | ID of an active record from `report_categories` |
| `title` | String | Yes | Incident title (3–255 characters) |
| `description` | String | Yes | Comprehensive narrative of the incident (10–5000 characters) |
| `county` | String | Yes | One of Kenya's 47 counties |
| `sub_county` | String | No | Sub-county or constituency |
| `ward` | String | No | Administrative ward |
| `location_text` | String | No | Landmark description (up to 255 chars) |
| `latitude` | Float | No | Decimal GPS latitude between -90 and 90 |
| `longitude` | Float | No | Decimal GPS longitude between -180 and 180 |
| `incident_date` | String | No | Date in `YYYY-MM-DD` format |
| `incident_time` | String | No | Time in `HH:MM` format |
| `is_anonymous` | Boolean | No | Defaults to `false`. Hides identity on report views |
| `preferred_contact` | Enum | No | `'none'`, `'email'`, or `'phone'`. Defaults to `'none'` |
| `attachments` | File(s) | No | Up to 5 files (JPG, PNG, WEBP, PDF; max 5 MB each) |

*Note: `user_id`, `report_reference`, and `status` are strictly derived and generated server-side. Client overrides are rejected.*

#### Success Response

* **HTTP Status**: `201 Created`
* **Content-Type**: `application/json`

```json
{
  "success": true,
  "message": "Report submitted successfully.",
  "report": {
    "reference": "CWK-2026-000001",
    "status": "Submitted",
    "created_at": "2026-10-01T12:30:42.054Z"
  }
}
```

#### Error Responses

* **400 Bad Request** (Validation Error or Unsupported File):
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      {
        "field": "body.title",
        "message": "Incident title is required"
      }
    ]
  }
  ```
* **401 Unauthorized** (Missing or invalid token):
  ```json
  {
    "success": false,
    "message": "Authentication required. No token provided."
  }
  ```
* **429 Too Many Requests** (Rate Limit Exceeded):
  ```json
  {
    "success": false,
    "message": "Too many report submissions. Please wait before submitting another report."
  }
  ```

---

### `GET /api/reports/stats/me`

Retrieves real report counts submitted by the authenticated citizen.

#### Request

* **Method**: `GET`
* **URL**: `/api/reports/stats/me`
* **Authentication**: Bearer Token or Cookie (`requireAuth`)

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`

```json
{
  "success": true,
  "stats": {
    "submitted": 2,
    "underReview": 0,
    "inProgress": 0,
    "resolved": 0,
    "total": 2
  }
}
```

---

### `GET /api/reports/my`

Retrieves paginated incident reports submitted by the authenticated citizen with search, status filtering, category filtering, and sorting.

#### Request

* **Method**: `GET`
* **URL**: `/api/reports/my`
* **Authentication**: Cookie (`civicwatch_auth`) or Bearer token (`requireAuth`)
* **Query Parameters**:
  * `page` (optional integer, min: 1, default: 1)
  * `limit` (optional integer, min: 1, max: 50, default: 10)
  * `status` (optional string, e.g. `'Submitted'`, `'Under Review'`, `'In Progress'`, `'Resolved'`)
  * `category_id` (optional integer)
  * `search` (optional string, max 100 chars, searches reference, title, description)
  * `sort` (optional string whitelist: `'created_at'`, `'updated_at'`, `'incident_date'`, default: `'updated_at'`)
  * `order` (optional string whitelist: `'ASC'`, `'DESC'`, default: `'DESC'`)

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`

```json
{
  "success": true,
  "reports": [
    {
      "reference": "CWK-2026-000001",
      "title": "Major Pothole along Argwings Kodhek Road",
      "category": {
        "id": 1,
        "name": "Infrastructure"
      },
      "county": "Nairobi",
      "sub_county": "Kilimani",
      "ward": "Kilimani",
      "status": "Submitted",
      "is_anonymous": false,
      "attachment_count": 1,
      "incident_date": "2026-10-01",
      "created_at": "2026-10-01T12:30:42.000Z",
      "updated_at": "2026-10-01T12:30:42.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### `GET /api/reports/my/summary`

Retrieves real database counts of the authenticated citizen's reports categorized by lifecycle status.

#### Request

* **Method**: `GET`
* **URL**: `/api/reports/my/summary`
* **Authentication**: Cookie (`civicwatch_auth`) or Bearer token (`requireAuth`)

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`

```json
{
  "success": true,
  "summary": {
    "total": 4,
    "submitted": 2,
    "underReview": 1,
    "verified": 0,
    "assigned": 0,
    "inProgress": 1,
    "resolved": 0,
    "closed": 0,
    "rejected": 0
  }
}
```

---

### `GET /api/reports/my/:reference`

Retrieves citizen-safe details, attachments metadata, and visible status progression timeline for a report owned by the authenticated citizen.

#### Request

* **Method**: `GET`
* **URL**: `/api/reports/my/:reference`
* **Authentication**: Cookie (`civicwatch_auth`) or Bearer token (`requireAuth`)
* **Path Parameters**:
  * `reference`: Valid report reference format (`CWK-YYYY-XXXXXX`)

#### Ownership Authorization Rule

If the report reference belongs to another user, or does not exist, the API returns a generic `404 Not Found` response with message `"Report not found"`. No information regarding whether the reference exists under another user is revealed.

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`

```json
{
  "success": true,
  "report": {
    "reference": "CWK-2026-000001",
    "title": "Major Pothole along Argwings Kodhek Road",
    "description": "Severe road surface erosion causing dangerous vehicle swerving.",
    "category": {
      "id": 1,
      "name": "Infrastructure",
      "description": "Issues involving roads, potholes, drainage..."
    },
    "county": "Nairobi",
    "sub_county": "Kilimani",
    "ward": "Kilimani",
    "location_text": "Near the intersection",
    "latitude": -1.286389,
    "longitude": 36.817223,
    "incident_date": "2026-10-01",
    "incident_time": "14:20",
    "is_anonymous": false,
    "preferred_contact": "none",
    "status": "Submitted",
    "created_at": "2026-10-01T12:30:42.000Z",
    "updated_at": "2026-10-01T12:30:42.000Z",
    "attachments": [
      {
        "id": 1,
        "original_name": "evidence.pdf",
        "mime_type": "application/pdf",
        "size_bytes": 1048576,
        "created_at": "2026-10-01T12:30:42.000Z"
      }
    ],
    "status_history": [
      {
        "id": 1,
        "status": "Submitted",
        "note": "Report submitted by citizen.",
        "created_at": "2026-10-01T12:30:42.000Z"
      }
    ]
  }
}
```

---

### `GET /api/reports/my/:reference/attachments/:attachmentId`

Securely downloads an attachment belonging to an owned report after verifying the complete ownership chain (`User -> Report -> Attachment`).

#### Request

* **Method**: `GET`
* **URL**: `/api/reports/my/:reference/attachments/:attachmentId`
* **Authentication**: Cookie (`civicwatch_auth`) or Bearer token (`requireAuth`)
* **Headers**: `X-Content-Type-Options: nosniff`

#### Security Checks

1. Requester must be authenticated.
2. Report with `:reference` must exist and belong to `req.user.id`.
3. Attachment with `:attachmentId` must belong to this specific report.
4. If any check fails, returns `404 Not Found`.

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `<attachment.mime_type>`
* **Content-Disposition**: `attachment; filename="<original_name>"`




---

## Admin Dashboard API (Milestone 6)

All admin endpoints require authentication (`civicwatch_auth` HttpOnly cookie) and one of the roles: `Admin`, `Moderator`, or `Analyst`. Citizens receive `403 Forbidden`.

---

### `GET /api/admin/dashboard/summary`

Returns aggregated civic incident and user statistics for the OCL Administrative Dashboard.

#### Request

* **Method**: `GET`
* **URL**: `/api/admin/dashboard/summary`
* **Authentication**: Cookie (`civicwatch_auth`) — Required
* **Authorization**: Roles `Admin`, `Moderator`, `Analyst` only
* **Rate Limit**: 150 requests per 15 minutes per IP
* **Query Parameters**:

| Parameter | Type | Required | Values | Default |
|---|---|---|---|---|
| `range` | `string` | No | `7d`, `30d`, `90d`, `year`, `all` | `30d` |

#### Success Response

* **HTTP Status**: `200 OK`

```json
{
  "success": true,
  "data": {
    "total_reports": 16,
    "reports_by_status": {
      "Submitted": 4,
      "Under Review": 3,
      "Verified": 1,
      "Assigned": 2,
      "In Progress": 2,
      "Resolved": 3,
      "Closed": 1,
      "Rejected": 0
    },
    "reports_by_category": [
      { "category_name": "Road & Infrastructure", "count": 5 }
    ],
    "reports_by_county": [
      { "county": "Nairobi", "count": 7 }
    ],
    "reports_over_time": [
      { "date": "2026-09-25", "count": 2 }
    ],
    "users": {
      "total": 17,
      "citizens": 14,
      "admins": 1,
      "moderators": 1,
      "analysts": 1
    }
  }
}
```

#### Error Responses

| HTTP Status | Condition |
|---|---|
| `400 Bad Request` | Invalid `range` parameter |
| `401 Unauthorized` | Not authenticated |
| `403 Forbidden` | Authenticated but role is `Citizen` |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Database or server error |

#### Security Notes

* Returns `403` for `Citizen` role accounts.
* `range` is validated with a strict Zod allowlist before use in SQL.
* All date arithmetic uses parameterized MySQL `DATE_SUB` — no string interpolation.

---

## Admin Incident Management API (Milestone 7)

All incident management endpoints require authentication via the secure HttpOnly cookie (`civicwatch_auth`).
* **Read Access** (`GET`): Permitted for `Admin`, `Moderator`, and `Analyst` roles.
* **Mutation Access** (`POST`, `PATCH`): Restricted to `Admin` and `Moderator` roles only. `Analyst` and `Citizen` roles receive `403 Forbidden`.
* **Citizen Boundary**: Citizens are strictly blocked from all `/api/admin/incidents` routes.

---

### `GET /api/admin/incidents`

Lists reports with debounced search, filtering, sorting, and pagination.

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `page` | `integer` | No | Page number (default: 1) |
| `limit` | `integer` | No | Items per page (default: 20, max: 50) |
| `status` | `string` | No | Filter by report status |
| `category_id` | `integer` | No | Filter by category ID |
| `county` | `string` | No | Filter by Kenyan county |
| `search` | `string` | No | Search across reference code, title, and description |
| `assigned` | `string` | No | `all`, `assigned`, or `unassigned` |
| `date_from` | `string` | No | ISO date (`YYYY-MM-DD`) |
| `date_to` | `string` | No | ISO date (`YYYY-MM-DD`) |
| `sort` | `string` | No | `updated_at`, `created_at`, `incident_date`, `status`, `title` |
| `order` | `string` | No | `ASC` or `DESC` (default: `DESC`) |

#### Success Response (`200 OK`)

```json
{
  "success": true,
  "incidents": [
    {
      "reference": "CWK-2026-000001",
      "title": "Damaged culvert near trading center",
      "category": { "id": 1, "name": "Road & Infrastructure" },
      "county": "Mombasa",
      "sub_county": "Nyali",
      "ward": "Frere Town",
      "status": "Under Review",
      "is_anonymous": false,
      "attachment_count": 2,
      "incident_date": "2026-09-30T10:00:00.000Z",
      "created_at": "2026-10-01T08:15:00.000Z",
      "updated_at": "2026-10-01T09:20:00.000Z",
      "assigned_to": {
        "id": 2,
        "name": "Civic Oversight Moderator",
        "role": "Moderator",
        "assigned_at": "2026-10-01T09:20:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### `GET /api/admin/incidents/assignees`

Returns active staff members eligible to receive case assignments (`Admin` and `Moderator` roles only).

#### Success Response (`200 OK`)

```json
{
  "success": true,
  "assignees": [
    {
      "id": 1,
      "full_name": "System Administrator",
      "email": "admin@civicwatch.ke",
      "role": "Admin",
      "county": "Nairobi"
    },
    {
      "id": 2,
      "full_name": "Civic Oversight Moderator",
      "email": "moderator@civicwatch.ke",
      "role": "Moderator",
      "county": "Nairobi"
    }
  ]
}
```

---

### `GET /api/admin/incidents/:reference`

Retrieves complete incident dossier for administrative review, including current assignment, internal notes, published citizen updates, referrals, attachments, and complete status timeline.

#### Success Response (`200 OK`)

```json
{
  "success": true,
  "incident": {
    "reference": "CWK-2026-000001",
    "title": "Damaged culvert near trading center",
    "description": "Culvert collapse causing water stagnation and road hazard.",
    "status": "Under Review",
    "is_anonymous": false,
    "incident_date": "2026-09-30T10:00:00.000Z",
    "created_at": "2026-10-01T08:15:00.000Z",
    "updated_at": "2026-10-01T09:20:00.000Z",
    "location": {
      "county": "Mombasa",
      "sub_county": "Nyali",
      "ward": "Frere Town",
      "landmark": "Near Main Market",
      "latitude": -4.0435,
      "longitude": 39.6682
    },
    "category": {
      "id": 1,
      "name": "Road & Infrastructure"
    },
    "reporter": {
      "id": 4,
      "name": "Victor Citizen",
      "email": "citizen@example.com",
      "phone": "+254712345678"
    },
    "current_assignment": {
      "id": 1,
      "assigned_to_user_id": 2,
      "assigned_to_name": "Civic Oversight Moderator",
      "assigned_to_email": "moderator@civicwatch.ke",
      "assigned_to_role": "Moderator",
      "assigned_by_user_id": 1,
      "assigned_by_name": "System Administrator",
      "assignment_note": "Please review highway authority jurisdiction.",
      "assigned_at": "2026-10-01T09:20:00.000Z"
    },
    "assignment_history": [],
    "internal_notes": [],
    "citizen_updates": [],
    "referrals": [],
    "status_history": [],
    "attachments": []
  }
}
```

*Note: For anonymous submissions (`is_anonymous = true`), `reporter` contains only `{ is_anonymous: true }` unless the authenticated role possesses explicit user management privileges.*

---

### `PATCH /api/admin/incidents/:reference/status`

Changes report status. Validates transition rules, records status history with actor tracking, and optionally publishes a citizen-visible notice within an atomic transaction.

#### Request Body

```json
{
  "status": "Under Review",
  "note": "Case opened for operational triage and preliminary verification.",
  "publish_citizen_update": true,
  "citizen_message": "Your report has been received and is currently under review by our triage team."
}
```

#### Transition Matrix

* `Submitted` → `Under Review`, `Rejected`, `Dismissed`
* `Under Review` → `Verified`, `Assigned`, `In Progress`, `Rejected`, `Dismissed`, `Submitted`
* `Verified` → `Assigned`, `In Progress`, `Under Review`, `Rejected`, `Dismissed`
* `Assigned` → `In Progress`, `Under Review`, `Verified`, `Rejected`, `Dismissed`
* `In Progress` → `Resolved`, `Under Review`, `Assigned`, `Rejected`, `Dismissed`
* `Resolved` → `Closed`, `In Progress`, `Under Review`
* `Closed` → `Under Review` *(Controlled reopen)*
* `Rejected` / `Dismissed` → `Under Review`, `Submitted`

---

### `POST /api/admin/incidents/:reference/assign`

Assigns or reassigns the incident to an eligible staff member (`Admin` or `Moderator`). Automatically marks previous assignment with `unassigned_at` timestamp.

#### Request Body

```json
{
  "assigned_to_user_id": 2,
  "assignment_note": "Assigned to regional moderator for county liaison."
}
```

---

### `POST /api/admin/incidents/:reference/unassign`

Removes the active assignment without deleting historical records (`unassigned_at` set to current timestamp).

#### Request Body

```json
{
  "reason": "Reallocating regional workload."
}
```

---

### `POST /api/admin/incidents/:reference/internal-notes`

Appends a staff-only investigation note.

#### Request Body

```json
{
  "note": "Spoke with county engineer; site visit scheduled for tomorrow morning."
}
```

---

### `POST /api/admin/incidents/:reference/updates`

Publishes a formal operational notice to the citizen who submitted the report.

#### Request Body

```json
{
  "message": "County engineers have been dispatched to inspect the reported culvert."
}
```

---

### `POST /api/admin/incidents/:reference/referrals`

Creates a formal external referral record.

#### Request Body

```json
{
  "referral_type": "Public Service Authority",
  "organization_name": "Kenya National Highways Authority (KeNHA)",
  "reason": "Road maintenance on national highway corridor falls under KeNHA jurisdiction."
}
```

---

### `PATCH /api/admin/incidents/:reference/referrals/:referralId`

Updates referral status (`Pending`, `Sent`, `Accepted`, `Declined`, `Completed`, `Cancelled`).

#### Request Body

```json
{
  "status": "Sent"
}
```

---

### `GET /api/admin/incidents/:reference/attachments/:attachmentId`

Securely downloads an incident attachment after verifying administrative authorization.

