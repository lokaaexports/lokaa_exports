# Category Image Audit Report

Date: 2026-07-17

## Scope

Code-level audit of category and subcategory image handling for:

- `/category/[slug]`
- `/category/[slug]/[subcategory]`

## Result

- Category pages now source hero imagery from `category.bannerImage` or `category.image` with a local `/og-image.jpg` fallback.
- Subcategory pages now source hero imagery from `subcategory.bannerImage` or `subcategory.image`, then category fallback, then `/og-image.jpg`.
- No hardcoded category-specific hero images remain in the page components.

## Findings

| Category | Page URL | Current Image | Status | Problem | Recommended Replacement |
| --- | --- | --- | --- | --- | --- |
| All categories | `/category/[slug]` | `category.bannerImage || category.image || /og-image.jpg` | Pass | No hardcoded category hero image; data-driven fallback in place | None |
| All subcategories | `/category/[slug]/[subcategory]` | `subcategory.bannerImage || subcategory.image || category.bannerImage || category.image || /og-image.jpg` | Pass | No hardcoded subcategory hero image; data-driven fallback in place | None |

## Notes

- The environment could not reach the Hostinger MySQL database during live Prisma queries, so this audit is based on source verification and the new render paths rather than a live record dump.
- Product images were not modified.
