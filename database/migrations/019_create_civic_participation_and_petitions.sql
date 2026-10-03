-- CivicWatch AI Kenya — Milestone 15: Civic Participation & Petitions
-- Implements online petition management with verified signature quorum,
-- county budget hearing schedules with county-scoped access,
-- citizen legislative feedback workflows, and comprehensive audit trails.

-- 1. Petitions Table
CREATE TABLE IF NOT EXISTS `petitions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `summary` VARCHAR(500) NOT NULL,
  `description` TEXT NOT NULL,
  `purpose` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `county` VARCHAR(100) DEFAULT NULL,
  `sub_county` VARCHAR(100) DEFAULT NULL,
  `target_authority` VARCHAR(255) NOT NULL,
  `requested_action` TEXT NOT NULL,
  `supporting_information` TEXT DEFAULT NULL,
  `opening_date` DATE NOT NULL,
  `closing_date` DATE NOT NULL,
  `quorum_requirement` INT NOT NULL DEFAULT 50,
  `total_signatures` INT NOT NULL DEFAULT 0,
  `verified_signatures` INT NOT NULL DEFAULT 0,
  `status` ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'CLOSED', 'QUORUM_REACHED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `rejection_reason` TEXT DEFAULT NULL,
  `creator_id` INT NOT NULL,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `quorum_reached_at` TIMESTAMP NULL DEFAULT NULL,
  `closed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_petitions_status` (`status`),
  INDEX `idx_petitions_county` (`county`),
  INDEX `idx_petitions_category` (`category`),
  INDEX `idx_petitions_creator` (`creator_id`),
  CONSTRAINT `fk_petitions_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Petition Signatures Table
CREATE TABLE IF NOT EXISTS `petition_signatures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `petition_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `is_verified_signer` TINYINT(1) NOT NULL DEFAULT 0,
  `is_withdrawn` TINYINT(1) NOT NULL DEFAULT 0,
  `withdrawn_at` TIMESTAMP NULL DEFAULT NULL,
  `signer_county` VARCHAR(100) DEFAULT NULL,
  `comment` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_petition_user` (`petition_id`, `user_id`),
  INDEX `idx_sig_petition_status` (`petition_id`, `is_verified_signer`, `is_withdrawn`),
  CONSTRAINT `fk_sig_petition` FOREIGN KEY (`petition_id`) REFERENCES `petitions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sig_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. County Budget Hearings Table
CREATE TABLE IF NOT EXISTS `budget_hearings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `county` VARCHAR(100) NOT NULL,
  `sub_county` VARCHAR(100) DEFAULT NULL,
  `ward` VARCHAR(100) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `fiscal_year` VARCHAR(20) NOT NULL DEFAULT 'FY 2026/2027',
  `hearing_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `participation_instructions` TEXT DEFAULT NULL,
  `contact_information` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `cancellation_reason` TEXT DEFAULT NULL,
  `created_by` INT NOT NULL,
  `updated_by` INT DEFAULT NULL,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_hearings_county` (`county`),
  INDEX `idx_hearings_date` (`hearing_date`),
  INDEX `idx_hearings_status` (`status`),
  CONSTRAINT `fk_hearings_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Legislative Items Table
CREATE TABLE IF NOT EXISTS `legislative_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reference_code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT NOT NULL,
  `body_text` LONGTEXT DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `level` ENUM('NATIONAL', 'COUNTY') NOT NULL DEFAULT 'NATIONAL',
  `county` VARCHAR(100) DEFAULT NULL,
  `sponsoring_body` VARCHAR(255) NOT NULL,
  `status` ENUM('ACTIVE', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `feedback_deadline` DATE NOT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_leg_status` (`status`),
  INDEX `idx_leg_county` (`county`),
  CONSTRAINT `fk_leg_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Citizen Legislative Feedback Table
CREATE TABLE IF NOT EXISTS `legislative_feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `legislative_item_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `feedback_text` TEXT NOT NULL,
  `stance` ENUM('SUPPORT', 'OPPOSE', 'NEUTRAL', 'PROPOSAL') NOT NULL DEFAULT 'NEUTRAL',
  `category` VARCHAR(100) DEFAULT NULL,
  `county` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED', 'REJECTED', 'WITHDRAWN', 'ARCHIVED') NOT NULL DEFAULT 'SUBMITTED',
  `moderation_notes` TEXT DEFAULT NULL,
  `moderated_by` INT DEFAULT NULL,
  `moderated_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_feedback_item` (`legislative_item_id`),
  INDEX `idx_feedback_status` (`status`),
  INDEX `idx_feedback_user` (`user_id`),
  CONSTRAINT `fk_fb_item` FOREIGN KEY (`legislative_item_id`) REFERENCES `legislative_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Participation Audits Table
