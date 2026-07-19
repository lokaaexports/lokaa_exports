'use client'
import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowUpRight, Filter } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'
import { CATEGORIES } from '@/lib/products'

const EASE = [0.16, 1, 0.3, 1]

export default function ProductsPageClient({ products = [], categories = [] }) {
  const params = useSearchParams()
  const initial = params.get('c') || 'all'
  const [cat, setCat] = useState(initial)

  useEffect(() => { setCat(params.get('c') || 'all') }, [params])

  const categoryList = useMemo(() => {
    const list = Array.isArray(categories) && categories.length > 0 ? categories : CATEGORIES
    return list.map((category) => ({ slug: category.slug, name: category.name || category.slug }))
  }, [categories])

  const catalogProducts = useMemo(() => (products || []).map((product) => ({
    ...product,
    certifications: Array.isArray(product.certifications) ? product.certifications : [],
    applications: Array.isArray(product.applications) ? product.applications : [],
    packaging: Array.isArray(product.packaging) ? product.packaging : [],
    gallery: Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : [product.hero || '/placeholder.png'],
    tagline: product.tagline || '',
  })), [products])

  const filtered = useMemo(() => cat === 'all' ? catalogProducts : catalogProducts.filter((p) => p.category === cat), [cat, catalogProducts])

  return (
    <main>
      <Nav />
      <section className="relative overflow-hidden bg-navy-deep pb-20 pt-40 text-white">
        <div className="absolute inset-0 grain opacity-40" />
        <div className="absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold">
            <span className="h-px w-8 bg-gold" /> Product catalogue · export-ready
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15, ease: EASE }} className="max-w-4xl font-display text-5xl leading-[1.02] tracking-tight lg:text-7xl">
            Verified products for <span className="shimmer-text">global sourcing teams</span>.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
            Curated commodities and value-added exports with quality documentation, export-ready packaging and support for importers, distributors and procurement managers.
          </motion.p>
        </div>
      </section>
      <section className="sticky top-20 z-30 border-b border-navy/10 bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 overflow-x-auto px-6 py-4 lg:px-10">
          <div className="mr-2 flex flex-shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-graphite/60"><Filter className="h-3.5 w-3.5" /> Export type</div>
          {[{ slug: 'all', name: 'All' }, ...categoryList].map((c) => (
              <button key={c.slug} onClick={() => setCat(c.slug)} className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-all ${cat === c.slug ? 'bg-navy text-white' : 'border border-navy/10 bg-white text-navy/70 hover:text-navy'}`}>{c.name}</button>
          ))}
        </div>
      </section>
      <section className="bg-ivory py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <motion.div key={p.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, delay: (i % 6) * 0.06, ease: EASE }}>
                <Link href={`/products/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy/5">
                    <Image src={p.hero} alt={p.name} fill sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.08]" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-navy backdrop-blur">{categoryList.find((c) => c.slug === p.category)?.name || p.category}</div>
                    <div className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-navy transition group-hover:bg-gold"><ArrowUpRight className="h-4 w-4" /></div>
                  </div>
                  <div className="mt-5">
                    <div className="font-display text-xl tracking-tight text-navy transition group-hover:text-gold">{p.name}</div>
                    <div className="mt-1 text-sm text-graphite/60">{p.tagline}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.certifications.slice(0, 3).map((c) => <span key={c} className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-navy/70">{c}</span>)}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && <div className="py-20 text-center text-graphite/50">No products in this category yet.</div>}
        </div>
      </section>
      <Footer />
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </main>
  )
}
