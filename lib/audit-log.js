import crypto from 'crypto'
import { getMysqlPool } from './mysql-client'

function toSqlDate(value = new Date()) {
  return new Date(value).toISOString().slice(0, 19).replace('T', ' ')
}

export async function logAuditEvent({ action, userId = null, email = null, ipAddress = 'unknown', details = {} }) {
  try {
    const pool = await getMysqlPool()
    await pool.query(
      `INSERT INTO audit_logs (id, action, userId, email, ipAddress, details, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      [crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, action, userId, email, ipAddress, JSON.stringify(details || {}), toSqlDate()]
    )
  } catch (error) {
    console.warn('Audit logging failed', error)
  }
}
