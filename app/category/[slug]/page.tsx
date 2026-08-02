import { notFound } from 'next/navigation'
import { createPageMetadata } from '@/app/metadata'
import CategoryPageClient from '@/components/site/category-page-client'
import { getCategoryBySlug, getProductsByCategory, getSubcategoriesForCategory, getCatalogCategories } from '@/lib/products-server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: any) {
  const { slug } = await params
  try {
    const category = await getCategoryBySlug(slug)
    if (!category) return {}

    return createPageMetadata({
      title: `${category.name} | Lokaa Exports`,
      description: category.description || `Explore ${category.name} products and sourcing solutions from Lokaa Exports.`,
      path: `/category/${slug}`,
      image: category.image || '/og-image.jpg',
      keywords: [],
    })
  } catch {
    return {}
  }
}

export default async function CategoryPage({ params }: any) {
  const { slug } = await params
  try {
    const [category, subcategories, products, categories] = await Promise.all([
      getCategoryBySlug(slug),
      getSubcategoriesForCategory(slug),
      getProductsByCategory(slug),
      getCatalogCategories(),
    ])

    if (!category) {
      return <div className="min-h-screen bg-ivory px-6 py-24 text-center text-navy">Category not available.</div>
    }

    return <CategoryPageClient category={category} subcategories={subcategories} products={products} categories={categories} />
  } catch (error: any) {
    console.warn('Category page fallback due to data fetch error', error)
    return <div className="min-h-screen bg-ivory px-6 py-24 text-center text-navy">Category not available right now.</div>
  }
}
