'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Building, Users, Calendar, FileText, Plus, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function CustomerDetailPage() {
  const [customer] = useState({
    id: 1,
    name: 'Raj Kumar Singh',
    email: 'raj@company.com',
    phone: '+91 98765 43210',
    company: 'Kumar Trading Co.',
    location: 'Mumbai, India',
    status: 'active',
    joinDate: '2024-01-15',
    totalValue: '₹45,00,000',
    lastContact: '2024-07-10',
    notes: 'Preferred vendor for organic exports. Established relationship.',
    industry: 'Trading & Export',
    employees: 50,
    website: 'www.kumartrading.com'
  })

  const [interactions] = useState([
    { date: '2024-07-10', type: 'Call', subject: 'Quarterly review discussion', owner: 'Raj Kumar' },
    { date: '2024-07-05', type: 'Email', subject: 'Updated product catalog sent', owner: 'Sarah' },
    { date: '2024-07-01', type: 'Meeting', subject: 'On-site visit for new product demo', owner: 'Ahmed' },
  ])

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">RK</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {customer.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{customer.company}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </motion.button>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Value</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹45L</p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 inline-block">
            ↑ 12% from last year
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Active</p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 inline-block">
            Since Jan 2024
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Interactions</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">127</p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 inline-block">
            Last contact: Jul 10
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Account Owner</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">Raj Kumar</p>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 inline-block">
            Since: Mar 2024
          </span>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Contact Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <motion.a
                whileHover={{ translateX: 4 }}
                href={`mailto:${customer.email}`}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition cursor-pointer"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {customer.email}
                  </p>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ translateX: 4 }}
                href={`tel:${customer.phone}`}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition cursor-pointer"
              >
                <Phone className="w-5 h-5 text-green-600" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {customer.phone}
                  </p>
                </div>
              </motion.a>

              <motion.div
                whileHover={{ translateX: 4 }}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg"
              >
                <MapPin className="w-5 h-5 text-orange-600" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {customer.location}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Company Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Industry</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                  {customer.industry}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Employees</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                  {customer.employees}+
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Website</p>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-1 truncate">
                  {customer.website}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Interactions & Notes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Communication History */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Communication History
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <Plus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
            </div>
            <div className="space-y-3">
              {interactions.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700/50"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {item.type}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {item.subject}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      by {item.owner}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Notes & Comments
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {customer.notes}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Added by: Raj Kumar on Jul 10, 2024
                </p>
              </div>
              <textarea
                placeholder="Add a note..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                rows={3}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                Save Note
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
