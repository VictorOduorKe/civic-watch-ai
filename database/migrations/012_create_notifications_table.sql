-- Migration 012: Create notifications table
-- CivicWatch AI Kenya — Milestone 8: Notifications

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_user_id INT NOT NULL,
  type ENUM(
    'REPORT_RECEIVED',
    'REPORT_STATUS_CHANGED',
    'REPORT_ASSIGNED',
    'REPORT_UPDATED',
    'SYSTEM_NOTIFICATION',
    'ALERT_PUBLISHED',
    'CONSULTATION_OPENED',
    'SURVEY_CLOSING'
  ) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id INT NULL,
  entity_reference VARCHAR(100) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL DEFAULT NULL,
  dedupe_key VARCHAR(191) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_notifications_dedupe (dedupe_key),
  INDEX idx_notifications_recipient (recipient_user_id),
  INDEX idx_notifications_recipient_unread (recipient_user_id, is_read),
  INDEX idx_notifications_recipient_created (recipient_user_id, created_at),
  INDEX idx_notifications_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
