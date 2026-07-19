import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
]

const routes = [
  { path: '/', label: 'homepage' },
  { path: '/products', label: 'products listing' },
  { path: '/auth/login', label: 'login' },
  { path: '/auth/register', label: 'register' },
  { path: '/dashboard', label: 'customer dashboard' },
  { path: '/admin/dashboard', label: 'admin dashboard' },
]

test.describe('Responsive UI QA', () => {
  for (const viewport of viewports) {
    test(`${viewport.name} layout stays within bounds`, async ({ page }) => {
      test.setTimeout(120000)

      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      for (const route of routes) {
        await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 60000 })
        await expect(page.locator('body')).toBeVisible()

        const metrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }))

        expect(
          metrics.scrollWidth,
          `${viewport.name} overflow on ${route.label} (${route.path})`
        ).toBeLessThanOrEqual(metrics.clientWidth + 2)
      }
    })
  }
})
