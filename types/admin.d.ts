export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  status: 'published' | 'draft' | 'archived'
  subcategories?: Subcategory[]
  createdAt: string
  updatedAt: string
}

export interface Subcategory {
  id: string
  name: string
  slug: string
  categoryId: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  status: 'active' | 'inactive' | 'lead'
  createdAt: string
  updatedAt: string
}

export interface RFQ {
  id: string
  reference: string
  customerId: string
  productInterest: string
  quantity: number
  unit: string
  shipmentDate?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'new' | 'quoted' | 'negotiation' | 'won' | 'lost'
  internalNotes?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  name: string
  slug: string
  description?: string
  categoryId: string
  subcategoryId?: string
  isActive: boolean
  fields: TemplateField[]
  createdAt: string
  updatedAt: string
}

export interface TemplateField {
  id: string
  templateId: string
  fieldName: string
  fieldLabel: string
  fieldType: 'TEXT' | 'NUMBER' | 'TEXTAREA' | 'DROPDOWN' | 'MULTI_SELECT' | 'DATE' | 'BOOLEAN' | 'RICH_TEXT' | 'IMAGE'
  isRequired: boolean
  displayOrder: number
  placeholder?: string
  helpText?: string
  options?: string
  createdAt: string
  updatedAt: string
}

export interface MediaAsset {
  id: string
  url: string
  filename: string
  assetType: string
  entityType: string
  mimeType: string
  sizeBytes: number
  width?: number
  height?: number
  uploadedBy: string
  createdAt: string
}
