'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Moon,
  Sun,
  Briefcase,
  FileText
} from 'lucide-react'
import Link from 'next/link'

const SIDEBAR_ITEMS = [
  { id: 'platform', label: 'Platform', icon: Home, href: '/admin/platform' },
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin/dashboard' },
  { id: 'employees', label: 'Employees', icon: Briefcase, href: '/admin/employees' },
  { id: 'crm', label: 'CRM', icon: Users, href: '/admin/crm' },
  { id: 'rfqs', label: 'RFQs', icon: FileText, href: '/admin/rfqs' },
  { id: 'pim', label: 'PIM', icon: Package, href: '/admin/pim' },
  { id: 'media', label: 'Media Library', icon: FileText, href: '/admin/media' },
  { id: 'search', label: 'Search', icon: Search, href: '/admin/search' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { id: 'approvals', label: 'Approvals', icon: FileText, href: '/admin/approvals' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/admin/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  // Get active item based on current path
  const getActiveItem = () => {
    return SIDEBAR_ITEMS.find(item => pathname.startsWith(item.href))
  }

  const activeItem = getActiveItem()

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ width: sidebarOpen ? 256 : 80 }}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        transition={{ duration: 0.3 }}
        className={`${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } border-r h-screen flex flex-col overflow-hidden`}
      >
        {/* Logo Area */}
        <motion.div
          className={`flex items-center justify-between p-4 ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          } border-b`}
        >
          <motion.div
            animate={{ scale: sidebarOpen ? 1 : 0.8 }}
            className={`flex items-center gap-2 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LA</span>
            </div>
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Lokaa Admin
            </span>
          </motion.div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </motion.div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {SIDEBAR_ITEMS.map((item, index) => {
            const isActive = activeItem?.id === item.id
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition group relative ${
                    isActive
                      ? darkMode
                        ? 'bg-blue-900/30 text-blue-400 shadow-lg shadow-blue-500/20'
                        : 'bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/10'
                      : darkMode
                      ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300'
                      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-lg ${
                        darkMode ? 'bg-blue-400' : 'bg-blue-600'
                      }`}
                    />
                  )}
                  
                  <item.icon size={20} className="flex-shrink-0 relative z-10" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium text-sm whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Logout Button */}
        <motion.div className={`p-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'} border-t`}>
          <button
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition ${
              darkMode
                ? 'hover:bg-red-500/20 text-red-400'
                : 'hover:bg-red-50 text-red-600'
            }`}
          >
            <LogOut size={20} />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium text-sm whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <motion.div
          className={`${
            darkMode
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          } border-b px-8 py-4 flex items-center justify-between`}
        >
          {/* Search Bar */}
          <motion.div className="flex-1 max-w-md">
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-slate-800 border border-slate-700'
                  : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <Search size={18} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
              <input
                type="text"
                placeholder="Search..."
                className={`flex-1 bg-transparent outline-none text-sm ${
                  darkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </motion.div>

          {/* Right Actions */}
          <motion.div className="flex items-center gap-4 ml-auto">
            {/* Home/Website Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition flex items-center gap-2 px-3 ${
                darkMode
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Visit Website"
            >
              <Home size={20} />
              <span className="text-sm font-medium hidden md:inline">Website</span>
            </a>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg transition relative ${
                darkMode
                  ? 'hover:bg-slate-800 text-slate-400'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition ${
                darkMode
                  ? 'hover:bg-slate-800 text-slate-400'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* Profile Menu */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`w-10 h-10 rounded-full ${
                darkMode ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-gradient-to-br from-purple-500 to-blue-500'
              } flex items-center justify-center cursor-pointer`}
            >
              <span className="text-white font-bold text-sm">AB</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`flex-1 overflow-y-auto ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
