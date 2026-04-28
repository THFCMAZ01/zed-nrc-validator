import { NextRequest, NextResponse } from 'next/server'
import { validateNRC } from '@/lib/nrc'
import type { NRCValidateOptions } from '@/types/nrc.types'

/**
 * POST /api/validate
 *
 * Validates a single Zambian NRC number.
 *
 * Request body:
 *   { "nrc": string, "strict"?: boolean }
 *
 * Response 200 — always returned when the request is well-formed.
 *   The NRCValidationResult tells you if the NRC itself is valid.
 *
 * Response 400 — only when the request body is malformed.
 *   { "error": string }
 *
 * Note: A valid HTTP request containing an invalid NRC returns 200,
 * not 400. The request succeeded. The NRC failed. These are different.
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
    !('nrc' in body) ||
    typeof (body as Record<string, unknown>).nrc !== 'string'
  ) {
    return NextResponse.json(
      { error: "Request body must include an 'nrc' field of type string." },
      { status: 400 }
    )
  }

  const { nrc, strict } = body as { nrc: string; strict?: unknown }

  const options: NRCValidateOptions = {
    strict: typeof strict === 'boolean' ? strict : false,
  }

  const result = validateNRC(nrc, options)
  return NextResponse.json(result, { status: 200 })
}