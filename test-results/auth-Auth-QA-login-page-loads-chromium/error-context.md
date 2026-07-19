# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Auth QA >> login page loads
- Location: tests\live-qa\auth.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').filter({ hasText: 'Customer login' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1').filter({ hasText: 'Customer login' })

```

```yaml
- text: Loading...
- region "Notifications alt+T"
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test'
  2 | 
  3 | test.describe('Auth QA', () => {
  4 |   test('login page loads', async ({ page }) => {
  5 |     await page.goto('/auth/login')
> 6 |     await expect(page.locator('h1', { hasText: 'Customer login' })).toBeVisible()
    |                                                                     ^ Error: expect(locator).toBeVisible() failed
  7 |   })
  8 | })
  9 | 
```