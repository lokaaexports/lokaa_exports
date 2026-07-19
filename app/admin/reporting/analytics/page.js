'use client'

import { motion } from 'framer-motion'
import { Calendar, Download, Filter, BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30days')

  const metrics = [
    { label: 'Total Revenue', value: '₹1.28Cr', change: '+12.5%', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600' },
    { label: 'New Customers', value: '45', change: '+8.2%', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
    { label: 'Orders Processed', value: '234', change: '+23.1%', icon: LineChart, color: 'from-purple-500 to-purple-600' },
    { label: 'Conversion Rate', value: '45%', change: '+5.4%', icon: PieChart, color: 'from-orange-500 to-orange-600' },
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
            Analytics & Reporting
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Comprehensive business analytics and insights
          </p>
        </div>
      </motion.div>

      {/* Date Range & Export */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
          <Download className="w-4 h-4" />
          Export Report
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {metrics.map((metric, idx) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {metric.value}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    {metric.change}
                  </p>
                </div>
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Revenue Trend
          </h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {[45, 52, 48, 65, 72, 68, 82, 88, 92, 85, 95, 98].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ delay: 0.3 + idx * 0.03, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t hover:from-purple-600 hover:to-purple-500 transition relative group"
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap transition">
                  ₹{value}L
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Monthly revenue for {dateRange === '30days' ? 'last 30 days' : dateRange}
          </p>
        </motion.div>

        {/* Customer Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Customer Growth
          </h3>
          <div className="space-y-4">
            {[
              { label: 'New Customers', value: 45, max: 100, color: 'from-blue-500 to-blue-600' },
              { label: 'Retained', value: 78, max: 100, color: 'from-emerald-500 to-emerald-600' },
              { label: 'At Risk', value: 12, max: 100, color: 'from-orange-500 to-orange-600' },
              { label: 'Churned', value: 5, max: 100, color: 'from-red-500 to-red-600' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.max) * 100}%` }}
                    transition={{ delay: 0.4 + idx * 0.05, duration: 0.6 }}
                    className={`h-full bg-gradient-to-r ${item.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Top Products */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Top Products
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Organic Basmati Rice', sales: '₹45L', growth: '+18%' },
              { name: 'Cotton Textile Fabric', sales: '₹38L', growth: '+12%' },
              { name: 'Industrial Steel', sales: '₹32L', growth: '+8%' },
            ].map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + idx * 0.05 }}
                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {product.sales}
                  </p>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  {product.growth}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Top Customers
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Global Trading Ltd', value: '₹50L', status: 'Active' },
              { name: 'Textile Traders Int', value: '₹45L', status: 'Active' },
              { name: 'Export Solutions', value: '₹38L', status: 'Active' },
            ].map((customer, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + idx * 0.05 }}
                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {customer.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {customer.value}
                  </p>
                </div>
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium">
                  {customer.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