CREATE TABLE IF NOT EXISTS `participation_audits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `entity_type` ENUM('PETITION', 'HEARING', 'LEGISLATIVE_ITEM', 'LEGISLATIVE_FEEDBACK', 'SIGNATURE') NOT NULL,
  `entity_id` INT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `actor_id` INT NOT NULL,
  `actor_role` VARCHAR(50) NOT NULL,
  `previous_state` JSON DEFAULT NULL,
  `new_state` JSON DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_part_audit_entity` (`entity_type`, `entity_id`),
  INDEX `idx_part_audit_actor` (`actor_id`),
  CONSTRAINT `fk_part_audit_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Initial Baseline Petitions (authentic civic matters)
INSERT INTO `petitions` (
  `id`, `title`, `summary`, `description`, `purpose`, `category`, `county`, `sub_county`,
  `target_authority`, `requested_action`, `supporting_information`, `opening_date`, `closing_date`,
  `quorum_requirement`, `total_signatures`, `verified_signatures`, `status`, `creator_id`, `published_at`
) VALUES
(
  1,
  'Public Audit of Ward Development & Emergency Contingency Funds in Nairobi',
  'Citizen demand for itemized, accessible publication of ward project budgets and procurement records across all 85 wards in Nairobi City County.',
  'Under Article 35 and Article 201 of the Constitution of Kenya, public finances must adhere to openness, accountability, and citizen participation. This petition urges the Nairobi City County Assembly Public Accounts Committee to publish comprehensive disbursement records and contractor delivery audits.',
  'Promote transparency in devolved public funds utilization and eliminate stalled ward projects.',
  'Budget & Finance',
  'Nairobi',
  'Westlands',
  'Nairobi City County Assembly Public Accounts Committee',
  'Publish quarterly itemized expenditure dashboards for ward development projects and conduct bi-annual physical inspection hearings open to the public.',
  'Official report references from the Auditor-General on Nairobi City County financial statements (2024/2025).',
  '2026-09-01',
  '2026-12-31',
  10,
  3,
  3,
  'PUBLISHED',
  15,
  '2026-09-01 10:00:00'
),
(
  2,
  'Establishment of 24-Hour Level 4 Emergency Medical Centers in Kisumu Rural Sub-Counties',
  'Urgent petition to equip and operationalize round-the-clock emergency medical response and maternity wards in Nyando, Muhoroni, and Seme.',
  'Residents in rural sub-counties face delays of over two hours during night-time medical emergencies. This petition petitions the Kisumu County Department of Health to allocate capital infrastructure and medical officer staffing to ensure Level 4 facilities operate on a continuous 24-hour cycle.',
  'Guarantee constitutional right to emergency medical treatment under Article 43(2).',
  'Healthcare',
  'Kisumu',
  'Nyando',
  'Kisumu County Executive Committee for Health & Sanitation',
  'Allocate FY 2026/2027 supplementary funds for standby ambulances and night clinician rosters at Nyando and Seme Level 4 health centers.',
  'Citizen incident reports filed on CivicWatch indicating average ambulance wait times exceeding 90 minutes.',
  '2026-09-15',
  '2026-11-30',
  5,
  5,
  5,
  'QUORUM_REACHED',
  15,
  '2026-09-15 08:30:00'
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Seed Initial Baseline Budget Hearings
INSERT INTO `budget_hearings` (
  `id`, `title`, `county`, `sub_county`, `ward`, `description`, `fiscal_year`,
  `hearing_date`, `start_time`, `end_time`, `venue`, `participation_instructions`,
  `contact_information`, `status`, `created_by`, `published_at`
) VALUES
(
  1,
  'Nairobi City County FY 2026/2027 Annual Development Plan (ADP) Consultation',
  'Nairobi',
  'Starehe',
  'Nairobi Central',
  'Public stakeholder consultation on priority infrastructure, water reticulation, and feeder road rehabilitation allocations for the upcoming fiscal year budget.',
  'FY 2026/2027',
  '2026-10-15',
  '09:00:00',
  '13:00:00',
  'Charter Hall, City Hall Annex, Nairobi',
  'Citizens are invited to submit written memoranda or register for 5-minute oral submissions at the venue entrance. Photo ID required.',
  'budget-consultations@nairobi.go.ke / 020-2222222',
  'PUBLISHED',
  15,
  '2026-10-01 09:00:00'
),
(
  2,
  'Mombasa County Citizen Budget Forum — Drainage & Climate Resilience Priorities',
  'Mombasa',
  'Mvita',
  'Majengo',
  'Public participation hearing focusing on stormwater drainage infrastructure, flood mitigation along Tudor Creek, and solid waste collection budget allocations.',
  'FY 2026/2027',
  '2026-10-22',
  '10:00:00',
  '14:00:00',
  'Mvita Sub-County Social Hall, Mombasa',
  'Open to all Mombasa residents and registered community-based organizations. Sign language interpreters provided.',
  'participation@mombasa.go.ke / 041-2311234',
  'PUBLISHED',
  15,
  '2026-10-02 11:00:00'
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Seed Initial Baseline Legislative Items
INSERT INTO `legislative_items` (
  `id`, `reference_code`, `title`, `summary`, `body_text`, `category`,
  `level`, `county`, `sponsoring_body`, `status`, `feedback_deadline`, `created_by`
) VALUES
(
  1,
  'BILL-2026-001',
  'County Governments Budget Transparency & Open Contracting Framework Bill 2026',
  'Proposed legislation mandating real-time open disclosure of procurement awards, subcontractor declarations, and milestone inspection certifications across all 47 counties.',
  'A Bill for an Act of Parliament to provide for a standardized electronic open contracting data standard (OCDS) across county governments; to mandate public registry access for civic watchdogs; and to prescribe sanctions for non-compliance by accounting officers.',
  'Governance & Accountability',
  'NATIONAL',
  NULL,
  'Senate Standing Committee on Finance and Budget',
  'ACTIVE',
  '2026-11-15',
  15
),
(
  2,
  'POLICY-NRB-2026-04',
  'Nairobi Urban Green Spaces Protection & Tree Canopy Ordinance 2026',
  'County policy regulation establishing mandatory civic consultation before any commercial rezoning of public parks, road reserves, and riparian reserves in Nairobi.',
  'A County Executive policy guideline prohibiting conversion of gazetted public recreation spaces into commercial developments without 60-day public notice and mandatory environmental quorum approval.',
  'Environment',
  'COUNTY',
  'Nairobi',
  'Nairobi County Assembly Committee on Planning and Housing',
  'ACTIVE',
  '2026-11-01',
  15
)
ON DUPLICATE KEY UPDATE `reference_code` = VALUES(`reference_code`);
