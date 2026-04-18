/**
 * API Error Handler
 * 
 * Converts different error scenarios into consistent API error responses
 * 
 * Why this exists:
 * - Standardizes error responses across all endpoints
 * - Maps business logic errors to HTTP status codes
 * - Handles edge cases (missing fields, invalid input types, etc.)
 * - Provides request tracing via requestId
 * - Never leaks sensitive error details to clients
 */

import { NextResponse } from 'next/server'
import type { ApiErrorResponse } from '@/types/api'

/**
 * Error categories and their HTTP status codes
 * 
 * These map to different scenarios:
 * - VALIDATION: User provided invalid input (400 Bad Request)
 * - NOT_FOUND: Resource doesn't exist (404 Not Found)
 * - RATE_LIMITED: Too many requests (429 Too Many Requests)
 * - SERVER: Unexpected server error (500 Internal Server Error)
 */
type ErrorType = 'VALIDATION' | 'NOT_FOUND' | 'RATE_LIMITED' | 'SERVER'

interface ErrorConfig {
  type: ErrorType
  code: string
  message: string
  details?: Record<string, any>
  requestId?: string
}

/**
 * Map error types to HTTP status codes
 * 
 * @param type - The error category
 * @returns HTTP status code (400, 404, 429, 500)
 */
function getStatusCode(type: ErrorType): number {
  const statusMap: Record<ErrorType, number> = {
    VALIDATION: 400,      // Bad Request
    NOT_FOUND: 404,        // Not Found
    RATE_LIMITED: 429,     // Too Many Requests
    SERVER: 500,           // Internal Server Error
  }
  return statusMap[type]
}

/**
 * Create a standardized error response
 * 
 * @param config - Error configuration with type, code, message, etc.
 * @returns NextResponse with appropriate status code and error shape
 * 
 * Example:
 *   return handleApiError({
 *     type: 'VALIDATION',
 *     code: 'EMPTY_INPUT',
 *     message: 'NRC cannot be empty',
 *     details: { received: '', expected: 'SEQUENCE/DISTRICT/NATIONALITY' },
 *     requestId: req.id,
 *   })
 */
export function handleApiError(config: ErrorConfig): NextResponse {
  const statusCode = getStatusCode(config.type)

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: config.code,
      message: config.message,
      ...(config.details && { details: config.details }),
      ...(config.requestId && { requestId: config.requestId }),
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(errorResponse, { status: statusCode })
}

/**
 * Handle missing required fields in request body
 * 
 * @param missing - Array of field names that are missing
 * @param requestId - Optional request ID for tracing
 * @returns NextResponse with 400 error
 * 
 * Example:
 *   // User sent {} instead of { nrc: "..." }
 *   return handleMissingFields(['nrc'], req.id)
 */
export function handleMissingFields(
  missing: string[],
  requestId?: string
): NextResponse {
  return handleApiError({
    type: 'VALIDATION',
    code: 'MISSING_REQUIRED_FIELDS',
    message: `Missing required field(s): ${missing.join(', ')}`,
    details: {
      missing,
      expected: `Request body must include: ${missing.join(', ')}`,
    },
    requestId,
  })
}

/**
 * Handle invalid input types
 * 
 * @param field - Field name with wrong type
 * @param expectedType - What type was expected
 * @param receivedType - What type was provided
 * @param requestId - Optional request ID
 * @returns NextResponse with 400 error
 * 
 * Example:
 *   // User sent { nrc: 123 } instead of { nrc: "..." }
 *   return handleInvalidType('nrc', 'string', 'number', req.id)
 */
export function handleInvalidType(
  field: string,
  expectedType: string,
  receivedType: string,
  requestId?: string
): NextResponse {
  return handleApiError({
    type: 'VALIDATION',
    code: 'INVALID_TYPE',
    message: `Field '${field}' must be ${expectedType}`,
    details: {
      field,
      expected: expectedType,
      received: receivedType,
    },
    requestId,
  })
}

/**
 * Handle array size validation
 * 
 * @param field - Field name (usually the array)
 * @param length - Actual length provided
 * @param max - Maximum allowed
 * @param min - Minimum required
 * @param requestId - Optional request ID
 * @returns NextResponse with 400 error
 * 
 * Example:
 *   // User sent 51 NRCs, max is 50
 *   return handleArraySizeError('nrcs', 51, 50, 1, req.id)
 */
export function handleArraySizeError(
  field: string,
  length: number,
  max: number,
  min: number = 1,
  requestId?: string
): NextResponse {
  return handleApiError({
    type: 'VALIDATION',
    code: 'ARRAY_SIZE_ERROR',
    message: `${field} must have between ${min} and ${max} items`,
    details: {
      field,
      received: length,
      min,
      max,
    },
    requestId,
  })
}

/**
 * Handle unexpected server errors
 * 
 * IMPORTANT: Never expose internal error details to client in production!
 * This function strips sensitive info.
 * 
 * @param error - The caught error
 * @param context - Optional context about what failed (for logging, not response)
 * @param requestId - Optional request ID for tracing
 * @returns NextResponse with 500 error (safe for clients)
 * 
 * Example:
 *   try {
 *     // some code
 *   } catch (error) {
 *     return handleServerError(error, 'validating NRC', req.id)
 *   }
 */
export function handleServerError(
  error: unknown,
  context?: string,
  requestId?: string
): NextResponse {
  // Log the real error (server-side only)
  console.error(`[${new Date().toISOString()}] Server error${context ? ` while ${context}` : ''}:`, error)

  // Return safe error to client (no internal details)
  return handleApiError({
    type: 'SERVER',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
    details: {
      ...(requestId && { hint: `Report this request ID for support: ${requestId}` }),
    },
    requestId,
  })
}
