-- Migration 009: Create report_internal_notes table
-- CivicWatch AI Kenya — Milestone 7: Incident Management

CREATE TABLE IF NOT EXISTS report_internal_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  author_user_id INT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_internal_notes_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_internal_notes_author FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_internal_notes_report (report_id, created_at),
  INDEX idx_internal_notes_author (author_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
