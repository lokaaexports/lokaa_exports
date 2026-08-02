'use client'

import { motion } from 'framer-motion'
import { Plus, Search, Filter, Truck, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function OrderWorkflowPage() {
  const [orders] = useState([
    {
      id: 'ORD-2024-0001',
      customer: 'Global Trading Ltd',
      date: '2024-07-10',
      amount: '₹50,00,000',
      items: 3,
      status: 'shipping',
      expected: '2024-07-18',
      owner: 'Raj Kumar'
    },
    {
      id: 'ORD-2024-0002',
      customer: 'Export Solutions Inc',
      date: '2024-07-09',
      amount: '₹35,00,000',
      items: 2,
      status: 'processing',
      expected: '2024-07-20',
      owner: 'Sarah'
    },
    {
      id: 'ORD-2024-0003',
      customer: 'Asia Pacific Partners',
      date: '2024-07-08',
      amount: '₹28,00,000',
      items: 4,
      status: 'delivered',
      expected: '2024-07-15',
      owner: 'Ahmed'
    },
    {
      id: 'ORD-2024-0004',
      customer: 'European Import Co',
      date: '2024-07-07',
      amount: '₹15,00,000',
      items: 1,
      status: 'pending',
      expected: '2024-07-22',
      owner: 'Li Wei'
    },
  ])

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'processing': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      case 'shipping': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
      case 'delivered': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return Clock
      case 'processing': return AlertCircle
      case 'shipping': return Truck
      case 'delivered': return CheckCircle2
      default: return AlertCircle
    }
  }

  const stats = [
    { label: 'Total Orders', value: '4', change: '+2 this week' },
    { label: 'Revenue', value: '₹1.28Cr', change: '+8.5%' },
    { label: 'Pending', value: '1', change: 'Needs action' },
    { label: 'Delivered', value: '1', change: '25% delivery' },
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
            Order Workflow
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage orders from creation to delivery
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </motion.button>
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
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders by ID, customer..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Expected</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {orders.map((order, idx) => {
              const StatusIcon = getStatusIcon(order.status)
              return (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                >
                  <td className="px-6 py-4 font-mono font-semibold text-slate-900 dark:text-white">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4" />
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {order.expected}
                  </td>
                  <td className="px-6 py-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    >
                      View
                    </motion.button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Order Status Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Order Status Workflow
        </h3>
        <div className="flex items-center justify-between">
          {[
            { label: 'Pending', icon: Clock, color: 'from-blue-500 to-blue-600' },
            { label: 'Processing', icon: AlertCircle, color: 'from-orange-500 to-orange-600' },
            { label: 'Shipping', icon: Truck, color: 'from-purple-500 to-purple-600' },
            { label: 'Delivered', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
          ].map((stage, idx) => {
            const Icon = stage.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
                className="flex flex-col items-center flex-1"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center mb-2`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <p className="text-sm font-medium text-slate-900 dark:text-white text-center">
                  {stage.label}
                </p>
                {idx < 3 && (
                  <div className="hidden md:block w-full h-1 bg-slate-200 dark:bg-slate-700 mt-2 mx-2" />
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
