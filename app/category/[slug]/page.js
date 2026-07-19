import { notFound } from 'next/navigation'
import { createPageMetadata } from '@/app/metadata'
import CategoryPageClient from '@/components/site/category-page-client'
import { getCategoryBySlug, getProductsByCategory, getSubcategoriesForCategory } from '@/lib/products-server'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const category = await getCategoryBySlug(slug)
    if (!category) return {}

    return createPageMetadata({
      title: category.seoTitle || `${category.name} | Lokaa Exports`,
      description: category.seoDescription || category.description || `Explore ${category.name} products and sourcing solutions from Lokaa Exports.`,
      path: `/category/${slug}`,
      image: category.ogImage || category.bannerImage || category.image || '/og-image.jpg',
      keywords: category.keywords || [],
    })
  } catch {
    return {}
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params
  try {
    const [category, subcategories, products] = await Promise.all([
      getCategoryBySlug(slug),
      getSubcategoriesForCategory(slug),
      getProductsByCategory(slug),
    ])

    if (!category) {
      return <div className="min-h-screen bg-ivory px-6 py-24 text-center text-navy">Category not available.</div>
    }

    return <CategoryPageClient category={category} subcategories={subcategories} products={products} />
  } catch (error) {
    console.warn('Category page fallback due to data fetch error', error)
    return <div className="min-h-screen bg-ivory px-6 py-24 text-center text-navy">Category not available right now.</div>
  }
}
