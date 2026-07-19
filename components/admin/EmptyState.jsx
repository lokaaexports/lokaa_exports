'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

/**
 * Empty state component for list pages
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel = null,
  onAction = null,
  actionHref = null,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {Icon && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-full"
        >
          <Icon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
        </motion.div>
      )}

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-sm text-center">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4 gap-2">
          {actionLabel}
        </Button>
      )}

      {actionLabel && actionHref && (
        <motion.a
          href={actionHref}
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition font-medium text-sm"
        >
          {actionLabel}
        </motion.a>
      )}
    </motion.div>
  )
}

/**
 * Error state component
 */
export function ErrorState({ title, description, onRetry = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg"
    >
      <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
        <svg
          className="w-8 h-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-red-700 dark:text-red-300 mb-4 max-w-sm text-center">
          {description}
        </p>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          className="mt-4 bg-red-600 hover:bg-red-700"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  )
}
