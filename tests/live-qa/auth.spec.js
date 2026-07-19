import { test, expect } from '@playwright/test'

test.describe('Auth QA', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('h1', { hasText: 'Customer login' })).toBeVisible()
  })
})
