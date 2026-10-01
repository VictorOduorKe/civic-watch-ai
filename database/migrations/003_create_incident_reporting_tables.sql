-- Migration 003: Create Incident Reporting Tables
-- CivicWatch AI Kenya — Milestone 4

-- 1. Report Categories Table
CREATE TABLE IF NOT EXISTS report_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categories_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Seed 12 Official Incident Categories
INSERT INTO report_categories (name, description, is_active) VALUES
  ('Infrastructure', 'Issues involving roads, potholes, drainage, bridges, street lighting, and public buildings.', TRUE),
  ('Public Services', 'Challenges with water supply, power outages, municipal garbage collection, sanitation, and sewer systems.', TRUE),
  ('Corruption Concern', 'Reports of bribery, extortion, embezzlement, misuse of public funds, or procurement irregularities.', TRUE),
  ('Safety Concern', 'Community security risks, unlit dark spots, vandalism, gang activity, and public hazards.', TRUE),
  ('Missing Person', 'Reports regarding missing persons, vulnerable children, or tracing requests for community members.', TRUE),
  ('Drug Activity', 'Concerns regarding illicit substance distribution, drug dens, or unregulated substance sales affecting youth.', TRUE),
  ('Environmental Issue', 'Illegal dumping, deforestation, wetland encroachment, river pollution, and hazardous emissions.', TRUE),
  ('Public Health', 'Outbreaks, contaminated water sources, sanitation hazards, food safety violations, and clinic shortages.', TRUE),
  ('Human Rights Concern', 'Violations of constitutional rights, excessive police force, discrimination, or unlawful eviction.', TRUE),
  ('Emergency', 'Urgent hazards such as structural collapses, fires, landslides, or severe flash flooding.', TRUE),
  ('Misinformation', 'False public notices, fraudulent government alerts, impersonation of officials, or civic deception.', TRUE),
  ('Other', 'Any civic concern or public accountability issue that does not fit into the predefined categories.', TRUE)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 3. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_reference VARCHAR(50) NULL UNIQUE,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  county VARCHAR(100) NOT NULL,
  sub_county VARCHAR(100) NULL,
  ward VARCHAR(100) NULL,
  location_text VARCHAR(255) NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  incident_date DATE NULL,
  incident_time TIME NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_contact ENUM('none', 'email', 'phone') NOT NULL DEFAULT 'none',
  status ENUM('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Dismissed') NOT NULL DEFAULT 'Submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reports_user_id (user_id),
  INDEX idx_reports_category_id (category_id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_created_at (created_at),
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reports_category FOREIGN KEY (category_id) REFERENCES report_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Report Attachments Table
CREATE TABLE IF NOT EXISTS report_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_attachments_report_id (report_id),
  CONSTRAINT fk_attachments_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
