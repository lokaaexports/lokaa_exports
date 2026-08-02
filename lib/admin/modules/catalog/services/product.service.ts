// Dynamic Product Management Service
import prisma from '@/lib/prisma'

export class ProductService {
  // ===== PRODUCT CRUD =====
  
  static async createProduct(data: any) {
    try {
      const baseSlug = this.generateSlug(data.productName)
      let uniqueSlug = baseSlug
      let count = 1
      while (await prisma.dynamicProduct.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${count++}`
      }

      const product = await prisma.dynamicProduct.create({
        data: {
          productName: data.productName,
          slug: uniqueSlug,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId || null,
          templateId: data.templateId,
          description: data.description,
          shortDescription: data.shortDescription,
          exportDescription: data.exportDescription,
          hsnCode: data.hsnCode,
          productType: data.productType,
          status: 'draft',
          mainImage: data.mainImage,
        },
        include: {
          category: true,
          subcategory: true,
          template: true,
        }
      })
      return { success: true, data: product }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getProductById(productId: any) {
    try {
      const product = await prisma.dynamicProduct.findUnique({
        where: { id: productId },
        include: {
          category: true,
          subcategory: true,
          template: {
            include: { fields: { orderBy: { displayOrder: 'asc' } } }
          },
          specifications: { orderBy: { displayOrder: 'asc' } },
          images: { orderBy: { displayOrder: 'asc' } },
          packaging: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
          certifications: true,
          seo: true,
          exportInfo: true,
          documents: { orderBy: { displayOrder: 'asc' } },
          videos: { orderBy: { displayOrder: 'asc' } },
          variants: { orderBy: { displayOrder: 'asc' } },
          relatedProductsFrom: {
            include: { relatedProduct: true },
            orderBy: { displayOrder: 'asc' }
          },
        }
      })
      return product
    } catch (error: any) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  static async getAllProducts(filters: Record<string, any> = {}, pagination: Record<string, any> = { limit: 50, offset: 0 }) {
    try {
      const where: Record<string, any> = {}
      
      if (filters.categoryId) where.categoryId = filters.categoryId
      if (filters.subcategoryId) where.subcategoryId = filters.subcategoryId
      if (filters.status) where.status = filters.status
      if (filters.search) {
        where.OR = [
          { productName: { contains: filters.search } },
          { slug: { contains: filters.search } },
          { hsnCode: { contains: filters.search } },
        ]
      }

      const [products, total] = await Promise.all([
        prisma.dynamicProduct.findMany({
          where,
          include: {
            category: true,
            subcategory: true,
            specifications: true,
          },
          orderBy: { createdAt: 'desc' },
          take: pagination.limit,
          skip: pagination.offset,
        }),
        prisma.dynamicProduct.count({ where })
      ])

      return {
        products,
        pagination: {
          total,
          limit: pagination.limit,
          offset: pagination.offset,
          pages: Math.ceil(total / pagination.limit)
        }
      }
    } catch (error: any) {
      console.error('Error fetching products:', error)
      return { products: [], pagination: { total: 0 } }
    }
  }

  static async updateProduct(productId: any, data: any) {
    try {
      const product = await prisma.dynamicProduct.update({
        where: { id: productId },
        data: {
          productName: data.productName,
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.subcategoryId !== undefined && { subcategoryId: data.subcategoryId || null }),
          description: data.description,
          shortDescription: data.shortDescription,
          exportDescription: data.exportDescription,
          hsnCode: data.hsnCode,
          status: data.status,
          isFeatured: data.isFeatured,
          mainImage: data.mainImage,
          updatedAt: new Date(),
        },
        include: {
          specifications: true,
          images: true,
          packaging: true,
          certifications: true,
          documents: true,
          videos: true,
          variants: true,
        }
      })
      return { success: true, data: product }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async syncSpecifications(productId: string, specifications: any[]) {
    try {
      // Delete existing specifications for this product
      await prisma.productSpecification.deleteMany({
        where: { productId }
      })

      // Insert new specifications
      if (specifications && specifications.length > 0) {
        await prisma.productSpecification.createMany({
          data: specifications.map((s, index) => ({
            productId,
            fieldId: s.fieldId,
            specName: s.specName,
            specValue: String(s.specValue || ''),
            displayOrder: index
          }))
        })
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error syncing specifications:', error)
      return { success: false, error: error.message }
    }
  }

  static async publishProduct(productId: any) {
    try {
      // Validate product before publishing
      const product = await this.getProductById(productId)
      const validation = this.validateProduct(product)
      
      if (!validation.valid) {
        return { success: false, errors: validation.errors }
      }

      const updated = await prisma.dynamicProduct.update({
        where: { id: productId },
        data: {
          status: 'published',
          publishedAt: new Date(),
        },
        include: { category: true, template: true }
      })

      return { success: true, data: updated }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async deleteProduct(productId: any) {
    try {
      await prisma.dynamicProduct.delete({
        where: { id: productId }
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ===== PRODUCT SEARCH & FILTER =====

  static async searchProducts(searchTerm: any, limit = 20) {
    try {
      const products = await prisma.dynamicProduct.findMany({
        where: {
          OR: [
            { productName: { contains: searchTerm } },
            { hsnCode: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
          status: 'published'
        },
        take: limit,
        select: {
          id: true,
          productName: true,
          slug: true,
          mainImage: true,
          hsnCode: true,
        }
      })
      return products
    } catch (error: any) {
      return []
    }
  }

  static async getProductsByCategory(categoryId: any, limit = 50, offset = 0) {
    try {
      const [products, total] = await Promise.all([
        prisma.dynamicProduct.findMany({
          where: { categoryId, status: 'published' },
          include: { category: true, subcategory: true },
          orderBy: { isFeatured: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.dynamicProduct.count({ where: { categoryId, status: 'published' } })
      ])
      return { products, total }
    } catch (error: any) {
      return { products: [], total: 0 }
    }
  }

  // ===== PRODUCT STATISTICS =====

  static async getProductStats() {
    try {
      const [total, published, drafts, featured] = await Promise.all([
        prisma.dynamicProduct.count(),
        prisma.dynamicProduct.count({ where: { status: 'published' } }),
        prisma.dynamicProduct.count({ where: { status: 'draft' } }),
        prisma.dynamicProduct.count({ where: { isFeatured: true } }),
      ])

      return { total, published, drafts, featured }
    } catch (error: any) {
      return { total: 0, published: 0, drafts: 0, featured: 0 }
    }
  }

  // ===== PRODUCT DUPLICATION =====

  static async duplicateProduct(productId: any) {
    try {
      const product = await this.getProductById(productId)
      
      if (!product) {
        return { success: false, error: 'Product not found' }
      }

      // Create duplicate
      const newProduct = await prisma.dynamicProduct.create({
        data: {
          productName: `${product.productName} (Copy)`,
          slug: this.generateSlug(`${product.productName} Copy`),
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId,
          templateId: product.templateId,
          description: product.description,
          shortDescription: product.shortDescription,
          hsnCode: product.hsnCode,
          status: 'draft',
        }
      })

      // Copy specifications
      if (product.specifications && product.specifications.length > 0) {
        await prisma.productSpecification.createMany({
          data: product.specifications.map(spec => ({
            productId: newProduct.id,
            fieldId: spec.fieldId,
            specName: spec.specName,
            specValue: spec.specValue,
            displayOrder: spec.displayOrder,
          }))
        })
      }

      // Copy images
      if (product.images && product.images.length > 0) {
        await prisma.productImage.createMany({
          data: product.images.map(img => ({
            productId: newProduct.id,
            imageUrl: img.imageUrl,
            imageTitle: img.imageTitle,
            altText: img.altText,
            seoDescription: img.seoDescription,
            imageType: img.imageType,
            displayOrder: img.displayOrder,
          }))
        })
      }

      // Copy packaging
      if (product.packaging && product.packaging.length > 0) {
        await prisma.productPackaging.createMany({
          data: product.packaging.map(pkg => ({
            productId: newProduct.id,
            packageType: pkg.packageType,
            weight: pkg.weight,
            unit: pkg.unit,
            quantityAvailable: pkg.quantityAvailable,
            isActive: pkg.isActive,
            displayOrder: pkg.displayOrder,
          }))
        })
      }

      return { success: true, data: newProduct }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ===== BULK OPERATIONS =====

  static async bulkUpdateStatus(productIds: any, status: any) {
    try {
      const result = await prisma.dynamicProduct.updateMany({
        where: { id: { in: productIds } },
        data: { status }
      })
      return { success: true, updated: result.count }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async bulkDelete(productIds: any) {
    try {
      const result = await prisma.dynamicProduct.deleteMany({
        where: { id: { in: productIds } }
      })
      return { success: true, deleted: result.count }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async bulkSetFeatured(productIds: any, isFeatured = true) {
    try {
      const result = await prisma.dynamicProduct.updateMany({
        where: { id: { in: productIds } },
        data: { isFeatured }
      })
      return { success: true, updated: result.count }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ===== VALIDATION =====

  static validateProduct(product: any) {
    const errors = []

    // Required fields
    if (!product.productName) errors.push('Product name is required')
    if (!product.categoryId) errors.push('Category is required')
    if (!product.description) errors.push('Description is required')
    if (!product.hsnCode) errors.push('HSN Code is required')
    if (!product.mainImage) errors.push('Main image is required')

    // Image validation
    if (!product.images || product.images.length === 0) {
      errors.push('At least one image is required')
    }

    // Specification validation
    if (!product.specifications || product.specifications.length < 3) {
      errors.push('At least 3 specifications are required')
    }

    // Packaging validation
    if (!product.packaging || product.packaging.length === 0) {
      errors.push('At least one packaging option is required')
    }



    return {
      valid: errors.length === 0,
      errors
    }
  }

  // ===== UTILITY FUNCTIONS =====

  static generateSlug(text: any) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  static async getProductBySlug(slug: any) {
    try {
      return await prisma.dynamicProduct.findUnique({
        where: { slug },
        include: {
          category: true,
          subcategory: true,
          specifications: true,
          images: true,
          packaging: true,
          certifications: true,
          documents: true,
          videos: true,
          variants: true,
          seo: true,
          exportInfo: true,
          relatedProductsFrom: { include: { relatedProduct: true } },
        }
      })
    } catch (error: any) {
      return null
    }
  }
}

export default ProductService
