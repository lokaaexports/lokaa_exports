'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/admin/Breadcrumb';
import { TableSkeleton } from '@/components/admin/LoadingSkeleton';
import { EmptyState, ErrorState } from '@/components/admin/EmptyState';
import {
  FileText,
  Plus,
  Download,
  Clock,
  Settings,
  Share2,
  Mail,
  QrCode,
  Eye,
  Zap,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

export default function CatalogManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState<any>({});
  const [generatingId, setGeneratingId] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    catalogType: 'complete',
    includeProducts: true,
    includeCategories: true,
    includePricing: true,
    includeImages: true,
    selectedCategories: [],
  });

  // Fetch catalogues
  const fetchCatalogues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/catalog?action=list');
      const data = await res.json();
      if (data.success) {
        setCatalogues(data.data || []);
      } else {
        setError(data.error || 'Failed to load catalogues');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load catalogues');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogues();
  }, [fetchCatalogues]);

  const validateForm = () => {
    const errors: any = {};
    if (!formData.catalogType?.trim()) errors.catalogType = 'Catalog type required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateCatalog = async () => {
    if (!validateForm()) return;
    
    try {
      setGeneratingId('generating');
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          ...formData,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Catalogue generated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowGenerateForm(false);
        setFormData({
          catalogType: 'complete',
          includeProducts: true,
          includeCategories: true,
          includePricing: true,
          includeImages: true,
          selectedCategories: [],
        });
        await fetchCatalogues();
      } else {
        setError(data.error || 'Failed to generate catalogue');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate catalogue');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDeleteCatalog = async (id) => {
    if (!confirm('Delete this catalogue version?')) return;
    
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Catalogue deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchCatalogues();
      } else {
        setError(data.error || 'Failed to delete catalogue');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete catalogue');
    }
  };

  const handleDownloadCatalog = async (id) => {
    try {
      const res = await fetch(`/api/admin/catalog?id=${id}&action=download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catalogue-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      setError('Failed to download catalogue');
    }
  };

  const stats = [
    { label: 'Total Versions', value: catalogues.length.toString(), icon: FileText },
    { label: 'Published', value: catalogues.filter(c => c.status === 'published').length.toString(), icon: BarChart3 },
    { label: 'Last Generated', value: catalogues.length > 0 ? '2 hours ago' : 'Never', icon: Clock },
    { label: 'Storage Used', value: '2.4 GB', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Catalog Manager' }]} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Catalog Manager</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage and generate product catalogues</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            Generate Catalog
          </motion.button>
        </div>
      </motion.div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800"
        >
          {successMessage}
        </motion.div>
      )}

      {/* Error State */}
      {error && <ErrorState title="Failed" description={error} onRetry={fetchCatalogues} />}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Icon size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Generate Form */}
      {showGenerateForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Generate Catalog</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Catalog Type
              </label>
              <select
                value={formData.catalogType}
                onChange={(e) => setFormData({ ...formData, catalogType: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="complete">Complete Catalog</option>
                <option value="category">By Category</option>
                <option value="selected">Selected Products</option>
                <option value="customer">Customer Specific</option>
              </select>
              {formErrors.catalogType && <p className="text-red-600 text-sm mt-1">{formErrors.catalogType}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeProducts}
                  onChange={(e) => setFormData({ ...formData, includeProducts: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 dark:text-slate-300">Include Products</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeCategories}
                  onChange={(e) => setFormData({ ...formData, includeCategories: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 dark:text-slate-300">Include Categories</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includePricing}
                  onChange={(e) => setFormData({ ...formData, includePricing: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 dark:text-slate-300">Include Pricing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeImages}
                  onChange={(e) => setFormData({ ...formData, includeImages: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 dark:text-slate-300">Include Images</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerateCatalog}
                disabled={generatingId === 'generating'}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {generatingId === 'generating' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Now
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowGenerateForm(false);
                  setFormErrors({});
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-8">
          {['overview', 'versions', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium border-b-2 transition-all ${
                activeTab === tab
                  ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : error ? (
            <ErrorState title="Failed to Load" description={error} onRetry={fetchCatalogues} />
          ) : catalogues.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Catalogues Yet"
              description="Generate your first product catalogue to get started"
              actionLabel="Generate Catalog"
              onAction={() => setShowGenerateForm(true)}
            />
          ) : (
            <div className="space-y-3">
              {catalogues.map((cat) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{cat.name || 'Catalog ' + cat.version}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{cat.type} • {cat.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cat.status === 'published'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {cat.status || 'Draft'}
                    </span>
                    <button
                      onClick={() => handleDownloadCatalog(cat.id)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                      <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteCatalog(cat.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Version History</h3>
          {loading ? (
            <TableSkeleton rows={5} columns={3} />
          ) : catalogues.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No Version History"
              description="Generate a catalog to see version history"
              actionLabel="Generate Now"
              onAction={() => setShowGenerateForm(true)}
            />
          ) : (
            catalogues.map((cat) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{cat.version || 'v1.0'}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{cat.createdAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50">
                      View
                    </button>
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-600">
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Catalog Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Color Theme</label>
              <input type="color" defaultValue="#059669" className="w-20 h-10 rounded cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Auto-generate on updates</label>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
