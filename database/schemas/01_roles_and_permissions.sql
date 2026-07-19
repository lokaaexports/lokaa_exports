-- ==========================================
-- LOKAA EXPORTS - ENTERPRISE ADMIN DATABASE
-- PHASE 1: CORE INFRASTRUCTURE
-- ==========================================

-- ==========================================
-- 1. ROLES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tier INT DEFAULT 0 COMMENT '0=Custom, 1=Viewer, 2=Executive, 3=Manager, 4=Admin, 5=Super Admin',
    is_system BOOLEAN DEFAULT FALSE COMMENT 'Cannot be deleted if true',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    INDEX idx_slug (slug),
    INDEX idx_tier (tier),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. PERMISSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL COMMENT 'crm, products, employees, etc',
    action VARCHAR(50) NOT NULL COMMENT 'create, read, update, delete, export, approve, etc',
    description TEXT,
    resource_type VARCHAR(50) COMMENT 'Customer, RFQ, Product, etc',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_permission (module, action, resource_type),
    INDEX idx_slug (slug),
    INDEX idx_module (module),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. ROLE PERMISSIONS (JUNCTION TABLE)
-- ==========================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. DEPARTMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    manager_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active),
    INDEX idx_manager_id (manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. EMPLOYEES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    department_id INT,
    designation VARCHAR(100),
    reporting_manager_id INT,
    date_of_joining DATE,
    status ENUM('active', 'inactive', 'pending', 'on_leave', 'terminated') DEFAULT 'pending',
    is_online BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    invitation_token VARCHAR(255),
    invitation_sent_at TIMESTAMP NULL,
    invitation_expires_at TIMESTAMP NULL,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    INDEX idx_email (email),
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_department_id (department_id),
    INDEX idx_reporting_manager_id (reporting_manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign keys after all referenced tables exist
ALTER TABLE roles ADD FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE roles ADD FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE departments ADD FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE employees ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE employees ADD FOREIGN KEY (reporting_manager_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE employees ADD FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE employees ADD FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL;

-- ==========================================
-- 6. EMPLOYEE ROLES (MANY-TO-MANY)
-- ==========================================
CREATE TABLE IF NOT EXISTS employee_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    expires_at TIMESTAMP NULL COMMENT 'For temporary role assignments',
    
    UNIQUE KEY unique_employee_role (employee_id, role_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_role_id (role_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. SESSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50) COMMENT 'desktop, mobile, tablet',
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    access_token VARCHAR(500),
    refresh_token VARCHAR(500),
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMP NULL,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_device_id (device_id),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. LOGIN HISTORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS login_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    email VARCHAR(100),
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    browser VARCHAR(100),
    os VARCHAR(100),
    login_method ENUM('email_password', 'sso', 'api_key') DEFAULT 'email_password',
    status ENUM('success', 'failed', 'blocked') DEFAULT 'success',
    failure_reason VARCHAR(255),
    otp_verified BOOLEAN DEFAULT FALSE,
    two_factor_verified BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP NULL,
    session_duration_seconds INT,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_login_at (login_at),
    INDEX idx_status (status),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 9. ACTIVITY LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    action VARCHAR(100) NOT NULL COMMENT 'create, update, delete, approve, export, etc',
    module VARCHAR(50) NOT NULL COMMENT 'crm, products, employees, etc',
    resource_type VARCHAR(50) NOT NULL COMMENT 'Customer, RFQ, Product, etc',
    resource_id INT,
    resource_name VARCHAR(255),
    old_values JSON,
    new_values JSON,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('success', 'failed') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_resource_type (resource_type),
    INDEX idx_resource_id (resource_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 10. AUDIT LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    changes JSON,
    reason VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 11. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'alert') DEFAULT 'info',
    category VARCHAR(50) COMMENT 'rfq, order, customer, etc',
    related_id INT,
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_is_read (is_read),
    INDEX idx_is_archived (is_archived),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 12. API KEYS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS api_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    api_secret VARCHAR(255) NOT NULL,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_employee_id (employee_id),
    INDEX idx_api_key (api_key),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 13. EMAIL TEMPLATES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS email_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body LONGTEXT NOT NULL,
    variables JSON COMMENT 'List of available variables: {{variable_name}}',
    is_active BOOLEAN DEFAULT TRUE,
    category VARCHAR(50) COMMENT 'invitation, password_reset, notification, etc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 14. COMPANY SETTINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS company_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value LONGTEXT,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    category VARCHAR(50) COMMENT 'general, email, security, payment, etc',
    is_editable BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_category (category),
    FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- DEFAULT ROLES SEEDING
-- ==========================================
INSERT INTO roles (slug, name, description, tier, is_system) VALUES
('super_admin', 'Super Admin', 'Full system access', 5, TRUE),
('admin', 'Admin', 'Administrative access', 4, TRUE),
('sales_manager', 'Sales Manager', 'Manage sales team and RFQs', 3, TRUE),
('sales_executive', 'Sales Executive', 'Handle RFQs and quotations', 2, TRUE),
('export_manager', 'Export Manager', 'Manage export operations', 3, TRUE),
('documentation_officer', 'Documentation Officer', 'Handle export documentation', 2, TRUE),
('logistics_manager', 'Logistics Manager', 'Manage shipments', 3, TRUE),
('warehouse_staff', 'Warehouse Staff', 'Warehouse operations', 1, TRUE),
('customer_support', 'Customer Support', 'Support team', 2, TRUE),
('marketing', 'Marketing', 'Marketing team', 2, TRUE),
('finance', 'Finance', 'Finance team', 2, TRUE),
('viewer', 'Viewer', 'Read-only access', 1, TRUE);

-- ==========================================
-- DEFAULT PERMISSIONS SEEDING
-- ==========================================
-- CRM Permissions
INSERT INTO permissions (slug, module, action, resource_type, description) VALUES
('crm.customer.create', 'crm', 'create', 'Customer', 'Create new customer'),
('crm.customer.read', 'crm', 'read', 'Customer', 'View customer details'),
('crm.customer.update', 'crm', 'update', 'Customer', 'Edit customer'),
('crm.customer.delete', 'crm', 'delete', 'Customer', 'Delete customer'),
('crm.customer.export', 'crm', 'export', 'Customer', 'Export customers'),

('crm.rfq.create', 'crm', 'create', 'RFQ', 'Create RFQ'),
('crm.rfq.read', 'crm', 'read', 'RFQ', 'View RFQ'),
('crm.rfq.update', 'crm', 'update', 'RFQ', 'Edit RFQ'),
('crm.rfq.assign', 'crm', 'assign', 'RFQ', 'Assign RFQ to team'),
('crm.rfq.approve', 'crm', 'approve', 'RFQ', 'Approve RFQ'),
('crm.rfq.export', 'crm', 'export', 'RFQ', 'Export RFQs'),

-- Products Permissions
('products.create', 'products', 'create', 'Product', 'Add new product'),
('products.read', 'products', 'read', 'Product', 'View products'),
('products.update', 'products', 'update', 'Product', 'Edit products'),
('products.delete', 'products', 'delete', 'Product', 'Delete products'),
('products.export', 'products', 'export', 'Product', 'Export products'),
('products.bulk_upload', 'products', 'create', 'Product', 'Bulk upload products'),

-- Employees Permissions
('employees.create', 'employees', 'create', 'Employee', 'Add employee'),
('employees.read', 'employees', 'read', 'Employee', 'View employees'),
('employees.update', 'employees', 'update', 'Employee', 'Edit employee'),
('employees.delete', 'employees', 'delete', 'Employee', 'Delete employee'),
('employees.invite', 'employees', 'create', 'Employee', 'Invite employee'),

-- Reports Permissions
('reports.view', 'reports', 'read', 'Report', 'View reports'),
('reports.export', 'reports', 'export', 'Report', 'Export reports'),
('reports.create', 'reports', 'create', 'Report', 'Create custom reports'),

-- Settings Permissions
('settings.view', 'settings', 'read', 'Settings', 'View settings'),
('settings.edit', 'settings', 'update', 'Settings', 'Edit settings'),
('settings.security', 'settings', 'update', 'Settings', 'Manage security'),

-- Activity & Logs
('logs.view', 'admin', 'read', 'ActivityLog', 'View activity logs'),
('logs.audit', 'admin', 'read', 'AuditLog', 'View audit logs');

-- ==========================================
-- ASSIGN DEFAULT PERMISSIONS TO ROLES
-- ==========================================

-- SUPER_ADMIN gets all permissions (already implied by tier 5)

-- ADMIN gets almost all
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'admin' AND p.slug NOT LIKE '%delete%' AND p.slug NOT LIKE '%security%';

-- VIEWER gets only read permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'viewer' AND p.action = 'read';

-- SALES_MANAGER gets CRM and reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'sales_manager' AND (p.module = 'crm' OR p.module = 'reports');

-- SALES_EXECUTIVE gets limited CRM
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'sales_executive' AND p.module = 'crm' AND p.action IN ('read', 'create', 'update');

-- MARKETING gets products and media
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.slug = 'marketing' AND (p.module = 'products' OR p.module = 'media');

-- Create default departments
INSERT INTO departments (name, slug, description) VALUES
('Sales', 'sales', 'Sales and RFQ management'),
('Operations', 'operations', 'Operations and logistics'),
('Products', 'products', 'Product management'),
('Finance', 'finance', 'Finance and accounting'),
('Marketing', 'marketing', 'Marketing and communications'),
('HR', 'hr', 'Human resources'),
('IT', 'it', 'Information technology'),
('Customer Support', 'customer_support', 'Customer support');

-- Create email templates
INSERT INTO email_templates (slug, name, subject, body, variables, category) VALUES
('employee_invitation', 'Employee Invitation', 'Welcome to Lokaa Exports Admin Portal', 
 '<h1>Welcome {{employee_name}}!</h1><p>You have been invited to join Lokaa Exports. Click <a href="{{invitation_link}}">here</a> to setup your account.</p>', 
 '["employee_name", "invitation_link", "company_name"]', 'invitation'),
 
('password_reset', 'Password Reset', 'Reset Your Password',
 '<h1>Password Reset Request</h1><p>Click <a href="{{reset_link}}">here</a> to reset your password. Link expires in {{expiry_time}}.</p>',
 '["reset_link", "expiry_time"]', 'password_reset'),
 
('rfq_assigned', 'RFQ Assignment', 'New RFQ Assigned to You',
 '<h1>New RFQ Assignment</h1><p>RFQ {{rfq_number}} has been assigned to you. <a href="{{rfq_link}}">View Details</a></p>',
 '["rfq_number", "rfq_link", "customer_name"]', 'notification');

-- Default company settings
INSERT INTO company_settings (setting_key, setting_value, data_type, category, description) VALUES
('company_name', 'Lokaa Exports', 'string', 'general', 'Company name'),
('company_email', 'admin@lokaaexports.com', 'string', 'general', 'Company email'),
('company_phone', '+91 97906 07059', 'string', 'general', 'Company phone'),
('company_logo_url', '/logo.png', 'string', 'general', 'Company logo URL'),
('smtp_host', 'smtp.gmail.com', 'string', 'email', 'SMTP server'),
('smtp_port', '587', 'number', 'email', 'SMTP port'),
('smtp_user', 'noreply@lokaaexports.com', 'string', 'email', 'SMTP user'),
('session_timeout_minutes', '30', 'number', 'security', 'Session timeout in minutes'),
('max_login_attempts', '5', 'number', 'security', 'Max failed login attempts'),
('jwt_expiry_hours', '24', 'number', 'security', 'JWT token expiry in hours'),
('enable_two_factor', 'false', 'boolean', 'security', 'Enable 2FA for all users'),
('enable_otp', 'true', 'boolean', 'security', 'Enable OTP verification'),
('currency', 'USD', 'string', 'general', 'Default currency'),
('timezone', 'Asia/Kolkata', 'string', 'general', 'Default timezone'),
('language', 'en', 'string', 'general', 'Default language');
