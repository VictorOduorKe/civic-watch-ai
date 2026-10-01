-- Migration 005: Optimize Admin Dashboard Query Indexes
-- CivicWatch AI Kenya — Milestone 6

-- Add index on reports.county for rapid geographical aggregation
SET @county_idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'reports'
    AND index_name = 'idx_reports_county'
);

SET @sql_add_county_idx = IF(@county_idx_exists = 0,
  'ALTER TABLE reports ADD INDEX idx_reports_county (county)',
  'SELECT "Index idx_reports_county already exists"'
);
PREPARE stmt FROM @sql_add_county_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on users.is_active for rapid user statistics
SET @user_active_idx_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND index_name = 'idx_users_is_active'
);

SET @sql_add_user_active_idx = IF(@user_active_idx_exists = 0,
  'ALTER TABLE users ADD INDEX idx_users_is_active (is_active)',
  'SELECT "Index idx_users_is_active already exists"'
);
PREPARE stmt2 FROM @sql_add_user_active_idx;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
