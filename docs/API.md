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
    "resolved": 0
  }
}
```


