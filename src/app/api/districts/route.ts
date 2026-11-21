import { NextResponse } from 'next/server'
import { CONFIRMED_DISTRICT_CODES } from '@/data/districts'

/**
 * GET /api/districts
 *
 * Returns a partial reference list, not an exhaustive list of valid codes.
 * Absence from this response must never be treated as proof that a code
 * is invalid.
 */
export async function GET() {
  return NextResponse.json(
    {
      districts: CONFIRMED_DISTRICT_CODES,
      total_confirmed: Object.keys(CONFIRMED_DISTRICT_CODES).length,
      dataset_status: 'partial',
      note: 'Only three district-code references are currently confirmed. This dataset is not exhaustive and is not used to reject NRCs.',
      contribute_url: 'https://github.com/THFCMAZ01/zed-nrc-validator/issues',
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}