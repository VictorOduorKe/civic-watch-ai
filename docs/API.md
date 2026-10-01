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
