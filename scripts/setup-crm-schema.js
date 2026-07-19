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

async function main() {
  let connection

  try {
    connection = await mysql.createConnection(getMysqlConfig())

    await connection.query('DROP VIEW IF EXISTS customer_stats')
    await connection.query('DROP VIEW IF EXISTS lead_stats')
    await connection.query('DROP TABLE IF EXISTS lead_activities')
    await connection.query('DROP TABLE IF EXISTS leads')
    await connection.query('DROP TABLE IF EXISTS customers')

    console.log('Dropped existing tables and views')

    await connection.query(`CREATE TABLE customers (
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
      INDEX idx_status (status)
    )`)
    console.log('Created customers table')

    await connection.query(`CREATE TABLE leads (
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
      INDEX idx_assigned_employee (assigned_employee)
    )`)
    console.log('Created leads table')

    await connection.query(`CREATE TABLE lead_activities (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      lead_id VARCHAR(36) NOT NULL,
      activity_type VARCHAR(100),
      description TEXT,
      created_by VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      INDEX idx_lead_id (lead_id)
    )`)
    console.log('Created lead_activities table')

    await connection.query(`CREATE VIEW lead_stats AS
    SELECT
      COUNT(*) AS total_leads,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_leads,
      SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) AS contacted_leads,
      SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) AS converted_leads,
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS high_priority_leads
    FROM leads
    WHERE deleted_at IS NULL`)
    console.log('Created lead_stats view')

    await connection.query(`CREATE VIEW customer_stats AS
    SELECT
      COUNT(*) AS total_customers,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_customers,
      SUM(CASE WHEN status = 'prospect' THEN 1 ELSE 0 END) AS prospect_customers,
      COUNT(DISTINCT country) AS countries_served
    FROM customers
    WHERE deleted_at IS NULL`)
    console.log('Created customer_stats view')

    console.log('\nALL SCHEMA CREATED SUCCESSFULLY!')
  } catch (error) {
    console.error('Error:', error.message)
    process.exitCode = 1
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

await main()
