# 🚀 Dynamic Product Management System - Quick Start Guide

## Phase 1: API Routes Setup ✅ COMPLETE

All API routes have been created and are ready to use.

### Available Endpoints

**Products Management:**
- `GET /api/admin/products-advanced/products` - List products
- `POST /api/admin/products-advanced/products` - Create product
- `PUT /api/admin/products-advanced/products?id=...` - Update product
- `DELETE /api/admin/products-advanced/products?id=...` - Delete product
- `POST /api/admin/products-advanced/products/:id?action=publish` - Publish
- `POST /api/admin/products-advanced/products?action=bulk-update-status` - Bulk update
- `DELETE /api/admin/products-advanced/products?action=bulk-delete` - Bulk delete
- `GET /api/admin/products-advanced/products?action=stats` - Statistics
- `GET /api/admin/products-advanced/products?action=search&q=...` - Search

**Categories:**
- `GET /api/admin/products-advanced/categories` - List all
- `POST /api/admin/products-advanced/categories` - Create
- `PUT /api/admin/products-advanced/categories?id=...` - Update
- `DELETE /api/admin/products-advanced/categories?id=...` - Delete

**Subcategories:**
- `GET /api/admin/products-advanced/subcategories?categoryId=...` - List
- `POST /api/admin/products-advanced/subcategories` - Create
- `PUT /api/admin/products-advanced/subcategories?id=...` - Update
- `DELETE /api/admin/products-advanced/subcategories?id=...` - Delete

**Templates:**
- `GET /api/admin/products-advanced/templates?categoryId=...` - List
- `POST /api/admin/products-advanced/templates` - Create
- `PUT /api/admin/products-advanced/templates?id=...` - Update
- `DELETE /api/admin/products-advanced/templates?id=...` - Delete

**Template Fields:**
- `GET /api/admin/products-advanced/template-fields?templateId=...` - Get fields
- `POST /api/admin/products-advanced/template-fields` - Add field
- `PUT /api/admin/products-advanced/template-fields?id=...` - Update field
- `PUT /api/admin/products-advanced/template-fields?action=reorder` - Reorder fields
- `DELETE /api/admin/products-advanced/template-fields?id=...` - Delete field

**Specifications:**
- `GET /api/admin/products-advanced/specifications?productId=...` - List
- `POST /api/admin/products-advanced/specifications` - Add
- `PUT /api/admin/products-advanced/specifications?id=...` - Update
- `DELETE /api/admin/products-advanced/specifications?id=...` - Delete

**Images:**
- `GET /api/admin/products-advanced/images?productId=...` - List
- `POST /api/admin/products-advanced/images` - Add
- `PUT /api/admin/products-advanced/images?id=...` - Update
- `DELETE /api/admin/products-advanced/images?id=...` - Delete

**Packaging:**
- `GET /api/admin/products-advanced/packaging?productId=...` - List
- `POST /api/admin/products-advanced/packaging` - Add
- `PUT /api/admin/products-advanced/packaging?id=...` - Update
- `DELETE /api/admin/products-advanced/packaging?id=...` - Delete

**Certifications:**
- `GET /api/admin/products-advanced/certifications?productId=...` - List
- `POST /api/admin/products-advanced/certifications` - Add
- `PUT /api/admin/products-advanced/certifications?id=...` - Update
- `DELETE /api/admin/products-advanced/certifications?id=...` - Delete

**SEO:**
- `GET /api/admin/products-advanced/seo?productId=...` - Get SEO
- `POST /api/admin/products-advanced/seo` - Create/Update
- `PUT /api/admin/products-advanced/seo?productId=...` - Update

**Export Info:**
- `GET /api/admin/products-advanced/export-info?productId=...` - Get info
- `POST /api/admin/products-advanced/export-info` - Create/Update
- `PUT /api/admin/products-advanced/export-info?productId=...` - Update

**RFQ Enquiries:**
- `GET /api/admin/products-advanced/rfq-enquiries?productId=...` - List (admin only)
- `POST /api/admin/products-advanced/rfq-enquiries` - Create enquiry (public)
- `PUT /api/admin/products-advanced/rfq-enquiries?id=...` - Update status (admin)

---

## Phase 2: Database Setup

### Run Prisma Migration

```bash
npx prisma migrate dev --name add_dynamic_product_system
```

This creates all 12 tables with proper indexes.

### Seed Initial Data

```bash
node -r dotenv/config lib/admin/modules/products-advanced/seeds/seed-products.js
```

This creates:
- 5 categories (Agriculture, Machinery, Electronics, Textiles, Food)
- 13 subcategories
- 3 pre-configured templates with fields

---

## Phase 3: Testing API Routes

### Test Categories Endpoint

```bash
curl http://localhost:3004/api/admin/products-advanced/categories
```

### Test Templates Endpoint

```bash
curl http://localhost:3004/api/admin/products-advanced/templates?categoryId=cat_1
```

### Test Create Product

```bash
curl -X POST http://localhost:3004/api/admin/products-advanced/products \
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
lib/admin/modules/products-advanced/
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

app/api/admin/products-advanced/
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
**Solution**: Seed the database first: `node -r dotenv/config lib/admin/modules/products-advanced/seeds/seed-products.js`

---

## Quick Reference

### Create a complete product workflow:

```javascript
// 1. Get template
const templates = await fetch('/api/admin/products-advanced/templates?categoryId=cat_1')

// 2. Create product
const product = await fetch('/api/admin/products-advanced/products', {
  method: 'POST',
  body: JSON.stringify({
    productName: 'Test',
    categoryId: 'cat_1',
    templateId: 'tmpl_1',
    description: 'Test'
  })
})

// 3. Add specifications
await fetch('/api/admin/products-advanced/specifications', {
  method: 'POST',
  body: JSON.stringify({
    productId: product.id,
    specName: 'Size',
    specValue: '30mm'
  })
})

// 4. Publish
await fetch(`/api/admin/products-advanced/products/${product.id}?action=publish`, {
  method: 'POST'
})
```

---

**System Ready for Phase 3: Admin UI Development** 🎉

