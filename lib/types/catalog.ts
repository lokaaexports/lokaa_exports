/**
 * Enterprise PIM & Catalog Core Type Definitions
 * Lokaa Exports B2B Global Platform
 */

export type ProductStatus = 'draft' | 'published' | 'archived'
export type AvailabilityStatus = 'in_stock' | 'out_of_stock' | 'discontinued'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type ImageType = 'main' | 'gallery' | 'packaging' | 'certificate' | 'factory'

export interface CatalogImage {
  id?: string
  imageUrl: string
  imageTitle?: string
  altText?: string
  seoDescription?: string
  imageType?: ImageType
  displayOrder?: number
}

export interface CatalogSpecification {
  id?: string
  fieldId?: string
  specName: string
  specValue: string
  displayOrder?: number
}

export interface CatalogPackaging {
  id?: string
  packageType: string
  weight: number
  unit: string
  quantityAvailable?: number
  isActive?: boolean
  displayOrder?: number
}

export interface CatalogCertification {
  id?: string
  certName: string
  certNumber?: string
  certImage?: string
  issueDate?: string | Date
  expiryDate?: string | Date
}

export interface CatalogSEO {
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  canonicalUrl?: string
  ogImage?: string
}

export interface CatalogExportInfo {
  hsCode?: string
  moq?: number
  moqUnit?: string
  supplyCapacity?: string
  originCountry?: string
  portOfLoading?: string
  paymentTerms?: string
  incoterms?: string
}

export interface ProductDomainModel {
  id: string
  productName: string
  slug: string
  categoryId: string
  subcategoryId?: string | null
  templateId: string
  
  categoryName?: string
  categorySlug?: string
  subcategoryName?: string
  subcategorySlug?: string

  shortDescription?: string | null
  description?: string | null
  exportDescription?: string | null

  hsnCode?: string | null
  productType?: string | null
  origin?: string | null
  shelfLife?: string | null
  seasonAvailability?: string | null

  status: ProductStatus
  approvalStatus?: ApprovalStatus
  isFeatured: boolean
  availabilityStatus: AvailabilityStatus

  mainImage?: string | null
  images: CatalogImage[]
  specifications: CatalogSpecification[]
  packaging: CatalogPackaging[]
  certifications: CatalogCertification[]
  seo?: CatalogSEO | null
  exportInfo?: CatalogExportInfo | null
  
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CategoryDomainModel {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  displayOrder: number
  status: string
  subcategories?: SubcategoryDomainModel[]
  productCount?: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SubcategoryDomainModel {
  id: string
  categoryId: string
  name: string
  slug: string
  description?: string | null
  displayOrder: number
  status: string
  productCount?: number
  createdAt: Date | string
  updatedAt: Date | string
}
