// lib/admin/modules/products/services/product.service.js
// Product Management Service

import prisma from '@/lib/prisma'

export class ProductService {
  // Get all products
  static async getAllProducts(filters = {}, pagination = {}) {
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
  static async getProductById(productId) {
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
  static async createProduct(data, createdByUserId) {
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
  static async updateProduct(productId, data) {
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
  static async deleteProduct(productId) {
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
}

export class CategoryService {
  // Get all categories
  static async getAllCategories(filters = {}) {
    const where = {
      companyId: 1,
      ...(filters.parent && { parentId: filters.parent })
    }

    return await prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: true,
        products: true
      },
      orderBy: { name: 'asc' }
    })
  }

  // Get category by ID
  static async getCategoryById(categoryId) {
    return await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: true,
        children: true,
        products: true
      }
    })
  }

  // Create category
  static async createCategory(data) {
    const { name, description, parentId } = data

    return await prisma.category.create({
      data: {
        name,
        description,
        parentId: parentId || null,
        companyId: 1
      },
      include: { parent: true }
    })
  }

  // Update category
  static async updateCategory(categoryId, data) {
    const { name, description } = data

    return await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        updatedAt: new Date()
      },
      include: { parent: true }
    })
  }

  // Delete category
  static async deleteCategory(categoryId) {
    return await prisma.category.delete({
      where: { id: categoryId }
    })
  }
}

export class VariantService {
  // Get product variants
  static async getProductVariants(productId) {
    return await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { displayOrder: 'asc' }
    })
  }

  // Create variant
  static async createVariant(data) {
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
  static async updateVariant(variantId, data) {
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
  static async deleteVariant(variantId) {
    // Delete variant images
    await prisma.productImage.deleteMany({
      where: { variantId }
    })

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
