-- Employee Management System Schema
-- Production-ready schema for Lokaa Global Exports

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status ENUM('active', 'inactive', 'on_leave', 'terminated') DEFAULT 'active',
  hire_date DATE,
  manager_id VARCHAR(36),
  profile_image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  updated_by VARCHAR(36),
  deleted_at TIMESTAMP NULL,
  
  -- Indexes for performance
  INDEX idx_department (department),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_email (email),
  INDEX idx_hire_date (hire_date),
  INDEX idx_created_at (created_at),
  INDEX idx_manager_id (manager_id),
  
  -- Foreign keys
  CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  head_id VARCHAR(36),
  budget DECIMAL(15, 2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_status (status),
  CONSTRAINT fk_dept_head FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Employee Roles Table
CREATE TABLE IF NOT EXISTS employee_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role_name VARCHAR(50) NOT NULL UNIQUE,
  hierarchy_level INT DEFAULT 1,
  description TEXT,
  permissions JSON,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employee Activity Log
CREATE TABLE IF NOT EXISTS employee_activity_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_id VARCHAR(36) NOT NULL,
  action VARCHAR(100),
  details JSON,
  log_type ENUM('login', 'logout', 'create', 'update', 'delete', 'export', 'other') DEFAULT 'other',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_employee_id (employee_id),
  INDEX idx_log_type (log_type),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_log_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Employee Performance Ratings (Optional but useful)
CREATE TABLE IF NOT EXISTS employee_performance (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  employee_id VARCHAR(36) NOT NULL UNIQUE,
  rating DECIMAL(3, 2),
  review_date DATE,
  reviewed_by VARCHAR(36),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_employee_id (employee_id),
  INDEX idx_rating (rating),
  CONSTRAINT fk_perf_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_perf_reviewer FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- Insert Default Departments
INSERT INTO departments (id, name, description, status) VALUES
('dept-001', 'Sales & Marketing', 'Sales, Marketing, Business Development', 'active'),
('dept-002', 'Operations', 'Operations, Logistics, Inventory Management', 'active'),
('dept-003', 'Finance', 'Accounting, Finance, Audit', 'active'),
('dept-004', 'Human Resources', 'HR, Recruitment, Employee Relations', 'active'),
('dept-005', 'IT & Systems', 'IT, Systems Administration, Development', 'active'),
('dept-006', 'Export & Documentation', 'Export Compliance, Documentation, Shipping', 'active')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert Default Roles
INSERT INTO employee_roles (id, role_name, hierarchy_level, description, status) VALUES
('role-001', 'super_admin', 5, 'Super Administrator - Full System Access', 'active'),
('role-002', 'admin', 4, 'Administrator - Administrative Access', 'active'),
('role-003', 'operations', 3, 'Operations Manager - Operations Access', 'active'),
('role-004', 'manager', 2, 'Department Manager - Limited Management', 'active'),
('role-005', 'staff', 1, 'Staff - Basic Access', 'active'),
('role-006', 'viewer', 0, 'Viewer - Read-only Access', 'active')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;



-- Create View for Employee Dashboard Stats
CREATE OR REPLACE VIEW employee_stats AS
SELECT 
  COUNT(*) as total_employees,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_employees,
  SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_employees,
  SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as on_leave_employees,
  SUM(CASE WHEN status = 'terminated' THEN 1 ELSE 0 END) as terminated_employees
FROM employees
WHERE deleted_at IS NULL;

-- Create View for Department Employee Count
CREATE OR REPLACE VIEW department_employee_count AS
SELECT 
  department,
  COUNT(*) as employee_count,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
FROM employees
WHERE deleted_at IS NULL
GROUP BY department;
