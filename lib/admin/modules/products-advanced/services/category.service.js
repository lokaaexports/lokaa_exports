// Category Service - Manages Product Categories & Subcategories
import prisma from '@/lib/prisma'

export class CategoryService {
  // ===== CATEGORY CRUD =====

  static async createCategory(data) {
    try {
      const category = await prisma.productCategory.create({
        data: {
          name: data.name,
          slug: this.generateSlug(data.name),
          description: data.description,
          image: data.image,
          status: 'active',
        }
      })
      return { success: true, data: category }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getAllCategories() {
    try {
      const categories = await prisma.productCategory.findMany({
        where: { status: 'active' },
        include: {
          subcategories: { where: { status: 'active' } },
          templates: { where: { isActive: true } },
        },
        orderBy: { displayOrder: 'asc' }
      })
      return categories
    } catch (error) {
      return []
    }
  }

  static async getCategoryById(categoryId) {
    try {
      return await prisma.productCategory.findUnique({
        where: { id: categoryId },
        include: {
          subcategories: { orderBy: { displayOrder: 'asc' } },
          templates: true,
          products: {
            where: { status: 'published' },
            select: {
              id: true,
              productName: true,
              slug: true,
              mainImage: true,
            }
          }
        }
      })
    } catch (error) {
      return null
    }
  }

  static async updateCategory(categoryId, data) {
    try {
      const category = await prisma.productCategory.update({
        where: { id: categoryId },
        data: {
          name: data.name,
          description: data.description,
          image: data.image,
          status: data.status,
          displayOrder: data.displayOrder,
        }
      })
      return { success: true, data: category }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async deleteCategory(categoryId) {
    try {
      await prisma.productCategory.delete({
        where: { id: categoryId }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ===== SUBCATEGORY CRUD =====

  static async createSubcategory(data) {
    try {
      const subcategory = await prisma.productSubcategory.create({
        data: {
          categoryId: data.categoryId,
          name: data.name,
          slug: this.generateSlug(data.name),
          description: data.description,
          status: 'active',
        }
      })
      return { success: true, data: subcategory }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getSubcategoriesByCategory(categoryId) {
    try {
      return await prisma.productSubcategory.findMany({
        where: { categoryId, status: 'active' },
        orderBy: { displayOrder: 'asc' }
      })
    } catch (error) {
      return []
    }
  }

  static async getSubcategoryById(subcategoryId) {
    try {
      return await prisma.productSubcategory.findUnique({
        where: { id: subcategoryId },
        include: {
          category: true,
          templates: true,
        }
      })
    } catch (error) {
      return null
    }
  }

  static async updateSubcategory(subcategoryId, data) {
    try {
      const subcategory = await prisma.productSubcategory.update({
        where: { id: subcategoryId },
        data: {
          name: data.name,
          description: data.description,
          status: data.status,
          displayOrder: data.displayOrder,
        }
      })
      return { success: true, data: subcategory }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async deleteSubcategory(subcategoryId) {
    try {
      await prisma.productSubcategory.delete({
        where: { id: subcategoryId }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ===== STATISTICS =====

  static async getCategoryStats() {
    try {
      const categories = await prisma.productCategory.findMany({
        include: {
          subcategories: true,
          products: true,
        }
      })

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        totalSubcategories: cat.subcategories.length,
        totalProducts: cat.products.length,
      }))
    } catch (error) {
      return []
    }
  }

  // ===== UTILITY FUNCTIONS =====

  static generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

export default CategoryService
