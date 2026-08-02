'use client'

import { motion } from 'framer-motion'
import { Plus, Search, Filter, CheckCircle2, Circle, Calendar, User } from 'lucide-react'
import { useState } from 'react'

export default function TasksPage() {
  const [tasks] = useState([
    {
      id: 1,
      title: 'Follow up with Global Trading Ltd',
      description: 'Send product samples and pricing details',
      due: '2024-07-13',
      owner: 'Raj Kumar',
      priority: 'high',
      status: 'pending',
      assignee: 'Raj Kumar',
      relatedCustomer: 'Global Trading Ltd'
    },
    {
      id: 2,
      title: 'Schedule demo for Export Solutions',
      description: 'Organize product demo meeting',
      due: '2024-07-15',
      owner: 'Sarah',
      priority: 'medium',
      status: 'pending',
      assignee: 'Sarah',
      relatedCustomer: 'Export Solutions Inc'
    },
    {
      id: 3,
      title: 'Send quotation to Asia Pacific',
      description: 'Prepare and send detailed quotation',
      due: '2024-07-12',
      owner: 'Ahmed',
      priority: 'high',
      status: 'pending',
      assignee: 'Ahmed',
      relatedCustomer: 'Asia Pacific Partners'
    },
    {
      id: 4,
      title: 'Update CRM with contract details',
      description: 'Log signed contract in system',
      due: '2024-07-11',
      owner: 'Li Wei',
      priority: 'low',
      status: 'completed',
      assignee: 'Li Wei',
      relatedCustomer: 'European Import Co'
    },
  ])

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'medium': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    }
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const completedTasks = tasks.filter(t => t.status === 'completed')

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
            Tasks & Activities
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage follow-ups and scheduled activities
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Task
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
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{tasks.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all teams</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
            {pendingTasks.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Need action</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {completedTasks.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This month</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">Overdue</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">0</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All on track</p>
        </div>
      </motion.div>

      {/* Search */}
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
            placeholder="Search tasks..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </motion.div>

      {/* Pending Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pending Tasks ({pendingTasks.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {pendingTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + idx * 0.05 }}
              className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition flex items-start gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0"
              >
                <Circle className="w-5 h-5 text-slate-400" />
              </motion.button>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {task.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {task.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Related to: {task.relatedCustomer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {task.due}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                    {task.assignee}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition"
              >
                Mark Done
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Completed Tasks ({completedTasks.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {completedTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition flex items-start gap-4"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white line-through opacity-75">
                    {task.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 opacity-75">
                    {task.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
