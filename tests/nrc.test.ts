import { describe, test, expect } from 'vitest'
import { validateNRC, generateNRC } from '@/lib/nrc'

describe('NRC Validator — format validation', () => {
  test('accepts a correctly structured NRC example', () => {
    const result = validateNRC('613475/61/1')
    expect(result.valid).toBe(true)
    expect(result.validationLevel).toBe('format')
  })

  test('accepts every single ASCII digit in the country-code position structurally', () => {
    // This tests the observed structural pattern, not whether DNRPC has
    // officially assigned each value to an NRC category.
    for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      const result = validateNRC('000123/11/' + digit)
      expect(result.valid).toBe(true)
      if (result.valid) expect(result.segments.countryCode).toBe(digit)
    }
  })

  test('preserves leading zeroes in every segment', () => {
    const result = validateNRC('000001/01/0')
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.segments.sequence).toBe('000001')
      expect(result.segments.districtCode).toBe('01')
      expect(result.segments.countryCode).toBe('0')
    }
  })

  test('does not reject an unobserved district code', () => {
    expect(validateNRC('613475/99/1').valid).toBe(true)
  })

  test('rejects whitespace around an otherwise valid NRC', () => {
    expect(validateNRC(' 613475/61/1').valid).toBe(false)
    expect(validateNRC('613475/61/1 ').valid).toBe(false)
  })

  test('rejects Unicode numerals rather than normalising them', () => {
    expect(validateNRC('٦١٣٤٧٥/٦١/١').valid).toBe(false)
  })

  test('rejects a trailing line break despite the regular expression end anchor', () => {
    expect(validateNRC('613475/61/1\n').valid).toBe(false)
    expect(validateNRC('613475/61/1\r\n').valid).toBe(false)
  })

  test('rejects a dash in place of the separators', () => {
    const result = validateNRC('613475-61-1')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error.code).toBe('INVALID_FORMAT')
  })

  test('identifies a short sequence', () => {
    const result = validateNRC('61347/61/1')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.code).toBe('INVALID_SEQUENCE_LENGTH')
      expect(result.error.segment).toBe('sequence')
    }
  })

  test('identifies a long sequence', () => {
    const result = validateNRC('6134756/61/1')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error.code).toBe('INVALID_SEQUENCE_LENGTH')
  })

  test('rejects a non-numeric sequence', () => {
    const result = validateNRC('61347A/61/1')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.code).toBe('INVALID_FORMAT')
      expect(result.error.segment).toBe('sequence')
    }
  })

  test('rejects a district code with the wrong length', () => {
    const result = validateNRC('613475/611/1')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error.segment).toBe('districtCode')
  })

  test('rejects a non-numeric district code', () => {
    const result = validateNRC('613475/6A/1')
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.code).toBe('INVALID_FORMAT')
      expect(result.error.segment).toBe('districtCode')
    }
  })

  test('rejects a multi-character or non-numeric country-code segment', () => {
    for (const suffix of ['', '10', 'A']) {
      expect(validateNRC('613475/61/' + suffix).valid).toBe(false)
    }
  })

  test('rejects missing, extra, or empty segments', () => {
    for (const value of [
      '613475/61',
      '613475/61/1/2',
      '/61/1',
      '613475//1',
      '613475/61/',
    ]) {
      expect(validateNRC(value).valid).toBe(false)
    }
  })

  test('rejects an empty string', () => {
    const result = validateNRC('')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error.code).toBe('EMPTY_INPUT')
  })

  test('rejects whitespace-only input', () => {
    const result = validateNRC('   ')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error.code).toBe('EMPTY_INPUT')
  })

  test('does not throw when a JavaScript caller passes null', () => {
    const result = validateNRC(null as unknown as string)
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error.code).toBe('EMPTY_INPUT')
  })

  test('legacy strict option remains format-only for unobserved codes', () => {
    expect(validateNRC('613475/99/1', { strict: true }).valid).toBe(true)
  })
})

describe('NRC Generator', () => {
  test('generates a synthetic sample that passes structural validation', () => {
    const generated = generateNRC()
    const result = validateNRC(generated.nrc)
    expect(result.valid).toBe(true)
    expect(generated.synthetic).toBe(true)
  })

  test('uses a single-digit country-code-shaped value', () => {
    const generated = generateNRC()
    expect(generated.countryCode).toMatch(/^[0-9]$/)
  })
})
