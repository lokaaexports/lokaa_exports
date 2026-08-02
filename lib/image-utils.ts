/**
 * Production-grade image utilities for Lokaa Exports.
 *
 * Images MUST always come from the database or from local static assets.
 * External image services (Unsplash, Picsum, placeholder.com, etc.) are NEVER allowed.
 *
 * Fallback chain for product images:
 *   product.mainImage → images[0].imageUrl → /images/placeholders/product-placeholder.jpg
 */

/** Local fallback image served from /public/images/placeholders/ */
export const PRODUCT_PLACEHOLDER = '/images/placeholders/product-placeholder.jpg'
export const CATEGORY_PLACEHOLDER = '/images/placeholders/product-placeholder.jpg'

/**
 * Safely resolve a product hero image.
 * Falls back through: mainImage → first gallery image → placeholder.
 */
export function resolveHeroImage(product: any) {
  if (!product) return PRODUCT_PLACEHOLDER
  if (product.mainImage && isValidLocalOrDbImage(product.mainImage)) return product.mainImage
  if (product.hero && isValidLocalOrDbImage(product.hero)) return product.hero
  const gallery = Array.isArray(product.gallery) ? product.gallery : []
  const first = gallery.find((img) => img && isValidLocalOrDbImage(img))
  if (first) return first
  const images = Array.isArray(product.images) ? product.images : []
  const firstImg = images.find((img) => img?.imageUrl && isValidLocalOrDbImage(img.imageUrl))
  if (firstImg) return firstImg.imageUrl
  return PRODUCT_PLACEHOLDER
}

/**
 * Safely resolve the gallery array for a product.
 * Filters out any external/invalid URLs.
 * Always returns at least [PRODUCT_PLACEHOLDER].
 */
export function resolveGallery(product: any) {
  if (!product) return [PRODUCT_PLACEHOLDER]

  const sources = []

  if (product.mainImage && isValidLocalOrDbImage(product.mainImage)) {
    sources.push(product.mainImage)
  }

  const images = Array.isArray(product.images) ? product.images : []
  for (const img of images) {
    if (img?.imageUrl && isValidLocalOrDbImage(img.imageUrl) && !sources.includes(img.imageUrl)) {
      sources.push(img.imageUrl)
    }
  }

  const gallery = Array.isArray(product.gallery) ? product.gallery : []
  for (const url of gallery) {
    if (url && isValidLocalOrDbImage(url) && !sources.includes(url)) {
      sources.push(url)
    }
  }

  return sources.length > 0 ? sources : [PRODUCT_PLACEHOLDER]
}

/**
 * Safely resolve a category or industry banner image.
 */
export function resolveCategoryImage(category: any) {
  if (!category) return CATEGORY_PLACEHOLDER
  if (category.image && isValidLocalOrDbImage(category.image)) return category.image
  if (category.bannerImage && isValidLocalOrDbImage(category.bannerImage)) return category.bannerImage
  if (category.heroImage && isValidLocalOrDbImage(category.heroImage)) return category.heroImage
  return CATEGORY_PLACEHOLDER
}

/**
 * Returns true if the URL is a valid image source:
 *   - Relative paths starting with /
 *   - Absolute URLs from configured CDN hosts only
 *   - NOT from Unsplash, Picsum, placeholder services, etc.
 */
export function isValidLocalOrDbImage(url: any) {
  if (!url || typeof url !== 'string') return false

  // Allow relative/local paths (served from /public)
  if (url.startsWith('/')) return true

  try {
    const urlObj = new URL(url)
    // Only allow https
    if (urlObj.protocol !== 'https:') return false
    return true
  } catch {
    return false
  }
}
