import { NextRequest, NextResponse } from 'next/server'
import { validateNRC } from '@/lib/nrc'

const NO_STORE = { 'Cache-Control': 'no-store' }

function badRequest(code: string, message: string, field?: string) {
  return NextResponse.json(
    { error: { code, message, ...(field ? { field } : {}) } },
    { status: 400, headers: NO_STORE }
  )
}

/**
 * POST /api/validate
 *
 * A well-formed request returns 200, even when the NRC format is invalid.
 * The result's valid property describes format only, not registry status.
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
    !('nrc' in body) ||
    typeof (body as Record<string, unknown>).nrc !== 'string'
  ) {
    return badRequest(
      'INVALID_REQUEST_BODY',
      "Request body must include an 'nrc' field of type string.",
      'nrc'
    )
  }

  const payload = body as Record<string, unknown>

  if ('strict' in payload && typeof payload.strict !== 'boolean') {
    return badRequest(
      'INVALID_STRICT_OPTION',
      "The optional 'strict' field must be a boolean.",
      'strict'
    )
  }

  // strict is retained for compatibility but does not perform district lookup.
  const result = validateNRC(payload.nrc as string, {
    strict: payload.strict as boolean | undefined,
  })

  return NextResponse.json(result, { status: 200, headers: NO_STORE })
}