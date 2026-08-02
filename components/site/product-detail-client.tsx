'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, CheckCircle2, Factory, Download, Info, ShieldCheck, Box, Anchor } from 'lucide-react'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'
import { PRODUCT_PLACEHOLDER, resolveGallery } from '@/lib/image-utils'

export default function ProductDetailPageClient({ slug, products = [], categories = [] }: any) {
  const [activeImage, setActiveImage] = useState(0)
  
  const product = useMemo(() => products.find((p: any) => p.slug === slug), [products, slug])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans">
        Product data not available.
      </div>
    )
  }

  const category = (Array.isArray(categories) ? categories : []).find((c: any) => c.slug === product.category)
  
  const gallery = resolveGallery(product)
  const certs = Array.isArray(product.certifications) ? product.certifications : []
  const specs = Array.isArray(product.specs) ? product.specs : []
  const packaging = Array.isArray(product.packaging) ? product.packaging : []
  
  const origin = specs.find((s: any) => s.label?.toLowerCase() === 'origin')?.value || 'India'
  const moq = specs.find((s: any) => s.label?.toLowerCase() === 'moq')?.value || '1 FCL'
  const hsCode = product.hsnCode || 'Available upon request'
  const leadTime = '14-21 Days'
  const supplyCapacity = '1000 MT / Month'
  
  const relatedProducts = products.filter((p: any) => p.slug !== product.slug && p.category === product.category).slice(0, 4)

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Nav categories={categories} theme="light" />
      
      {/* SECTION 1: HERO */}
      <section className="bg-white border-b border-slate-200 pt-32 lg:pt-40 pb-12 px-6 lg:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-6 flex gap-2">
            <Link href="/category/all" className="hover:text-blue-600 transition">Products</Link>
            <span>/</span>
            <Link href={`/category/${product.categorySlug}`} className="hover:text-blue-600 transition">{product.categoryName}</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{product.name}</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div className="space-y-6">
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700 border border-blue-200">
                  <Factory className="h-3.5 w-3.5" /> Export Ready
                </span>
                {product.status === 'published' && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-700 border border-green-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Available
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>
              
              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                {product.tagline || product.shortDescription}
              </p>

              <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-200">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">HS Code</div>
                  <div className="font-semibold text-slate-900">{hsCode}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Origin</div>
                  <div className="font-semibold text-slate-900">{origin}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">MOQ</div>
                  <div className="font-semibold text-slate-900">{moq}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Supply Capacity</div>
                  <div className="font-semibold text-slate-900">{supplyCapacity}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href={`/rfq?product=${product.slug}`} className="inline-flex items-center justify-center rounded-sm bg-slate-900 px-8 py-4 text-sm font-bold text-white transition hover:bg-slate-800">
                  Request Quote
                </Link>
                <button className="inline-flex items-center justify-center gap-2 rounded-sm bg-white border border-slate-300 px-8 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Download Specification
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-2 rounded-sm shadow-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <Image src={gallery[activeImage] ?? PRODUCT_PLACEHOLDER} alt={product.name || 'Product'} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" priority />
              </div>
              {gallery.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                  {gallery.map((img: string, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImage(idx)} 
                      className={`relative h-20 w-24 shrink-0 overflow-hidden border ${activeImage === idx ? 'border-blue-600' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                    >
                      <Image src={img} alt={`Thumbnail ${idx+1}`} fill sizes="100px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-12 grid gap-12 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-12">
          {/* SECTION 2: OVERVIEW */}
          {(product.longDescription || product.description) && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Info className="h-5 w-5 text-slate-400" /> Product Overview
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>{product.longDescription || product.description}</p>
              </div>
            </section>
          )}

          {/* SECTION 3: SPECIFICATIONS */}
          {specs.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Box className="h-5 w-5 text-slate-400" /> Specifications
              </h2>
              <table className="w-full text-left text-sm border border-slate-200">
                <tbody className="divide-y divide-slate-200">
                  {specs.map((spec: any, i: number) => (
                    <tr key={i} className="bg-white hover:bg-slate-50">
                      <th className="w-1/3 bg-slate-50 px-4 py-3 font-semibold text-slate-700 border-r border-slate-200">
                        {spec.label}
                      </th>
                      <td className="px-4 py-3 text-slate-600">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
          
          {/* SECTION 6: DOCUMENTS */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileText className="h-5 w-5 text-slate-400" /> Documents
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between border border-slate-200 bg-white p-4 rounded-sm">
                <span className="font-semibold text-sm text-slate-700">Specification.pdf</span>
                <button className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1">
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* SECTION 4: EXPORT INFORMATION */}
          <section className="bg-white border border-slate-200 rounded-sm overflow-hidden">
            <h2 className="text-lg font-bold text-slate-900 bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
              <Anchor className="h-5 w-5 text-slate-400" /> Export Information
            </h2>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr><th className="px-4 py-3 text-slate-500 font-medium border-r border-slate-100 bg-slate-50">HS Code</th><td className="px-4 py-3 font-semibold text-slate-800">{hsCode}</td></tr>
                <tr><th className="px-4 py-3 text-slate-500 font-medium border-r border-slate-100 bg-slate-50">Origin</th><td className="px-4 py-3 font-semibold text-slate-800">{origin}</td></tr>
                <tr><th className="px-4 py-3 text-slate-500 font-medium border-r border-slate-100 bg-slate-50">MOQ</th><td className="px-4 py-3 font-semibold text-slate-800">{moq}</td></tr>
                <tr><th className="px-4 py-3 text-slate-500 font-medium border-r border-slate-100 bg-slate-50">Lead Time</th><td className="px-4 py-3 font-semibold text-slate-800">{leadTime}</td></tr>
                <tr><th className="px-4 py-3 text-slate-500 font-medium border-r border-slate-100 bg-slate-50">Supply Capacity</th><td className="px-4 py-3 font-semibold text-slate-800">{supplyCapacity}</td></tr>
                <tr>
                  <th className="px-4 py-3 text-slate-500 font-medium align-top border-r border-slate-100 bg-slate-50">Packaging</th>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {packaging.length > 0 ? packaging.map((pkg: any) => pkg.packageType || pkg).join(', ') : 'Export Standard Packaging'}
                  </td>
                </tr>
                <tr><th className="px-4 py-3 text-slate-500 font-medium border-r border-slate-100 bg-slate-50">Incoterms</th><td className="px-4 py-3 font-semibold text-slate-800">FOB, CIF, CFR</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 5: CERTIFICATES */}
          {certs.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-sm overflow-hidden">
              <h2 className="text-lg font-bold text-slate-900 bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-slate-400" /> Certifications
              </h2>
              <div className="p-4 flex flex-col gap-3">
                {certs.map((cert: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold text-slate-700">{cert.certName || cert}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 8: RFQ CTA */}
          <section className="bg-slate-900 p-6 rounded-sm text-white text-center">
            <h3 className="font-bold text-lg mb-2">Request Official Quote</h3>
            <p className="text-sm text-slate-300 mb-6">Get customized pricing and shipping estimates for bulk orders.</p>
            <Link href={`/rfq?product=${product.slug}`} className="block w-full rounded-sm bg-white px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 transition">
              Start RFQ
            </Link>
          </section>
        </div>
      </div>

      {/* SECTION 7: RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="bg-white border-t border-slate-200 py-16">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">Related Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p: any) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group block border border-slate-200 bg-white hover:border-blue-600 transition">
                  <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden border-b border-slate-200">
                    <Image src={p.hero || PRODUCT_PLACEHOLDER} alt={p.name} fill sizes="25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 truncate">{p.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 truncate">{p.tagline || p.shortDescription || p.categoryName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
