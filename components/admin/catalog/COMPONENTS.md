# Admin Components Documentation

## Components Created

### 1. **CategorySelector.jsx**
- **Purpose**: Dropdown to select product category
- **Props**:
  - `value`: Selected category ID
  - `onChange`: Callback when category changes
  - `disabled`: Disable the selector
  - `label`: Custom label text
- **Features**:
  - Auto-fetches categories from API
  - Loading and error states
  - Required field indicator
- **Usage**:
  ```jsx
  <CategorySelector 
    value={categoryId} 
    onChange={setCategoryId}
    label="Select Product Category"
  />
  ```

### 2. **SubcategorySelector.jsx**
- **Purpose**: Dropdown to select product subcategory (dependent on category)
- **Props**:
  - `categoryId`: Parent category ID
  - `value`: Selected subcategory ID
  - `onChange`: Callback when subcategory changes
  - `disabled`: Disable the selector
  - `label`: Custom label text
- **Features**:
  - Auto-fetches based on selected category
  - Conditional disabling (requires category first)
  - Smart placeholder messages
- **Usage**:
  ```jsx
  <SubcategorySelector 
    categoryId={categoryId}
    value={subcategoryId} 
    onChange={setSubcategoryId}
  />
  ```

### 3. **TemplateSelector.jsx**
- **Purpose**: Dropdown to select form template
- **Props**:
  - `categoryId`: Category ID to fetch templates for
  - `value`: Selected template ID
  - `onChange`: Callback when template changes
  - `disabled`: Disable the selector
  - `label`: Custom label text
- **Features**:
  - Auto-fetches templates for category
  - Conditional disabling (requires category first)
- **Usage**:
  ```jsx
  <TemplateSelector 
    categoryId={categoryId}
    value={templateId} 
    onChange={setTemplateId}
  />
  ```

### 4. **DynamicFormGenerator.jsx**
- **Purpose**: Renders dynamic form fields based on template
- **Props**:
  - `templateId`: Template ID to load fields from
  - `values`: Current form values object
  - `onChange`: Callback when any field changes
  - `disabled`: Disable all fields
- **Features**:
  - Supports 9 field types:
    - TEXT: Text input
    - NUMBER: Number input
    - TEXTAREA: Multi-line text
    - DROPDOWN: Select dropdown
    - MULTI_SELECT: Multi-select dropdown
    - DATE: Date picker
    - BOOLEAN: Checkbox
    - RICH_TEXT: Rich text editor
    - IMAGE: File upload
  - Field-level validation
  - Help text support
  - Responsive layout
- **Usage**:
  ```jsx
  <DynamicFormGenerator 
    templateId={templateId}
    values={formValues}
    onChange={setFormValues}
  />
  ```

### 5. **ProductList.jsx**
- **Purpose**: Display products in table format with CRUD actions
- **Props**:
  - `onEdit`: Callback when edit is clicked
  - `onDelete`: Callback when delete is successful
  - `onView`: Callback when view is clicked
  - `categoryId`: Filter by category
  - `status`: Filter by status (draft, published, archived)
  - `searchQuery`: Filter by search term
- **Features**:
  - Pagination (50 products per page)
  - Status badge with color coding
  - Bulk actions (Edit, Delete, Duplicate, View)
  - Responsive table design
  - Error handling and loading states
- **Usage**:
  ```jsx
  <ProductList 
    categoryId={selectedCategory}
    status={selectedStatus}
    searchQuery={search}
    onEdit={(productId) => handleEdit(productId)}
    onDelete={(productId) => refreshList()}
  />
  ```

### 6. **SpecificationBuilder.jsx**
- **Purpose**: Manage product specifications (dynamic key-value pairs)
- **Props**:
  - `productId`: Product ID to load specifications for
  - `onSpecsChange`: Callback when specs are updated
- **Features**:
  - Add new specifications inline
  - Edit existing specifications
  - Delete specifications
  - Drag-to-reorder support
  - API integration for CRUD operations
- **Usage**:
  ```jsx
  <SpecificationBuilder 
    productId={product.id}
    onSpecsChange={(specs) => handleSpecChange(specs)}
  />
  ```

### 7. **ImageUploader.jsx**
- **Purpose**: Manage product images (gallery, packaging, certificates)
- **Props**:
  - `productId`: Product ID to upload images for
  - `onImagesChange`: Callback when images are updated
- **Features**:
  - Image type selection (main, gallery, packaging, certificate)
  - Tabbed interface by image type
  - Image preview
  - Delete functionality
  - Drag-to-reorder support (future)
  - File upload with base64 conversion
