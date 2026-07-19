/**
 * Database Schema for Dynamic Product Catalogue System
 * MySQL 8.0+ compatible schema
 * 
 * Tables:
 * 1. catalogues - Store all generated catalogue versions
 * 2. catalogue_versions - Track version history with changelog
 * 3. catalogue_settings - Store customization settings
 * 4. catalogue_sections - Store section configurations
 * 5. catalogue_products - Link products to specific catalogues
 * 6. customer_catalogues - Store customer-personalized catalogues
 * 7. catalogue_downloads - Track download analytics
 */

-- ============================================================================
-- 1. MAIN CATALOGUES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `catalogues` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `version_number` VARCHAR(10) NOT NULL UNIQUE,
  `catalogue_type` ENUM('complete', 'category', 'selected', 'customer') NOT NULL DEFAULT 'complete',
  `title` VARCHAR(255) NOT NULL,
  `status` ENUM('draft', 'ready', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `pdf_url` TEXT,
  `file_path` TEXT,
  `file_size` INT,
  `total_pages` INT DEFAULT 0,
  `total_products` INT DEFAULT 0,
  `generated_by` BIGINT UNSIGNED,
  `generated_at` TIMESTAMP NOT NULL,
  `published_at` TIMESTAMP NULL,
  `archived_at` TIMESTAMP NULL,
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX idx_version (`version_number`),
  INDEX idx_status (`status`),
  INDEX idx_type (`catalogue_type`),
  INDEX idx_generated_at (`generated_at`),
  INDEX idx_created_at (`created_at`)
);

-- ============================================================================
-- 2. CATALOGUE VERSIONS & CHANGELOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS `catalogue_versions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `catalogue_id` BIGINT UNSIGNED NOT NULL,
  `version_number` VARCHAR(10) NOT NULL,
  `previous_version` VARCHAR(10),
  `changelog` TEXT,
  `changes_summary` JSON, -- { products_added: N, products_updated: N, sections_changed: [...] }
  `breaking_changes` TEXT,
  `comparison_data` JSON, -- Diff against previous version
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`catalogue_id`) REFERENCES `catalogues`(`id`) ON DELETE CASCADE,
  INDEX idx_version (`version_number`),
  INDEX idx_catalogue_id (`catalogue_id`)
);

-- ============================================================================
-- 3. CATALOGUE SETTINGS & CUSTOMIZATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS `catalogue_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  
  -- Company Information
  `company_name` VARCHAR(255) DEFAULT 'LOKAA GLOBAL EXPORTS',
  `tagline` VARCHAR(255) DEFAULT 'Connecting Global Buyers & Suppliers',
  `mission` LONGTEXT,
  `vision` LONGTEXT,
  `business_description` LONGTEXT,
  
  -- Contact Information
  `website` VARCHAR(255),
  `email` VARCHAR(255),
  `phone` VARCHAR(20),
  `address` TEXT,
  `social_media` JSON, -- { linkedin, facebook, twitter, instagram }
  
  -- Design & Branding
  `primary_color` VARCHAR(7) DEFAULT '#1a472a',
  `secondary_color` VARCHAR(7) DEFAULT '#F4A460',
  `theme_type` ENUM('classic', 'modern', 'minimal') DEFAULT 'modern',
  `logo_url` TEXT,
  `cover_image_url` TEXT,
  `footer_text` TEXT,
  
  -- PDF Settings
  `include_watermark` BOOLEAN DEFAULT TRUE,
  `watermark_text` VARCHAR(255) DEFAULT 'LOKAA GLOBAL EXPORTS - CONFIDENTIAL',
  `include_toc` BOOLEAN DEFAULT TRUE,
  `include_qr_codes` BOOLEAN DEFAULT TRUE,
  `include_page_numbers` BOOLEAN DEFAULT TRUE,
  `make_searchable` BOOLEAN DEFAULT TRUE,
  
  -- Certification & Legal
  `certifications` JSON, -- Array of certification objects
  `legal_disclaimers` TEXT,
  
  -- Automation Settings
  `auto_generate_on_product_update` BOOLEAN DEFAULT TRUE,
  `auto_generate_on_company_update` BOOLEAN DEFAULT TRUE,
  `auto_generate_schedule` ENUM('daily', 'weekly', 'monthly', 'manual') DEFAULT 'weekly',
  `next_scheduled_generation` TIMESTAMP NULL,
  
  -- Retention Policy
  `retention_days` INT DEFAULT 90, -- Keep versions for N days
  `max_versions` INT DEFAULT 50, -- Maximum versions to keep
  
  -- SEO & Metadata
  `pdf_title` VARCHAR(255),
  `pdf_author` VARCHAR(255),
  `pdf_keywords` TEXT,
  `pdf_description` TEXT,
  
  -- Tracking
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX idx_updated_at (`updated_at`)
);

