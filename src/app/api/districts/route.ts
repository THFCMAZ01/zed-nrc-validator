import { NextResponse } from 'next/server'
import { OBSERVED_DISTRICT_CODES } from '@/data/districts'

/**
 * GET /api/districts
 *
 * Returns codes observed in cited public records. This is not an official,
 * complete DNRPC directory and must not be used as a validation allowlist.
 */
export async function GET() {
  return NextResponse.json(
    {
      observed_codes: OBSERVED_DISTRICT_CODES,
      total_observed: OBSERVED_DISTRICT_CODES.length,
      dataset_status: 'observational_partial',
      official_dnrpc_directory: false,
      note:
        'These codes have been observed in public records, but their official place-name mappings and completeness have not been established. Absence from this list does not mean a code is invalid.',
      contribute_url: 'https://github.com/THFCMAZ01/zed-nrc-validator/issues',
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}
