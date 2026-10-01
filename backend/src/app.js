import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { cookieParser } from './middleware/cookieParser.js';
import { csrfProtection } from './middleware/csrfMiddleware.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// 1. HTTP Security Headers
app.use(helmet());

// 2. CORS Configuration for Credentialed HttpOnly Cookie Architecture
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-XSRF-TOKEN',
    'x-xsrf-token',
    'X-CSRF-Token',
    'x-csrf-token'
  ]
}));

// 3. Cookie Parsing Middleware (must precede CSRF and routes)
app.use(cookieParser);

// 4. Rate Limiting (development-friendly: 200 requests per 15 min)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
app.use('/api', limiter);

// 5. Request Logging (sensitive-data safe: no credentials, headers, or cookies logged)
app.use(requestLogger);

// 6. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. CSRF Protection Middleware for state-changing requests
app.use('/api', csrfProtection);

// 8. API Routes
app.use('/api', routes);

// 9. 404 Handler for undefined routes
app.use(notFoundHandler);

// 10. Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
