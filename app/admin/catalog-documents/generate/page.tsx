'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Download, Send, Eye, Copy, AlertCircle } from 'lucide-react';

export default function GenerateCatalogue() {
  const [darkMode] = useState(false);
  const [catalogueType, setCatalogueType] = useState('complete');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<any>(null);
  const [selectedSections, setSelectedSections] = useState<any>({
    about: true,
    business: true,
    whyChoose: true,
    globalPresence: true,
    certifications: true,
    workflow: true,
    services: true,
  });

  const handleGenerateCatalogue = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Simulate API call
      const response = await fetch('/api/admin/catalog-documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: catalogueType,
          sections: selectedSections,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate catalogue');
      }

      // Handle download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lokaa-catalogue-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setSelectedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    { id: 'about', label: 'About Us', desc: 'Company mission, vision, and values' },
    { id: 'business', label: 'Our Business', desc: 'Services and solutions offered' },
    { id: 'whyChoose', label: 'Why Choose Us', desc: '12 key benefits and differentiators' },
    { id: 'globalPresence', label: 'Global Presence', desc: 'International regions and markets' },
    { id: 'certifications', label: 'Certifications', desc: 'Quality and compliance certifications' },
    { id: 'workflow', label: 'Export & Import Workflow', desc: '14-step trade process' },
    { id: 'services', label: 'Services', desc: 'Complete service offerings' },
  ];

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Generate Catalogue
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Create professional PDF catalogues with customizable content
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* Success Alert */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-2"
        >
          <Zap className="text-emerald-600" size={20} />
          <span className="text-emerald-700">Catalogue generated successfully!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Catalogue Type Selection */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Catalogue Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: 'complete', label: 'Complete Catalogue', desc: 'All products and sections' },
                { value: 'category', label: 'Category Catalogue', desc: 'Single category only' },
                { value: 'selected', label: 'Selected Products', desc: 'Custom product selection' },
                { value: 'customer', label: 'Customer Catalogue', desc: 'Personalized catalogue' },
              ].map((type) => (
                <label
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    catalogueType === type.value
                      ? 'bg-emerald-100 border-emerald-500'
                      : darkMode
                      ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <input
                    type="radio"
                    value={type.value}
                    checked={catalogueType === type.value}
                    onChange={(e) => setCatalogueType(e.target.value)}
                    className="mr-2"
                  />
                  <div>
                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {type.label}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {type.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Sections to Include */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Include Sections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section) => (
                <label key={section.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSections[section.id]}
                    onChange={() => toggleSection(section.id)}
                    className="w-5 h-5 mt-1 text-emerald-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {section.label}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {section.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Generation Options */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              PDF Settings
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                  Include Table of Contents
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                  Include QR Codes
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                  Add Watermark
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                  Make PDF Searchable
                </span>
              </label>
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          {/* Action Buttons */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Actions
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateCatalogue}
                disabled={loading}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap size={18} />
                {loading ? 'Generating...' : 'Generate Catalogue'}
              </motion.button>
              <Button variant="outline" className="w-full justify-center gap-2">
                <Eye size={18} />
                Preview
              </Button>
              <Button variant="outline" className="w-full justify-center gap-2">
                <Download size={18} />
                Download Latest
              </Button>
            </div>
          </Card>

          {/* Quick Share */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Quick Share
            </h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-center gap-2">
                <Send size={18} />
                Email
              </Button>
              <Button variant="outline" className="w-full justify-center gap-2">
                <Copy size={18} />
                Copy Link
              </Button>
            </div>
          </Card>

          {/* Info */}
          <Card
            className={`p-4 backdrop-blur-2xl border ${
              darkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              <strong>💡 Tip:</strong> Catalogues are automatically regenerated whenever you update products or company information.
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
