/**
 * Input sanitization and validation utilities for API route handlers.
 * Prevents injection attacks via enum whitelisting and type-safe parsing.
 */

/** Valid employee status values */
const EMPLOYEE_STATUS_WHITELIST = ['active', 'inactive', 'suspended', 'terminated']

/** Valid customer status values */
const CUSTOMER_STATUS_WHITELIST = ['active', 'inactive', 'suspended', 'lead', 'prospect']

/** Valid RFQ status values */
const RFQ_STATUS_WHITELIST = ['new', 'pending', 'reviewing', 'quoted', 'confirmed', 'rejected', 'completed', 'cancelled']

/** Valid RFQ priority values */
const RFQ_PRIORITY_WHITELIST = ['low', 'normal', 'high', 'urgent']

/** Valid order status values */
const ORDER_STATUS_WHITELIST = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']

/**
 * Safely parse and cap an integer from a string.
 * @param value - Raw string value
 * @param defaultVal - Default value if parse fails
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 */
export function safeParseInt(value: string | null, defaultVal: number, min = 0, max = 10000): number {
  if (!value) return defaultVal
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) return defaultVal
  return Math.max(min, Math.min(max, parsed))
}

/**
 * Sanitize a search string: strip HTML-like characters and excessive whitespace.
 */
export function sanitizeSearch(value: string | null): string | null {
  if (!value) return null
  return value.replace(/[<>"'%;()&+]/g, '').trim().substring(0, 200)
}

/**
 * Whitelist-validate a status enum value.
 * Returns null if value is not in the whitelist.
 */
export function whitelistStatus(value: string | null, whitelist: string[]): string | null {
  if (!value) return null
  const lower = value.toLowerCase().trim()
  return whitelist.includes(lower) ? lower : null
}

export const employeeStatusWhitelist = EMPLOYEE_STATUS_WHITELIST
export const customerStatusWhitelist = CUSTOMER_STATUS_WHITELIST
export const rfqStatusWhitelist = RFQ_STATUS_WHITELIST
export const rfqPriorityWhitelist = RFQ_PRIORITY_WHITELIST
export const orderStatusWhitelist = ORDER_STATUS_WHITELIST
