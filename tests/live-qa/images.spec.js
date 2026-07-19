import { test, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PAGES = [
  { page: '/', name: 'Homepage' },
  { page: '/products', name: 'Storefront listing' },
  { page: '/category/organics', name: 'Category: organics' },
  { page: '/category/industrial', name: 'Category: industrial' },
]

function normalizeUrl(baseUrl, src) {
  try {
    return new URL(src, baseUrl).href
  } catch {
    return src
  }
}

async function collectImageIssues(page, pageName) {
  return page.evaluate((currentPageName) => {
    const problems = []
    const seen = new Set()
    const images = Array.from(document.querySelectorAll('img'))

    for (const img of images) {
      const src = img.currentSrc || img.src || ''
      const key = `${src}::${img.alt || ''}`
      if (seen.has(key)) continue
      seen.add(key)

      const rect = img.getBoundingClientRect()
      if (!img.alt) {
        problems.push({
          page: currentPageName,
          url: src,
          problem: 'missing-alt-text',
          recommendation: 'Add descriptive alt text.',
        })
      }

      if (rect.width === 0 || rect.height === 0) {
        problems.push({
          page: currentPageName,
          url: src,
          problem: 'empty-image-container',
          recommendation: 'Ensure the image is rendered with a non-zero layout size.',
        })
      }

      if (img.complete && img.naturalWidth === 0) {
        problems.push({
          page: currentPageName,
          url: src,
          problem: 'broken-image',
          recommendation: 'Replace with a working URL or a local asset.',
        })
      }

      const placeholderMatch = src.includes('placeholder.png')
      if (placeholderMatch) {
        problems.push({
          page: currentPageName,
          url: src,
          problem: 'placeholder-image',
          recommendation: 'Replace placeholder imagery with product/category-specific assets.',
        })
      }

      if (img.naturalWidth > 0 && rect.width > 0 && rect.height > 0) {
        const displayedRatio = rect.width / rect.height
        const naturalRatio = img.naturalWidth / img.naturalHeight
        if (Number.isFinite(displayedRatio) && Number.isFinite(naturalRatio) && Math.abs(displayedRatio - naturalRatio) > 0.8) {
          problems.push({
            page: currentPageName,
            url: src,
            problem: 'possible-dimension-mismatch',
            recommendation: 'Confirm the rendered aspect ratio matches the source asset.',
          })
        }
      }
    }

    return problems
  }, pageName)
}

async function writeReport(issues) {
  const reportPath = path.join(process.cwd(), 'tests', 'live-qa', 'image-audit-report.md')
  const lines = [
    '# Image Audit Report',
    '',
    `Status: ${issues.length ? 'Issues found' : 'No issues detected'} after browser validation.`,
    '',
    '| Image URL | Page | Problem | Recommended replacement |',
    '| --- | --- | --- | --- |',
  ]

  if (issues.length === 0) {
    lines.push('| _None_ | _All pages_ | No image issues detected | No replacement required |')
  } else {
    for (const issue of issues) {
      lines.push(`| ${issue.url || '_unknown_'} | ${issue.page} | ${issue.problem} | ${issue.recommendation} |`)
    }
  }

  await writeFile(reportPath, `${lines.join('\n')}\n`, 'utf8')
}

test.describe('Image audit', () => {
  test('audits rendered images across public pages', async ({ page }) => {
    test.setTimeout(120000)
    const issues = []

    for (const target of PAGES) {
      await page.goto(target.page, { waitUntil: 'commit', timeout: 60000 })
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {})
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
      const pageIssues = await collectImageIssues(page, target.name)
      for (const issue of pageIssues) {
        issue.url = issue.url ? normalizeUrl(page.url(), issue.url) : issue.url
        issues.push(issue)
      }
    }

    await mkdir(path.join(process.cwd(), 'tests', 'live-qa'), { recursive: true })
    await writeReport(issues)

    expect(issues, `image issues:\n${issues.map((issue) => `${issue.page}: ${issue.problem} ${issue.url}`).join('\n')}`).toEqual([])
  })
})
