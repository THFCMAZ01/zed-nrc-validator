/**
 * POST /api/validation/batch
 * 
 * Validates multiple Zambian NRC numbers in a single request
 * 
 * Request Body:
 * {
 *   "nrcs": ["613475/61/1", "000123/11/2"],  // Required: array of NRCs
 *   "strict": false                           // Optional: enable strict mode
 * }
 * 
 * Limits:
 * - Maximum 50 NRCs per request (NFR-06)
 * - Minimum 1 NRC per request
 * 
 * Success Response (HTTP 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "nrc": "613475/61/1",
 *       "result": { "valid": true }
 *     },
 *     {
 *       "nrc": "000123/11/2",
 *       "result": { "valid": true }
 *     }
 *   ],
 *   "timestamp": "2026-04-18T20:45:00Z"
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateNRC } from '@/lib/nrc'
import type {
  BatchValidationRequest,
  BatchValidationItem,
  ApiSuccessResponse,
} from '@/types/api'
import {
  handleMissingFields,
  handleInvalidType,
  handleArraySizeError,
  handleServerError,
} from '@/app/api/_lib/error-handler'

const MAX_BATCH_SIZE = 50  // FR-06: support up to 50 NRCs
const MIN_BATCH_SIZE = 1

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    // Parse request body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Request body must be valid JSON',
            requestId,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // Check required fields
    if (!body.nrcs) {
      return handleMissingFields(['nrcs'], requestId)
    }

    // Validate that nrcs is an array
    if (!Array.isArray(body.nrcs)) {
      return handleInvalidType('nrcs', 'array', typeof body.nrcs, requestId)
    }

    // Validate array size
    if (body.nrcs.length < MIN_BATCH_SIZE || body.nrcs.length > MAX_BATCH_SIZE) {
      return handleArraySizeError(
        'nrcs',
        body.nrcs.length,
        MAX_BATCH_SIZE,
        MIN_BATCH_SIZE,
        requestId
      )
    }

    // Validate all items are strings
    const invalidItems = body.nrcs
      .map((item: any, index: number) => ({ item, index }))
      .filter(({ item }: any) => typeof item !== 'string')

    if (invalidItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ARRAY_ITEMS',
            message: `All items in 'nrcs' array must be strings`,
            details: {
              invalidIndices: invalidItems.map((x: any) => x.index),
              hint: `Items at indices ${invalidItems.map((x: any) => x.index).join(', ')} are not strings`,
            },
            requestId,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // Validate strict parameter if provided
    if (body.strict !== undefined && typeof body.strict !== 'boolean') {
      return handleInvalidType('strict', 'boolean', typeof body.strict, requestId)
    }

    // ===== Validate all NRCs =====
    const validationRequest: BatchValidationRequest = {
      nrcs: body.nrcs.map((nrc: string) => nrc.trim()),
      strict: body.strict ?? false,
    }

    const results: BatchValidationItem[] = validationRequest.nrcs.map((nrc) => ({
      nrc,
      result: validateNRC(nrc, { strict: validationRequest.strict }),
    }))

    // ===== Return success response =====
    const apiResponse: ApiSuccessResponse<BatchValidationItem[]> = {
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
      requestId,
    }

    return NextResponse.json(apiResponse, { status: 200 })
  } catch (error) {
    return handleServerError(error, 'batch validating NRCs', requestId)
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Content-Type': 'application/json',
    },
  })
}
