import { NextRequest, NextResponse } from 'next/server'
import { validateNRC } from '@/lib/nrc'
import type { NRCBatchResult } from '@/types/nrc.types'

const BATCH_LIMIT = 50
const NO_STORE = { 'Cache-Control': 'no-store' }

function badRequest(code: string, message: string, field?: string) {
  return NextResponse.json(
    { error: { code, message, ...(field ? { field } : {}) } },
    { status: 400, headers: NO_STORE }
  )
}

/**
 * POST /api/validate/batch
 *
 * Accepts 1–50 NRC strings. A malformed request returns 400; individual
 * NRCs with an invalid format are included in the 200 batch result.
 */
export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return badRequest('INVALID_JSON', 'Request body must be valid JSON.')
  }

  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    !('nrcs' in body) ||
    !Array.isArray((body as Record<string, unknown>).nrcs)
  ) {
    return badRequest(
      'INVALID_REQUEST_BODY',
      "Request body must include an 'nrcs' array of strings.",
      'nrcs'
    )
  }

  const payload = body as Record<string, unknown>
  const nrcs = payload.nrcs as unknown[]

  if (nrcs.length === 0) {
    return badRequest(
      'EMPTY_BATCH',
      'Provide at least one NRC. The batch must contain 1–50 items.',
      'nrcs'
    )
  }

  if (nrcs.length > BATCH_LIMIT) {
    return badRequest(
      'BATCH_LIMIT_EXCEEDED',
      'A batch can contain at most 50 NRC numbers.',
      'nrcs'
    )
  }

  if ('strict' in payload && typeof payload.strict !== 'boolean') {
    return badRequest(
      'INVALID_STRICT_OPTION',
      "The optional 'strict' field must be a boolean.",
      'strict'
    )
  }

  const invalidIndex = nrcs.findIndex((value) => typeof value !== 'string')
  if (invalidIndex !== -1) {
    return badRequest(
      'INVALID_BATCH_ITEM',
      'Every item in the nrcs array must be a string.',
      'nrcs[' + invalidIndex + ']'
    )
  }

  const results = (nrcs as string[]).map((nrc) =>
    validateNRC(nrc, { strict: payload.strict as boolean | undefined })
  )
  const validCount = results.filter((result) => result.valid).length

  const response: NRCBatchResult = {
    results,
    summary: {
      total: results.length,
      valid: validCount,
      invalid: results.length - validCount,
    },
  }

  return NextResponse.json(response, { status: 200, headers: NO_STORE })
}