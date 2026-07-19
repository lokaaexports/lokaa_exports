// Template Service - Manages Product Templates & Dynamic Fields
import prisma from '@/lib/prisma'

export class TemplateService {
  // ===== TEMPLATE CRUD =====

  static async createTemplate(data) {
    try {
      const template = await prisma.productTemplate.create({
        data: {
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          name: data.name,
          slug: this.generateSlug(data.name),
          description: data.description,
          isActive: true,
          fieldCount: 0,
        }
      })
      return { success: true, data: template }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getTemplateById(templateId) {
    try {
      return await prisma.productTemplate.findUnique({
        where: { id: templateId },
        include: {
          category: true,
          subcategory: true,
          fields: { orderBy: { displayOrder: 'asc' } },
        }
      })
    } catch (error) {
      return null
    }
  }

  static async getTemplatesByCategory(categoryId) {
    try {
      return await prisma.productTemplate.findMany({
        where: { categoryId, isActive: true },
        include: {
          fields: { orderBy: { displayOrder: 'asc' } }
        },
        orderBy: { displayOrder: 'asc' }
      })
    } catch (error) {
      return []
    }
  }

  static async getTemplatesBySubcategory(subcategoryId) {
    try {
      return await prisma.productTemplate.findMany({
        where: { subcategoryId, isActive: true },
        include: {
          fields: { orderBy: { displayOrder: 'asc' } }
        }
      })
    } catch (error) {
      return []
    }
  }

  static async updateTemplate(templateId, data) {
    try {
      const template = await prisma.productTemplate.update({
        where: { id: templateId },
        data: {
          name: data.name,
          description: data.description,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
        include: { fields: true }
      })
      return { success: true, data: template }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async deleteTemplate(templateId) {
    try {
      await prisma.productTemplate.delete({
        where: { id: templateId }
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ===== TEMPLATE FIELDS =====

  static async addTemplateField(templateId, fieldData) {
    try {
      // Get current field count
      const template = await prisma.productTemplate.findUnique({
        where: { id: templateId },
        select: { fieldCount: true }
      })

      const field = await prisma.productTemplateField.create({
        data: {
          templateId: templateId,
          fieldName: fieldData.fieldName,
          fieldLabel: fieldData.fieldLabel,
          fieldType: fieldData.fieldType,
          isRequired: fieldData.isRequired || false,
          displayOrder: fieldData.displayOrder || template.fieldCount + 1,
          placeholder: fieldData.placeholder,
          helpText: fieldData.helpText,
          validationRules: fieldData.validationRules,
          defaultValue: fieldData.defaultValue,
          options: fieldData.options,
        }
      })

      // Update field count
      await prisma.productTemplate.update({
        where: { id: templateId },
        data: { fieldCount: template.fieldCount + 1 }
      })

      return { success: true, data: field }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async updateTemplateField(fieldId, fieldData) {
    try {
      const field = await prisma.productTemplateField.update({
        where: { id: fieldId },
        data: {
          fieldName: fieldData.fieldName,
          fieldLabel: fieldData.fieldLabel,
          fieldType: fieldData.fieldType,
          isRequired: fieldData.isRequired,
          placeholder: fieldData.placeholder,
          helpText: fieldData.helpText,
          validationRules: fieldData.validationRules,
          defaultValue: fieldData.defaultValue,
          options: fieldData.options,
          displayOrder: fieldData.displayOrder,
        }
      })
      return { success: true, data: field }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async deleteTemplateField(fieldId) {
    try {
      const field = await prisma.productTemplateField.findUnique({
        where: { id: fieldId }
      })

      await prisma.productTemplateField.delete({
        where: { id: fieldId }
      })

      // Decrement field count
      await prisma.productTemplate.update({
        where: { id: field.templateId },
        data: { fieldCount: { decrement: 1 } }
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async reorderTemplateFields(templateId, fieldOrder) {
    try {
      // fieldOrder is array of { fieldId, displayOrder }
      for (const item of fieldOrder) {
        await prisma.productTemplateField.update({
          where: { id: item.fieldId },
          data: { displayOrder: item.displayOrder }
        })
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  static async getTemplateFormSchema(templateId) {
    try {
      const template = await prisma.productTemplate.findUnique({
        where: { id: templateId },
        include: {
          fields: { orderBy: { displayOrder: 'asc' } }
        }
      })

      if (!template) {
        return { success: false, error: 'Template not found' }
      }

      // Generate form schema
      const schema = {
        templateId: template.id,
        templateName: template.name,
        fields: template.fields.map(field => ({
          id: field.id,
          name: field.fieldName,
          label: field.fieldLabel,
          type: field.fieldType,
          required: field.isRequired,
          order: field.displayOrder,
          placeholder: field.placeholder,
          help: field.helpText,
          validation: field.validationRules ? JSON.parse(field.validationRules) : null,
          default: field.defaultValue,
          options: field.options ? JSON.parse(field.options) : null,
        }))
      }

      return { success: true, data: schema }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ===== PREDEFINED TEMPLATES =====

  static async createPredefinedTemplates(categoryId) {
    const templates = {
      'Agriculture': this.getAgricultureTemplate(),
      'Machinery': this.getMachineryTemplate(),
      'Electronics': this.getElectronicsTemplate(),
    }

    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId }
    })

    const templateName = category.name

    if (templates[templateName]) {
      const template = await this.createTemplate({
        categoryId,
        name: `${templateName} Product Template`,
        description: `Standard template for ${templateName} products`,
      })

      if (template.success) {
        for (const field of templates[templateName]) {
          await this.addTemplateField(template.data.id, field)
        }
      }

      return template
    }

    return { success: false, error: 'No template for this category' }
  }

  static getAgricultureTemplate() {
    return [
      { fieldName: 'botanical_name', fieldLabel: 'Botanical Name', fieldType: 'TEXT', isRequired: false, displayOrder: 1 },
      { fieldName: 'variety', fieldLabel: 'Variety', fieldType: 'TEXT', isRequired: true, displayOrder: 2 },
      { fieldName: 'origin_country', fieldLabel: 'Origin Country', fieldType: 'DROPDOWN', isRequired: true, displayOrder: 3 },
      { fieldName: 'size', fieldLabel: 'Size', fieldType: 'TEXT', isRequired: true, displayOrder: 4, placeholder: 'e.g., 30mm-70mm' },
      { fieldName: 'grade', fieldLabel: 'Grade', fieldType: 'DROPDOWN', isRequired: false, displayOrder: 5 },
      { fieldName: 'color', fieldLabel: 'Color', fieldType: 'DROPDOWN', isRequired: false, displayOrder: 6 },
      { fieldName: 'shape', fieldLabel: 'Shape', fieldType: 'TEXT', isRequired: false, displayOrder: 7 },
      { fieldName: 'taste', fieldLabel: 'Taste', fieldType: 'TEXT', isRequired: false, displayOrder: 8 },
      { fieldName: 'texture', fieldLabel: 'Texture', fieldType: 'TEXT', isRequired: false, displayOrder: 9 },
      { fieldName: 'moisture_content', fieldLabel: 'Moisture Content (%)', fieldType: 'NUMBER', isRequired: false, displayOrder: 10 },
      { fieldName: 'purity', fieldLabel: 'Purity (%)', fieldType: 'NUMBER', isRequired: false, displayOrder: 11 },
      { fieldName: 'shelf_life', fieldLabel: 'Shelf Life', fieldType: 'TEXT', isRequired: true, displayOrder: 12, placeholder: 'e.g., 30-60 days' },
      { fieldName: 'storage_temperature', fieldLabel: 'Storage Temperature', fieldType: 'TEXT', isRequired: false, displayOrder: 13 },
      { fieldName: 'storage_condition', fieldLabel: 'Storage Condition', fieldType: 'TEXT', isRequired: false, displayOrder: 14 },
    ]
  }

  static getMachineryTemplate() {
    return [
      { fieldName: 'model_number', fieldLabel: 'Model Number', fieldType: 'TEXT', isRequired: true, displayOrder: 1 },
      { fieldName: 'machine_type', fieldLabel: 'Machine Type', fieldType: 'TEXT', isRequired: true, displayOrder: 2 },
      { fieldName: 'application', fieldLabel: 'Application', fieldType: 'TEXTAREA', isRequired: true, displayOrder: 3 },
      { fieldName: 'production_capacity', fieldLabel: 'Production Capacity', fieldType: 'TEXT', isRequired: false, displayOrder: 4 },
      { fieldName: 'power_requirement', fieldLabel: 'Power Requirement (kW)', fieldType: 'NUMBER', isRequired: false, displayOrder: 5 },
      { fieldName: 'voltage', fieldLabel: 'Voltage (V)', fieldType: 'NUMBER', isRequired: false, displayOrder: 6 },
      { fieldName: 'automation_level', fieldLabel: 'Automation Level', fieldType: 'DROPDOWN', isRequired: false, displayOrder: 7 },
      { fieldName: 'material_used', fieldLabel: 'Material Used', fieldType: 'TEXT', isRequired: false, displayOrder: 8 },
      { fieldName: 'dimensions', fieldLabel: 'Dimensions (L×W×H)', fieldType: 'TEXT', isRequired: false, displayOrder: 9 },
      { fieldName: 'weight', fieldLabel: 'Weight (kg)', fieldType: 'NUMBER', isRequired: false, displayOrder: 10 },
      { fieldName: 'warranty_years', fieldLabel: 'Warranty (Years)', fieldType: 'NUMBER', isRequired: false, displayOrder: 11 },
      { fieldName: 'country_origin', fieldLabel: 'Country of Origin', fieldType: 'DROPDOWN', isRequired: false, displayOrder: 12 },
    ]
  }

  static getElectronicsTemplate() {
    return [
      { fieldName: 'model', fieldLabel: 'Product Model', fieldType: 'TEXT', isRequired: true, displayOrder: 1 },
      { fieldName: 'technology', fieldLabel: 'Technology', fieldType: 'TEXT', isRequired: true, displayOrder: 2 },
      { fieldName: 'input_voltage', fieldLabel: 'Input Voltage (V)', fieldType: 'NUMBER', isRequired: false, displayOrder: 3 },
      { fieldName: 'power_consumption', fieldLabel: 'Power Consumption (W)', fieldType: 'NUMBER', isRequired: false, displayOrder: 4 },
      { fieldName: 'operating_temp', fieldLabel: 'Operating Temperature Range', fieldType: 'TEXT', isRequired: false, displayOrder: 5 },
      { fieldName: 'connectivity', fieldLabel: 'Connectivity Type', fieldType: 'DROPDOWN', isRequired: false, displayOrder: 6 },
      { fieldName: 'communication_protocol', fieldLabel: 'Communication Protocol', fieldType: 'TEXT', isRequired: false, displayOrder: 7 },
      { fieldName: 'application', fieldLabel: 'Application Area', fieldType: 'TEXT', isRequired: true, displayOrder: 8 },
      { fieldName: 'certification', fieldLabel: 'Certification Type', fieldType: 'DROPDOWN', isRequired: false, displayOrder: 9 },
      { fieldName: 'warranty_months', fieldLabel: 'Warranty (Months)', fieldType: 'NUMBER', isRequired: false, displayOrder: 10 },
    ]
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

export default TemplateService
