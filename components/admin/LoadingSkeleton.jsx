'use client'

import { motion } from 'framer-motion'

/**
 * Table loading skeleton for list pages
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="flex gap-4 p-4 bg-slate-200 dark:bg-slate-700 rounded-lg"
          >
            {Array(columns)
              .fill(0)
              .map((_, j) => (
                <div
                  key={j}
                  className={`h-4 bg-slate-300 dark:bg-slate-600 rounded ${j === 0 ? 'flex-1' : 'w-24'}`}
                />
              ))}
          </motion.div>
        ))}
    </div>
  )
}

/**
 * Card loading skeleton
 */
export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="p-6 bg-slate-200 dark:bg-slate-700 rounded-lg h-40"
          />
        ))}
    </div>
  )
}

/**
 * Form field loading skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="space-y-2"
          >
            <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded" />
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          </motion.div>
        ))}
    </div>
  )
}

/**
 * Header loading skeleton
 */
export function HeaderSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
      className="space-y-3 mb-6"
    >
      <div className="h-8 w-48 bg-slate-300 dark:bg-slate-600 rounded" />
      <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded" />
    </motion.div>
  )
}
