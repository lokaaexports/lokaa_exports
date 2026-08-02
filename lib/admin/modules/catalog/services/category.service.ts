// Category Service - Manages Product Categories & Subcategories
import prisma from '@/lib/prisma'

export class CategoryService {
  // ===== CATEGORY CRUD =====

  static async createCategory(data: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      return []
    }
  }

  static async getCategoryById(categoryId: any) {
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
    } catch (error: any) {
      return null
    }
  }

  static async updateCategory(categoryId: any, data: any) {
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
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async deleteCategory(categoryId: any) {
    try {
      await prisma.productCategory.delete({
        where: { id: categoryId }
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // ===== SUBCATEGORY CRUD =====

  static async createSubcategory(data: any) {
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
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getSubcategoriesByCategory(categoryId: any) {
    try {
      return await prisma.productSubcategory.findMany({
        where: { categoryId, status: 'active' },
        orderBy: { displayOrder: 'asc' }
      })
    } catch (error: any) {
      return []
    }
  }

  static async getSubcategoryById(subcategoryId: any) {
    try {
      return await prisma.productSubcategory.findUnique({
        where: { id: subcategoryId },
        include: {
          category: true,
          templates: true,
        }
      })
    } catch (error: any) {
      return null
    }
  }

  static async updateSubcategory(subcategoryId: any, data: any) {
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
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async deleteSubcategory(subcategoryId: any) {
    try {
      await prisma.productSubcategory.delete({
        where: { id: subcategoryId }
      })
      return { success: true }
    } catch (error: any) {
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
    } catch (error: any) {
      return []
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
}

export default CategoryService
