import crypto from 'crypto'
import { getMysqlPool } from '@/lib/mysql-client'

const CREATE_APPROVALS_TABLE = `
  CREATE TABLE IF NOT EXISTS workflow_approvals (
    id VARCHAR(36) PRIMARY KEY,
    domainName VARCHAR(80) NOT NULL,
    entityType VARCHAR(80) NOT NULL,
    entityId VARCHAR(80) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('draft','pending_review','approved','published','archived','rejected') NOT NULL DEFAULT 'draft',
    requestedBy VARCHAR(80) DEFAULT '',
    assignedTo VARCHAR(80) DEFAULT '',
    notes TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    approvedAt DATETIME DEFAULT NULL,
    rejectedAt DATETIME DEFAULT NULL,
    KEY idx_workflow_domain_status(domainName,status),
    KEY idx_workflow_entity(entityType,entityId),
    KEY idx_workflow_assignee(assignedTo)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`

async function ensureTable() {
  const pool = await getMysqlPool()
  await pool.query(CREATE_APPROVALS_TABLE)
  return pool
}

function normalizeApproval(row) {
  return {
    id: row.id,
    domainName: row.domainName,
    entityType: row.entityType,
    entityId: row.entityId,
    title: row.title,
    status: row.status,
    requestedBy: row.requestedBy,
    assignedTo: row.assignedTo,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    approvedAt: row.approvedAt,
    rejectedAt: row.rejectedAt,
  }
}

export async function listApprovals({ status, domainName, limit = 100, offset = 0 } = {}) {
  const pool = await ensureTable()
  const where = []
  const values = []

  if (status) {
    where.push('status = ?')
    values.push(status)
  }
  if (domainName) {
    where.push('domainName = ?')
    values.push(domainName)
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const [rows] = await pool.query(
    `SELECT * FROM workflow_approvals ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...values, Number(limit), Number(offset)]
  )
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM workflow_approvals ${whereClause}`,
    values
  )
  return { items: rows.map(normalizeApproval), total: Number(total || 0) }
}

export async function createApprovalRequest(data) {
  const pool = await ensureTable()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const id = data.id || crypto.randomUUID()

  await pool.query(
    `INSERT INTO workflow_approvals
      (id, domainName, entityType, entityId, title, status, requestedBy, assignedTo, notes, createdAt, updatedAt, approvedAt, rejectedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.domainName,
      data.entityType,
      data.entityId,
      data.title,
      data.status || 'draft',
      data.requestedBy || '',
      data.assignedTo || '',
      data.notes || '',
      now,
      now,
      data.approvedAt || null,
      data.rejectedAt || null,
    ]
  )

  return getApprovalById(id)
}

export async function updateApprovalStatus(id, status, notes = '') {
  const pool = await ensureTable()
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const approvedAt = status === 'approved' || status === 'published' ? now : null
  const rejectedAt = status === 'rejected' ? now : null

  await pool.query(
    `UPDATE workflow_approvals
     SET status = ?, notes = ?, updatedAt = ?, approvedAt = COALESCE(?, approvedAt), rejectedAt = COALESCE(?, rejectedAt)
     WHERE id = ?`,
    [status, notes, now, approvedAt, rejectedAt, id]
  )

  return getApprovalById(id)
}

export async function getApprovalById(id) {
  const pool = await ensureTable()
  const [rows] = await pool.query('SELECT * FROM workflow_approvals WHERE id = ? LIMIT 1', [id])
  return rows.length ? normalizeApproval(rows[0]) : null
}
