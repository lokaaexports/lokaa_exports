'use client'
import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Filter, Search, ChevronRight, Package2, Globe2, Anchor, Scale, ArrowRight, BookOpen } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'
import { PRODUCT_PLACEHOLDER } from '@/lib/image-utils'

const EASE = [0.16, 1, 0.3, 1]

const getTheme = (slug: any) => {
  if (slug?.includes('agri') || slug?.includes('farm') || slug?.includes('food')) {
    return { name: 'agriculture', textAccent: 'text-amber-600', bgAccent: 'bg-amber-600', hoverRing: 'hover:ring-amber-500/30' }
  }
  if (slug?.includes('industr') || slug?.includes('machine') || slug?.includes('metal')) {
    return { name: 'industrial', textAccent: 'text-cyan-600', bgAccent: 'bg-cyan-600', hoverRing: 'hover:ring-cyan-500/30' }
  }
  return { name: 'default', textAccent: 'text-blue-600', bgAccent: 'bg-blue-600', hoverRing: 'hover:ring-blue-500/30' }
}

export default function ProductsPageClient({ products = [], categories = [] }: any) {
  const params = useSearchParams()
  const initial = params.get('c') || 'all'
  const [cat, setCat] = useState(initial)
  const [query, setQuery] = useState('')

  useEffect(() => { setCat(params.get('c') || 'all') }, [params])

  const categoryList = useMemo(() => {
    const list = Array.isArray(categories) ? categories : []
    return list.map((category) => ({ slug: category.slug, name: category.name || category.slug }))
  }, [categories])

  const catalogProducts = useMemo(() => (products || []).map((product) => ({
    ...product,
    certifications: Array.isArray(product.certifications) ? product.certifications : [],
    applications: Array.isArray(product.applications) ? product.applications : [],
    packaging: Array.isArray(product.packaging) ? product.packaging : [],
    gallery: Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : [product.hero || PRODUCT_PLACEHOLDER],
    tagline: product.tagline || '',
  })), [products])

  const filtered = useMemo(() => {
    return catalogProducts.filter(p => {
      const matchCat = cat === 'all' || p.category === cat
      const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.tagline.toLowerCase().includes(query.toLowerCase()) || p.hsCode?.includes(query)
      return matchCat && matchQuery
    })
  }, [cat, query, catalogProducts])

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Nav categories={categories} theme="light" />
      
      {/* Enterprise Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 pb-20 pt-32 text-white">
        {/* Abstract Technical Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-600/20 blur-[100px]" />
        
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="mb-6 flex items-center gap-3 text-xs uppercase tracking-widest text-blue-400 font-semibold">
            <span className="h-px w-8 bg-blue-400" /> Global Procurement Catalog
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15, ease: EASE }} className="max-w-4xl font-display text-5xl leading-[1.1] tracking-tight lg:text-7xl font-light">
            Sourcing excellence for <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">enterprise operations</span>.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-300">
            Access our comprehensive portfolio of export-ready commodities, industrial materials, and specialized components. Fully documented and compliant for global trade.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.45, ease: EASE }} className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300"><BookOpen className="w-4 h-4 text-blue-400" /> Detailed Specs</div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300"><Globe2 className="w-4 h-4 text-cyan-400" /> Multi-origin</div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300"><Anchor className="w-4 h-4 text-indigo-400" /> FOB/CIF Pricing</div>
          </motion.div>
        </div>
      </section>

      {/* Advanced Filters */}
      <section className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <div className="mr-2 flex flex-shrink-0 items-center gap-2 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <Filter className="h-4 w-4" /> Divisions
            </div>
            <button onClick={() => setCat('all')} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all ${cat === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              Complete Catalog
            </button>
            {categoryList.map((c) => (
              <button key={c.slug} onClick={() => setCat(c.slug)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all ${cat === c.slug ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {c.name}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search by name, HS Code..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50" />
          </div>
        </div>
      </section>

      {/* B2B Grid */}
      <section className="bg-[#F8F9FA] py-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-display font-medium text-slate-900">
              {cat === 'all' ? 'All Products' : categoryList.find(c => c.slug === cat)?.name || 'Products'}
            </h2>
            <span className="text-sm font-medium text-slate-500 bg-slate-200/50 px-3 py-1 rounded-full">{filtered.length} Items</span>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {filtered.map((p, i) => {
                const theme = getTheme(p.category)
                return (
                  <motion.div key={p.slug || i} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, delay: (i % 8) * 0.05, ease: EASE }}>
                    <Link href={`/products/${p.slug}`} className={`group flex flex-col h-full rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ring-1 ring-transparent ${theme.hoverRing}`}>
                      
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-slate-100">
                        <Image src={p.hero || p.gallery?.[0] || PRODUCT_PLACEHOLDER} alt={p.name || 'Product'} fill sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                        
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/95 backdrop-blur rounded-sm shadow-sm ${theme.textAccent}`}>
                            {categoryList.find((c) => c.slug === p.category)?.name || p.category || 'Product'}
                          </div>
                          {p.hsCode && (
                            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-slate-900/95 text-white backdrop-blur rounded-sm shadow-sm">
                              HS {p.hsCode}
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-900 opacity-0 shadow-md transition-all group-hover:opacity-100 group-hover:bg-slate-900 group-hover:text-white">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex flex-col flex-grow p-5">
                        <h3 className="font-display text-xl font-medium tracking-tight text-slate-900 transition-colors group-hover:text-slate-600 line-clamp-1">{p.name}</h3>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2 min-h-[40px]">{p.tagline || 'Industrial grade export commodity ready for global shipping.'}</p>
                        
                        <div className="mt-5 mb-4 h-px w-full bg-slate-100"></div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1"><Globe2 className="w-3 h-3"/> Origin</span>
                            <span className="font-medium text-slate-700 text-xs">{p.origin || 'Multiple'}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] flex items-center gap-1"><Package2 className="w-3 h-3"/> MOQ</span>
                            <span className="font-medium text-slate-700 text-xs">{p.minOrder || 'Container Load'}</span>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex gap-1.5 flex-wrap">
                            {p.certifications?.slice(0, 2).map((c) => (
                              <span key={c} className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">{c}</span>
                            ))}
                            {p.certifications?.length > 2 && <span className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">+{p.certifications.length - 2}</span>}
                          </div>
                          <span className={`text-sm font-semibold flex items-center gap-1 ${theme.textAccent}`}>View Specs <ChevronRight className="w-4 h-4"/></span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          
          {filtered.length === 0 && (
            <div className="py-24 flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Search className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-xl font-display font-medium text-slate-900 mb-2">No items found</h3>
              <p className="text-slate-500 max-w-sm">No products match your current filters or search query. Try adjusting your criteria.</p>
              <button onClick={() => { setCat('all'); setQuery('') }} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </main>
  )
}
