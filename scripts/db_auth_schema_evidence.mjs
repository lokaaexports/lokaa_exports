import { getMysqlPool } from '../lib/mysql-client.js'

function uniq(arr) {
  return [...new Set(arr)]
}

async function main() {
  const pool = await getMysqlPool()
  const [rows] = await pool.query('SELECT DATABASE() as db')
  const db = rows?.[0]?.db
  if (!db) {
    console.log('DB=UNKNOWN')
    throw new Error('Could not determine current database')
  }

  const patterns = [
    '%authtoken%',
    '%auth_token%',
    '%authtk%',
    '%auththrottle%',
    '%auth_throttle%',
    '%throttle%',
    '%token%'
  ]

  const candidate = []
  for (const p of patterns) {
    const [t] = await pool.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema=? AND LOWER(table_name) LIKE LOWER(?)',
      [db, p]
    )
    for (const r of t) candidate.push(r.table_name)
  }

  const tables = uniq(candidate)
  console.log('DB=' + db)
  console.log('CANDIDATE_TABLES=' + tables.join(','))

  for (const table of tables) {
    const [idx] = await pool.query('SHOW INDEX FROM ??', [table])
    console.log('--- INDEXES ' + table + ' ---')
    console.log(
      idx.map((r) => ({
        Key_name: r.Key_name,
        Column_name: r.Column_name,
        Non_unique: r.Non_unique,
        Seq_in_index: r.Seq_in_index,
        Index_type: r.Index_type
      }))
    )

    const [fk] = await pool.query(
      `
      SELECT
        kcu.constraint_name,
        kcu.table_name,
        kcu.column_name,
        kcu.referenced_table_name,
        kcu.referenced_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = kcu.constraint_name
       AND rc.constraint_schema = kcu.constraint_schema
      WHERE kcu.table_schema = ?
        AND kcu.table_name = ?
        AND kcu.referenced_table_name IS NOT NULL
      `,
      [db, table]
    )

    console.log('--- FOREIGN_KEYS ' + table + ' ---')
    console.log(fk)
  }

  await pool.end()
}

main().catch((e) => {
  console.error('DB auth schema evidence script failed:', e)
  process.exit(1)
})
