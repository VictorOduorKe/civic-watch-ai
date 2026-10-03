-- Migration 020: Create System Audit Logging & Platform Governance Settings
-- CivicWatch AI Kenya — Milestone 16

-- 1. Immutable Audit Events Table (Chained Hashes Tamper-Evident Trail)
CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL UNIQUE,
  actor_id INT NULL,
  actor_email VARCHAR(255) NULL,
  actor_role VARCHAR(50) NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NULL,
  outcome ENUM('SUCCESS', 'FAILURE', 'DENIED', 'BLOCKED') NOT NULL DEFAULT 'SUCCESS',
  severity ENUM('INFO', 'NOTICE', 'WARNING', 'SECURITY', 'CRITICAL') NOT NULL DEFAULT 'INFO',
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  request_id VARCHAR(64) NULL,
  metadata JSON NULL,
  previous_hash VARCHAR(64) NULL,
  event_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor (actor_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_resource (resource_type, resource_id),
  INDEX idx_audit_severity (severity),
  INDEX idx_audit_created_at (created_at),
  INDEX idx_audit_event_id (event_id),
  INDEX idx_audit_event_hash (event_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Audit Export Compliance Jobs Table
CREATE TABLE IF NOT EXISTS audit_export_jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  export_id VARCHAR(64) NOT NULL UNIQUE,
  requested_by INT NOT NULL,
  format ENUM('CSV', 'JSON') NOT NULL DEFAULT 'CSV',
  filter_criteria JSON NULL,
  record_count INT DEFAULT 0,
  file_path VARCHAR(255) NULL,
  status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_export_requested_by (requested_by),
  INDEX idx_export_status (status),
  CONSTRAINT fk_audit_export_user FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Security Intrusion Monitoring Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('WARNING', 'SECURITY', 'CRITICAL') NOT NULL DEFAULT 'SECURITY',
  status ENUM('DETECTED', 'REVIEWING', 'CONFIRMED', 'DISMISSED', 'RESOLVED') NOT NULL DEFAULT 'DETECTED',
  source_ip VARCHAR(45) NULL,
  user_id INT NULL,
  threshold_details JSON NULL,
  related_event_ids JSON NULL,
  reviewed_by INT NULL,
  reviewed_at TIMESTAMP NULL,
  resolution_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sec_events_status (status),
  INDEX idx_sec_events_code (event_code),
  INDEX idx_sec_events_severity (severity),
  INDEX idx_sec_events_created_at (created_at),
  CONSTRAINT fk_sec_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_sec_events_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Extend report_categories for Centralized Category Governance
ALTER TABLE report_categories
  ADD COLUMN IF NOT EXISTS status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS module VARCHAR(50) NOT NULL DEFAULT 'REPORT',
  ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parent_id INT NULL,
  ADD COLUMN IF NOT EXISTS metadata JSON NULL;

-- 5. API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_id VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(16) NOT NULL,
  secret_hash VARCHAR(128) NOT NULL,
  scopes JSON NOT NULL,
  user_id INT NOT NULL,
  status ENUM('ACTIVE', 'DEACTIVATED', 'REVOKED') DEFAULT 'ACTIVE',
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_api_keys_status (status),
  INDEX idx_api_keys_user (user_id),
  INDEX idx_api_keys_prefix (key_prefix),
  CONSTRAINT fk_api_keys_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Webhooks Table
CREATE TABLE IF NOT EXISTS webhooks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  endpoint_url VARCHAR(500) NOT NULL,
  event_subscriptions JSON NOT NULL,
  secret_hash VARCHAR(128) NOT NULL,
  status ENUM('ACTIVE', 'DISABLED', 'FAILED') DEFAULT 'ACTIVE',
  failure_count INT DEFAULT 0,
  last_delivery_at TIMESTAMP NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_webhooks_status (status),
  INDEX idx_webhooks_user (user_id),
  CONSTRAINT fk_webhooks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Webhook Deliveries Table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  webhook_id INT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload_summary JSON NULL,
  status_code INT NULL,
  response_time_ms INT NULL,
  status ENUM('SUCCESS', 'FAILED') NOT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_webhook_deliveries_webhook (webhook_id),
  INDEX idx_webhook_deliveries_created (created_at),
  CONSTRAINT fk_webhook_deliveries_webhook FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Platform Security Policies Table
CREATE TABLE IF NOT EXISTS security_policies (
  policy_key VARCHAR(100) PRIMARY KEY,
  policy_value JSON NOT NULL,
  data_type ENUM('INTEGER', 'STRING', 'BOOLEAN', 'JSON') NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'SECURITY',
  description TEXT NOT NULL,
  min_value INT NULL,
  max_value INT NULL,
  is_editable BOOLEAN DEFAULT TRUE,
  updated_by INT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sec_policies_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Security Policy History Table
CREATE TABLE IF NOT EXISTS security_policy_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  policy_key VARCHAR(100) NOT NULL,
  previous_value JSON NOT NULL,
  new_value JSON NOT NULL,
  changed_by INT NOT NULL,
  change_reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sec_policy_history_key (policy_key),
  CONSTRAINT fk_sec_policy_history_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Seed Initial Security Policies
INSERT INTO security_policies 
  (policy_key, policy_value, data_type, category, description, min_value, max_value, is_editable) 
VALUES
  ('failed_login_threshold', '5', 'INTEGER', 'AUTHENTICATION', 'Number of consecutive failed logins before flagging security intrusion', 3, 20, TRUE),
  ('account_lockout_duration_mins', '15', 'INTEGER', 'AUTHENTICATION', 'Temporary lock duration in minutes after failed attempts', 5, 120, TRUE),
  ('session_lifetime_hours', '24', 'INTEGER', 'AUTHENTICATION', 'Maximum active session lifetime in hours', 1, 168, TRUE),
  ('api_rate_limit_per_minute', '120', 'INTEGER', 'RATE_LIMITING', 'Maximum API requests per minute per IP address', 30, 600, TRUE),
  ('audit_retention_days', '365', 'INTEGER', 'AUDIT_LOGGING', 'Days to preserve immutable audit records before archival', 90, 3650, TRUE),
  ('unauthorized_request_threshold', '10', 'INTEGER', 'INTRUSION', 'Threshold for 401/403 errors per 5 minutes before security alert', 5, 50, TRUE),
  ('security_alert_cooldown_mins', '30', 'INTEGER', 'INTRUSION', 'Cooldown period between automatic duplicate intrusion alerts', 5, 240, TRUE),
  ('webhook_retry_limit', '3', 'INTEGER', 'INTEGRATIONS', 'Maximum delivery retries for failing webhook endpoints', 1, 10, TRUE),
  ('password_min_length', '8', 'INTEGER', 'AUTHENTICATION', 'Minimum required password character length', 8, 32, TRUE)
ON DUPLICATE KEY UPDATE description = VALUES(description);
