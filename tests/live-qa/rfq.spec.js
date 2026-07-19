import { test, expect } from '@playwright/test'

test.describe('RFQ QA', () => {
  test('rfq page loads', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/rfq', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(page.locator('body')).toBeVisible()
  })
})
