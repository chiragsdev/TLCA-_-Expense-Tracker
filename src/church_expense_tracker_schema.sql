-- =====================================================
-- True Light Christian Assembly - Expense Tracker
-- MySQL Database Schema
-- =====================================================
-- 
-- Import this file into PhpMyAdmin to create all tables
-- Database: church_expense_tracker
--
-- =====================================================

-- Create database (optional - you may need to create this manually in PhpMyAdmin)
-- CREATE DATABASE IF NOT EXISTS church_expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE church_expense_tracker;

-- =====================================================
-- Table: users
-- Stores all user accounts (admin and department managers)
-- =====================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'department_manager') NOT NULL DEFAULT 'department_manager',
  `department` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: departments
-- Stores active department names
-- =====================================================

CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `is_archived` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`),
  INDEX `idx_archived` (`is_archived`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: expenses
-- Stores all expense records with optional receipts
-- =====================================================

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `date` DATE NOT NULL,
  `purchased_by` VARCHAR(255) NOT NULL,
  `notes` TEXT NULL,
  `reimbursement_status` ENUM('Pending', 'Reimbursed', 'Not Required') DEFAULT 'Not Required',
  `receipt_url` VARCHAR(500) NULL,
  `receipt_filename` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_department` (`department`),
  INDEX `idx_date` (`date`),
  INDEX `idx_purchased_by` (`purchased_by`),
  INDEX `idx_reimbursement_status` (`reimbursement_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: income
-- Stores all income/contribution records
-- =====================================================

CREATE TABLE IF NOT EXISTS `income` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `date` DATE NOT NULL,
  `contributed_by` VARCHAR(255) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_department` (`department`),
  INDEX `idx_date` (`date`),
  INDEX `idx_contributed_by` (`contributed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: church_members
-- Stores all church member names for autocomplete
-- =====================================================

CREATE TABLE IF NOT EXISTS `church_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: sessions
-- Stores active user sessions (for JWT alternative)
-- =====================================================

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(100) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `token` VARCHAR(500) NOT NULL UNIQUE,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_token` (`token`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Insert default departments
-- =====================================================

INSERT INTO `departments` (`name`, `is_archived`) VALUES
('Sports', FALSE),
('Fellowship', FALSE),
('Food', FALSE),
('Kids', FALSE),
('Worship', FALSE),
('Media', FALSE),
('General', FALSE)
ON DUPLICATE KEY UPDATE `name` = `name`;

-- =====================================================
-- Insert sample church members (118 members)
-- =====================================================

INSERT INTO `church_members` (`name`) VALUES
('Abey Abraham'),
('Aleyamma Anthrayose'),
('Ancy Jijo'),
('Ancy Joy'),
('Anitha Thomas'),
('Annamma Mathew'),
('Annie Wilson'),
('Ansa Sam'),
('Anthrayose (Andrews) Thomas'),
('Ben Joy'),
('Betcy Mathews'),
('Bibu Kurian'),
('Biju Kurian'),
('Biju Mathew'),
('Binoy Daniel'),
('Blessy Alexander'),
('Christeena Mathew'),
('Cibi Joseph'),
('Cijo Mathews'),
('Daniel John'),
('Denny Raju'),
('Dhanya Thomas'),
('Dr. K. G. Jose'),
('Eby Thomas Alexander'),
('Elizabeth Jose'),
('Feby John'),
('Geemole Ansa Sam'),
('Geoffry Paul'),
('George Mathew (Saji)'),
('Grace Joseph'),
('Gracy Paul'),
('Jason George (Pastor)'),
('Jaya Abraham'),
('Jean Paul'),
('Jeena Samuel'),
('Jemi Abraham'),
('Jesly Mathew'),
('Jibu Cletus'),
('Jijo Abraham'),
('Jim Idicula (Jimmy)'),
('Jim Varghese'),
('Jincy Jason'),
('Jincy Kurian'),
('Jisha Cletus'),
('Jobbish Zechariah'),
('Jobby Philipose'),
('Jobin Johnson'),
('John Peter'),
('Johns Daniel'),
('Johnson Mathew'),
('Josamma Thomas'),
('Joyce Joy'),
('Joyce Paul'),
('Justin Joshuva'),
('Justin Palamoottil Joy'),
('Kevin John'),
('Kevin Sam'),
('Koshy George (Saji)'),
('Leemon Thomas'),
('Leon Samuel (Pastor)'),
('Libin Lal'),
('Lija Mathew'),
('Liney Vinu'),
('Lini Koshy'),
('Lysa Daniel'),
('Manoj Mathew'),
('Manoj Thomas'),
('Mariamma Jacob'),
('Mathew Cherian (Renji)'),
('Melbin Baby'),
('Merlin Kurian'),
('Merin Varughese'),
('Mini Johns'),
('Nancy Sunil'),
('Neethu Punnoose'),
('Nissy Mathew'),
('P. A. Abraham (Raju)'),
('P. T. Johnson'),
('Paul Alex'),
('Paul Varkey'),
('Prince Baby Alex'),
('Prince Jose'),
('Priya Jim'),
('Rachel Mathai'),
('Rajan Mathai'),
('Rebecca Tom'),
('Remya Ninan'),
('Rinson Joseph'),
('Robin Joseph'),
('Roji Eapen'),
('Sajan Joy'),
('Saji Perinjelil'),
('Seena John'),
('Sherine Jobby'),
('Shiji Idicula'),
('Shiny Perinjelil'),
('Sindhu Kurian'),
('Sona Zechariah'),
('Soniya John'),
('Sonny M. Koshy'),
('Sosamma John'),
('Stacey Stephen'),
('Steffi Thomas'),
('Sunil Abraham'),
('Sunimol Zacharia'),
('Sunny Samuel'),
('Susan Andrews'),
('Susan Mathew'),
('Susan Sunny'),
('Susamma Mathew (Moncy)'),
('Teena Joshuva'),
('Thomas John'),
('Tinu Amal'),
('Tom Andrews'),
('Tom Kurian'),
('Varghese Thomas (Saji Bhilai)'),
('Vinu Sreepurathu'),
('Wilson Philip')
ON DUPLICATE KEY UPDATE `name` = `name`;

-- =====================================================
-- Create admin user (default password: Admin@123)
-- Password hash is bcrypt hash of "Admin@123"
-- IMPORTANT: Change this password after first login!
-- =====================================================

-- Note: You'll need to generate this hash in your backend
-- This is a placeholder - your backend will handle password hashing
-- To create your first admin, use the signup endpoint after deployment

-- =====================================================
-- Views for reporting (optional but recommended)
-- =====================================================

-- View: Total expenses by department
CREATE OR REPLACE VIEW `v_department_expenses` AS
SELECT 
  `department`,
  COUNT(*) as `expense_count`,
  SUM(`amount`) as `total_expenses`,
  AVG(`amount`) as `avg_expense`
FROM `expenses`
GROUP BY `department`;

-- View: Total income by department
CREATE OR REPLACE VIEW `v_department_income` AS
SELECT 
  `department`,
  COUNT(*) as `income_count`,
  SUM(`amount`) as `total_income`,
  AVG(`amount`) as `avg_income`
FROM `income`
GROUP BY `department`;

-- View: Department balances (income - expenses)
CREATE OR REPLACE VIEW `v_department_balances` AS
SELECT 
  d.`name` as `department`,
  COALESCE(i.`total_income`, 0) as `total_income`,
  COALESCE(e.`total_expenses`, 0) as `total_expenses`,
  COALESCE(i.`total_income`, 0) - COALESCE(e.`total_expenses`, 0) as `balance`
FROM `departments` d
LEFT JOIN `v_department_income` i ON d.`name` = i.`department`
LEFT JOIN `v_department_expenses` e ON d.`name` = e.`department`
WHERE d.`is_archived` = FALSE;

-- View: Recent transactions (last 30 days)
CREATE OR REPLACE VIEW `v_recent_transactions` AS
SELECT 
  'expense' as `type`,
  `id`,
  `department`,
  `description`,
  `amount`,
  `date`,
  `purchased_by` as `person`,
  `created_at`
FROM `expenses`
WHERE `date` >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
UNION ALL
SELECT 
  'income' as `type`,
  `id`,
  `department`,
  `description`,
  `amount`,
  `date`,
  `contributed_by` as `person`,
  `created_at`
FROM `income`
WHERE `date` >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY `date` DESC, `created_at` DESC;

-- =====================================================
-- Stored Procedures (optional)
-- =====================================================

DELIMITER //

-- Procedure: Add new expense
CREATE PROCEDURE IF NOT EXISTS `sp_add_expense`(
  IN p_id VARCHAR(50),
  IN p_user_id VARCHAR(36),
  IN p_department VARCHAR(100),
  IN p_description TEXT,
  IN p_amount DECIMAL(10,2),
  IN p_date DATE,
  IN p_purchased_by VARCHAR(255),
  IN p_notes TEXT,
  IN p_reimbursement_status VARCHAR(20),
  IN p_receipt_url VARCHAR(500),
  IN p_receipt_filename VARCHAR(255)
)
BEGIN
  INSERT INTO `expenses` (
    `id`, `user_id`, `department`, `description`, `amount`, 
    `date`, `purchased_by`, `notes`, `reimbursement_status`,
    `receipt_url`, `receipt_filename`
  ) VALUES (
    p_id, p_user_id, p_department, p_description, p_amount,
    p_date, p_purchased_by, p_notes, p_reimbursement_status,
    p_receipt_url, p_receipt_filename
  );
END //

-- Procedure: Add new income
CREATE PROCEDURE IF NOT EXISTS `sp_add_income`(
  IN p_id VARCHAR(50),
  IN p_user_id VARCHAR(36),
  IN p_department VARCHAR(100),
  IN p_description TEXT,
  IN p_amount DECIMAL(10,2),
  IN p_date DATE,
  IN p_contributed_by VARCHAR(255),
  IN p_notes TEXT
)
BEGIN
  INSERT INTO `income` (
    `id`, `user_id`, `department`, `description`, `amount`,
    `date`, `contributed_by`, `notes`
  ) VALUES (
    p_id, p_user_id, p_department, p_description, p_amount,
    p_date, p_contributed_by, p_notes
  );
END //

-- Procedure: Get department summary
CREATE PROCEDURE IF NOT EXISTS `sp_get_department_summary`(
  IN p_department VARCHAR(100)
)
BEGIN
  SELECT 
    p_department as `department`,
    COALESCE(SUM(CASE WHEN `type` = 'income' THEN `amount` ELSE 0 END), 0) as `total_income`,
    COALESCE(SUM(CASE WHEN `type` = 'expense' THEN `amount` ELSE 0 END), 0) as `total_expenses`,
    COALESCE(SUM(CASE WHEN `type` = 'income' THEN `amount` ELSE -`amount` END), 0) as `balance`
  FROM (
    SELECT 'income' as `type`, `amount` FROM `income` WHERE `department` = p_department
    UNION ALL
    SELECT 'expense' as `type`, `amount` FROM `expenses` WHERE `department` = p_department
  ) as transactions;
END //

DELIMITER ;

-- =====================================================
-- Cleanup old sessions (add to cron job)
-- =====================================================

-- Run this periodically to clean up expired sessions
-- DELETE FROM `sessions` WHERE `expires_at` < NOW();

-- =====================================================
-- Schema Version
-- =====================================================

CREATE TABLE IF NOT EXISTS `schema_version` (
  `version` VARCHAR(20) PRIMARY KEY,
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `schema_version` (`version`) VALUES ('1.0.0')
ON DUPLICATE KEY UPDATE `version` = `version`;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Success message
SELECT 'Database schema created successfully!' as `Status`,
       'Import the 118 church members from church_members table' as `Note1`,
       'Create your first admin user via the signup endpoint' as `Note2`,
       'Change default admin password immediately!' as `Note3`;
