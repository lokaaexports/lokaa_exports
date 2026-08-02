# 🚀 Dynamic Product Management System - Quick Start Guide

## Phase 1: API Routes Setup ✅ COMPLETE

All API routes have been created and are ready to use.

### Available Endpoints

**Products Management:**
- `GET /api/admin/catalog/products` - List products
- `POST /api/admin/catalog/products` - Create product
- `PUT /api/admin/catalog/products?id=...` - Update product
- `DELETE /api/admin/catalog/products?id=...` - Delete product
- `POST /api/admin/catalog/products/:id?action=publish` - Publish
- `POST /api/admin/catalog/products?action=bulk-update-status` - Bulk update
- `DELETE /api/admin/catalog/products?action=bulk-delete` - Bulk delete
- `GET /api/admin/catalog/products?action=stats` - Statistics
- `GET /api/admin/catalog/products?action=search&q=...` - Search

**Categories:**
- `GET /api/admin/catalog/categories` - List all
- `POST /api/admin/catalog/categories` - Create
- `PUT /api/admin/catalog/categories?id=...` - Update
- `DELETE /api/admin/catalog/categories?id=...` - Delete

**Subcategories:**
- `GET /api/admin/catalog/subcategories?categoryId=...` - List
- `POST /api/admin/catalog/subcategories` - Create
- `PUT /api/admin/catalog/subcategories?id=...` - Update
- `DELETE /api/admin/catalog/subcategories?id=...` - Delete

**Templates:**
- `GET /api/admin/catalog/templates?categoryId=...` - List
- `POST /api/admin/catalog/templates` - Create
- `PUT /api/admin/catalog/templates?id=...` - Update
- `DELETE /api/admin/catalog/templates?id=...` - Delete

**Template Fields:**
- `GET /api/admin/catalog/template-fields?templateId=...` - Get fields
- `POST /api/admin/catalog/template-fields` - Add field
- `PUT /api/admin/catalog/template-fields?id=...` - Update field
- `PUT /api/admin/catalog/template-fields?action=reorder` - Reorder fields
- `DELETE /api/admin/catalog/template-fields?id=...` - Delete field

**Specifications:**
- `GET /api/admin/catalog/specifications?productId=...` - List
- `POST /api/admin/catalog/specifications` - Add
- `PUT /api/admin/catalog/specifications?id=...` - Update
- `DELETE /api/admin/catalog/specifications?id=...` - Delete

**Images:**
- `GET /api/admin/catalog/images?productId=...` - List
- `POST /api/admin/catalog/images` - Add
- `PUT /api/admin/catalog/images?id=...` - Update
- `DELETE /api/admin/catalog/images?id=...` - Delete

**Packaging:**
- `GET /api/admin/catalog/packaging?productId=...` - List
- `POST /api/admin/catalog/packaging` - Add
- `PUT /api/admin/catalog/packaging?id=...` - Update
- `DELETE /api/admin/catalog/packaging?id=...` - Delete

**Certifications:**
- `GET /api/admin/catalog/certifications?productId=...` - List
- `POST /api/admin/catalog/certifications` - Add
- `PUT /api/admin/catalog/certifications?id=...` - Update
- `DELETE /api/admin/catalog/certifications?id=...` - Delete

**SEO:**
- `GET /api/admin/catalog/seo?productId=...` - Get SEO
- `POST /api/admin/catalog/seo` - Create/Update
- `PUT /api/admin/catalog/seo?productId=...` - Update

**Export Info:**
- `GET /api/admin/catalog/export-info?productId=...` - Get info
- `POST /api/admin/catalog/export-info` - Create/Update
- `PUT /api/admin/catalog/export-info?productId=...` - Update

**RFQ Enquiries:**
- `GET /api/admin/catalog/rfq-enquiries?productId=...` - List (admin only)
- `POST /api/admin/catalog/rfq-enquiries` - Create enquiry (public)
- `PUT /api/admin/catalog/rfq-enquiries?id=...` - Update status (admin)

---

## Phase 2: Database Setup

### Run Prisma Migration

```bash
npx prisma migrate dev --name add_dynamic_product_system
```

This creates all 12 tables with proper indexes.

