// Catalogue generation service with professional multi-page PDF template
// Handles all catalogue creation, versioning, and optimization

import jsPDF from 'jspdf';

// ============================================================================
// CATALOGUE DATA STRUCTURE
// ============================================================================

export const catalogueTemplate = {
  metadata: {
    company: 'LOKAA GLOBAL EXPORTS',
    tagline: 'Connecting Global Buyers & Suppliers',
    mission: 'To simplify international trade by connecting trusted suppliers and buyers across the world through quality products, transparent business practices, innovative technology, and reliable logistics.',
    vision: 'To become one of the world\'s most trusted technology-driven import and export companies, creating seamless global trade opportunities for businesses of every size.',
    businessDescription: 'Lokaa Global Exports connects businesses worldwide by sourcing, supplying, importing, and exporting premium products across multiple industries.',
    website: 'www.lokaaexports.com',
    email: 'info@lokaaexports.com',
    phone: '+91-XXXX-XXXX-XXX',
    address: 'Global Headquarters, India',
  },
  
  sections: {
    coverPage: {
      title: 'Global Import & Export Solutions',
      subtitle: 'Connecting Global Buyers & Suppliers',
    },
    
    aboutUs: {
      heading: 'About Us',
      sections: [
        {
          title: 'Who We Are',
          content: 'Lokaa Global Exports is a leading import/export company specializing in connecting international businesses with premium products and reliable suppliers.',
        },
        {
          title: 'Our Story',
          content: 'Founded with a vision to simplify international trade, we have grown into a trusted partner for businesses across continents.',
        },
        {
          title: 'Core Values',
          values: ['Integrity', 'Innovation', 'Quality', 'Reliability', 'Customer Focus', 'Global Collaboration'],
        },
      ],
    },
    
    ourBusiness: [
      'Import Services',
      'Export Services',
      'Global Sourcing',
      'Private Label Manufacturing',
      'OEM Services',
      'Wholesale Supply',
      'Industrial Solutions',
      'Agricultural Products',
      'Packaging Solutions',
      'Global Logistics',
      'Supply Chain Management',
      'International Documentation',
    ],
    
    whyChooseUs: [
      { title: 'Trusted Global Partner', icon: '🌍' },
      { title: 'Worldwide Supplier Network', icon: '🤝' },
      { title: 'Reliable Quality', icon: '✓' },
      { title: 'Competitive Pricing', icon: '💰' },
      { title: 'Fast RFQ Response', icon: '⚡' },
      { title: 'Professional Documentation', icon: '📄' },
      { title: 'Global Logistics Support', icon: '🚢' },
      { title: 'Flexible MOQ', icon: '📦' },
      { title: 'OEM & Private Label', icon: '🏭' },
      { title: 'Dedicated Support', icon: '👥' },
      { title: 'Long-term Partnerships', icon: '📈' },
      { title: 'Technology Driven', icon: '💻' },
    ],
    
    globalPresence: {
      regions: ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Middle East', 'Oceania'],
      capabilities: ['Import Markets', 'Export Markets', 'International Buyers', 'Global Suppliers', 'Shipping Partners', 'Trade Network'],
    },
    
    certifications: [
      { name: 'ISO 9001:2015', category: 'Quality Management' },
      { name: 'ISO 14001:2015', category: 'Environmental Management' },
      { name: 'APEDA', category: 'Agricultural Products' },
      { name: 'FIEO', category: 'Export Recognition' },
      { name: 'Spices Board', category: 'Spice Products' },
      { name: 'MSME', category: 'Small Business' },
      { name: 'GST Registration', category: 'Tax Compliance' },
      { name: 'Export License', category: 'Legal Authorization' },
    ],
    
    workflow: [
      'Customer Inquiry',
      'Requirement Analysis',
      'Supplier Matching',
      'Quotation',
      'Sample Approval',
      'Purchase Confirmation',
      'Production',
      'Quality Inspection',
      'Packaging',
      'Documentation',
      'International Shipping',
      'Customs Clearance',
      'Final Delivery',
      'Customer Support',
    ],
    
    services: [
      'Global Import',
      'Global Export',
      'Product Sourcing',
      'OEM Manufacturing',
      'Private Label',
      'Contract Manufacturing',
      'Logistics',
      'Inspection',
      'Warehousing',
      'Packaging',
      'Quality Assurance',
      'Documentation',
      'Trade Consulting',
      'Buyer Support',
      'Supplier Support',
    ],
  },
};

