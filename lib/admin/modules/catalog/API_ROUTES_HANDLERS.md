// API Routes for Dynamic Product Management System
// Location: app/api/admin/catalog/

import { verifyAdminAuth } from '@/lib/admin/middleware/auth'
import { hasPermission } from '@/lib/admin/modules/rbac/services/permission.service'
import ProductService from '@/lib/admin/modules/catalog/services/product.service'
import CategoryService from '@/lib/admin/modules/catalog/services/category.service'
import TemplateService from '@/lib/admin/modules/catalog/services/template.service'
import {
  SpecificationService,
  SEOService,
  PackagingService,
  ExportInfoService,
  ImageService,
  CertificationService,
  RFQEnquiryService
} from '@/lib/admin/modules/catalog/services/product-features.service'

// ===== PRODUCTS ROUTES =====

export async function handleProductsRoute(method, body, query, session) {
  if (method === 'GET') {
    // GET /api/admin/catalog/products
    const filters = {
      categoryId: query.categoryId,
      subcategoryId: query.subcategoryId,
      status: query.status,
      search: query.search,
    }
    
    const pagination = {
      limit: parseInt(query.limit) || 50,
      offset: parseInt(query.offset) || 0,
    }

    const result = await ProductService.getAllProducts(filters, pagination)
    return { status: 200, data: result }
  }

  if (method === 'POST') {
    // POST /api/admin/catalog/products
    const result = await ProductService.createProduct(body)
    return result.success 
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'PUT') {
    // PUT /api/admin/catalog/products/:id
    const result = await ProductService.updateProduct(query.id, body)
    return result.success
      ? { status: 200, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'DELETE') {
    // DELETE /api/admin/catalog/products/:id
    const result = await ProductService.deleteProduct(query.id)
    return result.success
      ? { status: 200, data: { message: 'Product deleted' } }
      : { status: 400, error: result.error }
  }
}

// ===== CATEGORIES ROUTES =====

export async function handleCategoriesRoute(method, body, query, session) {
  if (method === 'GET') {
    // GET /api/admin/catalog/categories
    const categories = await CategoryService.getAllCategories()
    return { status: 200, data: categories }
  }

  if (method === 'POST') {
    // POST /api/admin/catalog/categories
    const result = await CategoryService.createCategory(body)
    return result.success
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }
}

// ===== TEMPLATES ROUTES =====

export async function handleTemplatesRoute(method, body, query, session) {
  if (method === 'GET') {
    // GET /api/admin/catalog/templates
    if (query.categoryId) {
      const templates = await TemplateService.getTemplatesByCategory(query.categoryId)
      return { status: 200, data: templates }
    }
    return { status: 400, error: 'categoryId required' }
  }

  if (method === 'POST') {
    // POST /api/admin/catalog/templates
    const result = await TemplateService.createTemplate(body)
    return result.success
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }
}

// ===== SPECIFICATIONS ROUTES =====

export async function handleSpecificationsRoute(method, body, query, session) {
  if (method === 'GET') {
    // GET /api/admin/catalog/specifications?productId=...
    const specs = await SpecificationService.getProductSpecifications(query.productId)
    return { status: 200, data: specs }
  }

  if (method === 'POST') {
    // POST /api/admin/catalog/specifications
    const result = await SpecificationService.addSpecification(body.productId, body)
    return result.success
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'PUT') {
    // PUT /api/admin/catalog/specifications/:id
    const result = await SpecificationService.updateSpecification(query.id, body)
    return result.success
      ? { status: 200, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'DELETE') {
    // DELETE /api/admin/catalog/specifications/:id
    const result = await SpecificationService.deleteSpecification(query.id)
    return result.success
      ? { status: 200, data: { message: 'Specification deleted' } }
      : { status: 400, error: result.error }
  }
}

// ===== IMAGES ROUTES =====

export async function handleImagesRoute(method, body, query, session) {
  if (method === 'GET') {
    // GET /api/admin/catalog/images?productId=...
    const images = await ImageService.getProductImages(query.productId)
    return { status: 200, data: images }
  }

  if (method === 'POST') {
    // POST /api/admin/catalog/images
    const result = await ImageService.addImage(body.productId, body)
    return result.success
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'PUT') {
    // PUT /api/admin/catalog/images/:id
    const result = await ImageService.updateImage(query.id, body)
    return result.success
      ? { status: 200, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'DELETE') {
    // DELETE /api/admin/catalog/images/:id
    const result = await ImageService.deleteImage(query.id)
    return result.success
      ? { status: 200, data: { message: 'Image deleted' } }
      : { status: 400, error: result.error }
  }
}

// ===== PACKAGING ROUTES =====

export async function handlePackagingRoute(method, body, query, session) {
  if (method === 'GET') {
    // GET /api/admin/catalog/packaging?productId=...
    const packaging = await PackagingService.getProductPackaging(query.productId)
    return { status: 200, data: packaging }
  }

  if (method === 'POST') {
    // POST /api/admin/catalog/packaging
    const result = await PackagingService.addPackaging(body.productId, body)
    return result.success
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'PUT') {
    // PUT /api/admin/catalog/packaging/:id
    const result = await PackagingService.updatePackaging(query.id, body)
    return result.success
      ? { status: 200, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'DELETE') {
    // DELETE /api/admin/catalog/packaging/:id
    const result = await PackagingService.deletePackaging(query.id)
    return result.success
      ? { status: 200, data: { message: 'Packaging deleted' } }
      : { status: 400, error: result.error }
  }
}

// ===== SEO ROUTES =====

export async function handleSEORoute(method, body, query, session) {
  if (method === 'GET') {
    // GET /api/admin/catalog/seo?productId=...
    const seo = await SEOService.getProductSEO(query.productId)
    return { status: 200, data: seo }
  }

  if (method === 'POST') {
    // POST /api/admin/catalog/seo
    const result = await SEOService.updateProductSEO(body.productId, body)
    return result.success
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'PUT') {
    // PUT /api/admin/catalog/seo?productId=...
    const result = await SEOService.updateProductSEO(query.productId, body)
    return result.success
      ? { status: 200, data: result.data }
      : { status: 400, error: result.error }
  }
}

// ===== EXPORT INFO ROUTES =====

export async function handleExportInfoRoute(method, body, query, session) {
  if (method === 'GET') {
    // GET /api/admin/catalog/export-info?productId=...
    const info = await ExportInfoService.getExportInfo(query.productId)
    return { status: 200, data: info }
  }

  if (method === 'POST') {
    // POST /api/admin/catalog/export-info
    const result = await ExportInfoService.updateExportInfo(body.productId, body)
    return result.success
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'PUT') {
    // PUT /api/admin/catalog/export-info?productId=...
    const result = await ExportInfoService.updateExportInfo(query.productId, body)
    return result.success
      ? { status: 200, data: result.data }
      : { status: 400, error: result.error }
  }
}

// ===== RFQ ENQUIRY ROUTES =====

export async function handleRFQEnquiryRoute(method, body, query, session) {
  if (method === 'GET') {
    // GET /api/admin/catalog/rfq-enquiries?productId=...
    const enquiries = await RFQEnquiryService.getProductEnquiries(query.productId)
    return { status: 200, data: enquiries }
  }

  if (method === 'POST') {
    // POST /api/admin/catalog/rfq-enquiries (Public)
    const result = await RFQEnquiryService.createEnquiry(body)
    return result.success
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }

  if (method === 'PUT') {
    // PUT /api/admin/catalog/rfq-enquiries/:id/status
    const result = await RFQEnquiryService.updateEnquiryStatus(query.id, body.status)
    return result.success
      ? { status: 200, data: result.data }
      : { status: 400, error: result.error }
  }
}

// ===== PRODUCT ACTIONS =====

export async function handleProductActionsRoute(method, body, query, session) {
  const action = query.action

  if (action === 'publish') {
    // POST /api/admin/catalog/products/:id?action=publish
    const result = await ProductService.publishProduct(query.id)
    return result.success
      ? { status: 200, data: result.data }
      : { status: 400, error: result.error || result.errors }
  }

  if (action === 'duplicate') {
    // POST /api/admin/catalog/products/:id?action=duplicate
    const result = await ProductService.duplicateProduct(query.id)
    return result.success
      ? { status: 201, data: result.data }
      : { status: 400, error: result.error }
  }

  if (action === 'bulk-update-status') {
    // POST /api/admin/catalog/products?action=bulk-update-status
    const result = await ProductService.bulkUpdateStatus(body.productIds, body.status)
    return result.success
      ? { status: 200, data: { updated: result.updated } }
      : { status: 400, error: result.error }
  }

  if (action === 'bulk-delete') {
    // DELETE /api/admin/catalog/products?action=bulk-delete
    const result = await ProductService.bulkDelete(body.productIds)
    return result.success
      ? { status: 200, data: { deleted: result.deleted } }
      : { status: 400, error: result.error }
  }

  if (action === 'search') {
    // GET /api/admin/catalog/products?action=search&q=...
    const products = await ProductService.searchProducts(query.q, 20)
    return { status: 200, data: products }
  }

  if (action === 'stats') {
    // GET /api/admin/catalog/products?action=stats
    const stats = await ProductService.getProductStats()
    return { status: 200, data: stats }
  }

  return { status: 400, error: 'Invalid action' }
}

export {
  handleProductsRoute,
  handleCategoriesRoute,
  handleTemplatesRoute,
  handleSpecificationsRoute,
  handleImagesRoute,
  handlePackagingRoute,
  handleSEORoute,
  handleExportInfoRoute,
  handleRFQEnquiryRoute,
  handleProductActionsRoute
}
