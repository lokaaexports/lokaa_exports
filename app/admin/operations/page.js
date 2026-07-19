'use client'

import { motion } from 'framer-motion'
import { Package, Truck, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function OperationsPage() {
  const modules = [
    { id: 'inventory', label: 'Inventory Management', href: '/admin/operations/inventory', icon: Package, description: 'Track stock levels and warehouse inventory', count: '2,535 units' },
    { id: 'orders', label: 'Order Workflow', href: '/admin/operations/orders', icon: Truck, description: 'Manage orders from creation to delivery', count: '4 orders' },
    { id: 'suppliers', label: 'Supplier Management', href: '/admin/operations/suppliers', icon: Users, description: 'Manage supplier relationships', count: '4 suppliers' },
  ]

  const stats = [
    { label: 'Total Stock', value: '2,535 units', trend: '+12%' },
    { label: 'Active Orders', value: '4', trend: '+2 this week' },
    { label: 'Suppliers', value: '4', trend: 'All active' },
    { label: 'Pipeline Value', value: '₹1.28Cr', trend: '+8.5%' },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Operations Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Complete operations and inventory management system
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{stat.trend}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Modules Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {modules.map((module, idx) => {
          const Icon = module.icon
          return (
            <Link key={module.id} href={module.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + idx * 0.05 }}
                whileHover={{ scale: 1.02, translateY: -8 }}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition h-full"
              >
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4"
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {module.label}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {module.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                    {module.count}
                  </p>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Go to {module.label} →
                  </p>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>
    </div>
  )
}