// ============================================================================
// CATALOGUE GENERATION SERVICE
// ============================================================================

export class CatalogueGenerationService {
  doc: any;
  pageCount: number;

  constructor() {
    this.doc = null;
    this.pageCount = 0;
  }

  /**
   * Generate complete catalogue PDF
   * @param {Object} options - Generation options
   * @returns {Blob} PDF blob
   */
  async generateCompleteCatalogue(options: Record<string, any> = {}) {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageCount = 0;

    // Generate all pages
    await this.addCoverPage();
    await this.addAboutPage();
    await this.addOurBusinessPage();
    await this.addWhyChooseUsPage();
    await this.addGlobalPresencePage();
    await this.addCertificationsPage();
    await this.addWorkflowPage();
    
    // Add products (if provided)
    if (options.products && options.products.length > 0) {
      await this.addTableOfContents(options.products);
      await this.addProductPages(options.products);
    }

    await this.addServicesPage();

    return this.doc.output('blob');
  }

  /**
   * Generate catalogue for specific category
   */
  async generateCategoryCatalogue(categoryId: any, products = []) {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageCount = 0;

    await this.addCoverPage();
    await this.addCategoryDividerPage(categoryId);
    await this.addProductPages(products);
    await this.addServicesPage();

    return this.doc.output('blob');
  }

  /**
   * Generate customer-specific catalogue
   */
  async generateCustomerCatalogue(customerData: any, selectedProducts = []) {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageCount = 0;

    await this.addCustomerCoverPage(customerData);
    await this.addAboutPage();
    await this.addProductPages(selectedProducts);
    await this.addCustomerInquiryPage(customerData);

    return this.doc.output('blob');
  }

  // =========================================================================
  // PAGE GENERATORS
  // =========================================================================

  async addCoverPage() {
    // Background
    this.doc.setFillColor(26, 71, 42); // Lokaa emerald
    this.doc.rect(0, 0, 210, 297, 'F');

    // World map background (placeholder)
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    
    // Company name
    this.doc.setFontSize(48);
    this.doc.text('LOKAA GLOBAL', 105, 80, { align: 'center' });
    this.doc.text('EXPORTS', 105, 135, { align: 'center' });

    // Headline
    this.doc.setFontSize(24);
    this.doc.text('Global Import & Export Solutions', 105, 160, { align: 'center' });

    // Tagline
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Connecting Global Buyers & Suppliers', 105, 175, { align: 'center' });

    // Contact info
    this.doc.setFontSize(11);
    this.doc.text('www.lokaaexports.com', 105, 210, { align: 'center' });
    this.doc.text('info@lokaaexports.com', 105, 218, { align: 'center' });
    this.doc.text('+91-XXXX-XXXX-XXX', 105, 226, { align: 'center' });

    // Date and version
    this.doc.setFontSize(10);
    const today = new Date().toLocaleDateString();
    this.doc.text(`Generated: ${today}`, 105, 250, { align: 'center' });
    this.doc.text('Catalogue Version 2.1', 105, 258, { align: 'center' });

    this.doc.addPage();
    this.pageCount++;
  }

