# Dynamic Product Management System - Implementation Guide

## Quick Start

### 1. Update Database Schema

Run Prisma migration to create all new tables:

```bash
npx prisma migrate dev --name add_dynamic_product_system
```

### 2. Seed Initial Data

Create categories, subcategories, and templates:

```bash
node -r dotenv/config lib/admin/modules/catalog/seeds/seed-products.js
```

### 3. API Endpoints

#### Products
- `GET /api/admin/catalog/products` - List products
- `POST /api/admin/catalog/products` - Create product
- `PUT /api/admin/catalog/products/:id` - Update product
- `DELETE /api/admin/catalog/products/:id` - Delete product
- `POST /api/admin/catalog/products/:id?action=publish` - Publish product
- `POST /api/admin/catalog/products/:id?action=duplicate` - Duplicate product
- `GET /api/admin/catalog/products?action=stats` - Product statistics
- `GET /api/admin/catalog/products?action=search&q=...` - Search products

#### Categories
- `GET /api/admin/catalog/categories` - List categories
- `POST /api/admin/catalog/categories` - Create category

#### Subcategories
- `GET /api/admin/catalog/subcategories?categoryId=...` - List subcategories
- `POST /api/admin/catalog/subcategories` - Create subcategory

#### Templates
- `GET /api/admin/catalog/templates?categoryId=...` - Get templates by category
- `POST /api/admin/catalog/templates` - Create template
- `GET /api/admin/catalog/templates/:id/schema` - Get form schema

#### Specifications
- `GET /api/admin/catalog/specifications?productId=...` - List specs
- `POST /api/admin/catalog/specifications` - Add specification
- `PUT /api/admin/catalog/specifications/:id` - Update specification
- `DELETE /api/admin/catalog/specifications/:id` - Delete specification

#### Images
- `GET /api/admin/catalog/images?productId=...` - List images
- `POST /api/admin/catalog/images` - Add image
- `PUT /api/admin/catalog/images/:id` - Update image
- `DELETE /api/admin/catalog/images/:id` - Delete image

#### Packaging
- `GET /api/admin/catalog/packaging?productId=...` - List packaging
- `POST /api/admin/catalog/packaging` - Add packaging
- `PUT /api/admin/catalog/packaging/:id` - Update packaging
- `DELETE /api/admin/catalog/packaging/:id` - Delete packaging

#### Certifications
- `GET /api/admin/catalog/certifications?productId=...` - List certifications
- `POST /api/admin/catalog/certifications` - Add certification
- `PUT /api/admin/catalog/certifications/:id` - Update certification
- `DELETE /api/admin/catalog/certifications/:id` - Delete certification

#### SEO
- `GET /api/admin/catalog/seo?productId=...` - Get SEO data
- `POST /api/admin/catalog/seo` - Create/Update SEO
- `PUT /api/admin/catalog/seo?productId=...` - Update SEO

#### Export Info
- `GET /api/admin/catalog/export-info?productId=...` - Get export info
- `POST /api/admin/catalog/export-info` - Create/Update export info
- `PUT /api/admin/catalog/export-info?productId=...` - Update export info

#### RFQ Enquiries
- `GET /api/admin/catalog/rfq-enquiries?productId=...` - List enquiries
- `POST /api/admin/catalog/rfq-enquiries` - Create enquiry (public)
- `PUT /api/admin/catalog/rfq-enquiries/:id/status` - Update status

---

## Database Schema

### Tables Created

1. **ProductCategory** - Product categories (Agriculture, Machinery, etc.)
2. **ProductSubcategory** - Subcategories per category
3. **ProductTemplate** - Dynamic form templates
4. **ProductTemplateField** - Template fields with validation
5. **DynamicProduct** - Master product table
6. **ProductSpecification** - Dynamic specifications
7. **ProductImage** - Product images (main, gallery, packaging, certificate)
8. **ProductPackaging** - Packaging options
9. **ProductCertification** - Certifications (ISO, HACCP, etc.)
10. **ProductSEO** - SEO metadata
11. **ProductExportInfo** - Export countries and details
12. **RFQEnquiry** - Customer enquiries

---

## Key Features

### 1. Dynamic Template Engine

```javascript
// Get template for category
const template = await TemplateService.getTemplatesByCategory(categoryId)

// Render dynamic form based on template fields
// Fields auto-adjust based on category selection
```

### 2. Product Creation

```javascript
// Create product with dynamic fields
const product = await ProductService.createProduct({
  productName: 'Dehydrated Onion',
  categoryId: 'cat_1',
  subcategoryId: 'subcat_1',
  templateId: 'tmpl_1',
  description: '...',
  hsnCode: '07031010',
  mainImage: 'url_to_image'
})

// Add specifications (dynamic based on template)
await SpecificationService.addSpecification(product.id, {
  specName: 'Size',
  specValue: '30mm-70mm diameter'
})

// Add images
await ImageService.addImage(product.id, {
  imageUrl: 'url',
  imageType: 'gallery'
})

// Add packaging options
await PackagingService.addPackaging(product.id, {
  packageType: 'Mesh Bag',
  weight: 50,
  quantityAvailable: 1000
})

// Add certifications
await CertificationService.addCertification(product.id, {
  certName: 'ISO 9001',
  certNumber: '123456'
})

// Configure export info
await ExportInfoService.updateExportInfo(product.id, {
  exportCountries: ['US', 'UK', 'DE'],
  availabilityStatus: 'year_round',
  moq: 100,
  leadTimeDays: 30,
  incoterms: 'FOB'
})

// Auto-generate SEO
const seoData = await SEOService.autoGenerateSEO(product)
await SEOService.updateProductSEO(product.id, seoData)

// Publish product
await ProductService.publishProduct(product.id)
```

