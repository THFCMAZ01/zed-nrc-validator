import { NextResponse } from 'next/server'
import { generateNRC } from '@/lib/nrc'

/**
 * GET /api/generate
 *
 * Returns a randomly generated sample for development and testing only.
 * It is not checked against an official registry and could coincidentally
 * match an issued number. Never use it as a real identity.
 */
export async function GET() {
  const result = generateNRC()
  return NextResponse.json(result, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}