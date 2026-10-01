-- Migration 011: Create report_referrals table
-- CivicWatch AI Kenya — Milestone 7: Incident Management

CREATE TABLE IF NOT EXISTS report_referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  referral_type VARCHAR(100) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('Pending', 'Sent', 'Accepted', 'Declined', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  referred_by_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_referrals_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_referrals_referred_by FOREIGN KEY (referred_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_referrals_report (report_id, created_at),
  INDEX idx_referrals_status (status),
  INDEX idx_referrals_referred_by (referred_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
