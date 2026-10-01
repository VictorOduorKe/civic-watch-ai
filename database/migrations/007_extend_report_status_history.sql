-- Migration 007: Extend report_status_history with changed_by_user_id
-- CivicWatch AI Kenya — Milestone 7: Incident Management

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'report_status_history'
    AND column_name = 'changed_by_user_id'
);

SET @sql_add_col = IF(@col_exists = 0,
  'ALTER TABLE report_status_history ADD COLUMN changed_by_user_id INT NULL AFTER note, ADD CONSTRAINT fk_status_history_changed_by FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL, ADD INDEX idx_status_history_changed_by (changed_by_user_id)',
  'SELECT "Column changed_by_user_id already exists"'
);

PREPARE stmt FROM @sql_add_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
