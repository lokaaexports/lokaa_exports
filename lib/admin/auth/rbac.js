// lib/admin/auth/rbac.js
// Role-Based Access Control System

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SALES_MANAGER: 'sales_manager',
  SALES_EXECUTIVE: 'sales_executive',
  EXPORT_MANAGER: 'export_manager',
  DOCUMENTATION_OFFICER: 'documentation_officer',
  LOGISTICS_MANAGER: 'logistics_manager',
  WAREHOUSE_STAFF: 'warehouse_staff',
  CUSTOMER_SUPPORT: 'customer_support',
  MARKETING: 'marketing',
  FINANCE: 'finance',
  VIEWER: 'viewer'
}

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 5,
  [ROLES.ADMIN]: 4,
  [ROLES.SALES_MANAGER]: 3,
  [ROLES.EXPORT_MANAGER]: 3,
  [ROLES.LOGISTICS_MANAGER]: 3,
  [ROLES.SALES_EXECUTIVE]: 2,
  [ROLES.DOCUMENTATION_OFFICER]: 2,
  [ROLES.CUSTOMER_SUPPORT]: 2,
  [ROLES.MARKETING]: 2,
  [ROLES.FINANCE]: 2,
  [ROLES.WAREHOUSE_STAFF]: 1,
  [ROLES.VIEWER]: 1
}

export const checkRole = (userRoles, requiredRoles) => {
  if (!Array.isArray(userRoles)) {
    return false
  }

  const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  return userRoles.some(role => required.includes(role))
}

export const checkRoleHierarchy = (userRole, minHierarchy) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  return userLevel >= minHierarchy
}

export const checkPermission = (userPermissions, requiredPermission) => {
  if (!Array.isArray(userPermissions)) {
    return false
  }

  // Super admin has all permissions
  if (userPermissions.includes('*.*')) {
    return true
  }

  // Check for exact permission match
  if (userPermissions.includes(requiredPermission)) {
    return true
  }

  // Check for wildcard permissions (e.g., crm.* includes crm.customer.read)
  const permissionParts = requiredPermission.split('.')
  for (let i = permissionParts.length - 1; i > 0; i--) {
    const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*'
    if (userPermissions.includes(wildcardPermission)) {
      return true
    }
  }

  return false
}

export const checkMultiplePermissions = (userPermissions, requiredPermissions, requireAll = false) => {
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]

  if (requireAll) {
    return required.every(permission => checkPermission(userPermissions, permission))
  } else {
    return required.some(permission => checkPermission(userPermissions, permission))
  }
}

export const canCreateCustomer = (userRoles) => {
  return checkRole(userRoles, [ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_EXECUTIVE])
}

export const canEditCustomer = (userRoles) => {
  return checkRole(userRoles, [ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_EXECUTIVE])
}

export const canDeleteCustomer = (userRoles) => {
  return checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN])
}

export const canViewReports = (userRoles) => {
  return checkRole(userRoles, [
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
    ROLES.SALES_MANAGER,
    ROLES.EXPORT_MANAGER,
    ROLES.FINANCE
  ])
}

export const canExportData = (userRoles) => {
  return checkRole(userRoles, [
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
    ROLES.SALES_MANAGER,
    ROLES.FINANCE
  ])
}

export const canManageEmployees = (userRoles) => {
  return checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN])
}

export const canManageRoles = (userRoles) => {
  return checkRole(userRoles, [ROLES.SUPER_ADMIN])
}

export const canViewSettings = (userRoles) => {
  return checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN])
}

export const canEditSettings = (userRoles) => {
  return checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN])
}

export const canManageRFQs = (userRoles) => {
  return checkRole(userRoles, [
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
    ROLES.SALES_MANAGER,
    ROLES.SALES_EXECUTIVE
  ])
}

export const canApproveRFQ = (userRoles) => {
  return checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.SALES_MANAGER])
}

export const canManageProducts = (userRoles) => {
  return checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MARKETING])
}

export const canViewAnalytics = (userRoles) => {
  return checkRole(userRoles, [
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
    ROLES.SALES_MANAGER,
    ROLES.FINANCE
  ])
}

export const canViewActivityLogs = (userRoles) => {
  return checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN])
}

export const getModuleAccess = (userRoles) => {
  const modules = {
    dashboard: true,
    profile: true
  }

  if (checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_EXECUTIVE])) {
    modules.crm = true
  }

  if (checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MARKETING])) {
    modules.products = true
  }

  if (checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN])) {
    modules.employees = true
    modules.settings = true
    modules.reports = true
    modules.logs = true
  }

  if (checkRole(userRoles, [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.EXPORT_MANAGER])) {
    modules.operations = true
  }

  if (checkRole(userRoles, [ROLES.FINANCE])) {
    modules.finance = true
  }

  return modules
}
