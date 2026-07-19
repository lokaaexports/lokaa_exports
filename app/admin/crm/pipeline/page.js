'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

const PIPELINE_STAGES = [
  { value: 'new', label: 'New', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { value: 'requirement_received', label: 'Requirements', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { value: 'quote_sent', label: 'Quoted', color: 'bg-orange-50 dark:bg-orange-900/20' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-pink-50 dark:bg-pink-900/20' },
  { value: 'converted', label: 'Converted', color: 'bg-green-50 dark:bg-green-900/20' }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPipeline()
  }, [])

  const fetchPipeline = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/leads?action=by-status')
      if (!response.ok) throw new Error('Failed to fetch pipeline')
      
      const data = await response.json()
      setPipeline(data.data || {})
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTotalLeads = () => {
    return Object.values(pipeline).reduce((sum, count) => sum + count, 0)
  }

  const getConversionRate = () => {
    const total = getTotalLeads()
    const converted = pipeline.converted || 0
    if (total === 0) return 0
    return Math.round((converted / total) * 100)
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Sales Pipeline</h1>
        <p className="text-slate-600 dark:text-slate-400">Kanban view of leads by sales stage</p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Leads</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{getTotalLeads()}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Conversion Rate</p>
            <p className="text-3xl font-bold text-green-600">{getConversionRate()}%</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {getTotalLeads() - (pipeline.new || 0) - (pipeline.converted || 0)}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error}
        </motion.div>
      )}

      {/* Pipeline Stages */}
      {loading ? (
        <motion.div variants={itemVariants} className="text-center py-12 text-slate-500">
          Loading pipeline...
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto"
        >
          {PIPELINE_STAGES.map((stage) => (
            <motion.div
              key={stage.value}
              variants={itemVariants}
              className={`${stage.color} rounded-lg p-4 min-h-[400px] flex flex-col`}
            >
              {/* Stage Header */}
              <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{stage.label}</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {pipeline[stage.value] || 0}
                </p>
              </div>

              {/* Stage Progress */}
              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {getTotalLeads() > 0 
                    ? `${Math.round((pipeline[stage.value] || 0) / getTotalLeads() * 100)}% of total`
                    : 'N/A'
                  }
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Pipeline Overview</h3>
        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <li>• <strong>New:</strong> Recently added leads</li>
          <li>• <strong>Contacted:</strong> Initial outreach made</li>
          <li>• <strong>Requirements:</strong> Customer requirements received</li>
          <li>• <strong>Quoted:</strong> Price quotation sent to customer</li>
          <li>• <strong>Negotiation:</strong> Terms being negotiated</li>
          <li>• <strong>Converted:</strong> Deal closed/customer acquired</li>
        </ul>
      </motion.div>
    </motion.div>
  )
}
