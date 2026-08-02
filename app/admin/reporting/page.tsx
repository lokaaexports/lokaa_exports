'use client'

import { motion } from 'framer-motion'
import { BarChart3, LineChart, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'

export default function ReportingPage() {
  const modules = [
    { id: 'analytics', label: 'Analytics & Insights', href: '/admin/reporting/analytics', icon: BarChart3, description: 'Business analytics and performance metrics', count: '12 metrics' },
    { id: 'reports', label: 'Reports & Exports', href: '/admin/reporting/reports', icon: FileText, description: 'Generate and manage business reports', count: '4 recent' },
  ]

  const stats = [
    { label: 'Revenue', value: '₹1.28Cr', trend: '+12.5%' },
    { label: 'Customer Growth', value: '+45', trend: '+8.2%' },
    { label: 'Orders', value: '234', trend: '+23.1%' },
    { label: 'Conversion', value: '45%', trend: '+5.4%' },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Reporting & Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Comprehensive analytics and reporting system
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

      {/* Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Daily Summary', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
            { title: 'Weekly Report', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
            { title: 'Monthly Analysis', icon: LineChart, color: 'from-emerald-500 to-emerald-600' },
          ].map((action, idx) => {
            const Icon = action.icon
            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition flex items-center gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </motion.div>
                <p className="font-medium text-slate-900 dark:text-white text-left">
                  {action.title}
                </p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
