/**
 * MySQL Connection Pool for Admin Services
 * Re-exports the connection pool from lib/mysql-client.js
 */

import { getMysqlPool as getPoolFromClient } from '@/lib/mysql-client'

/**
 * Get the MySQL connection pool
 * @returns {Promise<Pool>} MySQL connection pool
 */
export async function getMysqlPool() {
  return getPoolFromClient()
}

/**
 * Execute a query with automatic connection handling
 * @param {string} sql - SQL query string
 * @param {Array} values - Query parameters
 * @returns {Promise<Array>} Query results
 */
export async function executeQuery(sql: any, values = []) {
  const pool = await getMysqlPool()
  const [results] = await pool.query(sql, values)
  return results
}

/**
 * Get a single row from database
 * @param {string} sql - SQL query string
 * @param {Array} values - Query parameters
 * @returns {Promise<Object|null>} Single row or null
 */
export async function getRow(sql: any, values = []) {
  const results = await executeQuery(sql, values)
  return results.length > 0 ? results[0] : null
}

/**
 * Get multiple rows from database
 * @param {string} sql - SQL query string
 * @param {Array} values - Query parameters
 * @returns {Promise<Array>} Array of rows
 */
export async function getRows(sql: any, values = []) {
  return executeQuery(sql, values)
}
