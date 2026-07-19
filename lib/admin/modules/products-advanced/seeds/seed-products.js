// Seeding Script for Dynamic Product Management System
// Usage: node -r dotenv/config lib/admin/modules/products-advanced/seeds/seed-products.js

import prisma from '@/lib/prisma'
import CategoryService from '../services/category.service'
import TemplateService from '../services/template.service'

async function seedProductSystem() {
  console.log('🌱 Starting Dynamic Product System Seeding...\n')

  try {
    // ===== SEED CATEGORIES =====
    console.log('📁 Creating Categories...')
    
    const categories = [
      {
        name: 'Agriculture',
        slug: 'agriculture',
        description: 'Fresh agricultural products including vegetables, fruits, grains, and spices'
      },
      {
        name: 'Machinery',
        slug: 'machinery',
        description: 'Industrial and agricultural machinery for various applications'
      },
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic components, IoT products, and industrial electronics'
      },
      {
        name: 'Textiles',
        slug: 'textiles',
        description: 'Textile fabrics, garments, and textile products'
      },
      {
        name: 'Food Products',
        slug: 'food-products',
        description: 'Processed and packaged food items'
      },
    ]

    const createdCategories = []
    for (const cat of categories) {
      const existing = await prisma.productCategory.findUnique({
        where: { slug: cat.slug }
      })
      
      if (!existing) {
        const created = await prisma.productCategory.create({
          data: { ...cat, status: 'active' }
        })
        createdCategories.push(created)
        console.log(`  ✅ Created: ${cat.name}`)
      } else {
        createdCategories.push(existing)
        console.log(`  ⏭️  Already exists: ${cat.name}`)
      }
    }

    // ===== SEED SUBCATEGORIES =====
    console.log('\n📂 Creating Subcategories...')

    const subcategories = [
      // Agriculture
      { categorySlug: 'agriculture', name: 'Vegetables', slug: 'vegetables' },
      { categorySlug: 'agriculture', name: 'Fruits', slug: 'fruits' },
      { categorySlug: 'agriculture', name: 'Spices', slug: 'spices' },
      { categorySlug: 'agriculture', name: 'Grains & Pulses', slug: 'grains-pulses' },
      
      // Machinery
      { categorySlug: 'machinery', name: 'Food Processing Machinery', slug: 'food-processing' },
      { categorySlug: 'machinery', name: 'Packaging Machinery', slug: 'packaging' },
      { categorySlug: 'machinery', name: 'Agricultural Equipment', slug: 'agricultural-equipment' },
      
      // Electronics
      { categorySlug: 'electronics', name: 'IoT Devices', slug: 'iot-devices' },
      { categorySlug: 'electronics', name: 'Electronic Components', slug: 'components' },
      
      // Textiles
      { categorySlug: 'textiles', name: 'Fabrics', slug: 'fabrics' },
      { categorySlug: 'textiles', name: 'Garments', slug: 'garments' },
      
      // Food
      { categorySlug: 'food-products', name: 'Snacks', slug: 'snacks' },
      { categorySlug: 'food-products', name: 'Beverages', slug: 'beverages' },
    ]

    for (const subcat of subcategories) {
      const category = createdCategories.find(c => c.slug === subcat.categorySlug)
      if (category) {
        const existing = await prisma.productSubcategory.findFirst({
          where: {
            categoryId: category.id,
            slug: subcat.slug
          }
        })
        
        if (!existing) {
          await prisma.productSubcategory.create({
            data: {
              categoryId: category.id,
              name: subcat.name,
              slug: subcat.slug,
              status: 'active'
            }
          })
          console.log(`  ✅ Created: ${subcat.name}`)
        } else {
          console.log(`  ⏭️  Already exists: ${subcat.name}`)
        }
      }
    }

    // ===== SEED TEMPLATES =====
    console.log('\n🎨 Creating Product Templates...')

    // Agriculture Template
    const agricultureCat = createdCategories.find(c => c.slug === 'agriculture')
    if (agricultureCat) {
      const agricTemplate = await prisma.productTemplate.findFirst({
        where: { categoryId: agricultureCat.id, name: 'Fresh Agriculture Template' }
      })
      
      if (!agricTemplate) {
        const template = await prisma.productTemplate.create({
          data: {
            categoryId: agricultureCat.id,
            name: 'Fresh Agriculture Template',
            slug: 'fresh-agriculture',
            description: 'Template for fresh agricultural products',
            isActive: true,
            fieldCount: 0
          }
        })

        const fields = [
          { fieldName: 'botanical_name', fieldLabel: 'Botanical Name', fieldType: 'TEXT', isRequired: false, displayOrder: 1 },
          { fieldName: 'variety', fieldLabel: 'Variety', fieldType: 'TEXT', isRequired: true, displayOrder: 2 },
          { fieldName: 'origin_country', fieldLabel: 'Origin Country', fieldType: 'DROPDOWN', isRequired: true, displayOrder: 3 },
          { fieldName: 'size', fieldLabel: 'Size', fieldType: 'TEXT', isRequired: true, displayOrder: 4, placeholder: '30mm-70mm' },
          { fieldName: 'grade', fieldLabel: 'Grade', fieldType: 'DROPDOWN', isRequired: false, displayOrder: 5 },
          { fieldName: 'color', fieldLabel: 'Color', fieldType: 'TEXT', isRequired: false, displayOrder: 6 },
          { fieldName: 'moisture_content', fieldLabel: 'Moisture Content (%)', fieldType: 'NUMBER', isRequired: false, displayOrder: 7 },
          { fieldName: 'purity', fieldLabel: 'Purity (%)', fieldType: 'NUMBER', isRequired: false, displayOrder: 8 },
          { fieldName: 'shelf_life', fieldLabel: 'Shelf Life', fieldType: 'TEXT', isRequired: true, displayOrder: 9, placeholder: '30-60 days' },
          { fieldName: 'storage_condition', fieldLabel: 'Storage Condition', fieldType: 'TEXT', isRequired: false, displayOrder: 10 },
        ]

        for (const field of fields) {
          await prisma.productTemplateField.create({
            data: {
              templateId: template.id,
              fieldName: field.fieldName,
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              isRequired: field.isRequired,
              displayOrder: field.displayOrder,
              placeholder: field.placeholder,
            }
          })
        }

        await prisma.productTemplate.update({
          where: { id: template.id },
          data: { fieldCount: fields.length }
        })

        console.log(`  ✅ Created: Fresh Agriculture Template`)
      } else {
        console.log(`  ⏭️  Already exists: Fresh Agriculture Template`)
      }
    }

    // Machinery Template
    const machineryCat = createdCategories.find(c => c.slug === 'machinery')
    if (machineryCat) {
      const machineryTemplate = await prisma.productTemplate.findFirst({
        where: { categoryId: machineryCat.id, name: 'Industrial Machinery Template' }
      })
      
      if (!machineryTemplate) {
        const template = await prisma.productTemplate.create({
          data: {
            categoryId: machineryCat.id,
            name: 'Industrial Machinery Template',
            slug: 'industrial-machinery',
            description: 'Template for industrial machinery products',
            isActive: true,
            fieldCount: 0
          }
        })

        const fields = [
          { fieldName: 'model_number', fieldLabel: 'Model Number', fieldType: 'TEXT', isRequired: true, displayOrder: 1 },
          { fieldName: 'machine_type', fieldLabel: 'Machine Type', fieldType: 'TEXT', isRequired: true, displayOrder: 2 },
          { fieldName: 'application', fieldLabel: 'Application', fieldType: 'TEXTAREA', isRequired: true, displayOrder: 3 },
          { fieldName: 'production_capacity', fieldLabel: 'Production Capacity', fieldType: 'TEXT', isRequired: false, displayOrder: 4 },
          { fieldName: 'power_requirement', fieldLabel: 'Power Requirement (kW)', fieldType: 'NUMBER', isRequired: false, displayOrder: 5 },
          { fieldName: 'voltage', fieldLabel: 'Voltage (V)', fieldType: 'NUMBER', isRequired: false, displayOrder: 6 },
          { fieldName: 'material_used', fieldLabel: 'Material Used', fieldType: 'TEXT', isRequired: false, displayOrder: 7 },
          { fieldName: 'dimensions', fieldLabel: 'Dimensions (L×W×H)', fieldType: 'TEXT', isRequired: false, displayOrder: 8 },
          { fieldName: 'weight', fieldLabel: 'Weight (kg)', fieldType: 'NUMBER', isRequired: false, displayOrder: 9 },
          { fieldName: 'warranty_years', fieldLabel: 'Warranty (Years)', fieldType: 'NUMBER', isRequired: false, displayOrder: 10 },
        ]

        for (const field of fields) {
          await prisma.productTemplateField.create({
            data: {
              templateId: template.id,
              fieldName: field.fieldName,
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              isRequired: field.isRequired,
              displayOrder: field.displayOrder,
              placeholder: field.placeholder,
            }
          })
        }

        await prisma.productTemplate.update({
          where: { id: template.id },
          data: { fieldCount: fields.length }
        })

        console.log(`  ✅ Created: Industrial Machinery Template`)
      } else {
        console.log(`  ⏭️  Already exists: Industrial Machinery Template`)
      }
    }

    // Electronics Template
    const electronicsCat = createdCategories.find(c => c.slug === 'electronics')
    if (electronicsCat) {
      const electronicsTemplate = await prisma.productTemplate.findFirst({
        where: { categoryId: electronicsCat.id, name: 'Electronics Template' }
      })
      
      if (!electronicsTemplate) {
        const template = await prisma.productTemplate.create({
          data: {
            categoryId: electronicsCat.id,
            name: 'Electronics Template',
            slug: 'electronics',
            description: 'Template for electronic products',
            isActive: true,
            fieldCount: 0
          }
        })

        const fields = [
          { fieldName: 'model', fieldLabel: 'Product Model', fieldType: 'TEXT', isRequired: true, displayOrder: 1 },
          { fieldName: 'technology', fieldLabel: 'Technology', fieldType: 'TEXT', isRequired: true, displayOrder: 2 },
          { fieldName: 'input_voltage', fieldLabel: 'Input Voltage (V)', fieldType: 'NUMBER', isRequired: false, displayOrder: 3 },
          { fieldName: 'power_consumption', fieldLabel: 'Power Consumption (W)', fieldType: 'NUMBER', isRequired: false, displayOrder: 4 },
          { fieldName: 'operating_temp', fieldLabel: 'Operating Temperature Range', fieldType: 'TEXT', isRequired: false, displayOrder: 5 },
          { fieldName: 'connectivity', fieldLabel: 'Connectivity Type', fieldType: 'TEXT', isRequired: false, displayOrder: 6 },
          { fieldName: 'application', fieldLabel: 'Application Area', fieldType: 'TEXT', isRequired: true, displayOrder: 7 },
          { fieldName: 'certification', fieldLabel: 'Certification Type', fieldType: 'TEXT', isRequired: false, displayOrder: 8 },
          { fieldName: 'warranty_months', fieldLabel: 'Warranty (Months)', fieldType: 'NUMBER', isRequired: false, displayOrder: 9 },
        ]

        for (const field of fields) {
          await prisma.productTemplateField.create({
            data: {
              templateId: template.id,
              fieldName: field.fieldName,
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              isRequired: field.isRequired,
              displayOrder: field.displayOrder,
              placeholder: field.placeholder,
            }
          })
        }

        await prisma.productTemplate.update({
          where: { id: template.id },
          data: { fieldCount: fields.length }
        })

        console.log(`  ✅ Created: Electronics Template`)
      } else {
        console.log(`  ⏭️  Already exists: Electronics Template`)
      }
    }

    console.log('\n✅ Product System Seeding Completed Successfully!\n')
    console.log('📊 Summary:')
    console.log(`  - Categories: ${createdCategories.length}`)
    console.log(`  - Templates created for: Agriculture, Machinery, Electronics`)
    console.log(`  - Ready to create products using dynamic templates\n`)

  } catch (error) {
    console.error('❌ Seeding Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding
seedProductSystem().catch(err => {
  console.error(err)
  process.exit(1)
})
