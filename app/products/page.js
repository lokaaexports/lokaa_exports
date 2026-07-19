import { Suspense } from 'react'
import ProductsPageClient from '@/components/site/products-page-client'
import { createPageMetadata } from '@/app/metadata'
import { getCatalogCategories, getProductsCatalog } from '@/lib/products-server'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export const metadata = createPageMetadata({
  title: 'Product catalogue — seasonal and year-round export supplies',
  description: 'Browse our export-ready seasonal and non-seasonal product catalogue for Singapore, Malaysia and other global markets.',
  path: '/products',
})

export default async function ProductsPage() {
  try {
    const [products, categories] = await Promise.all([getProductsCatalog(), getCatalogCategories()])
    return (
      <Suspense fallback={null}>
        <ProductsPageClient products={products} categories={categories} />
      </Suspense>
    )
  } catch (error) {
    console.warn('Products page fallback due to data fetch error', error)
    return (
      <Suspense fallback={null}>
        <ProductsPageClient products={[]} categories={[]} />
      </Suspense>
    )
  }
}