### Seed Initial Data

```bash
node -r dotenv/config lib/admin/modules/catalog/seeds/seed-products.js
```

This creates:
- 5 categories (Agriculture, Machinery, Electronics, Textiles, Food)
- 13 subcategories
- 3 pre-configured templates with fields

---

## Phase 3: Testing API Routes

### Test Categories Endpoint

```bash
curl http://localhost:3004/api/admin/catalog/categories
```

### Test Templates Endpoint

```bash
curl http://localhost:3004/api/admin/catalog/templates?categoryId=cat_1
```

### Test Create Product

```bash
curl -X POST http://localhost:3004/api/admin/catalog/products \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Test Product",
    "categoryId": "cat_1",
    "subcategoryId": "subcat_1",
    "templateId": "tmpl_1",
    "description": "Test description",
    "hsnCode": "07031010"
  }'
```

---

## Phase 4: Next Steps

### 1. Create Admin Dashboard Components
- CategorySelector
- SubcategorySelector
- TemplateSelector
- DynamicFormGenerator
- ProductList
- ProductDetail
- SpecificationBuilder
- ImageUploader
- PackagingManager

### 2. Build Product Pages
- Auto-generate `/products/[category]/[subcategory]/[slug]/page.js`
- Display all product details
- Add RFQ enquiry form

### 3. Implement PDF Catalogue
- Generate PDFs per category
- Email functionality
- Download link on product page

### 4. Setup Notifications
- Email notifications for RFQ
- WhatsApp integration
- Admin dashboard alerts

---

## File Structure

```
lib/admin/modules/catalog/
├── services/
│   ├── product.service.js ✅
│   ├── category.service.js ✅
│   ├── template.service.js ✅
│   └── product-features.service.js ✅
├── seeds/
│   └── seed-products.js ✅
├── README.md ✅
├── IMPLEMENTATION_GUIDE.md ✅
├── DYNAMIC_PRODUCT_SYSTEM.md ✅
└── API_ROUTES_HANDLERS.md ✅

app/api/admin/catalog/
├── products/route.js ✅
├── categories/route.js ✅
├── subcategories/route.js ✅
├── templates/route.js ✅
├── template-fields/route.js ✅
├── specifications/route.js ✅
├── images/route.js ✅
├── packaging/route.js ✅
├── certifications/route.js ✅
├── seo/route.js ✅
├── export-info/route.js ✅
└── rfq-enquiries/route.js ✅
```

---

## Status Summary

| Component | Status |
|-----------|--------|
| Database Schema | ✅ Ready |
| Service Layer | ✅ Complete |
| API Routes | ✅ Complete |
| Seeding Script | ✅ Ready |
| Admin UI | ⏳ Next |
| Website Pages | ⏳ Planned |
| PDF Export | ⏳ Planned |
| Notifications | ⏳ Planned |

---

## Common Issues & Solutions

### Issue: API returns 401 Unauthorized
**Solution**: Make sure you're authenticated. The APIs require admin authentication via the `verifyAdminAuth` middleware.

### Issue: Database tables not created
**Solution**: Run the Prisma migration: `npx prisma migrate dev --name add_dynamic_product_system`

### Issue: Services return empty data
**Solution**: Seed the database first: `node -r dotenv/config lib/admin/modules/catalog/seeds/seed-products.js`

---

## Quick Reference

### Create a complete product workflow:

```javascript
// 1. Get template
const templates = await fetch('/api/admin/catalog/templates?categoryId=cat_1')

// 2. Create product
const product = await fetch('/api/admin/catalog/products', {
  method: 'POST',
  body: JSON.stringify({
    productName: 'Test',
    categoryId: 'cat_1',
    templateId: 'tmpl_1',
    description: 'Test'
  })
})

// 3. Add specifications
await fetch('/api/admin/catalog/specifications', {
  method: 'POST',
  body: JSON.stringify({
    productId: product.id,
    specName: 'Size',
    specValue: '30mm'
  })
})

// 4. Publish
await fetch(`/api/admin/catalog/products/${product.id}?action=publish`, {
  method: 'POST'
})
```

---

**System Ready for Phase 3: Admin UI Development** 🎉

