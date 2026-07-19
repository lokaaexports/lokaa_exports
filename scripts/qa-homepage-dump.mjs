import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const consoleErrors = []
const failed = []
const responses = []

page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})

page.on('response', async (resp) => {
  const status = resp.status()
  if (status >= 400) {
    responses.push(`${status} ${resp.request().method()} ${resp.url()}`)
  }
})

page.on('requestfailed', (req) => {
  failed.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText || 'failed'}`)
})

await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(5000)

console.log(JSON.stringify({ consoleErrors, failed, responses }, null, 2))

await browser.close()
