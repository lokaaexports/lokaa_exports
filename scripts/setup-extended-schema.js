import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

function loadDotEnv() {
  const envPath = fileURLToPath(new URL('../.env', import.meta.url))

  if (!fs.existsSync(envPath)) return

  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

    const separatorIndex = trimmed.indexOf('=')
    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function getMysqlConfig() {
  loadDotEnv()

  const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_SSL } =
    process.env

  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
    throw new Error('Missing MySQL environment variables')
  }

  return {
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT || 3306),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    ssl: MYSQL_SSL === 'true' || MYSQL_SSL === '1' ? { rejectUnauthorized: false } : undefined,
  }
}

async function setupDatabase() {
  let connection

  try {
    connection = await mysql.createConnection(getMysqlConfig())

    console.log('Setting up CRM extended schema...\n')

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customer_tasks (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        customer_id VARCHAR(36),
        lead_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        task_type VARCHAR(100),
        due_date DATETIME,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        assigned_to VARCHAR(36),
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,

        INDEX idx_customer_id (customer_id),
        INDEX idx_lead_id (lead_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date),
        INDEX idx_assigned_to (assigned_to)
      )
    `)
    console.log('Created customer_tasks table')

    await connection.query(`
      CREATE TABLE IF NOT EXISTS rfqs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        rfq_reference VARCHAR(50) UNIQUE,
        customer_id VARCHAR(36),
        lead_id VARCHAR(36),
        product_description TEXT NOT NULL,
        quantity DECIMAL(10, 2),
        unit VARCHAR(50),
        expected_delivery_date DATE,
        assigned_to VARCHAR(36),
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        status ENUM('received', 'processing', 'quoted', 'approved', 'rejected', 'completed') DEFAULT 'received',
        notes TEXT,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,

        INDEX idx_status (status),
        INDEX idx_customer_id (customer_id),
        INDEX idx_lead_id (lead_id),
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_priority (priority)
      )
    `)
    console.log('Created rfqs table')

    await connection.query(`
      CREATE TABLE IF NOT EXISTS rfq_quotations (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        rfq_id VARCHAR(36),
        quotation_reference VARCHAR(50) UNIQUE,
        unit_price DECIMAL(15, 2),
        total_price DECIMAL(15, 2),
        currency VARCHAR(3) DEFAULT 'USD',
        validity_days INT DEFAULT 30,
        delivery_days INT,
        notes TEXT,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        approved_by VARCHAR(36),

        INDEX idx_rfq_id (rfq_id),
        INDEX idx_status (approved_at)
      )
    `)
    console.log('Created rfq_quotations table')

    await connection.query(`
      CREATE TABLE IF NOT EXISTS rfq_orders (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        quotation_id VARCHAR(36),
        order_reference VARCHAR(50) UNIQUE,
        status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        po_number VARCHAR(100),
        shipment_date DATE,
        delivery_date DATE,
        notes TEXT,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_quotation_id (quotation_id),
        INDEX idx_status (status)
      )
    `)
    console.log('Created rfq_orders table')

    await connection.query('DROP VIEW IF EXISTS task_analytics')
    await connection.query(`
      CREATE VIEW task_analytics AS
      SELECT
        COUNT(*) AS total_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS high_priority_tasks,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'completed' THEN 1 ELSE 0 END) AS overdue_tasks
      FROM customer_tasks
      WHERE deleted_at IS NULL
    `)
    console.log('Created task_analytics view')

    await connection.query('DROP VIEW IF EXISTS rfq_analytics')
    try {
      await connection.query(`
        CREATE VIEW rfq_analytics AS
        SELECT
          COUNT(*) AS total_rfqs,
          SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) AS received_rfqs,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing_rfqs,
          SUM(CASE WHEN status = 'quoted' THEN 1 ELSE 0 END) AS quoted_rfqs,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_rfqs
        FROM rfqs
      `)
      console.log('Created rfq_analytics view')
    } catch (error) {
      console.log('Warning: Could not create rfq_analytics view')
    }

    console.log('\nALL EXTENDED SCHEMA TABLES AND VIEWS CREATED SUCCESSFULLY!\n')
  } catch (error) {
    console.error('Error:', error.message)
    process.exitCode = 1
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

await setupDatabase()
