// Standardized API response formatter with logging
import { NextResponse } from 'next/server'

export class ApiResponse {
  static success(data, message = null, status = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
      },
      { status }
    )
  }

  static error(error, status = 500, message = null) {
    const errorMessage = message || error?.message || 'Internal server error'
    const errorCode = error?.code || 'UNKNOWN_ERROR'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      },
      { status }
    )
  }

  static unauthorized(message = 'Unauthorized') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    )
  }

  static forbidden(message = 'Forbidden') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    )
  }

  static notFound(message = 'Resource not found') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    )
  }

  static badRequest(message = 'Bad request') {
    return NextResponse.json(
      {
        success: false,
        error: message,
        code: 'BAD_REQUEST',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    )
  }

  static paginated(data, total, page, pageSize, message = null) {
    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          hasMore: page * pageSize < total,
        },
        message,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  }
}

/**
 * Request logging helper for admin endpoints
 */
export function logAdminRequest(method, path, userId, details = {}) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    method,
    path,
    userId,
    ...details,
  }

  // Log to console in dev, could integrate with service in production
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${method}] ${path} - User: ${userId}`, details)
  }

  // TODO: Integrate with proper logging service (e.g., Winston, Datadog)
  return logEntry
}

/**
 * Error handler wrapper for route handlers
 */
export async function handleApiError(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', {
        message: error.message,
        path: request.nextUrl.pathname,
        method: request.method,
        stack: error.stack,
      })

      return ApiResponse.error(
        error,
        500,
        'An unexpected error occurred'
      )
    }
  }
}
