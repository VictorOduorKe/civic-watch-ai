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
  "full_name": "Victor Oduor",
  "email": "victor@civicwatch.ke",
  "phone": "+254712345678",
  "password": "Password123!",
  "confirm_password": "Password123!",
  "county": "Nairobi",
  "ward": "Kilimani",
  "terms": true
}
```

#### Validation Rules

* `full_name`: 2–255 characters, required
* `email`: Valid email format, normalized to lower case, unique in database
* `phone`: Valid Kenyan or international phone format (e.g. `+254...`, `07...`)
* `password`: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
* `confirm_password`: Must match `password`
* `county`: Must be one of Kenya's 47 counties
* `ward`: Optional, up to 100 characters
* `terms`: Boolean, must be `true`
* *Note: Any `role` field sent in the request body is intentionally stripped and defaulted to `Citizen` to prevent privilege escalation.*

#### Success Response

* **HTTP Status**: `201 Created`
* **Content-Type**: `application/json`
* **Set-Cookie**: `token=<jwt>; HttpOnly; SameSite=Strict; Path=/`

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "full_name": "Victor Oduor",
    "email": "victor@civicwatch.ke",
    "phone": "+254712345678",
    "county": "Nairobi",
    "ward": "Kilimani",
    "role": "Citizen",
    "created_at": "2026-10-01T11:15:32.000Z"
  }
}
```

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
    "message": "An account with this email already exists"
  }
  ```

---

### `POST /api/auth/login`

Authenticates an existing user and returns a signed JWT and user session profile.

#### Request

* **Method**: `POST`
* **URL**: `/api/auth/login`
* **Authentication**: None (Public)
* **Headers**: `Content-Type: application/json`

```json
{
  "email": "victor@civicwatch.ke",
  "password": "Password123!"
}
```

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`
* **Set-Cookie**: `token=<jwt>; HttpOnly; SameSite=Strict; Path=/`

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "full_name": "Victor Oduor",
    "email": "victor@civicwatch.ke",
    "phone": "+254712345678",
    "county": "Nairobi",
    "ward": "Kilimani",
    "role": "Citizen",
    "created_at": "2026-10-01T11:15:32.000Z",
    "last_login_at": "2026-10-01T11:40:00.000Z"
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
    "message": "Account has been deactivated. Please contact support."
  }
  ```

---

### `GET /api/auth/me`

Retrieves the currently authenticated user's profile and validates token freshness.

#### Request

* **Method**: `GET`
* **URL**: `/api/auth/me`
* **Authentication**: Bearer Token or Cookie
* **Headers**: `Authorization: Bearer <token>`

#### Success Response

* **HTTP Status**: `200 OK`
* **Content-Type**: `application/json`

```json
{
  "success": true,
  "user": {
    "id": 1,
    "full_name": "Victor Oduor",
    "email": "victor@civicwatch.ke",
    "phone": "+254712345678",
    "county": "Nairobi",
    "ward": "Kilimani",
    "role": "Citizen",
    "created_at": "2026-10-01T11:15:32.000Z",
    "last_login_at": "2026-10-01T11:40:00.000Z"
  }
}
```

#### Error Response

* **401 Unauthorized** (Missing, expired, or invalid token):
  ```json
  {
    "success": false,
    "message": "Authentication required. Invalid or expired token."
  }
  ```

---

### `POST /api/auth/logout`

Clears the authentication cookie and ends the client session.

#### Request

* **Method**: `POST`
* **URL**: `/api/auth/logout`
* **Authentication**: Optional

#### Success Response

* **HTTP Status**: `200 OK`
* **Clear-Cookie**: `token=; Max-Age=0`

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

