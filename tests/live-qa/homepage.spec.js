import { test, expect } from '@playwright/test'

test.describe('Homepage QA', () => {
  test('loads and captures desktop/mobile screenshots', async ({ page }) => {
    test.setTimeout(60000)
    const consoleErrors = []
    const failedRequests = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const txt = msg.text()
        if (!txt.includes('font') && !txt.includes('favicon') && !txt.includes('downloadable')) {
          consoleErrors.push(txt)
        }
      }
    })
    page.on('requestfailed', (req) => {
      const errText = req.failure()?.errorText || ''
      const url = req.url()
      if (errText.includes('ERR_ABORTED') || url.includes('_rsc') || url.includes('favicon')) {
        return
      }
      failedRequests.push(`${req.method()} ${url} :: ${errText || 'failed'}`)
    })

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('h1, h2, nav, main').first()).toBeVisible()
    await page.screenshot({ path: 'artifacts/homepage-desktop.png', fullPage: true })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.screenshot({ path: 'artifacts/homepage-mobile.png', fullPage: true })

    expect(consoleErrors, `console errors: ${consoleErrors.join('\n')}`).toEqual([])
    expect(failedRequests, `failed requests: ${failedRequests.join('\n')}`).toEqual([])
  })
})
