import ProductDetailPageClient from '@/components/site/product-detail-client'
import { createPageMetadata } from '@/app/metadata'
import { getProductBySlug, getProductsCatalog, getCatalogCategories } from '@/lib/products-server'
import { buildProductKeywords, buildProductSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: any) {
  const { slug } = await params
  try {
    const product = await getProductBySlug(slug)
    if (!product) return {}

    const title = product.seoTitle || `${product.name} Export from India | ${product.categoryName || 'Organic Export'} | Lokaa Exports`
    const description = product.seoDescription || `${product.name} export-grade supply from India with certified organic quality, bulk packaging, and global shipping to Singapore, Malaysia, UAE, UK and Germany. Ideal for importers, distributors, food manufacturers and private-label brands.`
    const keywords = product.keywords?.length ? product.keywords : buildProductKeywords(product, product.categoryName)

    return createPageMetadata({
      title,
      description,
      path: `/products/${product.slug}`,
      image: product.ogImage || product.hero || '/og-image.jpg',
      keywords,
      type: 'website',
    })
  } catch {
    return {}
  }
}

export default async function ProductDetailPage({ params }: any) {
  const { slug } = await params
  try {
    const [product, products, categories] = await Promise.all([getProductBySlug(slug), getProductsCatalog(), getCatalogCategories()])
    if (!product) return <div className="min-h-screen bg-ivory px-6 py-24 text-center text-navy">Product not available.</div>
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductSchema(product)) }} />
        <ProductDetailPageClient slug={slug} products={products} categories={categories} />
      </>
    )
  } catch (error: any) {
    console.warn('Product detail fallback due to data fetch error', error)
    return <div className="min-h-screen bg-ivory px-6 py-24 text-center text-navy">Product not available right now.</div>
  }
}
