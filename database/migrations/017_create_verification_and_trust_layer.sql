-- Migration 017: Create verification and trust layer
-- CivicWatch AI Kenya — Milestone 14: Verification & Trust Layer

-- 1. Create sources table
CREATE TABLE IF NOT EXISTS sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NULL,
  source_type ENUM(
    'GOVERNMENT',
    'COUNTY',
    'PUBLIC_UTILITY',
    'CIVIL_SOCIETY',
    'COMMUNITY',
    'OFFICIAL_ORGANIZATION',
    'MEDIA',
    'OTHER'
  ) NOT NULL DEFAULT 'COMMUNITY',
  website VARCHAR(500) NULL,
  description TEXT NULL,
  contact_email VARCHAR(255) NULL,
  contact_phone VARCHAR(50) NULL,
  verification_status ENUM(
    'UNVERIFIED',
    'UNDER_REVIEW',
    'VERIFIED',
    'DISPUTED',
    'CORRECTED',
    'WITHDRAWN'
  ) NOT NULL DEFAULT 'UNVERIFIED',
  verified_at TIMESTAMP NULL,
  verified_by INT NULL,
  is_official BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sources_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_sources_type (source_type),
  INDEX idx_sources_status (verification_status),
  INDEX idx_sources_official (is_official),
  INDEX idx_sources_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create verification_records table for audit and history tracking
CREATE TABLE IF NOT EXISTS verification_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('SOURCE', 'ALERT', 'REPORT') NOT NULL,
  entity_id INT NOT NULL,
  action ENUM(
    'VERIFIED',
    'DISPUTED',
    'CORRECTED',
    'WITHDRAWN',
    'UNDER_REVIEW'
  ) NOT NULL,
  previous_status ENUM(
    'UNVERIFIED',
    'UNDER_REVIEW',
    'VERIFIED',
    'DISPUTED',
    'CORRECTED',
    'WITHDRAWN'
  ) NULL,
  new_status ENUM(
    'UNVERIFIED',
    'UNDER_REVIEW',
    'VERIFIED',
    'DISPUTED',
    'CORRECTED',
    'WITHDRAWN'
  ) NOT NULL,
  verified_by INT NOT NULL,
  reason TEXT NULL,
  evidence_summary TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verif_records_user FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_verif_records_entity (entity_type, entity_id),
  INDEX idx_verif_records_user (verified_by),
  INDEX idx_verif_records_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create verification_references table for supporting evidence and links
CREATE TABLE IF NOT EXISTS verification_references (
  id INT AUTO_INCREMENT PRIMARY KEY,
  verification_record_id INT NULL,
  entity_type ENUM('SOURCE', 'ALERT', 'REPORT') NOT NULL,
  entity_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  reference_url VARCHAR(1000) NOT NULL,
  description TEXT NULL,
  source_type VARCHAR(100) NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verif_refs_record FOREIGN KEY (verification_record_id) REFERENCES verification_records(id) ON DELETE SET NULL,
  CONSTRAINT fk_verif_refs_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_verif_refs_entity (entity_type, entity_id),
  INDEX idx_verif_refs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Extend reports table with verification fields
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS verification_status ENUM(
    'UNVERIFIED',
    'UNDER_REVIEW',
    'VERIFIED',
    'DISPUTED',
    'CORRECTED',
    'WITHDRAWN'
  ) NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS source_id INT NULL,
  ADD COLUMN IF NOT EXISTS verified_by INT NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL,
  ADD CONSTRAINT fk_reports_source FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_reports_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD INDEX idx_reports_verif_status (verification_status);

-- 5. Extend civic_alerts table with source_id and expanded verification_status
ALTER TABLE civic_alerts
  ADD COLUMN IF NOT EXISTS source_id INT NULL,
  MODIFY COLUMN verification_status ENUM(
    'UNVERIFIED',
    'UNDER_REVIEW',
    'VERIFIED',
    'DISPUTED',
    'CORRECTED',
    'WITHDRAWN',
    'PENDING',
    'REJECTED',
    'EXPIRED'
  ) NOT NULL DEFAULT 'UNVERIFIED',
  ADD CONSTRAINT fk_civic_alerts_source FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL;

-- 6. Seed initial official and community sources
INSERT INTO sources (
  name, organization, source_type, website, description, verification_status, is_official, verified_at, verified_by
) VALUES
(
  'Nairobi City County Government',
  'County Government of Nairobi',
  'COUNTY',
  'https://nairobi.go.ke',
  'Official executive government authority for Nairobi County.',
  'VERIFIED',
  TRUE,
  CURRENT_TIMESTAMP,
  15
),
(
  'Kenya Power and Lighting Company (KPLC)',
  'Kenya Power PLC',
  'PUBLIC_UTILITY',
  'https://kplc.co.ke',
  'National electric power transmission and distribution utility company in Kenya.',
  'VERIFIED',
  TRUE,
  CURRENT_TIMESTAMP,
  15
),
(
  'Nairobi City Water and Sewerage Company (NCWSC)',
  'NCWSC Kenya',
  'PUBLIC_UTILITY',
  'https://nairobiwater.co.ke',
  'Municipal water supply and wastewater management utility for Nairobi.',
  'VERIFIED',
  TRUE,
  CURRENT_TIMESTAMP,
  15
),
(
  'National Disaster Management Unit (NDMU)',
  'Ministry of Interior and National Administration',
  'GOVERNMENT',
  'https://disastermanagement.go.ke',
  'Lead national agency for emergency coordination, disaster response, and civil defense.',
  'VERIFIED',
  TRUE,
  CURRENT_TIMESTAMP,
  15
),
(
  'Kenya Red Cross Society',
  'International Red Cross and Red Crescent Movement',
  'CIVIL_SOCIETY',
  'https://redcross.or.ke',
  'Humanitarian relief and emergency response organization operating across all 47 counties.',
  'VERIFIED',
  TRUE,
  CURRENT_TIMESTAMP,
  15
),
(
  'CivicWatch Community Submissions',
  'CivicWatch AI Citizen Network',
  'COMMUNITY',
  'https://civicwatch.ke',
  'Aggregated crowdsourced reports and notices submitted by local verified citizens.',
  'UNVERIFIED',
  FALSE,
  NULL,
  NULL
);
