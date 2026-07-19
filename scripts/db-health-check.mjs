import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import mysql from 'mysql2/promise'

function parseEnv(text) {
  const env = {}
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

const env = parseEnv(await readFile(resolve(process.cwd(), '.env'), 'utf8'))

const pool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: Number(env.MYSQL_PORT || 3306),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  ssl: env.MYSQL_SSL === 'true' || env.MYSQL_SSL === '1'
    ? { rejectUnauthorized: false }
    : undefined,
})

try {
  const [one] = await pool.query('SELECT 1 AS ok')
  const [db] = await pool.query('SELECT DATABASE() AS databaseName')
  console.log(JSON.stringify({ ok: one?.[0]?.ok, database: db?.[0]?.databaseName }))
  console.log('Database connected successfully')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await pool.end().catch(() => {})
}
