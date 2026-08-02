'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Breadcrumb navigation component for admin pages
 * Usage: <Breadcrumb items={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'RFQs' }]} />
 */
export default function Breadcrumb({ items = [] }: any) {
  if (!items || items.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 mb-6 flex-wrap"
    >
      {/* Home link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-400"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm font-medium">Admin</span>
      </Link>

      {/* Breadcrumb items */}
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: (index + 1) * 0.05 }}
          className="flex items-center gap-2"
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />

          {item.href ? (
            <Link
              href={item.href}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-400 text-sm font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="px-3 py-1.5 text-slate-900 dark:text-white text-sm font-medium">
              {item.label}
            </span>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}