- **Usage**:
  ```jsx
  <ImageUploader 
    productId={product.id}
    onImagesChange={(images) => handleImageChange(images)}
  />
  ```

---

## Integration in Product Form

### Complete Product Creation Flow

```jsx
'use client'

import { useState } from 'react'
import CategorySelector from '@/components/admin/catalog/CategorySelector'
import SubcategorySelector from '@/components/admin/catalog/SubcategorySelector'
import TemplateSelector from '@/components/admin/catalog/TemplateSelector'
import DynamicFormGenerator from '@/components/admin/catalog/DynamicFormGenerator'
import SpecificationBuilder from '@/components/admin/catalog/SpecificationBuilder'
import ImageUploader from '@/components/admin/catalog/ImageUploader'
import { Button } from '@/components/ui/button'

export default function CreateProductPage() {
  const [step, setStep] = useState('category') // category, template, details
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [product, setProduct] = useState({})
  const [formValues, setFormValues] = useState({})
  const [productId, setProductId] = useState(null)

  const handleCreateProduct = async () => {
    try {
      const response = await fetch('/api/admin/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formValues.productName || 'Untitled',
          categoryId,
          subcategoryId,
          templateId,
          description: formValues.description,
          hsnCode: formValues.hsnCode,
          mainImage: formValues.mainImage,
          ...formValues
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setProductId(data.data.id)
        setStep('details')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const handlePublish = async () => {
    try {
      const response = await fetch(
        `/api/admin/catalog/products/${productId}?action=publish`,
        { method: 'POST' }
      )
      const data = await response.json()
      
      if (data.success) {
        alert('Product published successfully!')
        // Redirect to product list
      } else {
        alert(`Error: ${data.errors?.join(', ') || data.error}`)
      }
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create Product</h1>

      {step === 'category' && (
        <div className="space-y-4">
          <CategorySelector 
            value={categoryId} 
            onChange={setCategoryId}
          />
          <SubcategorySelector 
            categoryId={categoryId}
            value={subcategoryId} 
            onChange={setSubcategoryId}
          />
          <TemplateSelector 
            categoryId={categoryId}
            value={templateId} 
            onChange={setTemplateId}
          />
          <Button 
            onClick={handleCreateProduct}
            disabled={!categoryId || !templateId}
          >
            Continue to Details
          </Button>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-2">Product Name</label>
            <input
              type="text"
              value={formValues.productName || ''}
              onChange={(e) => setFormValues({ ...formValues, productName: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter product name"
            />
          </div>

          <DynamicFormGenerator 
            templateId={templateId}
            values={formValues}
            onChange={setFormValues}
          />

          <SpecificationBuilder 
            productId={productId}
            onSpecsChange={(specs) => console.log('Specs updated:', specs)}
          />

          <ImageUploader 
            productId={productId}
            onImagesChange={(images) => console.log('Images updated:', images)}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('category')}>
              Back
            </Button>
            <Button onClick={handlePublish}>
              Publish Product
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Component File Locations

```
components/admin/catalog/
├── CategorySelector.jsx
├── SubcategorySelector.jsx
├── TemplateSelector.jsx
├── DynamicFormGenerator.jsx
├── ProductList.jsx
├── SpecificationBuilder.jsx
└── ImageUploader.jsx
```

---

## API Endpoints Used

Each component uses specific API endpoints:

| Component | Endpoints |
|-----------|-----------|
| CategorySelector | GET /api/admin/catalog/categories |
| SubcategorySelector | GET /api/admin/catalog/subcategories |
| TemplateSelector | GET /api/admin/catalog/templates |
| DynamicFormGenerator | GET /api/admin/catalog/template-fields |
| ProductList | GET/POST/PUT/DELETE /api/admin/catalog/products |
| SpecificationBuilder | GET/POST/PUT/DELETE /api/admin/catalog/specifications |
| ImageUploader | GET/POST/DELETE /api/admin/catalog/images |

---

## Next Components to Build

- `PackagingManager.jsx` - Manage packaging options
- `CertificationManager.jsx` - Manage product certifications
- `SEOEditor.jsx` - Edit SEO metadata
- `ExportInfoEditor.jsx` - Configure export details
- `RFQEnquiryList.jsx` - View customer enquiries
- `ProductDetail.jsx` - Complete product detail view

---

## Notes

- All components are client-side React components (use 'use client')
- All components require admin authentication (via API routes)
- Components use existing UI library (Button, Input, Select, Table, etc.)
- All components have error handling and loading states
- Components are designed to be composable and reusable