-- ============================================================================
-- 4. CATALOGUE SECTIONS CONFIGURATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS `catalogue_sections` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `catalogue_id` BIGINT UNSIGNED NOT NULL,
  `section_name` VARCHAR(255) NOT NULL,
  `section_key` VARCHAR(50) NOT NULL,
  `is_enabled` BOOLEAN DEFAULT TRUE,
  `display_order` INT DEFAULT 0,
  `custom_content` LONGTEXT,
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`catalogue_id`) REFERENCES `catalogues`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_catalogue_section` (`catalogue_id`, `section_key`),
  INDEX idx_catalogue_id (`catalogue_id`)
);

-- ============================================================================
-- 5. CATALOGUE PRODUCTS MAPPING
-- ============================================================================
CREATE TABLE IF NOT EXISTS `catalogue_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `catalogue_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED,
  `display_order` INT DEFAULT 0,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `custom_description` LONGTEXT,
  `included_in_generated_pdf` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`catalogue_id`) REFERENCES `catalogues`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_catalogue_product` (`catalogue_id`, `product_id`),
  INDEX idx_catalogue_id (`catalogue_id`),
  INDEX idx_product_id (`product_id`),
  INDEX idx_category_id (`category_id`)
);

-- ============================================================================
-- 6. CUSTOMER PERSONALIZED CATALOGUES
-- ============================================================================
CREATE TABLE IF NOT EXISTS `customer_catalogues` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `catalogue_id` BIGINT UNSIGNED NOT NULL,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  
  -- Customer Info
  `customer_name` VARCHAR(255),
  `customer_company` VARCHAR(255),
  `customer_email` VARCHAR(255),
  `customer_country` VARCHAR(100),
  
  -- Customization
  `include_custom_cover` BOOLEAN DEFAULT TRUE,
  `include_company_branding` BOOLEAN DEFAULT TRUE,
  `selected_products_only` BOOLEAN DEFAULT FALSE,
  `include_pricing` BOOLEAN DEFAULT TRUE,
  `include_moq` BOOLEAN DEFAULT TRUE,
  
  -- RFQ & Quote Reference
  `rfq_reference` VARCHAR(100),
  `quote_reference` VARCHAR(100),
  
  -- Generation
  `personalized_pdf_url` TEXT,
  `generated_at` TIMESTAMP NOT NULL,
  `expires_at` TIMESTAMP NULL,
  `download_count` INT DEFAULT 0,
  
  -- Metadata
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`catalogue_id`) REFERENCES `catalogues`(`id`) ON DELETE CASCADE,
  INDEX idx_catalogue_id (`catalogue_id`),
  INDEX idx_customer_id (`customer_id`),
  INDEX idx_customer_email (`customer_email`),
  INDEX idx_generated_at (`generated_at`)
);

-- ============================================================================
-- 7. CATALOGUE DOWNLOADS TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS `catalogue_downloads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `catalogue_id` BIGINT UNSIGNED NOT NULL,
  `customer_catalogue_id` BIGINT UNSIGNED,
  `downloaded_by` VARCHAR(255), -- Email or customer identifier
  `download_ip` VARCHAR(45),
  `user_agent` TEXT,
  `download_format` VARCHAR(10) DEFAULT 'pdf',
  `downloaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`catalogue_id`) REFERENCES `catalogues`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_catalogue_id`) REFERENCES `customer_catalogues`(`id`) ON DELETE CASCADE,
  INDEX idx_catalogue_id (`catalogue_id`),
  INDEX idx_downloaded_at (`downloaded_at`),
  INDEX idx_downloaded_by (`downloaded_by`)
);

-- ============================================================================
-- 8. CATALOGUE GENERATION LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS `catalogue_generation_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `catalogue_id` BIGINT UNSIGNED,
  `status` ENUM('started', 'processing', 'completed', 'failed') NOT NULL,
  `generation_type` VARCHAR(50),
  `generation_reason` VARCHAR(255), -- 'product_updated', 'scheduled', 'manual', 'company_updated'
  `duration_ms` INT,
  `error_message` TEXT,
  `error_stack` LONGTEXT,
  `triggered_by` BIGINT UNSIGNED,
  `input_parameters` JSON,
  `output_statistics` JSON, -- { pages, products, filesize, timestamp }
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`catalogue_id`) REFERENCES `catalogues`(`id`) ON DELETE SET NULL,
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`),
  INDEX idx_generation_reason (`generation_reason`)
);

-- ============================================================================
-- 9. CERTIFICATION MANAGEMENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS `catalogue_certifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `certification_name` VARCHAR(255) NOT NULL,
  `certification_category` VARCHAR(100),
  `description` TEXT,
  `certificate_image_url` TEXT,
  `certificate_number` VARCHAR(100),
  `issue_date` DATE,
  `expiry_date` DATE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX idx_is_active (`is_active`),
  INDEX idx_expiry_date (`expiry_date`)
);

