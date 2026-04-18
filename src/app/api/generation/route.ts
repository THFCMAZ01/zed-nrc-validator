/**
 * POST /api/generation
 * 
 * Generates valid random Zambian NRC numbers for testing
 * 
 * Request Body:
 * {
 *   "count": 1    // Optional: how many to generate (default: 1, max: 100)
 * }
 * 
 * Success Response (HTTP 200):
 * {
 *   "success": true,
 *   "data": {
 *     "nrc": "123456/61/1",
 *     "sequence": 123456,
 *     "district": 61,
 *     "nationality": 1
 *   },
 *   "timestamp": "2026-04-18T20:45:00Z"
 * }
 * 
 * Or if count > 1, data is an array:
 * {
 *   "success": true,
 *   "data": [
 *     { "nrc": "123456/61/1", ... },
 *     { "nrc": "234567/61/1", ... }
 *   ],
 *   "timestamp": "2026-04-18T20:45:00Z"
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateNRC } from '@/lib/nrc'
import type { GeneratedNRC, ApiSuccessResponse } from '@/types/api'
import {
  handleInvalidType,
  handleServerError,
} from '@/app/api/_lib/error-handler'

const MAX_GENERATE_COUNT = 100  // Reasonable default to prevent abuse
const DEFAULT_COUNT = 1

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    // Parse request body
    let body: any = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
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

    // Validate count if provided
    let count = DEFAULT_COUNT
    if (body.count !== undefined) {
      if (typeof body.count !== 'number') {
        return handleInvalidType('count', 'number', typeof body.count, requestId)
      }

      if (!Number.isInteger(body.count) || body.count < 1 || body.count > MAX_GENERATE_COUNT) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_COUNT',
              message: `count must be an integer between 1 and ${MAX_GENERATE_COUNT}`,
              details: {
                received: body.count,
                min: 1,
                max: MAX_GENERATE_COUNT,
              },
              requestId,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
      }

      count = body.count
    }

    // ===== Generate NRC(s) =====
    if (count === 1) {
      // Single NRC: return object directly
      const generated = generateNRC()
      const apiResponse: ApiSuccessResponse<GeneratedNRC> = {
        success: true,
        data: generated,
        timestamp: new Date().toISOString(),
        requestId,
      }
      return NextResponse.json(apiResponse, { status: 201 })
    } else {
      // Multiple NRCs: return array
      const generated = Array.from({ length: count }, () => generateNRC())
      const apiResponse: ApiSuccessResponse<GeneratedNRC[]> = {
        success: true,
        data: generated,
        timestamp: new Date().toISOString(),
        requestId,
      }
      return NextResponse.json(apiResponse, { status: 201 })
    }
  } catch (error) {
    return handleServerError(error, 'generating NRC', requestId)
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
