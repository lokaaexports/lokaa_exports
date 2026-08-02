'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronRight, Filter, Package2, Search, CheckCircle2, ShieldCheck, Scale, Globe2, FileText, Anchor } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'
import { PRODUCT_PLACEHOLDER } from '@/lib/image-utils'

const EASE = [0.16, 1, 0.3, 1]

const getTheme = (slug: any) => {
  if (slug?.includes('agri') || slug?.includes('farm') || slug?.includes('food')) {
    return {
      name: 'agriculture',
      accent: 'from-amber-900 via-stone-800 to-green-950',
      textAccent: 'text-amber-500',
      bgAccent: 'bg-amber-500',
      borderAccent: 'border-amber-500/20',
      badgeBg: 'bg-amber-500/10',
      badgeText: 'text-amber-600',
      hoverRing: 'hover:ring-amber-500/30'
    }
  }
  if (slug?.includes('industr') || slug?.includes('machine') || slug?.includes('metal')) {
    return {
      name: 'industrial',
      accent: 'from-slate-900 via-cyan-950 to-slate-900',
      textAccent: 'text-cyan-500',
      bgAccent: 'bg-cyan-500',
      borderAccent: 'border-cyan-500/20',
      badgeBg: 'bg-cyan-500/10',
      badgeText: 'text-cyan-600',
      hoverRing: 'hover:ring-cyan-500/30'
    }
  }
  return {
    name: 'default',
    accent: 'from-slate-950 via-slate-900 to-slate-950',
    textAccent: 'text-blue-500',
    bgAccent: 'bg-blue-500',
    borderAccent: 'border-blue-500/20',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-600',
    hoverRing: 'hover:ring-blue-500/30'
  }
}

export default function CategoryPageClient({ category, subcategories = [], products = [], categories = [] }: any) {
  const [query, setQuery] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [selectedOrigin, setSelectedOrigin] = useState('all')

  const theme = getTheme(category?.slug)
  const categoryImage = category?.bannerImage || category?.image || '/og-image.jpg'
  
  const origins = useMemo(() => {
    const originSet = new Set(products.map(p => p.origin).filter(Boolean))
    return ['all', ...Array.from(originSet)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = !query || product.name.toLowerCase().includes(query.toLowerCase()) || product.tagline?.toLowerCase().includes(query.toLowerCase()) || product.hsCode?.includes(query)
      const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory || product.subcategorySlug === selectedSubcategory
      const matchesOrigin = selectedOrigin === 'all' || product.origin === selectedOrigin
      return matchesQuery && matchesSubcategory && matchesOrigin
    })
  }, [products, query, selectedSubcategory, selectedOrigin])

  const subcategoryOptions = ['all', ...subcategories.map((item) => item.slug)]

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Nav categories={categories} theme="light" />
      
      <section className={`relative overflow-hidden bg-gradient-to-br ${theme.accent} px-6 pb-24 pt-32 text-white lg:px-10`}>
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <Image src={categoryImage} alt={category?.name || 'Category'} fill sizes="100vw" className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-soft-light"></div>
        
        <div className="relative mx-auto max-w-[1400px]">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mb-8 flex items-center gap-2 text-xs font-medium tracking-widest text-white/60 uppercase">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-white transition-colors">Categories</Link>
            <ChevronRight className="h-3 w-3" />
            <span className={theme.textAccent}>{category?.name}</span>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: EASE }} className="text-5xl lg:text-7xl font-display font-light tracking-tight mb-6">
                {category?.name}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }} className="text-lg text-white/80 max-w-xl leading-relaxed">
                {category?.description || category?.seoDescription || `Reliable export sourcing and procurement support from ${category?.name}. Explore our premium grade, export-ready catalogue tailored for global importers.`}
              </motion.p>
            </div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: EASE }} className="flex lg:justify-end gap-6 pb-2">
              <div className="flex flex-col gap-2 border-l border-white/20 pl-6">
                <span className="text-3xl font-display">{products.length}</span>
                <span className="text-xs uppercase tracking-widest text-white/50">Verified SKUs</span>
              </div>
              <div className="flex flex-col gap-2 border-l border-white/20 pl-6">
                <span className="text-3xl font-display">100%</span>
                <span className="text-xs uppercase tracking-widest text-white/50">Export Ready</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
              <Filter className="h-4 w-4" /> Subcategories
            </div>
            {subcategoryOptions.map(sub => (
              <button key={sub} onClick={() => setSelectedSubcategory(sub)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSubcategory === sub ? `${theme.bgAccent} text-white shadow-md` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {sub === 'all' ? 'All Products' : sub}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search by HS Code, Name..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 bg-slate-50" />
            </div>
            {origins.length > 2 && (
              <select value={selectedOrigin} onChange={(e) => setSelectedOrigin(e.target.value)} className="border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer">
                <option value="all">All Origins</option>
                {origins.filter((o: any) => o !== 'all').map((o: any) => (
                  <option key={String(o)} value={String(o)}>{String(o)}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-10 mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredProducts.map((product, i) => (
              <motion.div key={product.slug || i} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, delay: (i % 8) * 0.05 }} className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-transparent ${theme.hoverRing} flex flex-col`}>
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <Image src={product.hero || product.gallery?.[0] || PRODUCT_PLACEHOLDER} alt={product.name || 'Product'} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold bg-white/90 backdrop-blur rounded-sm shadow-sm ${theme.textAccent}`}>
                      {product.category || 'Commodity'}
                    </span>
                    {product.hsCode && (
                      <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold bg-slate-900/90 text-white backdrop-blur rounded-sm shadow-sm">
                        HS: {product.hsCode}
                      </span>
                    )}
                  </div>
                  <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-slate-400 hover:text-slate-900 transition-colors shadow-sm" title="Compare">
                    <Scale className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <Link href={`/products/${product.slug}`} className="block mb-2">
                    <h3 className="text-xl font-display font-medium text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-4">
                    {product.tagline || product.description || 'Premium export quality commodity.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1"><Package2 className="w-3 h-3"/> MOQ</span>
                      <span className="text-xs font-medium text-slate-700 truncate">{product.minOrder || '1 FCL / 20MT'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1"><Globe2 className="w-3 h-3"/> Origin</span>
                      <span className="text-xs font-medium text-slate-700 truncate">{product.origin || 'Global'}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1"><Anchor className="w-3 h-3"/> Incoterms</span>
                      <span className="text-xs font-medium text-slate-700 truncate">{product.incoterms || 'FOB, CIF, CFR'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex -space-x-1">
                      {product.certifications?.slice(0, 3).map((cert, idx) => (
                        <div key={idx} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600 shadow-sm z-10" title={cert}>
                          {cert.slice(0, 2)}
                        </div>
                      ))}
                      {product.certifications?.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 z-0">
                          +{product.certifications.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/products/${product.slug}`} className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors text-slate-500 hover:text-slate-800`}>
                      View Details
                    </Link>

                    <Link href={`/rfq?product=${product.id}`} className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${theme.textAccent} hover:opacity-80`}>
                      Request Quote <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-display font-medium text-slate-900 mb-2">No specifications found</h3>
            <p className="text-slate-500 max-w-md">We couldn't find any products matching your current filters. Adjust your search or clear filters to view the catalog.</p>
            <button onClick={() => { setQuery(''); setSelectedSubcategory('all'); setSelectedOrigin('all') }} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
              Clear All Filters
            </button>
          </div>
        )}
      </section>

      <Footer />
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </main>
  )
}
