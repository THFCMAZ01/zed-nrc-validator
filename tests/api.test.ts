// @vitest-environment node
import { describe, test, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as validateSingle } from '@/app/api/validate/route'
import { POST as validateBatch } from '@/app/api/validate/batch/route'
import { GET as generate } from '@/app/api/generate/route'
import { GET as districts } from '@/app/api/districts/route'

function postRequest(path: string, body: unknown) {
  return new NextRequest('http://localhost' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function rawPostRequest(path: string, body: string) {
  return new NextRequest('http://localhost' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
}

describe('POST /api/validate', () => {
  test('returns a format result for a string input', async () => {
    const response = await validateSingle(
      postRequest('/api/validate', { nrc: '613475/61/1' })
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.valid).toBe(true)
    expect(body.validationLevel).toBe('format')
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  test('returns 200 when the submitted NRC format is invalid', async () => {
    const response = await validateSingle(
      postRequest('/api/validate', { nrc: 'not-an-nrc' })
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.valid).toBe(false)
  })

  test('rejects malformed JSON', async () => {
    const response = await validateSingle(rawPostRequest('/api/validate', '{'))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('INVALID_JSON')
  })

  test('rejects non-string NRC values', async () => {
    const response = await validateSingle(
      postRequest('/api/validate', { nrc: 123456 })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('INVALID_REQUEST_BODY')
  })

  test('rejects a non-boolean legacy strict option', async () => {
    const response = await validateSingle(
      postRequest('/api/validate', { nrc: '613475/61/1', strict: 'yes' })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('INVALID_STRICT_OPTION')
  })
})

describe('POST /api/validate/batch', () => {
  test('validates a mixed batch and returns an accurate summary', async () => {
    const response = await validateBatch(
      postRequest('/api/validate/batch', {
        nrcs: ['613475/61/1', 'not-an-nrc'],
      })
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.summary).toEqual({ total: 2, valid: 1, invalid: 1 })
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  test('rejects numeric and null entries instead of coercing them to strings', async () => {
    const response = await validateBatch(
      postRequest('/api/validate/batch', {
        nrcs: ['613475/61/1', 123, null],
      })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('INVALID_BATCH_ITEM')
    expect(body.error.field).toBe('nrcs[1]')
  })

  test('rejects an empty batch', async () => {
    const response = await validateBatch(
      postRequest('/api/validate/batch', { nrcs: [] })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('EMPTY_BATCH')
  })

  test('accepts the maximum batch size of 50', async () => {
    const response = await validateBatch(
      postRequest('/api/validate/batch', {
        nrcs: Array.from({ length: 50 }, () => '613475/61/1'),
      })
    )

    expect(response.status).toBe(200)
    expect((await response.json()).summary.total).toBe(50)
  })

  test('rejects more than 50 items', async () => {
    const response = await validateBatch(
      postRequest('/api/validate/batch', {
        nrcs: Array.from({ length: 51 }, () => '613475/61/1'),
      })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('BATCH_LIMIT_EXCEEDED')
  })

  test('rejects a non-boolean legacy strict option', async () => {
    const response = await validateBatch(
      postRequest('/api/validate/batch', {
        nrcs: ['613475/61/1'],
        strict: 'true',
      })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('INVALID_STRICT_OPTION')
  })
})

describe('GET reference and sample endpoints', () => {
  test('district endpoint identifies its dataset as partial', async () => {
    const response = await districts()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.total_observed).toBe(28)
    expect(body.dataset_status).toBe('observational_partial')
    expect(body.official_dnrpc_directory).toBe(false)
    expect(body.observed_codes.some((entry: { code: string }) => entry.code === '15')).toBe(true)
  })

  test('generator returns a synthetic sample and prevents caching', async () => {
    const response = await generate()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.synthetic).toBe(true)
    expect(body.nrc).toMatch(/^\d{6}\/\d{2}\/[0-9]$/)
    expect(response.headers.get('cache-control')).toBe('no-store')
  })
})