/**
 * POST /api/validation
 * 
 * Validates a single Zambian NRC number
 * 
 * Request Body:
 * {
 *   "nrc": "613475/61/1",      // Required: NRC to validate
 *   "strict": false            // Optional: enable strict mode (district validation)
 * }
 * 
 * Success Response (HTTP 200):
 * {
 *   "success": true,
 *   "data": {
 *     "valid": true
 *   },
 *   "timestamp": "2026-04-18T20:45:00Z",
 *   "requestId": "req-123456"
 * }
 * 
 * Error Response (HTTP 400):
 * {
 *   "success": false,
 *   "error": {
 *     "code": "INVALID_SEQUENCE_LENGTH",
 *     "message": "Sequence must be exactly 6 digits, you provided 5.",
 *     "details": {
 *       "received": "61347",
 *       "expected": "exactly 6 digits"
 *     }
 *   },
 *   "timestamp": "2026-04-18T20:45:00Z"
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateNRC } from '@/lib/nrc'
import type { ValidationEndpointRequest, ApiSuccessResponse, ValidationResult } from '@/types/api'
import {
  handleMissingFields,
  handleInvalidType,
  handleApiError,
  handleServerError,
} from '@/app/api/_lib/error-handler'

/**
 * Handler for POST /api/validation
 * 
 * Steps:
 * 1. Generate unique request ID for tracing
 * 2. Parse and validate request body
 * 3. Call business logic (validateNRC)
 * 4. Wrap result in API response shape
 * 5. Return with timestamp and metadata
 */
export async function POST(request: NextRequest) {
  // Generate request ID for tracing this request through logs
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    // ===== STEP 1: Parse request body =====
    let body: any
    try {
      body = await request.json()
    } catch {
      return handleApiError({
        type: 'VALIDATION',
        code: 'INVALID_JSON',
        message: 'Request body must be valid JSON',
        requestId,
      })
    }

    // ===== STEP 2: Validate required fields =====
    if (!body.nrc) {
      return handleMissingFields(['nrc'], requestId)
    }

    // ===== STEP 3: Validate field types =====
    if (typeof body.nrc !== 'string') {
      return handleInvalidType('nrc', 'string', typeof body.nrc, requestId)
    }

    if (body.strict !== undefined && typeof body.strict !== 'boolean') {
      return handleInvalidType('strict', 'boolean', typeof body.strict, requestId)
    }

    // ===== STEP 4: Call business logic =====
    // validateNRC returns: { valid: true } OR { valid: false, error: {...} }
    const validationRequest: ValidationEndpointRequest = {
      nrc: body.nrc.trim(),  // Clean whitespace
      strict: body.strict ?? false,  // Default to false
    }

    const validationResult: ValidationResult = validateNRC(
      validationRequest.nrc,
      { strict: validationRequest.strict }
    )

    // ===== STEP 5: Wrap in API response shape =====
    const apiResponse: ApiSuccessResponse<ValidationResult> = {
      success: true,
      data: validationResult,
      timestamp: new Date().toISOString(),
      requestId,
    }

    // ===== STEP 6: Return success response =====
    return NextResponse.json(apiResponse, { status: 200 })
  } catch (error) {
    // Unexpected error - log it server-side, return safe message to client
    return handleServerError(error, 'validating NRC', requestId)
  }
}

/**
 * Handler for other HTTP methods on this endpoint
 * 
 * This endpoint only supports POST. Other methods get 405 Method Not Allowed
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Content-Type': 'application/json',
    },
  })
}
