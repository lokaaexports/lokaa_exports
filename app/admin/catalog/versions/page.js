'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Trash2, RotateCcw, Eye, Share2, Clock, Archive } from 'lucide-react';

export default function CatalogueVersions() {
  const [darkMode] = useState(false);
  const [versions] = useState([
    {
      id: 1,
      version: 'v2.1',
      type: 'Complete Catalogue',
      status: 'Published',
      date: 'Jul 12, 2024',
      time: '14:32:15',
      size: '4.2 MB',
      pages: 68,
      products: 247,
      changes: 'Updated product pricing, added 5 new products, refreshed branding',
      color: 'emerald',
    },
    {
      id: 2,
      version: 'v2.0',
      type: 'Complete Catalogue',
      status: 'Archived',
      date: 'Jul 5, 2024',
      time: '10:15:42',
      size: '3.9 MB',
      pages: 64,
      products: 242,
      changes: 'Fixed certifications page, improved layout',
      color: 'slate',
    },
    {
      id: 3,
      version: 'v1.9',
      type: 'Complete Catalogue',
      status: 'Archived',
      date: 'Jun 28, 2024',
      time: '09:45:22',
      size: '3.8 MB',
      pages: 63,
      products: 237,
      changes: 'Added new section: Global Presence',
      color: 'slate',
    },
    {
      id: 4,
      version: 'v1.8',
      type: 'Complete Catalogue',
      status: 'Archived',
      date: 'Jun 21, 2024',
      time: '11:20:33',
      size: '3.6 MB',
      pages: 61,
      products: 230,
      changes: 'Initial catalogue release',
      color: 'slate',
    },
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Version History
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Track and manage all catalogue versions
        </p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Versions', value: '4', icon: Archive },
          { label: 'Published', value: '1', icon: Download },
          { label: 'Archived', value: '3', icon: Clock },
          { label: 'Latest Size', value: '4.2 MB', icon: Clock },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <Card
                className={`p-4 backdrop-blur-2xl border ${
                  darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                    <Icon size={20} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Versions List */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        {versions.map((version, idx) => (
          <motion.div key={version.id} variants={itemVariants}>
            <Card
              className={`p-6 backdrop-blur-2xl border ${
                darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
              }`}
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Version Badge */}
                    <div
                      className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg ${
                        version.color === 'emerald'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {version.version}
                    </div>

                    {/* Version Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          Catalogue {version.version}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            version.status === 'Published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {version.status}
                        </span>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {version.type} • Generated {version.date} at {version.time}
                      </p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {version.pages} pages • {version.products} products • {version.size}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye size={18} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Share"
                    >
                      <Share2 size={18} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={18} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
                    </motion.button>
                  </div>
                </div>

                {/* Changelog */}
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Changes in this version:
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {version.changes}
                  </p>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  {version.status === 'Archived' && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <RotateCcw size={16} />
                      Restore
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download size={16} />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 ml-auto text-red-600 hover:text-red-700">
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`mt-8 p-4 rounded-lg border ${
          darkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'
        }`}
      >
        <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
          <strong>💾 Version Management:</strong> Catalogues are automatically versioned. You can restore previous
          versions at any time. Archived versions are kept for 90 days before automatic deletion.
        </p>
      </motion.div>
    </div>
  );
}
