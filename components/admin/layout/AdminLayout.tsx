'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FolderTree,
  ImageIcon,
  FileText,
  ShoppingCart,
  Users,
  Briefcase,
  UserCheck,
  Truck,
  Settings,
  Shield,
  Server,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import { CommandPalette } from './CommandPalette'
import Link from 'next/link'

const NAV_GROUPS = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' }
    ]
  },
  {
    title: 'CATALOG',
    items: [
      { id: 'products', label: 'PIM / Products', icon: Package, href: '/admin/catalog' },
      { id: 'categories', label: 'Categories', icon: FolderTree, href: '/admin/catalog/categories' },
      { id: 'media', label: 'Media Library', icon: ImageIcon, href: '/admin/media' }
    ]
  },
  {
    title: 'COMMERCE',
    items: [
      { id: 'rfqs', label: 'RFQs', icon: FileText, href: '/admin/rfqs' },
      { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
      { id: 'customers', label: 'Customers', icon: Users, href: '/admin/customers' }
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { id: 'crm', label: 'CRM', icon: Briefcase, href: '/admin/crm' },
      { id: 'employees', label: 'Employees', icon: UserCheck, href: '/admin/employees' },
      { id: 'suppliers', label: 'Suppliers', icon: Truck, href: '/admin/suppliers' }
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
      { id: 'rbac', label: 'RBAC', icon: Shield, href: '/admin/rbac' },
      { id: 'system', label: 'System', icon: Server, href: '/admin/system' }
    ]
  }
]

export default function AdminLayout({ children }: any) {
  const pathname = usePathname()
  const router = useRouter()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  useEffect(() => {
    // Check initial window width
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    // Load theme
    const savedTheme = localStorage.getItem('adminTheme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
    }

    // Load user
    const savedUser = localStorage.getItem('adminUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Failed to parse user', e)
      }
    } else {
      // Dummy user for testing if none found
      setUser({ name: 'Admin User', email: 'admin@lokaa.com', role: 'Super Admin' })
    }

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (darkMode) {
      localStorage.setItem('adminTheme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      localStorage.setItem('adminTheme', 'light')
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      localStorage.removeItem('adminUser')
      // Optional: other cleanup
      router.push('/admin/login')
    } catch (error: any) {
      console.error('Logout failed', error)
    }
  }

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  // Get current page name from pathname
  const getCurrentPageName = () => {
    let name = 'Dashboard'
    NAV_GROUPS.forEach(group => {
      group.items.forEach(item => {
        if (pathname.startsWith(item.href)) {
          name = item.label
        }
      })
    })
    return name
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  const renderSidebar = (isMobileDrawer = false) => {
    const isExpanded = isMobileDrawer ? true : sidebarOpen;
    return (
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? 240 : 72 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 ${isMobileDrawer ? 'w-[240px]' : ''}`}
      >
        {/* Header */}
        <div className="h-[56px] flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className={`flex items-center gap-2 overflow-hidden pl-1 ${!isExpanded && !isMobileDrawer ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy dark:bg-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 22h20L12 2z" fill="currentColor" className="text-white dark:text-navy" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-navy dark:text-white whitespace-nowrap">Lokaa Admin</span>
          </div>
          {!isMobileDrawer && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
          {isMobileDrawer && (
             <button
             onClick={() => setMobileMenuOpen(false)}
             className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
           >
             <X size={18} />
           </button>
          )}
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6">
              {isExpanded ? (
                <div className="px-4 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                  {group.title}
                </div>
              ) : (
                <div className="h-4" /> // Spacing when collapsed
              )}
              
              <ul className="space-y-1 px-2">
                {group.items.map((item) => {
                  const isActive = item.href === pathname || 
                                   (pathname.startsWith(item.href + '/') && !NAV_GROUPS.some(g => g.items.some(i => i.href !== item.href && pathname.startsWith(i.href))))
                  
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        title={!isExpanded ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors group relative ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-l-2 border-blue-600 dark:border-blue-500'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-2 border-transparent'
                        } ${!isExpanded ? 'justify-center px-0' : ''}`}
                      >
                        <item.icon size={20} className={`shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                        {isExpanded && (
                          <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {isExpanded ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold shrink-0" title={user?.name}>
                {getInitials(user?.name)}
              </div>
              <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (pathname === '/admin/login') {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 font-sans`}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="h-full z-20 shadow-sm relative">
          {renderSidebar()}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 shadow-xl"
            >
              {renderSidebar(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className="h-[56px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={() => setMobileMenuOpen(true)} className="p-1 text-slate-500">
                <Menu size={20} />
              </button>
            )}
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:block">
              {getCurrentPageName()}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <button 
              className="group relative flex w-full items-center rounded-xl bg-slate-100/70 dark:bg-slate-800/70 px-4 py-2 text-sm text-slate-500 transition-all hover:bg-slate-200/50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-navy/10"
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            >
              <Search className="mr-3 h-4 w-4 shrink-0 text-slate-400 group-hover:text-navy dark:group-hover:text-white transition-colors" />
              <span className="truncate">Search products, RFQs, customers...</span>
              <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-300 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-900 shadow-sm">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-sm font-semibold text-navy transition hover:bg-navy/10 focus:outline-none focus:ring-2 focus:ring-navy/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                {getInitials(user?.name)}
              </button>
              
              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileDropdownOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50 py-1"
                    >
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content with Framer Motion Transition */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {/* Command Palette */}
      <CommandPalette />
    </div>
  )
}
