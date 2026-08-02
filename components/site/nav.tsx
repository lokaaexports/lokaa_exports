'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight, User, ChevronDown } from 'lucide-react'

export default function Nav({ theme = 'auto', categories = [] }: any) {
  const DEFAULT_CATEGORIES = [
    { href: '/category/organics', label: 'Organics & Food', desc: 'Fresh produce, superfoods, spices, grains & organic exports.' },
    { href: '/category/machinery', label: 'Industrial & Machinery', desc: 'Automation, PLC controllers, sensors & heavy machinery.' },
    { href: '/products', label: 'All Export Categories', desc: 'Browse our complete catalog of B2B export products.' }
  ]

  const dynamicCategoryItems = categories && categories.length > 0
    ? categories.map(cat => ({
        href: `/category/${cat.slug}`,
        label: cat.name,
        desc: cat.seoDescription || cat.description || `Explore our ${cat.name} products.`
      }))
    : []

  // Combine and deduplicate items to ensure Organics & Industrial are always present
  const categoryDropdownItems = [
    { href: '/category/organics', label: 'Organics & Food', desc: 'Fresh produce, superfoods, spices, grains & organic exports.' },
    { href: '/category/machinery', label: 'Industrial & Machinery', desc: 'Automation, PLC controllers, sensors & heavy machinery.' },
    ...dynamicCategoryItems.filter(item => !item.href.includes('organics') && !item.href.includes('machinery')),
    { href: '/products', label: 'All Export Catalog', desc: 'Browse our complete catalog of B2B export products.' }
  ]

  const LINKS = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { 
      label: 'Export Categories', 
      dropdown: true,
      items: categoryDropdownItems
    },
    { href: '/products', label: 'All Products' },
    { href: '/contact', label: 'Contact' },
  ]
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const forceSolid = theme === 'solid'
  const forceLight = theme === 'light'
  const forceDark = theme === 'dark'
  const isSubBrand = pathname?.startsWith('/organics') || pathname?.startsWith('/category/organics') || pathname?.startsWith('/machinery') || pathname?.startsWith('/category/machinery')
  const isSolid = forceSolid || scrolled || isSubBrand
  const isTransparent = !isSolid && !forceLight && !forceDark

  const getBrand = () => {
    if (pathname?.startsWith('/organics') || pathname?.startsWith('/category/organics') || pathname?.startsWith('/agriculture') || pathname?.startsWith('/category/agriculture')) {
      return { label: 'AgriOrganicExports', subtitle: 'Seasonal & non-seasonal organic sourcing', accent: 'text-emerald-300' }
    }
    if (pathname?.startsWith('/machinery') || pathname?.startsWith('/category/machinery') || pathname?.startsWith('/industrial') || pathname?.startsWith('/category/industrial')) {
      return { label: 'Industrial Exports', subtitle: 'Machinery & industrial sourcing', accent: 'text-sky-300' }
    }
    if (pathname?.startsWith('/chemicals') || pathname?.startsWith('/category/chemicals')) {
      return { label: 'Chemical Exports', subtitle: 'Industrial & specialty chemicals', accent: 'text-purple-300' }
    }
    if (pathname?.startsWith('/textiles') || pathname?.startsWith('/category/textiles')) {
      return { label: 'Textiles & Fabrics', subtitle: 'Premium woven & knitted textiles', accent: 'text-rose-300' }
    }
    if (pathname?.startsWith('/packaging') || pathname?.startsWith('/category/packaging')) {
      return { label: 'Packaging Solutions', subtitle: 'Bulk & retail packaging materials', accent: 'text-orange-300' }
    }
    if (pathname?.startsWith('/living') || pathname?.startsWith('/category/living')) {
      return { label: 'Home & Living', subtitle: 'Decor, furniture & lifestyle products', accent: 'text-teal-300' }
    }
    return { label: 'LOKAA', subtitle: 'Exports · Est. 2026', accent: 'text-gold' }
  }

  const brand = getBrand()
  const brandColorClass = brand.accent

  const navLinkClass = 'text-white hover:text-white'
  const iconColorClass = 'text-white'

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500 bg-[#04070c]/90 backdrop-blur-md border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.15)] py-1.5 lg:py-2"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0 flex items-center justify-center">
              <Image src="/logo.png" alt="Lokaa Exports" width={36} height={36} className="object-contain" priority />
            </div>
            <div className="leading-tight">
              <div className={`font-display font-semibold tracking-tight text-[13px] lg:text-[14px] ${brandColorClass}`}>{brand.label}</div>
              <div className="text-[8px] lg:text-[9px] tracking-[0.24em] text-gold uppercase">{brand.subtitle}</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 mx-6">
            {LINKS.map(l => (
              <div key={l.label || l.href} className="relative group">
                {l.dropdown ? (
                  <button className={`text-[12.5px] font-medium transition-all relative whitespace-nowrap flex items-center gap-1 py-1.5 ${l.items?.some(item => pathname === item.href) ? 'text-gold' : 'text-white hover:text-white'}`}>
                    {l.label}
                    <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                ) : (
                  <Link href={l.href} prefetch={l.href === '/products' || l.href.startsWith('/category/')} className={`text-[12.5px] font-medium transition-all relative whitespace-nowrap flex items-center gap-1.5 py-1.5 ${pathname === l.href ? 'text-gold' : 'text-white hover:text-white'}`}>
                    {l.label}
                    {'badge' in l && l.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-gold/20 text-gold uppercase tracking-wider">
                        {l.badge as string}
                      </span>
                    )}
                    <motion.span 
                      className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-gold to-gold/60 group-hover:w-full transition-all duration-400"
                      initial={{ width: pathname === l.href ? '100%' : '0%' }}
                      animate={{ width: pathname === l.href ? '100%' : undefined }}
                      whileHover={{ width: '100%' }}
                    />
                  </Link>
                )}
                
                {l.dropdown && (
                  <div className="absolute top-[100%] left-1/2 -translate-x-1/2 pt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="w-[540px] bg-[#04070c] border border-white/10 rounded-2xl shadow-2xl p-5 grid grid-cols-2 gap-3">
                      {l.items.map(item => {
                        const isItemActive = pathname === item.href;
                        return (
                        <Link key={item.href} href={item.href} className={`block p-3 rounded-xl hover:bg-white/5 transition-colors group/item ${isItemActive ? 'bg-white/5' : ''}`}>
                          <div className={`flex items-center gap-1.5 font-display text-[14px] transition-colors ${isItemActive ? 'text-gold' : 'text-white group-hover/item:text-gold'}`}>
                            {item.label}
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </div>
                          <p className={`mt-1 text-[11px] leading-relaxed ${isItemActive ? 'text-white/70' : 'text-white/50'}`}>{item.desc}</p>
                        </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3.5 ml-auto pl-3.5 border-l border-white/10">
            <Link href="/auth/login" className={`text-[12.5px] font-medium ${navLinkClass} transition-all px-2.5 py-1 rounded hover:bg-white/5 hover:text-gold`}>
              Login
            </Link>
            <Link href="/auth/register" className={`text-[12.5px] font-medium ${navLinkClass} transition-all px-2.5 py-1 rounded hover:bg-white/5 hover:text-gold`}>
              Register
            </Link>
            <Link href="/rfq" className="inline-flex items-center gap-1.5 pl-4 pr-1.5 py-1.5 rounded-full bg-gold text-navy text-[12.5px] font-semibold hover:bg-[hsl(var(--gold-soft))] transition-all group premium-shadow">
              Request Quote
              <span className="w-5.5 h-5.5 rounded-full bg-navy text-gold flex items-center justify-center group-hover:rotate-45 transition-transform">
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-1.5">
            <Link href="/rfq" aria-label="Request Quote" prefetch={false} className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-full bg-gold text-navy text-[11.5px] font-semibold hover:bg-[hsl(var(--gold-soft))] transition-all group">
              Quote
              <span className="w-4.5 h-4.5 rounded-full bg-navy text-gold flex items-center justify-center">
                <ArrowUpRight className="w-2.5 h-2.5" />
              </span>
            </Link>
            <button className={`${iconColorClass} p-1.5`} onClick={() => setOpen(true)} aria-label="Menu">
              <Menu className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[59] bg-black/40"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 h-screen z-[60] w-full max-w-sm bg-[#04070c] border-l border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-transparent">
                    <Image src="/logo.png" alt="Lokaa Exports" fill className="object-contain" priority />
                  </div>
                  <div className="leading-tight">
                    <div className="font-display font-semibold text-[12px] text-white">LOKAA</div>
                    <div className="text-[9px] tracking-[0.2em] text-white/80 uppercase">Exports</div>
                  </div>
                </div>
                <motion.button 
                  onClick={() => setOpen(false)} 
                  className="text-white/60 hover:text-white p-2 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="overflow-y-auto h-[calc(100vh-80px)] px-6 py-8">
                <nav className="space-y-2 mb-8">
                  {LINKS.map(l => (
                    <div key={l.label}>
                      {l.dropdown ? (
                        <div className="space-y-1">
                          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold/70">
                            {l.label}
                          </div>
                          {l.items?.map(sub => {
                            const isSubActive = pathname === sub.href;
                            return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setOpen(false)}
                              className={`block px-6 py-2 rounded-lg transition-all text-[14px] ${isSubActive ? 'text-gold bg-white/5' : 'text-white/80 hover:text-gold hover:bg-white/5'}`}
                            >
                              {sub.label}
                            </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <Link 
                          href={l.href!} 
                          prefetch={l.href === '/products' || l.href?.startsWith('/category/')}
                          onClick={() => setOpen(false)} 
                          className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all font-medium text-[15px] ${pathname === l.href ? 'text-gold bg-white/5' : 'text-white/80 hover:text-gold hover:bg-white/5'}`}
                        >
                          <span>{l.label}</span>
                          {'badge' in l && l.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gold/20 text-gold uppercase tracking-wider">
                              {l.badge as string}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="border-t border-white/10 pt-6 space-y-3 mb-8">
                  <Link 
                    href="/auth/login" 
                    onClick={() => setOpen(false)} 
                    className="block px-4 py-3 rounded-lg text-white/80 hover:text-gold hover:bg-white/5 transition-all font-medium text-[15px]"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/register" 
                    onClick={() => setOpen(false)} 
                    className="block px-4 py-3 rounded-lg text-white/80 hover:text-gold hover:bg-white/5 transition-all font-medium text-[15px]"
                  >
                    Register
                  </Link>
                </div>

                <Link 
                  href="/rfq" 
                  prefetch={false}
                  onClick={() => setOpen(false)} 
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gold text-navy font-semibold text-[14px] hover:bg-[hsl(var(--gold-soft))] transition-all w-full group"
                >
                  Request Quote
                  <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
