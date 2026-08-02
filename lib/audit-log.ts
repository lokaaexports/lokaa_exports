import crypto from 'crypto'
import { getMysqlPool } from './mysql-client'
import { prisma } from './prisma'

function toSqlDate(value = new Date()) {
  return new Date(value).toISOString().slice(0, 19).replace('T', ' ')
}

export async function logAuditEvent({ action, userId = null, email = null, ipAddress = 'unknown', details = {} }: any) {
  try {
    const pool = await getMysqlPool()
    await pool.query(
      `INSERT INTO audit_logs (id, action, userId, email, ipAddress, details, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      [crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, action, userId, email, ipAddress, JSON.stringify(details || {}), toSqlDate()]
    )
  } catch (error: any) {
    console.warn('Audit logging failed', error)
  }
}

// Simple shallow diff function
export function getJsonDiff(previousState: any, newState: any) {
  const diff: any = {}
  const keys = new Set([...Object.keys(previousState || {}), ...Object.keys(newState || {})])
  
  for (const key of Array.from(keys)) {
    if (JSON.stringify(previousState?.[key]) !== JSON.stringify(newState?.[key])) {
      diff[key] = {
        old: previousState?.[key],
        new: newState?.[key]
      }
    }
  }
  return diff
}

export async function createAuditDiff({
  userId,
  action,
  entity,
  resourceId,
  previousState,
  newState,
  ipAddress,
  userAgent
}: {
  userId?: string
  action: string
  entity: string
  resourceId?: string
  previousState?: any
  newState?: any
  ipAddress?: string
  userAgent?: string
}) {
  try {
    const changes = getJsonDiff(previousState, newState)
    
    // Only log if there are actual changes or if it's a create/delete action
    if (Object.keys(changes).length === 0 && action !== 'CREATE' && action !== 'DELETE') {
      return
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: resourceId,
        changes,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Failed to create audit log', error)
  }
}
