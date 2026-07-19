'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Zap } from 'lucide-react'

const CRM_NAVIGATION = [
  { href: '/admin/customers', label: 'Customers', icon: Users, description: 'Manage customer records' },
  { href: '/admin/crm/leads', label: 'Leads', icon: TrendingUp, description: 'Track sales leads' },
  { href: '/admin/crm/pipeline', label: 'Pipeline', icon: Zap, description: 'Sales pipeline Kanban view' }
]

export default function CRMSubNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-8 overflow-x-auto">
          {CRM_NAVIGATION.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/') || 
                            (item.href === '/admin/customers' && pathname.includes('customers'))
            
            return (
              <motion.div
                key={item.href}
                whileHover={{ y: -2 }}
                className={`flex-shrink-0 ${isActive ? 'border-b-2 border-purple-600' : 'border-b-2 border-transparent'}`}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-4 text-sm font-medium transition ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