-- ============================================================================
-- SAMPLE DATA - Initial Certifications
-- ============================================================================
INSERT INTO `catalogue_certifications` 
(`certification_name`, `certification_category`, `description`, `is_active`, `display_order`) 
VALUES 
('ISO 9001:2015', 'Quality Management', 'International Standard for Quality Management Systems', TRUE, 1),
('ISO 14001:2015', 'Environmental Management', 'Environmental Management System Certification', TRUE, 2),
('APEDA', 'Agricultural Products', 'Agricultural Products Export Development Authority', TRUE, 3),
('FIEO', 'Export Recognition', 'Federation of Indian Export Organisations', TRUE, 4),
('Spices Board', 'Spice Products', 'Official Spice Industry Board Certification', TRUE, 5),
('MSME', 'Small Business', 'Micro, Small & Medium Enterprises Recognition', TRUE, 6),
('GST Registration', 'Tax Compliance', 'Goods and Services Tax Registration', TRUE, 7),
('Export License', 'Legal Authorization', 'Government Export License', TRUE, 8);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_catalogues_status ON catalogues(status);
CREATE INDEX IF NOT EXISTS idx_catalogues_created ON catalogues(created_at);
CREATE INDEX IF NOT EXISTS idx_catalogues_version ON catalogues(version_number);
CREATE INDEX IF NOT EXISTS idx_versions_catalogue ON catalogue_versions(catalogue_id);
CREATE INDEX IF NOT EXISTS idx_sections_catalogue ON catalogue_sections(catalogue_id);
CREATE INDEX IF NOT EXISTS idx_products_catalogue ON catalogue_products(catalogue_id);
CREATE INDEX IF NOT EXISTS idx_customers_catalogue ON customer_catalogues(catalogue_id);
CREATE INDEX IF NOT EXISTS idx_downloads_catalogue ON catalogue_downloads(catalogue_id);
CREATE INDEX IF NOT EXISTS idx_logs_catalogue ON catalogue_generation_logs(catalogue_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATION
-- ============================================================================

-- Trigger 1: Auto-increment version number when new catalogue is created
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS `tr_set_catalogue_version` 
BEFORE INSERT ON `catalogues` 
FOR EACH ROW
BEGIN
  IF NEW.version_number IS NULL THEN
    SET NEW.version_number = CONCAT('v', LPAD(
      (SELECT COALESCE(MAX(CAST(SUBSTRING(version_number, 2) AS DECIMAL(10,1))), 0) + 0.1)
      FROM catalogues), 3, '0'
    ));
  END IF;
END$$

DELIMITER ;

-- ============================================================================
-- SQL QUERIES FOR COMMON OPERATIONS
-- ============================================================================

-- Get latest published catalogue
-- SELECT * FROM catalogues WHERE status = 'published' ORDER BY published_at DESC LIMIT 1;

-- Get catalogue version history
-- SELECT * FROM catalogue_versions WHERE catalogue_id = ? ORDER BY created_at DESC;

-- Get all catalogues for a time period
-- SELECT * FROM catalogues WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC;

-- Get download analytics for a catalogue
-- SELECT DATE(downloaded_at) as date, COUNT(*) as downloads 
-- FROM catalogue_downloads WHERE catalogue_id = ? GROUP BY DATE(downloaded_at);

-- Get most popular products in catalogues
-- SELECT cp.product_id, COUNT(*) as appearances 
-- FROM catalogue_products cp 
-- GROUP BY cp.product_id ORDER BY appearances DESC LIMIT 10;

-- Cleanup old archived versions
-- DELETE FROM catalogues 
-- WHERE status = 'archived' AND archived_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
