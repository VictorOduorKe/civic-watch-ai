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

  // Handle standard HTTP status errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    message: statusCode >= 500 && !isDev ? 'Internal Server Error' : message
  };

  // Only include debug details in development, never exposing secrets or full stacks in production
  if (isDev && statusCode >= 500) {
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
