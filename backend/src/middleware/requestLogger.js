/**
 * Lightweight request logger middleware.
 * Sanitizes and logs incoming HTTP requests without exposing sensitive data.
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Avoid logging sensitive headers or payload contents
    const logLine = `[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      console.error(logLine);
    } else if (statusCode >= 400) {
      console.warn(logLine);
    } else {
      console.log(logLine);
    }
  });

  next();
}

export default requestLogger;
