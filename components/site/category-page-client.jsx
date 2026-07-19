'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronRight, Filter, Package2, Search } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'

export default function CategoryPageClient({ category, subcategories = [], products = [] }) {
  const [query, setQuery] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')

  const categoryImage = category.bannerImage || category.image || '/og-image.jpg'
  const categoryMeta = {
    heading: category.name,
    intro: category.description || category.seoDescription || `Reliable export sourcing and procurement support from ${category.name}.`,
    accent: 'from-slate-950 to-slate-700',
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = !query || product.name.toLowerCase().includes(query.toLowerCase()) || product.tagline?.toLowerCase().includes(query.toLowerCase())
      const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory || product.subcategorySlug === selectedSubcategory
      return matchesQuery && matchesSubcategory
    })
  }, [products, query, selectedSubcategory])

  const subcategoryOptions = ['all', ...subcategories.map((item) => item.slug)]

  return (
    <main className="min-h-screen bg-ivory">
      <Nav theme="light" />
      <section className={`relative overflow-hidden bg-gradient-to-br ${categoryMeta.accent} px-6 pb-24 pt-32 text-white lg:px-10`}>
        <div className="absolute inset-0 opacity-20">
          <Image src={categoryImage} alt={category.name} fill sizes="100vw" className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-black/45" />
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 flex flex-col gap-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white">
                <Package2 className="h-3.5 w-3.5" /> {categoryMeta.heading}
              </div>
              <h1 className="font-display text-6xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl">{categoryMeta.heading}</h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-white/90">{categoryMeta.intro}</p>
            </div>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/70">Category Overview</div>
              <div className="mt-3 text-2xl font-bold text-white">{products.length} dedicated products</div>
              <div className="mt-2 text-sm text-white/70">{subcategories.length} subcategories for organized sourcing</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
        <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Browse by subcategory</div>
              <h2 className="mt-2 font-display text-2xl text-navy">Structured sourcing paths</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 rounded-full border border-navy/10 bg-ivory px-4 py-3 text-sm text-graphite/70">
                <Search className="h-4 w-4 text-gold" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="w-full bg-transparent outline-none" />
              </label>
              <label className="flex items-center gap-2 rounded-full border border-navy/10 bg-ivory px-4 py-3 text-sm text-graphite/70">
                <Filter className="h-4 w-4 text-gold" />
                <select value={selectedSubcategory} onChange={(event) => setSelectedSubcategory(event.target.value)} className="bg-transparent outline-none">
                  <option value="all">All subcategories</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.slug} value={subcategory.slug}>{subcategory.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {subcategories.length > 0 && (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {subcategories.map((subcategory) => (
                <Link key={subcategory.slug} href={`/category/${category.slug}/${subcategory.slug}`} className="rounded-2xl border border-navy/10 bg-ivory p-5 transition hover:-translate-y-1 hover:border-gold">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-gold">Subcategory</div>
                      <h3 className="mt-2 font-display text-xl text-navy">{subcategory.name}</h3>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gold" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-graphite/70">{subcategory.description || 'Explore curated export products under this heading.'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-10">
        <div className="mb-8 flex flex-col gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Product listing</div>
            <h2 className="mt-2 font-display text-3xl font-bold text-navy">{categoryMeta.heading} Export Catalog</h2>
            <p className="mt-2 text-sm text-graphite/60">Premium products dedicated exclusively to {categoryMeta.heading}</p>
          </div>
          <div className="text-sm font-semibold text-graphite">{filteredProducts.length} dedicated products available</div>
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <motion.article key={product.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-navy/5">
                  <Image src={product.hero || '/placeholder.png'} alt={product.name} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-gold">{product.subcategory || category.name}</div>
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
          <div className="rounded-3xl border border-dashed border-navy/15 bg-white p-10 text-center text-graphite/60">No products match the current filters yet.</div>
        )}
      </section>

      <Footer />
    </main>
  )
}
