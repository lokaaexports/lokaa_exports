'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader, CheckCircle } from 'lucide-react';

/**
 * DownloadCatalogueButton
 * Reusable component for downloading company catalogue
 * Used on: Home, About, Products, Category, Footer, Customer Dashboard, RFQ Confirmation
 * 
 * Props:
 * - variant: 'default' | 'hero' | 'compact' | 'floating'
 * - type: 'complete' | 'category' | 'customer'
 * - categoryId: (optional) Category ID for category catalogue
 * - customerData: (optional) Customer info for personalized catalogue
 * - className: Additional CSS classes
 */
export default function DownloadCatalogueButton({
  variant = 'default',
  type = 'complete',
  categoryId,
  customerData,
  className = '',
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const payload = {
        type,
        categoryId,
        customerData,
      };

      const response = await fetch('/api/admin/catalog/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In production, add JWT token from cookies
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'lokaa-catalogue.pdf';

      // Get PDF blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to download catalogue');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Hero variant - Large prominent button for hero sections
  if (variant === 'hero') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDownload}
        disabled={loading}
        className={`px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-lg flex items-center gap-3 shadow-lg ${
          loading ? 'opacity-75 cursor-not-allowed' : ''
        } ${className}`}
      >
        {loading ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Loader size={20} />
            </motion.div>
            Generating...
          </>
        ) : success ? (
          <>
            <CheckCircle size={20} />
            Downloaded!
          </>
        ) : (
          <>
            <Download size={20} />
            📄 Download Company Catalogue
          </>
        )}
      </motion.button>
    );
  }

  // Compact variant - Smaller button for inline use
  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownload}
        disabled={loading}
        className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 ${
          loading ? 'opacity-75 cursor-not-allowed' : ''
        } ${className}`}
      >
        {loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <Loader size={16} />
          </motion.div>
        ) : success ? (
          <CheckCircle size={16} />
        ) : (
          <Download size={16} />
        )}
        {loading ? 'Generating...' : success ? 'Done!' : 'Catalogue'}
      </motion.button>
    );
  }

  // Floating variant - For sticky footer or floating action button
  if (variant === 'floating') {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDownload}
        disabled={loading}
        className={`fixed bottom-8 right-8 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg z-50 ${
          loading ? 'opacity-75 cursor-not-allowed' : ''
        } ${className}`}
        title="Download Company Catalogue"
      >
        {loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <Loader size={24} />
          </motion.div>
        ) : success ? (
          <CheckCircle size={24} />
        ) : (
          <Download size={24} />
        )}
      </motion.button>
    );
  }

  // Default variant - Standard button for general use
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleDownload}
      disabled={loading}
      className={`px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all ${
        loading ? 'opacity-75 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading ? (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <Loader size={18} />
          </motion.div>
          Generating...
        </>
      ) : success ? (
        <>
          <CheckCircle size={18} />
          Downloaded!
        </>
      ) : (
        <>
          <Download size={18} />
          📄 Download Catalogue
        </>
      )}
    </motion.button>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// 1. Hero section - complete catalogue
<DownloadCatalogueButton variant="hero" type="complete" />

// 2. Category page - category-specific catalogue
<DownloadCatalogueButton 
  variant="default" 
  type="category" 
  categoryId="Organics"
/>

// 3. Customer logged in - personalized catalogue
<DownloadCatalogueButton
  variant="default"
  type="customer"
  customerData={{
    company: 'Global Trading Ltd',
    contact: 'John Doe',
    email: 'john@globaltrade.com',
    country: 'USA',
    rfqRef: 'RFQ-2024-001',
  }}
/>

// 4. Floating action button
<DownloadCatalogueButton variant="floating" type="complete" />

// 5. Compact inline button
<DownloadCatalogueButton variant="compact" type="complete" />

// 6. RFQ confirmation page
<DownloadCatalogueButton
  variant="default"
  type="customer"
  customerData={rfqData}
/>
*/
