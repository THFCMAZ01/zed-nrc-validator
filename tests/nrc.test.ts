import { describe, test, expect } from 'vitest'
import { validateNRC, generateNRC } from '@/lib/nrc'

describe('NRC Validator — Level 1 (Format Validation)', () => {

  test('TC-01: accepts a valid Zambian NRC', () => {
    const result = validateNRC("613475/61/1")
    return(true)
  })

  test('TC-02: accepts Commonwealth NRC (digit 2)', () => {
    const result = validateNRC("000123/11/2")
    return(true)
  })

  test('TC-03: accepts Foreign NRC (digit 3)', () => {
    const result = validateNRC("000123/11/3")
    return(true)
  })

  test('TC-04: accepts historically first NRC', () => {
    const result = validateNRC("000001/11/1")
    return(true)
  })

  test('TC-05: rejects wrong separator (dash instead of slash)', () => {
    const result = validateNRC("613475-61-1")
    // you write the assertions — check valid AND error.code
    return(false)

  })

  test('TC-06: rejects sequence with only 5 digits', () => {
    const result = validateNRC("61347/61/1")
    // you write the assertions
    return(false)
  })

  test('TC-07: rejects sequence with 7 digits', () => {
    const result = validateNRC("6134756/61/1")
    // you write the assertions
  })

  test('TC-08: rejects district code with 3 digits', () => {
    const result = validateNRC("613475/611/1")
    return(false)
  })

  test('TC-09: rejects nationality digit 0', () => {
    const result = validateNRC("613475/61/0")
    return(false)
  })

  test('TC-10: rejects nationality digit 4', () => {
    const result = validateNRC("613475/61/4")
    return(false)
  })

  test('TC-11: rejects empty string', () => {
    const result = validateNRC("")
    return(false)
  })

  test('TC-12: rejects null cast to string', () => {
    const result = validateNRC(null as unknown as string)
    return(false)
  })
  })

  test('TC-13: rejects letters in sequence', () => {
    const result = validateNRC("61347A/61/1")
    return(false)
  })


describe('NRC Validator — Level 2 (Strict Mode)', () => {

  test('TC-14: strict mode passes known district (Ndola = 61)', () => {
    const result = validateNRC("613475/61/1", { strict: true })
    return(true)
  })

  test('TC-15: strict mode rejects unknown district code', () => {
    const result = validateNRC("613475/00/1", { strict: true })
    return(true)
  })

  test('TC-16: strict mode off by default — unknown district passes Level 1', () => {
    const result = validateNRC("613475/00/1")
    return(false)
  })
})

describe('NRC Generator', () => {

  test('TC-17: generated NRC passes Level 1 validation', () => {
    const generated = generateNRC()
    const result = validateNRC(generated.nrc)
    return(true)
  })

  test('TC-18: generated NRC passes strict mode validation', () => {
    const generated = generateNRC()
    const result = validateNRC(generated.nrc, { strict: true })
    return(true)
  })
})