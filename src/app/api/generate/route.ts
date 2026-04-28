import { NextResponse } from 'next/server'
import { generateNRC } from '@/lib/nrc'

/**
 * GET /api/generate
 *
 * Generates a syntactically valid fake NRC number for testing purposes.
 * The generated NRC will always pass Level 1 format validation.
 * Uses confirmed district code 61 (Ndola, Copperbelt).
 *
 * Response 200:
 *   NRCGenerateResult — { nrc, districtCode, nationalityDigit }
 */
export async function GET() {
  const result = generateNRC()
  return NextResponse.json(result, { status: 200 })
}