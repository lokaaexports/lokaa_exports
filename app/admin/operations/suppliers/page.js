'use client'

import { motion } from 'framer-motion'
import { Plus, Search, Filter, Mail, Phone, MapPin, Star, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function SuppliersPage() {
  const [suppliers] = useState([
    {
      id: 1,
      name: 'Premium Organics Ltd',
      email: 'sales@premiumorganics.com',
      phone: '+91 22 XXXX XXXX',
      location: 'Mumbai, India',
      category: 'Organics',
      rating: 4.8,
      deliveryTime: '7-10 days',
      orders: 24,
      totalValue: '₹2.5Cr',
      status: 'active'
    },
    {
      id: 2,
      name: 'Industrial Steel Co',
      email: 'contact@indsteel.com',
      phone: '+91 80 XXXX XXXX',
      location: 'Bangalore, India',
      category: 'Industrial',
      rating: 4.5,
      deliveryTime: '10-14 days',
      orders: 18,
      totalValue: '₹1.8Cr',
      status: 'active'
    },
    {
      id: 3,
      name: 'Textile Traders International',
      email: 'info@textiletrad.com',
      phone: '+88 2 XXXX XXXX',
      location: 'Dhaka, Bangladesh',
      category: 'Textiles',
      rating: 4.3,
      deliveryTime: '5-7 days',
      orders: 31,
      totalValue: '₹3.2Cr',
      status: 'active'
    },
    {
      id: 4,
      name: 'Electronic Parts Hub',
      email: 'procurement@elparthub.com',
      phone: '+86 10 XXXX XXXX',
      location: 'Shanghai, China',
      category: 'Electronics',
      rating: 4.1,
      deliveryTime: '14-21 days',
      orders: 12,
      totalValue: '₹1.2Cr',
      status: 'active'
    },
  ])

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
            Supplier Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage supplier relationships and procurement
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Suppliers</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">4</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">All active</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Procurement</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">₹9.7Cr</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All time</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Avg Rating</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">4.4</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Out of 5.0</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Orders</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">85</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+18% this quarter</p>
        </div>
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
            placeholder="Search suppliers..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </motion.div>

      {/* Suppliers Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {suppliers.map((supplier, idx) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {supplier.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {supplier.category}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(supplier.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <motion.a
                whileHover={{ translateX: 4 }}
                href={`mailto:${supplier.email}`}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
              >
                <Mail className="w-4 h-4" />
                {supplier.email}
              </motion.a>
              <motion.a
                whileHover={{ translateX: 4 }}
                href={`tel:${supplier.phone}`}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
              >
                <Phone className="w-4 h-4" />
                {supplier.phone}
              </motion.a>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                {supplier.location}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Delivery</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {supplier.deliveryTime}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Orders</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {supplier.orders}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Value</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {supplier.totalValue}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full mt-4 px-3 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/40 transition"
            >
              View Details
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
