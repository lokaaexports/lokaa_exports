'use client'

import { motion } from 'framer-motion'
import { Download, Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react'
import Breadcrumb from '@/components/admin/Breadcrumb'

export default function ReportsPage() {
  const reports = [
    { title: 'Sales Report', icon: TrendingUp, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    { title: 'Customer Report', icon: BarChart3, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
    { title: 'Inventory Report', icon: PieChart, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Reports' }]} />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Reports</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Generate and download detailed business reports</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="date" className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          <input type="date" className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Generate
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center mb-4`}>
              <report.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{report.title}</h3>
            <button className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline">
              <Download className="w-4 h-4" />
              Download
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
