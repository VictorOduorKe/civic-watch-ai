-- Migration 008: Create report_assignments table
-- CivicWatch AI Kenya — Milestone 7: Incident Management

CREATE TABLE IF NOT EXISTS report_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  assigned_to_user_id INT NOT NULL,
  assigned_by_user_id INT NOT NULL,
  assignment_note TEXT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unassigned_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_assignments_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignments_assigned_to FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_assignments_assigned_by FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_assignments_report (report_id),
  INDEX idx_assignments_assigned_to (assigned_to_user_id),
  INDEX idx_assignments_active (report_id, unassigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