### 3. Form Validation

```javascript
// All required fields validated before publishing
const validation = ProductService.validateProduct(product)

if (!validation.valid) {
  console.log(validation.errors)
  // Errors array contains missing requirements
}
```

### 4. Search & Filter

```javascript
// Search by product name, HSN code, or description
const results = await ProductService.searchProducts('onion', 20)

// Filter by category, subcategory, or status
const products = await ProductService.getAllProducts({
  categoryId: 'cat_1',
  subcategoryId: 'subcat_1',
  status: 'published',
  search: 'onion'
}, { limit: 50, offset: 0 })
```

### 5. Bulk Operations

```javascript
// Bulk update status
await ProductService.bulkUpdateStatus(productIds, 'published')

// Bulk set featured
await ProductService.bulkSetFeatured(productIds, true)

// Bulk delete
await ProductService.bulkDelete(productIds)
```

### 6. Product Duplication

```javascript
// Clone product with all specifications, images, packaging
const duplicate = await ProductService.duplicateProduct(productId)
// Returns new product with "(Copy)" suffix
```

### 7. RFQ Integration

```javascript
// Customer submits enquiry from product page
await RFQEnquiryService.createEnquiry({
  productId: 'prod_1',
  buyerName: 'John Doe',
  companyName: 'ABC Corp',
  country: 'US',
  email: 'john@example.com',
  phone: '+1234567890',
  requiredQuantity: 500,
  unit: 'kg',
  message: 'Enquiry message',
  documentUrl: 'url_to_requirement_doc'
})

// Admin views and manages enquiries
const enquiries = await RFQEnquiryService.getProductEnquiries(productId)

// Update enquiry status
await RFQEnquiryService.updateEnquiryStatus(enquiryId, 'quoted')
```

---

## Permissions Required

Add these permissions to your RBAC system:

```javascript
const permissions = [
  { slug: 'products:create_advanced', module: 'products', action: 'create_advanced' },
  { slug: 'products:read_advanced', module: 'products', action: 'read_advanced' },
  { slug: 'products:update_advanced', module: 'products', action: 'update_advanced' },
  { slug: 'products:delete_advanced', module: 'products', action: 'delete_advanced' },
  { slug: 'products:publish', module: 'products', action: 'publish' },
  { slug: 'categories:manage', module: 'products', action: 'manage_categories' },
  { slug: 'templates:manage', module: 'products', action: 'manage_templates' },
  { slug: 'rfq:manage', module: 'products', action: 'manage_rfq' },
]
```

---

## File Structure

```
lib/admin/modules/catalog/
├── services/
│   ├── product.service.js
│   ├── category.service.js
│   ├── template.service.js
│   └── product-features.service.js
├── seeds/
│   └── seed-products.js
├── DYNAMIC_PRODUCT_SYSTEM.md (this file)
├── API_ROUTES_HANDLERS.md
└── README.md

app/api/admin/catalog/
├── products/
│   └── route.js
├── categories/
│   └── route.js
├── templates/
│   └── route.js
├── specifications/
│   └── route.js
├── images/
│   └── route.js
├── packaging/
│   └── route.js
├── certifications/
│   └── route.js
├── seo/
│   └── route.js
├── export-info/
│   └── route.js
└── rfq-enquiries/
    └── route.js

components/admin/catalog/
├── ProductForm.jsx
├── CategorySelector.jsx
├── TemplateSelector.jsx
├── SpecificationBuilder.jsx
├── ImageUploader.jsx
├── PackagingManager.jsx
├── CertificationManager.jsx
├── SEOEditor.jsx
├── ExportInfoEditor.jsx
└── ProductPreview.jsx
```

---

## Next Steps

1. ✅ Database schema created
2. ✅ Service layer implemented
3. ⏳ API routes (create in app/api/admin/catalog/)
4. ⏳ Admin UI components
5. ⏳ Website product page generator
6. ⏳ PDF catalogue generator
7. ⏳ AI integration

---

## Scalability

The system supports:
- ✅ Unlimited products
- ✅ Multiple categories
- ✅ Custom templates per category
- ✅ Dynamic field generation
- ✅ Bulk operations
- ✅ Full-text search
- ✅ Indexed queries

Database optimizations:
- Indexed on productId, categoryId, status
- Lazy loading for images
- Pagination on all list endpoints
- Caching ready for Redis integration

---

## Support

For issues or questions, refer to:
- `DYNAMIC_PRODUCT_SYSTEM.md` - Architecture overview
- `API_ROUTES_HANDLERS.md` - API endpoint documentation
- Individual service files - Implementation details

