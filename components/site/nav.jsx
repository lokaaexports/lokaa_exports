'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight, User } from 'lucide-react'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/process', label: 'Process' },
  { href: '/category/organics', label: 'AgriOrganicExports' },
  { href: '/category/industrial', label: 'Industrial Exports' },
  { href: '/products', label: 'All Products' },
  { href: '/rfq', label: 'RFQ', badge: 'new' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav({ theme = 'auto' }) {
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
  const isSubBrand = pathname?.startsWith('/organics') || pathname?.startsWith('/category/organics') || pathname?.startsWith('/industrial') || pathname?.startsWith('/category/industrial')
  const isSolid = forceSolid || scrolled || isSubBrand
  const isTransparent = !isSolid && !forceLight && !forceDark

  const brand = pathname?.startsWith('/organics') || pathname?.startsWith('/category/organics')
    ? { label: 'AgriOrganicExports', subtitle: 'Seasonal & non-seasonal organic sourcing', accent: 'text-emerald-300' }
    : pathname?.startsWith('/industrial') || pathname?.startsWith('/category/industrial')
      ? { label: 'Industrial Exports', subtitle: 'Machinery & industrial sourcing', accent: 'text-sky-300' }
      : { label: 'LOKAA', subtitle: 'Exports · Est. 2026', accent: 'text-gold' }

  const brandColorClass = brand.accent
  const isOrganicsPage = pathname?.startsWith('/organics') || pathname?.startsWith('/category/organics')
  const navLinkClass = 'text-white hover:text-white'
  const iconColorClass = 'text-white'

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500 bg-[#04070c] backdrop-blur-xl border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)] py-3"
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <Image src="/logo.png" alt="Lokaa Exports" width={40} height={40} className="object-contain" priority />
            </div>
            {!isOrganicsPage && (
              <div className="leading-tight">
                <div className={`font-display font-semibold tracking-tight text-[14px] ${brandColorClass}`}>{brand.label}</div>
                <div className="text-[10px] tracking-[0.24em] text-gold uppercase">{brand.subtitle}</div>
              </div>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-6 mx-8">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} prefetch={l.href === '/products' || l.href.startsWith('/category/')} className={`text-[13px] font-medium ${navLinkClass} transition-all relative group whitespace-nowrap flex items-center gap-2`}>
                {l.label}
                {l.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gold/20 text-gold uppercase tracking-wider">
                    {l.badge}
                  </span>
                )}
                <motion.span 
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-gold to-gold/60 group-hover:w-full transition-all duration-400"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 ml-auto pl-4 border-l border-white/10">
            <Link href="/auth/login" className={`text-[13px] font-medium ${navLinkClass} transition-all px-3 py-1.5 rounded hover:bg-white/5 hover:text-gold`}>
              Login
            </Link>
            <Link href="/auth/register" className={`text-[13px] font-medium ${navLinkClass} transition-all px-3 py-1.5 rounded hover:bg-white/5 hover:text-gold`}>
              Register
            </Link>
            <Link href="/rfq" className="inline-flex items-center gap-2 pl-5 pr-3 py-2.5 rounded-full bg-gold text-navy text-[13px] font-semibold hover:bg-[hsl(var(--gold-soft))] transition-all group premium-shadow">
              Request Quote
              <span className="w-6 h-6 rounded-full bg-navy text-gold flex items-center justify-center group-hover:rotate-45 transition-transform">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <Link href="/rfq" aria-label="Request Quote" prefetch={false} className="inline-flex items-center gap-1.5 pl-3.5 pr-1.5 py-2 rounded-full bg-gold text-navy text-[12px] font-semibold hover:bg-[hsl(var(--gold-soft))] transition-all group">
              Quote
              <span className="w-5 h-5 rounded-full bg-navy text-gold flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </Link>
            <button className={`${iconColorClass} p-2`} onClick={() => setOpen(true)} aria-label="Menu">
              <Menu className="w-6 h-6" />
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
                  {!isOrganicsPage && (
                    <div className="leading-tight">
                      <div className="font-display font-semibold text-[12px] text-white">LOKAA</div>
                      <div className="text-[9px] tracking-[0.2em] text-white/80 uppercase">Exports</div>
                    </div>
                  )}
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
                <nav className="space-y-1 mb-8">
                  {LINKS.map(l => (
                    <Link 
                      key={l.href} 
                    href={l.href} 
                    prefetch={l.href === '/products' || l.href.startsWith('/category/')}
                    onClick={() => setOpen(false)} 
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-white/80 hover:text-gold hover:bg-white/5 transition-all font-medium text-[15px]"
                    >
                      <span>{l.label}</span>
                      {l.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gold/20 text-gold uppercase tracking-wider">
                          {l.badge}
                        </span>
                      )}
                    </Link>
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
