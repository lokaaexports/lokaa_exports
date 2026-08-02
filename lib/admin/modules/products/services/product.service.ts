// lib/admin/modules/products/services/product.service.js
// Product Management Service

import prisma from '@/lib/prisma'

export class ProductService {
  // Get all products
  static async getAllProducts(filters: Record<string, any> = {}, pagination: Record<string, any> = {}) {
    const { limit = 50, offset = 0 } = pagination
    const where = {
      ...(filters.search && {
        OR: [
          { productName: { contains: filters.search } },
          { slug: { contains: filters.search } },
          { description: { contains: filters.search } }
        ]
      }),
      ...(filters.category && { categoryId: filters.category }),
      ...(filters.status && { status: filters.status })
    }

    const [data, total] = await Promise.all([
      prisma.dynamicProduct.findMany({
        where,
        include: {
          category: true,
          subcategory: true,
          template: true,
          variants: true,
          images: true,
          documents: true
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.dynamicProduct.count({ where })
    ])

    return {
      data,
      pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
    }
  }

  // Get product by ID
  static async getProductById(productId: any) {
    return await prisma.dynamicProduct.findUnique({
      where: { id: productId },
      include: {
        category: true,
        subcategory: true,
        template: true,
        specifications: { orderBy: { displayOrder: 'asc' } },
        images: true,
        packaging: true,
        certifications: true,
        documents: true,
        variants: true,
        seo: true,
        exportInfo: true
      }
    })
  }

  // Create product
  static async createProduct(data: any, createdByUserId: any) {
    const { productName, slug, categoryId, subcategoryId, templateId, description, shortDescription, exportDescription, hsnCode, productType, status = 'draft', mainImage } = data

    const existingSlug = await prisma.dynamicProduct.findFirst({ where: { slug: slug || this.generateSlug(productName) } })
    if (existingSlug) throw new Error('Slug already exists')

    return await prisma.dynamicProduct.create({
      data: {
        productName,
        slug: slug || this.generateSlug(productName),
        categoryId,
        subcategoryId: subcategoryId || null,
        templateId,
        description,
        shortDescription: shortDescription || null,
        exportDescription: exportDescription || null,
        hsnCode: hsnCode || null,
        productType: productType || null,
        status,
        mainImage: mainImage || null
      },
      include: { category: true }
    })
  }

  // Update product
  static async updateProduct(productId: any, data: any) {
    const { productName, description, shortDescription, exportDescription, hsnCode, status, isFeatured, categoryId, subcategoryId, templateId, mainImage } = data

    return await prisma.dynamicProduct.update({
      where: { id: productId },
      data: {
        ...(productName && { productName }),
        ...(description && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(exportDescription !== undefined && { exportDescription }),
        ...(hsnCode !== undefined && { hsnCode }),
        ...(status && { status }),
        ...(typeof isFeatured === 'boolean' && { isFeatured }),
        ...(categoryId && { categoryId }),
        ...(subcategoryId !== undefined && { subcategoryId }),
        ...(templateId && { templateId }),
        ...(mainImage !== undefined && { mainImage })
      },
      include: { category: true }
    })
  }

  // Get product statistics
  static async getProductStats() {
    const [total, active, lowStock, categories] = await Promise.all([
      prisma.dynamicProduct.count(),
      prisma.dynamicProduct.count({ where: { status: 'published' } }),
      prisma.dynamicProduct.count({ where: { isFeatured: true } }),
      prisma.dynamicProduct.groupBy({
        by: ['categoryId'],
        _count: true
      })
    ])

    return {
      totalProducts: total,
      activeProducts: active,
      lowStockProducts: lowStock,
      byCategory: categories
    }
  }

  // Delete product
  static async deleteProduct(productId: any) {
    // Delete related records
    await Promise.all([
      prisma.productVariant.deleteMany({ where: { productId } }),
      prisma.productImage.deleteMany({ where: { productId } }),
      prisma.productDocument.deleteMany({ where: { productId } }),
      prisma.productPackaging.deleteMany({ where: { productId } }),
      prisma.productCertification.deleteMany({ where: { productId } }),
      prisma.productSEO.deleteMany({ where: { productId } }),
      prisma.productExportInfo.deleteMany({ where: { productId } }),
      prisma.productSpecification.deleteMany({ where: { productId } }),
      prisma.productVideo.deleteMany({ where: { productId } }),
      prisma.productRelatedProduct.deleteMany({ where: { OR: [{ productId }, { relatedProductId: productId }] } })
    ])

    return await prisma.dynamicProduct.delete({
      where: { id: productId }
    })
  }

  static generateSlug(text: string) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

export class CategoryService {
  static async getAllCategories(filters: Record<string, any> = {}) {
    const where = {}

    return await prisma.productCategory.findMany({
      where,
      include: {
        products: true
      },
      orderBy: { name: 'asc' }
    })
  }

  // Get category by ID
  static async getCategoryById(categoryId: any) {
    return await prisma.productCategory.findUnique({
      where: { id: categoryId },
      include: {
        products: true
      }
    })
  }

  static async createCategory(data: any) {
    const { name, description } = data
    const slug = ProductService.generateSlug(name)

    return await prisma.productCategory.create({
      data: {
        name,
        slug,
        description
      }
    })
  }

  // Update category
  static async updateCategory(categoryId: any, data: any) {
    const { name, description } = data

    return await prisma.productCategory.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(description && { description })
      }
    })
  }

  // Delete category
  static async deleteCategory(categoryId: any) {
    return await prisma.productCategory.delete({
      where: { id: categoryId }
    })
  }
}

export class VariantService {
  // Get product variants
  static async getProductVariants(productId: any) {
    return await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { displayOrder: 'asc' }
    })
  }

  // Create variant
  static async createVariant(data: any) {
    const { productId, name, sku, price, stock } = data

    return await prisma.productVariant.create({
      data: {
        productId,
        variantName: name,
        sku,
        price: price !== undefined ? parseFloat(price) : null,
        moq: stock !== undefined ? parseInt(stock) : null
      }
    })
  }

  // Update variant
  static async updateVariant(variantId: any, data: any) {
    const { name, sku, price, stock } = data

    return await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(name && { variantName: name }),
        ...(sku && { sku }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { moq: parseInt(stock) })
      }
    })
  }

  // Delete variant
  static async deleteVariant(variantId: any) {

    return await prisma.productVariant.delete({
      where: { id: variantId }
    })
  }
}

export default {
  ProductService,
  CategoryService,
  VariantService
}
