-- Migration 004: Create Report Status History Table & Update Status Enum
-- CivicWatch AI Kenya — Milestone 5

-- 1. Ensure reports table status column supports all CivicWatch lifecycle statuses:
ALTER TABLE reports MODIFY COLUMN status ENUM(
  'Submitted',
  'Under Review',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Rejected',
  'Dismissed'
) NOT NULL DEFAULT 'Submitted';

-- 2. Create report_status_history table
CREATE TABLE IF NOT EXISTS report_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  status ENUM(
    'Submitted',
    'Under Review',
    'Verified',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
    'Rejected',
    'Dismissed'
  ) NOT NULL,
  note TEXT NULL,
  visible_to_citizen BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status_history_report_created (report_id, created_at),
  CONSTRAINT fk_status_history_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Populate initial history for all existing reports using their original submission timestamp
INSERT INTO report_status_history (report_id, status, note, visible_to_citizen, created_at)
SELECT id, status, 'Report submitted by citizen.', TRUE, created_at
FROM reports r
WHERE NOT EXISTS (
  SELECT 1 FROM report_status_history h WHERE h.report_id = r.id
);
