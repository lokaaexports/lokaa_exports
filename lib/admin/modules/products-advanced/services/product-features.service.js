// Specification Service - Manages Product Specifications
import prisma from '@/lib/prisma'

export class SpecificationService {
  static async addSpecification(productId, specData) {
    try {
      const spec = await prisma.productSpecification.create({
        data: {
          productId: productId,
          fieldId: specData.fieldId,
          specName: specData.specName,
          specValue: specData.specValue,
          displayOrder: specData.displayOrder || 0,
        }
      })
      return { success: true, data: spec }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async updateSpecification(specId, specData) {
    try {
      const spec = await prisma.productSpecification.update({
        where: { id: specId },
        data: {
          specName: specData.specName,
          specValue: specData.specValue,
          displayOrder: specData.displayOrder,
        }
      })
      return { success: true, data: spec }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async deleteSpecification(specId) {
    try {
      await prisma.productSpecification.delete({
        where: { id: specId }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getProductSpecifications(productId) {
    try {
      return await prisma.productSpecification.findMany({
        where: { productId },
        orderBy: { displayOrder: 'asc' }
      })
    } catch (error) {
      return []
    }
  }

  static async reorderSpecifications(specifications) {
    try {
      for (const spec of specifications) {
        await prisma.productSpecification.update({
          where: { id: spec.id },
          data: { displayOrder: spec.displayOrder }
        })
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// SEO Service - Manages Product SEO
export class SEOService {
  static async createProductSEO(productId, seoData) {
    try {
      const seo = await prisma.productSEO.create({
        data: {
          productId: productId,
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
          metaKeywords: seoData.metaKeywords,
          schemaMarkup: seoData.schemaMarkup,
          ogImage: seoData.ogImage,
          ogDescription: seoData.ogDescription,
        }
      })
      return { success: true, data: seo }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async updateProductSEO(productId, seoData) {
    try {
      const seo = await prisma.productSEO.upsert({
        where: { productId: productId },
        create: {
          productId: productId,
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
          metaKeywords: seoData.metaKeywords,
          schemaMarkup: seoData.schemaMarkup,
          ogImage: seoData.ogImage,
          ogDescription: seoData.ogDescription,
        },
        update: {
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
          metaKeywords: seoData.metaKeywords,
          schemaMarkup: seoData.schemaMarkup,
          ogImage: seoData.ogImage,
          ogDescription: seoData.ogDescription,
        }
      })
      return { success: true, data: seo }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async autoGenerateSEO(product) {
    try {
      const metaTitle = `${product.productName} - Premium Export Quality | Lokaa Global Exports`
      const metaDescription = product.shortDescription || product.description?.substring(0, 160)
      const metaKeywords = [
        product.productName,
        product.category?.name,
        'export',
        'buy',
        'wholesale'
      ].join(', ')

      const schemaMarkup = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.productName,
        'description': product.description,
        'image': product.mainImage,
        'brand': {
          '@type': 'Brand',
          'name': 'Lokaa Global Exports'
        }
      }

      return {
        metaTitle,
        metaDescription,
        metaKeywords,
        schemaMarkup: JSON.stringify(schemaMarkup),
      }
    } catch (error) {
      return null
    }
  }

  static async getProductSEO(productId) {
    try {
      return await prisma.productSEO.findUnique({
        where: { productId }
      })
    } catch (error) {
      return null
    }
  }
}

// Packaging Service - Manages Product Packaging
export class PackagingService {
  static async addPackaging(productId, pkgData) {
    try {
      const pkg = await prisma.productPackaging.create({
        data: {
          productId: productId,
          packageType: pkgData.packageType,
          weight: pkgData.weight,
          unit: pkgData.unit || 'kg',
          quantityAvailable: pkgData.quantityAvailable,
          isActive: true,
          displayOrder: pkgData.displayOrder || 0,
        }
      })
      return { success: true, data: pkg }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async updatePackaging(packageId, pkgData) {
    try {
      const pkg = await prisma.productPackaging.update({
        where: { id: packageId },
        data: {
          packageType: pkgData.packageType,
          weight: pkgData.weight,
          unit: pkgData.unit,
          quantityAvailable: pkgData.quantityAvailable,
          isActive: pkgData.isActive,
          displayOrder: pkgData.displayOrder,
        }
      })
      return { success: true, data: pkg }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async deletePackaging(packageId) {
    try {
      await prisma.productPackaging.delete({
        where: { id: packageId }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getProductPackaging(productId) {
    try {
      return await prisma.productPackaging.findMany({
        where: { productId, isActive: true },
        orderBy: { displayOrder: 'asc' }
      })
    } catch (error) {
      return []
    }
  }
}

// Export Info Service - Manages Export Information
export class ExportInfoService {
  static async createExportInfo(productId, exportData) {
    try {
      const exportInfo = await prisma.productExportInfo.create({
        data: {
          productId: productId,
          exportCountries: JSON.stringify(exportData.exportCountries || []),
          availabilityStatus: exportData.availabilityStatus || 'year_round',
          season: exportData.season,
          moq: exportData.moq,
          leadTimeDays: exportData.leadTimeDays,
          incoterms: exportData.incoterms || 'FOB',
        }
      })
      return { success: true, data: exportInfo }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async updateExportInfo(productId, exportData) {
    try {
      const exportInfo = await prisma.productExportInfo.upsert({
        where: { productId: productId },
        create: {
          productId: productId,
          exportCountries: JSON.stringify(exportData.exportCountries || []),
          availabilityStatus: exportData.availabilityStatus || 'year_round',
          season: exportData.season,
          moq: exportData.moq,
          leadTimeDays: exportData.leadTimeDays,
          incoterms: exportData.incoterms || 'FOB',
        },
        update: {
          exportCountries: JSON.stringify(exportData.exportCountries || []),
          availabilityStatus: exportData.availabilityStatus,
          season: exportData.season,
          moq: exportData.moq,
          leadTimeDays: exportData.leadTimeDays,
          incoterms: exportData.incoterms,
        }
      })
      return { success: true, data: exportInfo }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getExportInfo(productId) {
    try {
      const info = await prisma.productExportInfo.findUnique({
        where: { productId }
      })
      if (info) {
        info.exportCountries = JSON.parse(info.exportCountries)
      }
      return info
    } catch (error) {
      return null
    }
  }
}

// Image Service - Manages Product Images
export class ImageService {
  static async addImage(productId, imageData) {
    try {
      const image = await prisma.productImage.create({
        data: {
          productId: productId,
          imageUrl: imageData.imageUrl,
          imageTitle: imageData.imageTitle,
          altText: imageData.altText,
          seoDescription: imageData.seoDescription,
          imageType: imageData.imageType || 'gallery',
          displayOrder: imageData.displayOrder || 0,
        }
      })
      return { success: true, data: image }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async updateImage(imageId, imageData) {
    try {
      const image = await prisma.productImage.update({
        where: { id: imageId },
        data: {
          imageTitle: imageData.imageTitle,
          altText: imageData.altText,
          seoDescription: imageData.seoDescription,
          imageType: imageData.imageType,
          displayOrder: imageData.displayOrder,
        }
      })
      return { success: true, data: image }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async deleteImage(imageId) {
    try {
      await prisma.productImage.delete({
        where: { id: imageId }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getProductImages(productId) {
    try {
      return await prisma.productImage.findMany({
        where: { productId },
        orderBy: { displayOrder: 'asc' }
      })
    } catch (error) {
      return []
    }
  }
}

// Certification Service - Manages Product Certifications
export class CertificationService {
  static async addCertification(productId, certData) {
    try {
      const cert = await prisma.productCertification.create({
        data: {
          productId: productId,
          certName: certData.certName,
          certNumber: certData.certNumber,
          certImage: certData.certImage,
          issueDate: certData.issueDate,
          expiryDate: certData.expiryDate,
        }
      })
      return { success: true, data: cert }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async updateCertification(certId, certData) {
    try {
      const cert = await prisma.productCertification.update({
        where: { id: certId },
        data: {
          certName: certData.certName,
          certNumber: certData.certNumber,
          certImage: certData.certImage,
          issueDate: certData.issueDate,
          expiryDate: certData.expiryDate,
        }
      })
      return { success: true, data: cert }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async deleteCertification(certId) {
    try {
      await prisma.productCertification.delete({
        where: { id: certId }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getProductCertifications(productId) {
    try {
      return await prisma.productCertification.findMany({
        where: { productId }
      })
    } catch (error) {
      return []
    }
  }
}

// RFQ Service - Manages RFQ Enquiries
export class RFQEnquiryService {
  static async createEnquiry(enquiryData) {
    try {
      const enquiry = await prisma.rfqEnquiry.create({
        data: {
          reference: enquiryData.reference || undefined, // Will auto-generate if not provided
          productId: enquiryData.productId || null,
          
          // Contact Information
          buyerName: enquiryData.buyerName || enquiryData.fullName || '',
          companyName: enquiryData.companyName || enquiryData.company || null,
          email: enquiryData.email || '',
          phone: enquiryData.phone || '',
          country: enquiryData.country || '',
          
          // Product & Requirement Details
          productInterest: enquiryData.productInterest || null,
          requiredQuantity: enquiryData.requiredQuantity ? parseInt(enquiryData.requiredQuantity) : null,
          quantity: enquiryData.quantity || null,
          unit: enquiryData.unit || 'kg',
          packaging: enquiryData.packaging || null,
          
          // Logistics Information
          incoterms: enquiryData.incoterms || 'CIF',
          targetPort: enquiryData.targetPort || null,
          targetPrice: enquiryData.targetPrice || null,
          preferredCurrency: enquiryData.preferredCurrency || 'USD',
          shipmentDate: enquiryData.shipmentDate || null,
          
          // Additional Information
          customSpecifications: enquiryData.customSpecifications || null,
          message: enquiryData.message || null,
          documentUrl: enquiryData.documentUrl || null,
          attachments: enquiryData.attachments ? JSON.stringify(enquiryData.attachments) : null,
          sourcePage: enquiryData.sourcePage || null,
          
          // Metadata
          status: 'new',
          priority: enquiryData.priority || 'normal',
        }
      })
      return { success: true, data: enquiry }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getAllEnquiries(filters = {}) {
    try {
      const where = {}
      if (filters.status) where.status = filters.status
      if (filters.country) where.country = filters.country
      if (filters.priority) where.priority = filters.priority
      if (filters.productId) where.productId = filters.productId
      if (filters.search) {
        where.OR = [
          { buyerName: { contains: filters.search } },
          { companyName: { contains: filters.search } },
          { email: { contains: filters.search } },
          { productInterest: { contains: filters.search } }
        ]
      }

      return await prisma.rfqEnquiry.findMany({
        where,
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 100,
        skip: filters.skip || 0
      })
    } catch (error) {
      return []
    }
  }

  static async getProductEnquiries(productId) {
    try {
      return await prisma.rfqEnquiry.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      return []
    }
  }

  static async getEnquiryById(enquiryId) {
    try {
      return await prisma.rfqEnquiry.findUnique({
        where: { id: enquiryId },
        include: { product: true }
      })
    } catch (error) {
      return null
    }
  }

  static async updateEnquiryStatus(enquiryId, status) {
    try {
      const enquiry = await prisma.rfqEnquiry.update({
        where: { id: enquiryId },
        data: { status }
      })
      return { success: true, data: enquiry }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async updateEnquiry(enquiryId, updateData) {
    try {
      const enquiry = await prisma.rfqEnquiry.update({
        where: { id: enquiryId },
        data: updateData,
        include: { product: true }
      })
      return { success: true, data: enquiry }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

