import fs from 'node:fs'

const body = fs.readFileSync('data/test-rfq.json', 'utf8')

;(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3003/api/rfqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    const text = await res.text()
    console.log('STATUS', res.status)
    console.log(text)
  } catch (error) {
    console.error('ERR', error)
    process.exit(1)
  }
})()