  async addAboutPage() {
    this.addPageHeader('About Us', 'Who We Are');

    let yPos = 30;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(0, 0, 0);

    const sections = [
      {
        title: 'Our Mission',
        content: catalogueTemplate.metadata.mission,
      },
      {
        title: 'Our Vision',
        content: catalogueTemplate.metadata.vision,
      },
      {
        title: 'About Lokaa Global Exports',
        content: catalogueTemplate.metadata.businessDescription,
      },
    ];

    sections.forEach((section) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.text(section.title, 20, yPos);
      yPos += 8;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(11);
      const lines = this.doc.splitTextToSize(section.content, 170);
      this.doc.text(lines, 20, yPos);
      yPos += lines.length * 5 + 8;

      if (yPos > 270) {
        this.doc.addPage();
        this.pageCount++;
        yPos = 20;
      }
    });

    // Core Values
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Our Core Values', 20, yPos);
    yPos += 10;

    const values = ['Integrity', 'Innovation', 'Quality', 'Reliability', 'Customer Focus', 'Global Collaboration'];
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    let col = 0;
    values.forEach((value) => {
      this.doc.text(`• ${value}`, 20 + col * 85, yPos);
      col++;
      if (col > 1) {
        col = 0;
        yPos += 6;
      }
    });

    this.doc.addPage();
    this.pageCount++;
  }

  async addOurBusinessPage() {
    this.addPageHeader('Our Business', 'Services & Solutions');

    let yPos = 30;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);

    const services = catalogueTemplate.sections.ourBusiness;
    let col = 0;
    
    services.forEach((service, idx) => {
      this.doc.text(`✓ ${service}`, 20 + col * 95, yPos);
      col++;
      
      if (col > 1) {
        col = 0;
        yPos += 8;
      }

      if (yPos > 270) {
        this.doc.addPage();
        this.pageCount++;
        yPos = 20;
      }
    });

    this.doc.addPage();
    this.pageCount++;
  }

  async addWhyChooseUsPage() {
    this.addPageHeader('Why Choose Us', '12 Reasons to Partner With Lokaa');

    let yPos = 30;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);

    const reasons = catalogueTemplate.sections.whyChooseUs;
    let col = 0;

    reasons.forEach((reason) => {
      this.doc.setFillColor(244, 164, 96); // Gold accent
      this.doc.rect(20 + col * 85, yPos - 4, 65, 20, 'F');
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.text(`${reason.icon} ${reason.title}`, 25 + col * 85, yPos + 8, { maxWidth: 55 });

      col++;
      if (col > 1) {
        col = 0;
        yPos += 26;
      }

      if (yPos > 260) {
        this.doc.addPage();
        this.pageCount++;
        yPos = 20;
      }
    });

    this.doc.addPage();
    this.pageCount++;
  }

  async addGlobalPresencePage() {
    this.addPageHeader('Global Presence', 'Serving Markets Worldwide');

    let yPos = 30;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(0, 0, 0);

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Our Regions', 20, yPos);
    yPos += 10;

    const regions = catalogueTemplate.sections.globalPresence.regions;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    regions.forEach((region) => {
      this.doc.text(`• ${region}`, 25, yPos);
      yPos += 6;
    });

    yPos += 5;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Trade Capabilities', 20, yPos);
    yPos += 10;

    const capabilities = catalogueTemplate.sections.globalPresence.capabilities;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);

    capabilities.forEach((capability) => {
      this.doc.text(`• ${capability}`, 25, yPos);
      yPos += 6;
    });

    this.doc.addPage();
    this.pageCount++;
  }

  async addCertificationsPage() {
    this.addPageHeader('Certifications', 'Quality & Compliance');

    let yPos = 30;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    const certs = catalogueTemplate.sections.certifications;
    let col = 0;

    certs.forEach((cert) => {
      // Certificate box
      this.doc.setFillColor(240, 240, 240);
      this.doc.rect(20 + col * 90, yPos - 2, 70, 22, 'F');
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.text(cert.name, 25 + col * 90, yPos + 4);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(cert.category, 25 + col * 90, yPos + 12);

      this.doc.setTextColor(0, 0, 0);
      col++;
      
      if (col > 1) {
        col = 0;
        yPos += 28;
      }

      if (yPos > 260) {
        this.doc.addPage();
        this.pageCount++;
        yPos = 20;
      }
    });

    this.doc.addPage();
    this.pageCount++;
  }

  async addWorkflowPage() {
    this.addPageHeader('Export & Import Workflow', 'Our Process');

    let yPos = 30;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(0, 0, 0);

    const workflow = catalogueTemplate.sections.workflow;
    const stepsPerPage = 14;
    let stepNum = 0;

    workflow.forEach((step, idx) => {
      const xPos = 20 + (stepNum % 2) * 95;
      const yPosition = 30 + Math.floor(stepNum / 2) * 8;

      this.doc.setFillColor(26, 71, 42); // Emerald
      this.doc.circle(xPos + 3, yPosition + 2, 2, 'F');
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${idx + 1}. ${step}`, xPos + 8, yPosition + 3);

      stepNum++;
      
      if (stepNum >= stepsPerPage) {
        this.doc.addPage();
        this.pageCount++;
        stepNum = 0;
      }
    });

    this.doc.addPage();
    this.pageCount++;
  }

  async addTableOfContents(products = []) {
    this.addPageHeader('Table of Contents', 'Products & Categories');

    let yPos = 30;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);

    const categories: Record<string, any[]> = {};
    products.forEach((product, idx) => {
      const category = product.category || 'Others';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ ...product, pageNum: 20 + idx });
    });

    let pageNum = 20;
    Object.entries(categories).forEach(([category, items]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(11);
      this.doc.text(`${category}`, 20, yPos);
      yPos += 6;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      items.forEach((item) => {
        this.doc.text(`  • ${item.name}`, 25, yPos);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(`page ${pageNum}`, 180, yPos, { align: 'right' });
        this.doc.setTextColor(0, 0, 0);
        yPos += 5;
        pageNum++;
      });

      yPos += 3;
      if (yPos > 270) {
        this.doc.addPage();
        this.pageCount++;
        yPos = 20;
      }
    });

    this.doc.addPage();
    this.pageCount++;
  }

  async addProductPages(products = []) {
    products.forEach((product) => {
      this.addProductPage(product);
    });
  }

  addProductPage(product: any) {
    this.addPageHeader(product.name, product.category);

    let yPos = 30;
    const colWidth = 85;

    // Left column - Info
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.text('Product Details', 20, yPos);
    yPos += 8;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(0, 0, 0);

    const details = [
      ['Product Code', product.code],
      ['Category', product.category],
      ['Origin', product.origin],
      ['MOQ', product.moq],
      ['Supply Capacity', product.capacity],
    ];

    details.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label + ':', 20, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value || 'N/A', 50, yPos);
      yPos += 5;
    });

    yPos += 5;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.text('Description', 20, yPos);
    yPos += 6;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    const descLines = this.doc.splitTextToSize(product.description || 'Premium quality product', 170);
    this.doc.text(descLines, 20, yPos);
    yPos += descLines.length * 4 + 5;

    if (product.applications) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Applications:', 20, yPos);
      yPos += 5;
      this.doc.setFont('helvetica', 'normal');
      const appLines = this.doc.splitTextToSize(product.applications, 170);
      this.doc.text(appLines, 20, yPos);
      yPos += appLines.length * 4 + 5;
    }

    // Specifications table
    if (product.specifications) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.text('Specifications', 20, yPos);
      yPos += 6;

      this.doc.setFontSize(8);
      this.doc.setFillColor(240, 240, 240);
      
      const specs = Object.entries(product.specifications);
      specs.forEach(([key, value]) => {
        this.doc.rect(20, yPos - 2, 85, 4, 'F');
        this.doc.text(`${key}: ${value}`, 22, yPos + 1);
        yPos += 5;
      });
    }

    // Add page footer with QR code placeholder
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('For more information: www.lokaaexports.com', 20, 280);

    this.doc.addPage();
    this.pageCount++;
  }

  async addCategoryDividerPage(categoryId: any) {
    this.doc.setFillColor(244, 164, 96); // Gold
    this.doc.rect(0, 0, 210, 80, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(36);
    this.doc.text(categoryId, 105, 50, { align: 'center' });

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.text('Premium Products & Solutions', 105, 90, { align: 'center' });

    this.doc.addPage();
    this.pageCount++;
  }

  async addCustomerCoverPage(customerData: any) {
    this.doc.setFillColor(26, 71, 42);
    this.doc.rect(0, 0, 210, 297, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(36);
    this.doc.text('EXCLUSIVE CATALOGUE', 105, 100, { align: 'center' });
    this.doc.text('FOR', 105, 130, { align: 'center' });

    this.doc.setFontSize(28);
    this.doc.text(customerData.company || 'Valued Customer', 105, 160, { align: 'center' });

    this.doc.setFontSize(12);
    this.doc.setTextColor(244, 164, 96);
    this.doc.text(customerData.country || '', 105, 175, { align: 'center' });

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(11);
    const today = new Date().toLocaleDateString();
    this.doc.text(`Generated: ${today}`, 105, 240, { align: 'center' });

    this.doc.addPage();
    this.pageCount++;
  }

  async addCustomerInquiryPage(customerData: any) {
    this.addPageHeader('Customer Details', 'Quotation Reference');

    let yPos = 30;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);

    const details = [
      ['Company Name', customerData.company],
      ['Contact Person', customerData.contact],
      ['Email', customerData.email],
      ['Country', customerData.country],
      ['RFQ Reference', customerData.rfqRef],
      ['Quote Reference', customerData.quoteRef],
    ];

    details.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, 20, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value || 'N/A', 70, yPos);
      yPos += 8;
    });

    yPos += 10;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.text('Next Steps', 20, yPos);
    yPos += 8;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    const steps = [
      'Review the catalogue carefully',
      'Contact our sales team with specific requirements',
      'Request samples for product evaluation',
      'Discuss pricing and delivery terms',
      'Finalize purchase order and payment terms',
    ];

    steps.forEach((step, idx) => {
      this.doc.text(`${idx + 1}. ${step}`, 25, yPos);
      yPos += 6;
    });
  }

  async addServicesPage() {
    this.addPageHeader('Our Services', 'Complete Solutions');

    let yPos = 30;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);

    const services = catalogueTemplate.sections.services;
    let col = 0;

    services.forEach((service) => {
      this.doc.text(`✓ ${service}`, 20 + col * 95, yPos);
      col++;
      
      if (col > 1) {
        col = 0;
        yPos += 8;
      }

      if (yPos > 270) {
        this.doc.addPage();
        this.pageCount++;
        yPos = 20;
      }
    });
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  addPageHeader(title: any, subtitle: any) {
    // Header background
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(0, 0, 210, 25, 'F');

    // Header line
    this.doc.setDrawColor(26, 71, 42);
    this.doc.setLineWidth(1.5);
    this.doc.line(0, 25, 210, 25);

    // Title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(26, 71, 42);
    this.doc.text(title, 20, 16);

    // Subtitle
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(subtitle, 20, 22);

    // Page number
    this.doc.setFontSize(9);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(`Page ${this.pageCount}`, 200, 16, { align: 'right' });
  }

  addMetadata(metadata: any) {
    this.doc.setProperties({
      title: 'Lokaa Global Exports - Product Catalogue',
      subject: 'Professional International Trade Catalogue',
      author: 'Lokaa Global Exports',
      keywords: `export, import, products, ${metadata.keywords || 'global trade'}`,
      creator: 'Catalogue Generation System',
    });
  }

  /**
   * Get catalogue statistics
   */
  getStatistics() {
    return {
      pages: this.pageCount,
      generated: new Date().toISOString(),
      version: '2.1',
    };
  }
}

// Export singleton instance
export const catalogueService = new CatalogueGenerationService();
