-- Migration 013: Create verification_requests table
-- CivicWatch AI Kenya — Milestone 9: AI Information Verification

CREATE TABLE IF NOT EXISTS verification_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  input_type ENUM(
    'TEXT',
    'URL',
    'IMAGE',
    'TEXT_AND_URL',
    'TEXT_AND_IMAGE'
  ) NOT NULL,
  claim_text TEXT NULL,
  source_url VARCHAR(1000) NULL,
  source_title VARCHAR(255) NULL,
  image_path VARCHAR(255) NULL,
  status ENUM(
    'REQUIRES_VERIFICATION',
    'EVIDENCE_SUPPORTS_CLAIM',
    'EVIDENCE_CONFLICTS_WITH_CLAIM',
    'INSUFFICIENT_EVIDENCE',
    'MISSING_CONTEXT'
  ) NOT NULL DEFAULT 'REQUIRES_VERIFICATION',
  main_claim VARCHAR(500) NULL,
  ai_summary TEXT NULL,
  confidence ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW',
  supporting_information JSON NULL,
  contradictory_information JSON NULL,
  missing_context JSON NULL,
  recommended_verification JSON NULL,
  ai_provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
  ai_model VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',
  prompt_version VARCHAR(20) NOT NULL DEFAULT 'v1',
  processing_duration_ms INT UNSIGNED NULL,
  error_message VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_verifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_verifications_user (user_id),
  INDEX idx_verifications_user_created (user_id, created_at),
  INDEX idx_verifications_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
