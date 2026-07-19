import { test, expect } from '@playwright/test'

test.describe('Customer QA', () => {
  test('customer dashboard route loads', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/customer/account', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(page.locator('body')).toBeVisible()
  })
})
