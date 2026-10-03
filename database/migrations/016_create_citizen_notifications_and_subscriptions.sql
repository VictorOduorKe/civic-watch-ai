-- Migration 016: Create Citizen Notifications and Subscriptions
-- Milestone 13: Citizen Notifications & Subscriptions

-- 1. User Notification Preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    user_id INT PRIMARY KEY,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    min_severity ENUM('INFO', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'LOW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_notif_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Alert Subscriptions table
CREATE TABLE IF NOT EXISTS alert_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    alert_type ENUM(
        'OFFICIAL_COUNTY_ALERT',
        'GOVERNMENT_ADVISORY',
        'UTILITY_DOWNTIME',
        'PUBLIC_SAFETY',
        'WEATHER_ENVIRONMENTAL',
        'COMMUNITY_ADVISORY'
    ) DEFAULT NULL,
    utility_service ENUM(
        'ELECTRICITY',
        'WATER',
        'ROAD_INFRASTRUCTURE',
        'WASTE_SANITATION',
        'INTERNET_TELECOM',
        'OTHER'
    ) DEFAULT NULL,
    county VARCHAR(100) DEFAULT NULL,
    sub_county VARCHAR(100) DEFAULT NULL,
    ward VARCHAR(100) DEFAULT NULL,
    min_severity ENUM('INFO', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL') DEFAULT NULL,
    channel ENUM('IN_APP', 'EMAIL', 'BOTH') NOT NULL DEFAULT 'IN_APP',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_alert_subs_user (user_id),
    INDEX idx_alert_subs_type (alert_type),
    INDEX idx_alert_subs_county (county),
    INDEX idx_alert_subs_active (is_active),
    CONSTRAINT fk_alert_subs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default preferences for existing active users if missing
INSERT IGNORE INTO user_notification_preferences (user_id, in_app_enabled, email_enabled, min_severity)
SELECT id, TRUE, FALSE, 'LOW' FROM users;
