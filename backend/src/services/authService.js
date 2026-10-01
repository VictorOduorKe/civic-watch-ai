import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_secret_change_in_production_min32chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Generate a signed JWT for the authenticated user.
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Register a new Citizen user.
 * Always assigns the role 'Citizen' regardless of any client inputs.
 */
export async function registerUser({ fullName, email, phone, password, county, ward }) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if email already registered
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (existing.length > 0) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password with bcrypt
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 3. Insert user into MySQL (enforcing role 'Citizen')
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, county, ward, role, is_active, email_verified)
     VALUES (?, ?, ?, ?, ?, ?, 'Citizen', 1, 0)`,
    [fullName.trim(), normalizedEmail, phone.trim(), passwordHash, county.trim(), ward ? ward.trim() : null]
  );

  const userId = result.insertId;

  // 4. Generate JWT token
  const token = generateToken({
    id: userId,
    email: normalizedEmail,
    role: 'Citizen'
  });

  const safeUser = {
    id: userId,
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    county: county.trim(),
    ward: ward ? ward.trim() : null,
    role: 'Citizen',
    isActive: true,
    emailVerified: false,
    createdAt: new Date().toISOString()
  };

  return { user: safeUser, token };
}

/**
 * Authenticate user with email and password.
 * Returns safe user information and JWT.
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Fetch user by normalized email
  const [rows] = await pool.query(
    `SELECT id, full_name, email, phone, password_hash, county, ward, role, is_active, email_verified, created_at, last_login_at
     FROM users WHERE email = ? LIMIT 1`,
    [normalizedEmail]
  );

  // Generic message prevents account enumeration
  if (rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = rows[0];

  // 2. Check active status
  if (!user.is_active) {
    const error = new Error('Your account is currently inactive. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Compare password hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 4. Update last_login_at timestamp
  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

  // 5. Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  const safeUser = {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    county: user.county,
    ward: user.ward,
    role: user.role,
    isActive: Boolean(user.is_active),
    emailVerified: Boolean(user.email_verified),
    createdAt: user.created_at,
    lastLoginAt: new Date().toISOString()
  };

  return { user: safeUser, token };
}

/**
 * Retrieve safe user profile by primary ID.
 */
export async function getUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, full_name, email, phone, county, ward, role, is_active, email_verified, created_at, last_login_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  if (!user.is_active) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    county: user.county,
    ward: user.ward,
    role: user.role,
    isActive: Boolean(user.is_active),
    emailVerified: Boolean(user.email_verified),
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at
  };
}
