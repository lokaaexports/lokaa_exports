'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronRight, Filter, Search } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'
import { PRODUCT_PLACEHOLDER } from '@/lib/image-utils'

export default function SubcategoryPageClient({ category, subcategory, subcategories = [], products = [], categories = [] }: any) {
  const [query, setQuery] = useState('')

  const filteredProducts = useMemo(() => {
    return products.filter((product) => !query || product.name.toLowerCase().includes(query.toLowerCase()) || product.tagline?.toLowerCase().includes(query.toLowerCase()))
  }, [products, query])

  const isOrganics = category.slug === 'organics'
  const brandName = isOrganics ? 'AgriOrganicExports' : 'Lokaa Exports'
  const sectionGradient = isOrganics ? 'from-emerald-950 to-emerald-700' : 'from-slate-950 to-slate-700'
  const subcategoryObj = typeof subcategory === 'object' ? subcategory : subcategories.find((s: any) => s.slug === subcategory || s.id === subcategory || s.name === subcategory) || { name: subcategory }
  const subcategoryImage = subcategoryObj?.bannerImage || subcategoryObj?.image || category.bannerImage || category.image || '/og-image.jpg'

  return (
    <main className="min-h-screen bg-ivory">
      <Nav categories={categories} theme="light" />
      <section className={`relative overflow-hidden bg-gradient-to-br ${sectionGradient} px-6 pb-20 pt-32 text-white lg:px-10`}>
        <div className="absolute inset-0 opacity-20">
          <Image src={subcategoryImage} alt={subcategoryObj?.name || subcategory} fill sizes="100vw" className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-black/45" />
        <div className="mx-auto max-w-[1400px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white">
            {category.name} / {subcategory}
          </div>
          <h1 className="mt-5 font-display text-4xl tracking-tight text-white sm:text-5xl">{subcategory}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white">Explore export-ready products and sourcing support for this subcategory from {brandName}.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Browse products</div>
              <h2 className="mt-2 font-display text-2xl text-navy">{subcategory} products</h2>
            </div>
            <label className="flex items-center gap-2 rounded-full border border-navy/10 bg-ivory px-4 py-3 text-sm text-graphite/70">
              <Search className="h-4 w-4 text-gold" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this subcategory" className="w-full bg-transparent outline-none" />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {subcategories.map((item) => (
              <Link key={item.slug} href={`/category/${category.slug}/${item.slug}`} className={`rounded-full px-4 py-2 text-sm font-medium ${item.slug === subcategory ? 'bg-navy text-white' : 'bg-ivory text-navy'}`}>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-10">
        {filteredProducts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <motion.article key={product.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-navy/5">
                  <Image src={product.hero || PRODUCT_PLACEHOLDER} alt={product.name || 'Product'} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-gold">{category.name}</div>
                  <h3 className="mt-3 font-display text-2xl text-navy">{product.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-graphite/70">{product.tagline || product.shortDescription || product.description}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="rounded-full bg-ivory px-3 py-1 text-xs font-medium text-navy">{product.status || 'published'}</span>
                    <Link href={`/products/${product.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-gold">
                      View product <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-navy/15 bg-white p-10 text-center text-graphite/60">No products are available for this subcategory yet.</div>
        )}
      </section>

      <Footer />
    </main>
  )
}
