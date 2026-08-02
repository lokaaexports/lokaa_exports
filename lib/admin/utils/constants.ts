// lib/admin/utils/constants.js
// Admin Portal Constants

export const ADMIN_CONFIG = {
  APP_NAME: 'Lokaa Exports Admin Portal',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development'
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 500,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100, 250, 500]
}

export const DATE_FORMAT = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy, HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss'
}

export const RFQ_STATUS = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  REVIEWING: 'reviewing',
  CONTACTED: 'contacted',
  QUOTATION_SENT: 'quotation_sent',
  NEGOTIATION: 'negotiation',
  APPROVED: 'approved',
  ORDER_CREATED: 'order_created',
  PRODUCTION: 'production',
  PACKING: 'packing',
  SHIPMENT: 'shipment',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const RFQ_STATUS_DISPLAY = {
  new: 'New',
  assigned: 'Assigned',
  reviewing: 'Reviewing',
  contacted: 'Contacted',
  quotation_sent: 'Quotation Sent',
  negotiation: 'In Negotiation',
  approved: 'Approved',
  order_created: 'Order Created',
  production: 'In Production',
  packing: 'Packing',
  shipment: 'In Shipment',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

export const RFQ_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

export const RFQ_PRIORITY_DISPLAY = {
  low: { label: 'Low', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
  urgent: { label: 'Urgent', color: '#7c3aed' }
}

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  ON_LEAVE: 'on_leave',
  TERMINATED: 'terminated'
}

export const EMPLOYEE_STATUS_DISPLAY = {
  active: { label: 'Active', color: '#10b981' },
  inactive: { label: 'Inactive', color: '#6b7280' },
  pending: { label: 'Pending', color: '#f59e0b' },
  on_leave: { label: 'On Leave', color: '#3b82f6' },
  terminated: { label: 'Terminated', color: '#ef4444' }
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
}

export const SHIPMENT_STATUS = {
  PENDING: 'pending',
  READY: 'ready',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  RETURNED: 'returned'
}

export const NOTIFICATION_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ALERT: 'alert'
}

export const ACTIVITY_ACTION = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  ASSIGN: 'assign',
  EXPORT: 'export',
  IMPORT: 'import',
  LOGIN: 'login',
  LOGOUT: 'logout'
}

export const ACTIVITY_MODULE = {
  CRM: 'crm',
  PRODUCTS: 'products',
  EMPLOYEES: 'employees',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  AUTH: 'auth'
}

export const ACTIVITY_RESOURCE = {
  CUSTOMER: 'Customer',
  RFQ: 'RFQ',
  QUOTATION: 'Quotation',
  ORDER: 'Order',
  INVOICE: 'Invoice',
  PRODUCT: 'Product',
  EMPLOYEE: 'Employee',
  ROLE: 'Role',
  PERMISSION: 'Permission'
}

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_SHEET_TYPES: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  UPLOAD_PATH: '/uploads/'
}

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'xlsx',
  CSV: 'csv',
  JSON: 'json'
}

export const CHART_COLORS = {
  primary: '#1a472a',
  secondary: '#2d6f47',
  accent: '#F4A460',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  pink: '#ec4899'
}

export const SIDEBAR_MODULES = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/admin/dashboard',
    badge: null
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: 'Users',
    href: '/admin/crm/customers',
    children: [
      { label: 'Customers', href: '/admin/crm/customers', icon: 'Users' },
      { label: 'RFQs', href: '/admin/crm/rfqs', icon: 'FileText' },
      { label: 'Quotations', href: '/admin/crm/quotations', icon: 'FileCheck' },
      { label: 'Orders', href: '/admin/crm/orders', icon: 'ShoppingCart' },
      { label: 'Invoices', href: '/admin/crm/invoices', icon: 'FileText' }
    ]
  },
  {
    id: 'products',
    label: 'Products',
    icon: 'Package',
    href: '/admin/products/catalog',
    children: [
      { label: 'Catalog', href: '/admin/products/catalog', icon: 'Package' },
      { label: 'Categories', href: '/admin/products/categories', icon: 'Layers' },
      { label: 'Certifications', href: '/admin/products/certifications', icon: 'Award' },
      { label: 'SEO Manager', href: '/admin/products/seo', icon: 'Search' }
    ]
  },
  {
    id: 'catalog',
    label: 'Catalog Manager',
    icon: 'FileText',
    href: '/admin/catalog',
    children: [
      { label: 'Overview', href: '/admin/catalog', icon: 'FileText' },
      { label: 'Generate', href: '/admin/catalog-documents/generate', icon: 'Zap' },
      { label: 'Versions', href: '/admin/catalog/versions', icon: 'Clock' },
      { label: 'Settings', href: '/admin/catalog/settings', icon: 'Settings' }
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: 'Truck',
    href: '/admin/operations/shipments',
    children: [
      { label: 'Shipments', href: '/admin/operations/shipments', icon: 'Truck' },
      { label: 'Documentation', href: '/admin/operations/documentation', icon: 'FileText' },
      { label: 'Warehouse', href: '/admin/operations/warehouse', icon: 'Package' }
    ]
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: 'Users',
    href: '/admin/employees',
    children: [
      { label: 'All Employees', href: '/admin/employees', icon: 'Users' },
      { label: 'Departments', href: '/admin/employees/departments', icon: 'Briefcase' },
      { label: 'Roles', href: '/admin/employees/roles', icon: 'Shield' }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    href: '/admin/reports/sales',
    children: [
      { label: 'Sales', href: '/admin/reports/sales', icon: 'TrendingUp' },
      { label: 'RFQs', href: '/admin/reports/rfq', icon: 'FileText' },
      { label: 'Products', href: '/admin/reports/products', icon: 'Package' },
      { label: 'Customers', href: '/admin/reports/customers', icon: 'Users' },
      { label: 'Analytics', href: '/admin/reports/analytics', icon: 'BarChart3' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/admin/settings/company',
    children: [
      { label: 'Company', href: '/admin/settings/company', icon: 'Building' },
      { label: 'Email Configuration', href: '/admin/settings/email', icon: 'Mail' },
      { label: 'Security', href: '/admin/settings/security', icon: 'Lock' },
      { label: 'Backup', href: '/admin/settings/backup', icon: 'HardDrive' }
    ]
  },
  {
    id: 'logs',
    label: 'Logs & Audit',
    icon: 'ClipboardList',
    href: '/admin/activity-logs'
  }
]

export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60 // 24 hours
}

export const API_ERRORS = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  BAD_REQUEST: 'Bad Request',
  INTERNAL_ERROR: 'Internal Server Error',
  VALIDATION_ERROR: 'Validation Error'
}
