import { notFound } from 'next/navigation'
import { createPageMetadata } from '@/app/metadata'
import SubcategoryPageClient from '@/components/site/subcategory-page-client'
import { getCategoryBySlug, getProductBySlug, getProductsBySubcategory, getSubcategoriesForCategory, getSubcategoryBySlug, getCatalogCategories } from '@/lib/products-server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: any) {
  const { slug, subcategory } = await params
  try {
    const [category, subcategoryObj] = await Promise.all([
      getCategoryBySlug(slug),
      getSubcategoryBySlug(slug, subcategory),
    ])

    if (!category) return {}

    const title = `${subcategoryObj?.name || subcategory} | ${category.name} | Lokaa Exports`
    const description = subcategoryObj?.description || `Discover ${subcategoryObj?.name || subcategory} products under ${category.name} from Lokaa Exports.`
    const image = category.image || '/og-image.jpg'

    return createPageMetadata({
      title,
      description,
      path: `/category/${slug}/${subcategory}`,
      image,
      keywords: [],
    })
  } catch {
    return {}
  }
}

export default async function SubcategoryPage({ params }: any) {
  const { slug, subcategory } = await params
  try {
    const [category, subcategories, products, subcategoryObj, categories] = await Promise.all([
      getCategoryBySlug(slug),
      getSubcategoriesForCategory(slug),
      getProductsBySubcategory(slug, subcategory),
      getSubcategoryBySlug(slug, subcategory),
      getCatalogCategories(),
    ])

    if (!category) {
      return <div className="min-h-screen bg-ivory px-6 py-24 text-center text-navy">Subcategory not available.</div>
    }

    return (
      <SubcategoryPageClient
        category={category}
        subcategory={subcategory}
        subcategoryObj={subcategoryObj}
        subcategories={subcategories}
        products={products}
        categories={categories}
      />
    )
  } catch (error: any) {
    console.warn('Subcategory page fallback due to data fetch error', error)
    return <div className="min-h-screen bg-ivory px-6 py-24 text-center text-navy">Subcategory not available right now.</div>
  }
}
