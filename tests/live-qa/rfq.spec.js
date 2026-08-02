import { test, expect } from '@playwright/test'

test.describe('RFQ QA', () => {
  test('rfq page loads', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/rfq', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(page).toHaveURL(/\/rfq/)
    await expect(page.locator('h1, h2, form, main').first()).toBeVisible()
  })
})
