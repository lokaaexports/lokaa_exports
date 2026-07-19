'use client'

import { motion } from 'framer-motion'
import { MoreVertical, User, Package, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react'

export default function ActivityFeed({ activities = [] }) {
  const mockActivities = [
    {
      id: 1,
      type: 'customer',
      title: 'New customer registered',
      description: 'Raj Kumar Singh from Mumbai',
      timestamp: '2 hours ago',
      icon: User,
      color: 'blue'
    },
    {
      id: 2,
      type: 'product',
      title: 'Product added to inventory',
      description: 'Organic Basmati Rice - 100kg',
      timestamp: '4 hours ago',
      icon: Package,
      color: 'purple'
    },
    {
      id: 3,
      type: 'order',
      title: 'New RFQ received',
      description: 'From Export Trading Company Ltd',
      timestamp: '6 hours ago',
      icon: ShoppingCart,
      color: 'emerald'
    },
    {
      id: 4,
      type: 'success',
      title: 'Order approved',
      description: 'Order #2024-001 approved for processing',
      timestamp: '1 day ago',
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Low inventory alert',
      description: 'Industrial Grade Steel - 50 units remaining',
      timestamp: '1 day ago',
      icon: AlertCircle,
      color: 'orange'
    },
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Latest updates from your dashboard
          </p>
        </div>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {displayActivities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition flex items-start gap-4"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  colorMap[activity.color]
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  {activity.title}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  {activity.timestamp}
                </p>
              </div>

              {/* Action */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </motion.button>
            </motion.div>
          )
        })}
      </div>

      {/* View All Button */}
      <motion.div
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
        className="p-4 text-center cursor-pointer"
      >
        <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700">
          View all activity →
        </button>
      </motion.div>
    </motion.div>
  )
}
