import { test, expect } from '@playwright/test'

test.describe('Admin QA', () => {
  test('admin dashboard route loads', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(page.locator('body')).toBeVisible()
  })
})
