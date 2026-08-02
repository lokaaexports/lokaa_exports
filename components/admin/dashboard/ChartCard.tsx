'use client'

import { motion } from 'framer-motion'
import { MoreVertical, TrendingUp } from 'lucide-react'

export default function ChartCard({ title, subtitle, data, type = 'line' }: any) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Chart Area */}
      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg hover:shadow-lg transition relative group"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: -15 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap"
            >
              {item.value}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            Showing data for the last 7 days
          </span>
          <div className="flex items-center gap-2 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">+12.5%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
