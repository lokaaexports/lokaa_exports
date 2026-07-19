'use client'

import { motion } from 'framer-motion'
import { Plus, Download, Calendar, FileText, BarChart3, Users, Package } from 'lucide-react'
import { useState } from 'react'

export default function ReportsPage() {
  const [reports] = useState([
    {
      id: 1,
      name: 'Monthly Sales Report',
      created: '2024-07-10',
      period: 'July 2024',
      type: 'Sales',
      icon: BarChart3,
      size: '2.4 MB',
      format: 'PDF, XLSX'
    },
    {
      id: 2,
      name: 'Customer Analysis Report',
      created: '2024-07-08',
      period: 'Q3 2024',
      type: 'Customer',
      icon: Users,
      size: '1.8 MB',
      format: 'PDF, XLSX'
    },
    {
      id: 3,
      name: 'Inventory Report',
      created: '2024-07-09',
      period: 'July 2024',
      type: 'Inventory',
      icon: Package,
      size: '1.2 MB',
      format: 'PDF, XLSX'
    },
    {
      id: 4,
      name: 'Revenue Analysis',
      created: '2024-07-07',
      period: 'H1 2024',
      type: 'Finance',
      icon: BarChart3,
      size: '3.1 MB',
      format: 'PDF, XLSX, CSV'
    },
  ])

  const reportTemplates = [
    { name: 'Sales Report', description: 'Monthly sales by product and region', icon: BarChart3 },
    { name: 'Customer Report', description: 'Customer acquisition and retention', icon: Users },
    { name: 'Inventory Report', description: 'Stock levels and turnover', icon: Package },
    { name: 'Financial Report', description: 'Revenue and expense analysis', icon: BarChart3 },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Reports & Exports
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Generate and manage business reports
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </motion.button>
      </motion.div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Reports
          </h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {reports.map((report, idx) => {
            const Icon = report.icon
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition flex items-start gap-4"
              >
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0"
                >
                  <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {report.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {report.period} • {report.type}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {report.size}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {report.format}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {report.created}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    <Download className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Report Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Generate New Report
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map((template, idx) => {
            const Icon = template.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition"
              >
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4"
                >
                  <Icon className="w-5 h-5 text-white" />
                </motion.div>
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {template.name}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {template.description}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="w-full mt-4 px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/40 transition"
                >
                  Generate
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Export Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { format: 'PDF', description: 'Professional formatted reports', icon: FileText },
            { format: 'XLSX', description: 'Excel spreadsheets for analysis', icon: BarChart3 },
            { format: 'CSV', description: 'Plain text for data import', icon: FileText },
          ].map((exp, idx) => {
            const Icon = exp.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + idx * 0.05 }}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {exp.format}
                  </p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {exp.description}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                >
                  Export
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
