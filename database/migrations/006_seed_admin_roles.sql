-- Migration 006: Seed Administrative Roles for OCL Administration
-- CivicWatch AI Kenya — Milestone 6

INSERT INTO users (
  full_name,
  email,
  phone,
  password_hash,
  county,
  ward,
  role,
  is_active,
  email_verified
) VALUES
  (
    'OCL Lead Administrator',
    'admin@civicwatch.ke',
    '+254700000001',
    '$2b$12$q4mZi937OgsWA9WahZ4Q0OiN5nlmvgNGKNef2LNfUhQNWyL8gMfry',
    'Nairobi',
    'Kilimani',
    'Admin',
    TRUE,
    TRUE
  ),
  (
    'Civic Oversight Moderator',
    'moderator@civicwatch.ke',
    '+254700000002',
    '$2b$12$q4mZi937OgsWA9WahZ4Q0OiN5nlmvgNGKNef2LNfUhQNWyL8gMfry',
    'Mombasa',
    'Mvita',
    'Moderator',
    TRUE,
    TRUE
  ),
  (
    'Public Data Analyst',
    'analyst@civicwatch.ke',
    '+254700000003',
    '$2b$12$q4mZi937OgsWA9WahZ4Q0OiN5nlmvgNGKNef2LNfUhQNWyL8gMfry',
    'Nakuru',
    'Nakuru Town East',
    'Analyst',
    TRUE,
    TRUE
  )
ON DUPLICATE KEY UPDATE
  role = VALUES(role),
  is_active = VALUES(is_active);
