import { test, expect } from '@playwright/test'

test.describe('Storefront QA', () => {
  test('product listing and detail routes load', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(page.locator('body')).toBeVisible()

    const firstProduct = page.locator('a[href^="/products/"]').first()
    if (await firstProduct.count()) {
      await firstProduct.click()
      await expect(page).toHaveURL(/\/products\/[^/]+$/)
    }
  })
})
