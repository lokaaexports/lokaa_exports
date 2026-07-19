-- Customers & Leads Management Schema
-- For Lokaa Global Exports Admin Portal

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  country VARCHAR(100),
  industry VARCHAR(100),
  website VARCHAR(255),
  status ENUM('active', 'inactive', 'prospect') DEFAULT 'prospect',
  notes TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  INDEX idx_company_name (company_name),
  INDEX idx_email (email),
  INDEX idx_country (country),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  customer_id VARCHAR(36),
  lead_reference VARCHAR(50) UNIQUE,
  source VARCHAR(50),
  product_interest VARCHAR(255),
  country VARCHAR(100),
  status ENUM('new', 'contacted', 'requirement_received', 'quote_sent', 'negotiation', 'converted') DEFAULT 'new',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  assigned_employee VARCHAR(36),
  notes TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  INDEX idx_status (status),
  INDEX idx_customer_id (customer_id),
  INDEX idx_assigned_employee (assigned_employee),
  INDEX idx_created_at (created_at),
  INDEX idx_priority (priority)
);

-- Lead Activity Log
CREATE TABLE IF NOT EXISTS lead_activities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  lead_id VARCHAR(36) NOT NULL,
  activity_type VARCHAR(100),
  description TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_lead_id (lead_id),
  INDEX idx_created_at (created_at)
);

-- Create View for Lead Stats
CREATE OR REPLACE VIEW lead_stats AS
SELECT 
  COUNT(*) as total_leads,
  SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
  SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_leads,
  SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted_leads,
  SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_leads
FROM leads
WHERE deleted_at IS NULL;

-- Create View for Customer Stats
CREATE OR REPLACE VIEW customer_stats AS
SELECT 
  COUNT(*) as total_customers,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_customers,
  SUM(CASE WHEN status = 'prospect' THEN 1 ELSE 0 END) as prospect_customers,
  COUNT(DISTINCT country) as countries_served
FROM customers
WHERE deleted_at IS NULL;
