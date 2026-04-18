/**
 * API Response Types
 * 
 * These types define the shape of all HTTP responses from the NRC Validator API.
 * Every endpoint MUST return one of these shapes to maintain consistency.
 * 
 * This is separate from business logic types (lib/nrc/types.ts) because:
 * - API responses have HTTP semantics (status codes, timing, etc.)
 * - Business logic types are pure data/domain types
 * - An endpoint may wrap or transform business types for JSON response
 */

import type { ValidationResult, GeneratedNRC } from '@/lib/nrc'

/**
 * Success response structure
 * 
 * Used when an endpoint completes successfully (HTTP 200/201)
 * Contains the actual data plus metadata about the response
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  timestamp: string                // ISO 8601: when the response was generated
  requestId?: string              // For request tracing/debugging
}

/**
 * Error response structure
 * 
 * Used when an endpoint encounters an error (HTTP 400/422/500)
 * Contains error details for debugging and user feedback
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string                   // Machine-readable error code (e.g., "INVALID_INPUT")
    message: string                // Human-readable error message
    details?: Record<string, any>  // Additional diagnostic info (what failed, why)
    requestId?: string             // For request tracing
  }
  timestamp: string                // ISO 8601: when the error occurred
}

/**
 * Union type for all possible API responses
 * 
 * Every endpoint returns either Success<T> or Error
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/* ===== Specific Endpoint Response Types ===== */

/**
 * Validation endpoint response
 * 
 * POST /api/validation
 * Validates a single NRC and returns the result
 */
export interface ValidationEndpointRequest {
  nrc: string                      // The NRC to validate (e.g., "613475/61/1")
  strict?: boolean                 // Optional: enable strict mode (district validation)
}

export type ValidationEndpointResponse = ApiResponse<ValidationResult>

/**
 * Batch validation endpoint response
 * 
 * POST /api/validation/batch
 * Validates up to 50 NRCs and returns results for each
 */
export interface BatchValidationRequest {
  nrcs: string[]                    // Array of NRCs to validate (max 50)
  strict?: boolean                  // Optional: enable strict mode for all
}

export interface BatchValidationItem {
  nrc: string                       // The NRC that was validated
  result: ValidationResult          // The validation result
}

export type BatchValidationResponse = ApiResponse<BatchValidationItem[]>

/**
 * Generation endpoint response
 * 
 * POST /api/generation
 * Generates a valid random NRC
 */
export interface GenerationEndpointRequest {
  count?: number                    // How many NRCs to generate (default: 1, max: 100)
}

export type GenerationEndpointResponse = ApiResponse<GeneratedNRC | GeneratedNRC[]>

/**
 * API Documentation endpoint
 * 
 * GET /api-docs
 * Returns interactive HTML or JSON documentation
 */
export interface ApiDocumentation {
  title: string
  version: string
  description: string
  endpoints: Array<{
    method: string
    path: string
    description: string
    parameters: Array<{
      name: string
      type: string
      required: boolean
      example: any
    }>
    requestBody?: {
      example: any
    }
    responses: Array<{
      status: number
      description: string
      example: any
    }>
  }>
}

export type ApiDocsResponse = ApiResponse<ApiDocumentation>
