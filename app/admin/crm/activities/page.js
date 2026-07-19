'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Clock, MessageSquare, UserCheck, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const ACTIVITY_TYPE_ICONS = {
  status_change: <Edit className="w-4 h-4" />,
  assignment: <UserCheck className="w-4 h-4" />,
  note: <MessageSquare className="w-4 h-4" />,
  communication: <MessageSquare className="w-4 h-4" />
}

const ACTIVITY_TYPE_COLORS = {
  status_change: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  assignment: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  note: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  communication: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [leads, setLeads] = useState([])
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    if (selectedLeadId) {
      fetchActivities()
    }
  }, [selectedLeadId, filterType])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/admin/leads?limit=100')
      if (!response.ok) throw new Error('Failed to fetch leads')
      
      const data = await response.json()
      setLeads(data.data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchActivities = async () => {
    if (!selectedLeadId) return

    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('leadId', selectedLeadId)
      if (filterType) params.append('type', filterType)

      const response = await fetch(`/api/admin/leads/activities?${params}`)
      if (!response.ok) throw new Error('Failed to fetch activities')

      const data = await response.json()
      setActivities(data.data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Lead Activities</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Track all lead interactions and status changes</p>
      </motion.div>

      {/* Lead Selector */}
      <motion.div variants={itemVariants} className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Select Lead</label>
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
          >
            <option value="">-- Choose a lead --</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.lead_reference} - {lead.company_name || 'Unknown'}
              </option>
            ))}
          </select>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
        >
          <option value="">All Activity Types</option>
          <option value="status_change">Status Changes</option>
          <option value="assignment">Assignments</option>
          <option value="note">Notes</option>
          <option value="communication">Communications</option>
        </select>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error}
        </motion.div>
      )}

      {/* Activities Timeline */}
      {selectedLeadId && (
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading activities...</div>
          ) : activities.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              No activities found for this lead
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${ACTIVITY_TYPE_COLORS[activity.activity_type] || 'bg-gray-100 text-gray-800'}`}>
                      {ACTIVITY_TYPE_ICONS[activity.activity_type] || <Clock className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white capitalize">
                            {activity.activity_type.replace('_', ' ')}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                            <span>{activity.created_by_name || 'Unknown User'}</span>
                            <span>{formatTime(activity.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* No Lead Selected */}
      {!selectedLeadId && !loading && (
        <motion.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Select a lead above to view its activity history</p>
        </motion.div>
      )}
    </motion.div>
  )
}
