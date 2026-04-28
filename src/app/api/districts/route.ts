import { NextResponse } from 'next/server'
import { CONFIRMED_DISTRICT_CODES } from '@/data/districts'

/**
 * GET /api/districts
 *
 * Returns all confirmed Zambian NRC district codes.
 *
 * NOTE: Only 3 codes are confirmed from primary sources.
 * Strict mode validation requires this list to be complete and verified.
 * It is therefore deferred to v2.
 * See docs/ADR-001-muchinga-province.md for full reasoning.
 *
 * Response 200:
 *   { districts, total_confirmed, note, contribute_url }
 */
export async function GET() {
  return NextResponse.json(
    {
      districts: CONFIRMED_DISTRICT_CODES,
      total_confirmed: Object.keys(CONFIRMED_DISTRICT_CODES).length,
      note: 'Only codes verified from primary sources are included. Strict mode district validation is deferred to v2. See ADR-001 for full reasoning.',
      contribute_url: 'https://github.com/THFCMAZ01/zed-nrc-validator/issues',
    },
    { status: 200 }
  )
}