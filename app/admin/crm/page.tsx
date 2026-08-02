'use client'

import { motion } from 'framer-motion'
import { Plus, TrendingUp, Users, Target, CheckCircle2, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import Breadcrumb from '@/components/admin/Breadcrumb'
import { useState } from 'react'

export default function CRMPage() {
  const [stats] = useState([
    { label: 'Total Customers', value: '1,234', change: '+12.5%', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Pipeline Value', value: '₹172L', change: '+8.2%', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Active Opportunities', value: '28', change: '+23.1%', icon: Target, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Conversion Rate', value: '45%', change: '+5.4%', icon: CheckCircle2, color: 'from-orange-500 to-orange-600' },
  ])

  const modules = [
    { id: 'customers', label: 'Customers', href: '/admin/crm', icon: Users, description: 'Manage and track all customers', count: '1,234' },
    { id: 'leads', label: 'Leads', href: '/admin/crm/leads', icon: Target, description: 'Manage new business leads', count: '4' },
    { id: 'pipeline', label: 'Sales Pipeline', href: '/admin/crm/pipeline', icon: TrendingUp, description: 'Track opportunities through stages', count: '43' },
    { id: 'tasks', label: 'Tasks', href: '/admin/crm/tasks', icon: Calendar, description: 'Manage activities and follow-ups', count: '4' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'CRM' }]} />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            CRM Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Complete customer relationship management system
          </p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{stat.change}</p>
                </div>
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* CRM Modules Grid */}
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
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold">
                    {module.count}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {module.label}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {module.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Go to {module.label} →
                  </p>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>

      {/* Recent Interactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Recent CRM Activity
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Lead Converted', company: 'Global Trading Ltd', time: '2 hours ago', icon: CheckCircle2 },
            { action: 'Email Sent', company: 'Export Solutions Inc', time: '4 hours ago', icon: MessageSquare },
            { action: 'Task Completed', company: 'Asia Pacific Partners', time: '1 day ago', icon: Calendar },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition"
              >
                <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{item.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.company}</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{item.time}</span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
