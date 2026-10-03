-- Migration 018: Create User and Role Management System
-- CivicWatch AI Kenya — Milestone 14: User & Role Management

-- 1. Extend users table with lifecycle, liaison, and identity attributes
ALTER TABLE users
  ADD COLUMN status ENUM('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'ACTIVE' AFTER is_active,
  ADD COLUMN identity_status ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNVERIFIED' AFTER status,
  ADD COLUMN is_county_liaison BOOLEAN NOT NULL DEFAULT FALSE AFTER identity_status,
  ADD COLUMN liaison_county VARCHAR(100) NULL AFTER is_county_liaison,
  ADD COLUMN liaison_sub_county VARCHAR(100) NULL AFTER liaison_county,
  ADD COLUMN suspension_reason TEXT NULL AFTER liaison_sub_county,
  ADD COLUMN suspended_at TIMESTAMP NULL AFTER suspension_reason,
  ADD COLUMN suspended_by INT NULL AFTER suspended_at,
  ADD INDEX idx_users_status (status),
  ADD INDEX idx_users_identity (identity_status),
  ADD INDEX idx_users_liaison (is_county_liaison, liaison_county);

-- Ensure is_active aligns with status for existing users
UPDATE users SET status = 'ACTIVE' WHERE is_active = 1;
UPDATE users SET status = 'SUSPENDED' WHERE is_active = 0;

-- 2. Create user_management_audits table for immutable administrative history
CREATE TABLE IF NOT EXISTS user_management_audits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT NOT NULL,
  target_user_id INT NOT NULL,
  action ENUM(
    'USER_ROLE_CHANGED',
    'USER_SUSPENDED',
    'USER_REACTIVATED',
    'STAFF_INVITED',
    'STAFF_CREATED',
    'COUNTY_LIAISON_CREATED',
    'COUNTY_ASSIGNMENT_CHANGED',
    'IDENTITY_VERIFIED',
    'IDENTITY_REJECTED',
    'USER_PROFILE_UPDATED'
  ) NOT NULL,
  previous_state JSON NULL,
  new_state JSON NULL,
  reason TEXT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uma_actor (actor_id),
  INDEX idx_uma_target (target_user_id),
  INDEX idx_uma_action (action),
  INDEX idx_uma_created (created_at),
  CONSTRAINT fk_uma_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_uma_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create identity_verification_records table
CREATE TABLE IF NOT EXISTS identity_verification_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED') NOT NULL,
  verified_by INT NULL,
  verified_at TIMESTAMP NULL,
  reason TEXT NULL,
  id_document_type VARCHAR(100) NULL,
  id_document_ref VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ivr_user (user_id),
  INDEX idx_ivr_status (status),
  INDEX idx_ivr_created (created_at),
  CONSTRAINT fk_ivr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ivr_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create staff_invitations table
CREATE TABLE IF NOT EXISTS staff_invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Moderator', 'Analyst') NOT NULL,
  is_county_liaison BOOLEAN NOT NULL DEFAULT FALSE,
  liaison_county VARCHAR(100) NULL,
  invitation_token VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMP NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP NULL,
  INDEX idx_si_email (email),
  INDEX idx_si_token (invitation_token),
  INDEX idx_si_status (status),
  CONSTRAINT fk_si_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
