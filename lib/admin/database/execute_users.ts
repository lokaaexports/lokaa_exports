import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '../../../.env')

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
  loadEnvFile()

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

async function addUsers() {
  let connection

  try {
    connection = await mysql.createConnection(getMysqlConfig())

    const usersPath = path.join(__dirname, 'add_users.sql')
    const usersSQL = fs.readFileSync(usersPath, 'utf8')
    const statements = usersSQL.split(';').filter((statement) => statement.trim())

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 60)}...`)
      await connection.execute(statement)
    }

    console.log('Admin and Operations users created successfully!')
  } catch (error: any) {
    console.error('Error adding users:', error.message)
    process.exitCode = 1
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

addUsers().catch(console.error)
