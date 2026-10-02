import { ZodError } from 'zod';

/**
 * Centralized API Error Handling Middleware.
 * Provides consistent JSON responses across all endpoints.
 */
export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Handle CORS rejections cleanly
  if (err.message && err.message.includes('CORS origin not allowed')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: CORS origin not allowed.'
    });
  }

  // Handle standard HTTP status errors
  const statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Prevent leaking internal SQL syntax or database structure
  const isSqlError = Boolean(
    err.code && (err.code.startsWith('ER_') || err.code.startsWith('SQLSTATE') || err.sqlState)
  );

  if (isSqlError) {
    console.error(`[Database Error] ${err.code}:`, err.message);
    message = isDev ? `Database Error: ${err.code}` : 'A database operation could not be completed.';
  } else if (statusCode >= 500 && !isDev) {
    message = 'Internal Server Error';
  }

  const response = {
    success: false,
    message
  };

  // Only include safe debug details in development, never exposing secrets or stacks in production
  if (isDev && statusCode >= 500 && !isSqlError) {
    response.debug = {
      name: err.name,
      message: err.message
    };
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found Handler for unmatched routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}

export default errorHandler;
