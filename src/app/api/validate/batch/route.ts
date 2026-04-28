import { NextRequest, NextResponse } from 'next/server'
import { validateNRC } from '@/lib/nrc'
import type { NRCBatchResult, NRCValidateOptions } from '@/types/nrc.types'

const BATCH_LIMIT = 50

/**
 * POST /api/validate/batch
 *
 * Validates up to 50 NRC numbers in a single request.
 *
 * Request body:
 *   { "nrcs": string[], "strict"?: boolean }
 *
 * Response 200:
 *   NRCBatchResult — array of individual results + a summary
 *
 * Response 400:
 *   { "error": string } — malformed request or over the batch limit
 */
export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 }
    )
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !Array.isArray((body as Record<string, unknown>).nrcs)
  ) {
    return NextResponse.json(
      { error: "Request body must include an 'nrcs' array of strings." },
      { status: 400 }
    )
  }

  const { nrcs, strict } = body as { nrcs: unknown[]; strict?: unknown }

  if (nrcs.length > BATCH_LIMIT) {
    return NextResponse.json(
      {
        error: `Batch limit is ${BATCH_LIMIT} NRC numbers per request. Received: ${nrcs.length}.`,
      },
      { status: 400 }
    )
  }

  const options: NRCValidateOptions = {
    strict: typeof strict === 'boolean' ? strict : false,
  }

  const results = nrcs.map((nrc) =>
    validateNRC(typeof nrc === 'string' ? nrc : String(nrc), options)
  )

  const validCount = results.filter((r) => r.valid).length

  const response: NRCBatchResult = {
    results,
    summary: {
      total: results.length,
      valid: validCount,
      invalid: results.length - validCount,
    },
  }

  return NextResponse.json(response, { status: 200 })
}