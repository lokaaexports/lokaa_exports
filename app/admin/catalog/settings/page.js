'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, RotateCcw, Upload, Eye } from 'lucide-react';

export default function CatalogueSettings() {
  const [darkMode] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'LOKAA GLOBAL EXPORTS',
    tagline: 'Connecting Global Buyers & Suppliers',
    mission: 'To simplify international trade...',
    vision: 'To become one of the world\'s most trusted...',
    businessDescription: 'Lokaa Global Exports connects businesses worldwide...',
    website: 'www.lokaaexports.com',
    email: 'info@lokaaexports.com',
    phone: '+91-XXXX-XXXX-XXX',
    address: 'Global Headquarters, India',
    primaryColor: '#1a472a',
    secondaryColor: '#F4A460',
    includeWatermark: true,
    watermarkText: 'LOKAA GLOBAL EXPORTS - CONFIDENTIAL',
    autoGenerateOnUpdate: true,
    autoGenerateSchedule: 'weekly',
    catalogueCoverImage: null,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Simulate save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      companyName: 'LOKAA GLOBAL EXPORTS',
      tagline: 'Connecting Global Buyers & Suppliers',
      mission: 'To simplify international trade...',
      vision: 'To become one of the world\'s most trusted...',
      businessDescription: 'Lokaa Global Exports connects businesses worldwide...',
      website: 'www.lokaaexports.com',
      email: 'info@lokaaexports.com',
      phone: '+91-XXXX-XXXX-XXX',
      address: 'Global Headquarters, India',
      primaryColor: '#1a472a',
      secondaryColor: '#F4A460',
      includeWatermark: true,
      watermarkText: 'LOKAA GLOBAL EXPORTS - CONFIDENTIAL',
      autoGenerateOnUpdate: true,
      autoGenerateSchedule: 'weekly',
    });
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Catalogue Settings
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Customize catalogue branding and generation settings
        </p>
      </motion.div>

      {/* Save Alert */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-2"
        >
          <span className="text-emerald-700">✓ Settings saved successfully!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Company Information */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Company Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Website
                </label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </Card>

          {/* Company Descriptions */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Company Descriptions
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Mission
                </label>
                <textarea
                  value={settings.mission}
                  onChange={(e) => handleChange('mission', e.target.value)}
                  rows={3}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Vision
                </label>
                <textarea
                  value={settings.vision}
                  onChange={(e) => handleChange('vision', e.target.value)}
                  rows={3}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Business Description
                </label>
                <textarea
                  value={settings.businessDescription}
                  onChange={(e) => handleChange('businessDescription', e.target.value)}
                  rows={3}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </Card>

          {/* Design Settings */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Design & Colors
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{settings.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Secondary Color (Accent)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{settings.secondaryColor}</span>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Cover Image
                </label>
                <div className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer ${
                  darkMode
                    ? 'border-slate-600 hover:border-emerald-500'
                    : 'border-slate-300 hover:border-emerald-500'
                }`}>
                  <Upload className={`mx-auto mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Click to upload cover image
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sidebar Settings */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          {/* PDF Settings */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              PDF Settings
            </h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeWatermark}
                  onChange={(e) => handleChange('includeWatermark', e.target.checked)}
                  className="w-4 h-4 mt-1"
                />
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Include Watermark
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Adds confidentiality watermark to PDFs
                  </div>
                </div>
              </label>
              {settings.includeWatermark && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={settings.watermarkText}
                    onChange={(e) => handleChange('watermarkText', e.target.value)}
                    className={`w-full p-2 border rounded-lg text-sm ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Automation */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Automation
            </h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoGenerateOnUpdate}
                  onChange={(e) => handleChange('autoGenerateOnUpdate', e.target.checked)}
                  className="w-4 h-4 mt-1"
                />
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Auto-generate on Update
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Regenerate when products change
                  </div>
                </div>
              </label>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  Schedule
                </label>
                <select
                  value={settings.autoGenerateSchedule}
                  onChange={(e) => handleChange('autoGenerateSchedule', e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Preview & Actions */}
          <Card
            className={`p-6 backdrop-blur-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/80 border-slate-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Actions
            </h3>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Settings
              </motion.button>
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={handleReset}
              >
                <RotateCcw size={18} />
                Reset to Default
              </Button>
              <Button variant="outline" className="w-full justify-center gap-2">
                <Eye size={18} />
                Preview Catalogue
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
