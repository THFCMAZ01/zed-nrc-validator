'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { CONFIRMED_DISTRICT_CODES } from '@/data/districts'
import type { NRCValidationResult } from '@/types/nrc.types'

const NATIONALITY_LABELS: Record<string, string> = {
  '1': 'Zambian citizen',
  '2': 'Commonwealth citizen',
  '3': 'Other foreign national',
}

export default function Home() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<NRCValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [requestError, setRequestError] = useState('')

  const validateNRC = async (value: string) => {
    setRequestError('')
    setValidating(true)

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ nrc: value }),
      })

      const payload: unknown = await response.json()

      if (!response.ok) {
        const errorPayload = payload as {
          error?: string | { message?: string }
        }
        const message =
          typeof errorPayload.error === 'string'
            ? errorPayload.error
            : errorPayload.error?.message
        throw new Error(message || 'The request could not be completed.')
      }

      setResult(payload as ValidationResult)
    } catch (error) {
      setResult(null)
      setRequestError(
        error instanceof Error
          ? error.message
          : 'Could not reach the validation service. Check your connection.'
      )
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (input.length === 0 || validating || generating) return
    void validateNRC(input)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setResult(null)
    setRequestError('')

    try {
      const response = await fetch('/api/generate', { cache: 'no-store' })
      const payload = (await response.json()) as { nrc?: unknown }

      if (!response.ok || typeof payload.nrc !== 'string') {
        throw new Error('A test example could not be generated.')
      }

      setInput(payload.nrc)
      await validateNRC(payload.nrc)
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : 'A test example could not be generated.'
      )
    } finally {
      setGenerating(false)
    }
  }

  const clearResult = (value: string) => {
    setInput(value)
    setResult(null)
    setRequestError('')
  }

  return (
    <div className="app-frame">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Zed NRC Validator home">
          <span className="brand-mark" aria-hidden="true">Z</span>
          <span className="brand-copy">
            <span className="brand-overline">ZED / DEVELOPER TOOLS</span>
            <span className="brand-name">NRC Validator</span>
          </span>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <a href="#api">API reference</a>
          <a href="https://github.com/THFCMAZ01/zed-nrc-validator" target="_blank" rel="noreferrer">
            Source code <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-meta">
            <span className="eyebrow">ZAMBIA / NATIONAL REGISTRATION CARD</span>
            <span className="hero-index">UTILITY 001</span>
          </div>

          <h1>
            Check the format.
            <br />
            <span>Not the identity.</span>
          </h1>

          <p className="hero-intro">
            A lightweight tool for checking the written structure of a Zambian
            NRC number. It does not connect to a government registry or verify
            who a number belongs to.
          </p>
        </section>

        <section className="workspace" aria-label="NRC format checker">
          <div className="checker-panel">
            <div className="panel-heading">
              <div>
                <p className="section-index">01 / FORMAT CHECK</p>
                <h2>Enter an NRC number</h2>
              </div>
              <span className="mode-label">
                <span className="mode-dot" />
                Format only
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="nrc-input">
                <span>National Registration Card number</span>
                <span className="field-count">11 characters</span>
              </label>

              <div className="input-row">
                <input
                  id="nrc-input"
                  className="nrc-input"
                  type="text"
                  inputMode="text"
                  value={input}
                  onChange={(event) => clearResult(event.target.value)}
                  placeholder="123456/78/1"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-describedby="nrc-help"
                />
                <button
                  className="primary-button"
                  type="submit"
                  disabled={input.length === 0 || validating || generating}
                >
                  {validating ? 'Checking…' : 'Check format'}
                  <span aria-hidden="true">↗</span>
                </button>
              </div>

              <p className="field-help" id="nrc-help">
                Pattern: six digits / two digits / one digit. Enter the value
                as written; spaces are not removed automatically.
              </p>
            </form>

            <div className="panel-actions">
              <button
                className="sample-button"
                type="button"
                onClick={handleGenerate}
                disabled={generating || validating}
              >
                <span className="sample-icon" aria-hidden="true">＋</span>
                {generating ? 'Creating sample…' : 'Generate a synthetic example'}
              </button>
              <p className="privacy-note">
                No account is required. This tool has no application database
                for storing submitted numbers.
              </p>
            </div>

            {requestError && (
              <div className="request-error" role="alert">
                <strong>Request not completed</strong>
                <p>{requestError}</p>
              </div>
            )}

            {result && (
              <section
                className={'result-panel ' + (result.valid ? 'result-pass' : 'result-fail')}
                aria-live="polite"
                aria-label="Format check result"
              >
                <div className="result-heading">
                  <div>
                    <p className="section-index">02 / RESULT</p>
                    <h3>{result.valid ? 'Format matches' : 'Format needs attention'}</h3>
                  </div>
                  <span className="result-stamp">
                    {result.valid ? 'MATCH' : 'REVIEW'}
                  </span>
                </div>

                {result.valid ? (
                  <>
                    <div className="segment-results">
                      <div className="segment-item">
                        <span>SEQUENCE</span>
                        <strong>{result.segments.sequence}</strong>
                      </div>
                      <div className="segment-item">
                        <span>DISTRICT CODE</span>
                        <strong>{result.segments.districtCode}</strong>
                      </div>
                      <div className="segment-item">
                        <span>FINAL DIGIT</span>
                        <strong>{result.segments.nationalityDigit}</strong>
                      </div>
                    </div>

                    <dl className="reference-rows">
                      <div>
                        <dt>District reference</dt>
                        <dd>
                          {CONFIRMED_DISTRICT_CODES[result.segments.districtCode] ??
                            'Not in the confirmed reference list'}
                        </dd>
                      </div>
                      <div>
                        <dt>Nationality category</dt>
                        <dd>
                          {NATIONALITY_LABELS[result.segments.nationalityDigit]}
                        </dd>
                      </div>
                    </dl>

                    <p className="result-caveat">
                      A matching format is not proof that this number was
                      issued, is active, or belongs to the person presenting it.
                    </p>
                  </>
                ) : (
                  <div className="validation-message">
                    <span className="error-code">{result.error.code}</span>
                    <p>{result.error.message}</p>
                    <span className="error-segment">
                      Affected part: {result.error.segment}
                    </span>
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="reference-panel">
            <div className="panel-heading side-heading">
              <div>
                <p className="section-index">REFERENCE / 01</p>
                <h2>How the format is read</h2>
              </div>
            </div>

            <div className="format-display" aria-label="Example format 123456 slash 78 slash 1">
              <span>123456</span>
              <i>/</i>
              <span>78</span>
              <i>/</i>
              <span>1</span>
            </div>

            <div className="format-legend">
              <div>
                <span className="legend-number">01</span>
                <div>
                  <strong>Sequence</strong>
                  <p>Six numeric characters</p>
                </div>
              </div>
              <div>
                <span className="legend-number">02</span>
                <div>
                  <strong>District code</strong>
                  <p>Two numeric characters</p>
                </div>
              </div>
              <div>
                <span className="legend-number">03</span>
                <div>
                  <strong>Nationality digit</strong>
                  <p>1, 2, or 3</p>
                </div>
              </div>
            </div>

            <div className="reference-callout">
              <p className="section-index">DISTRICT DATA</p>
              <strong>Reference list is incomplete</strong>
              <p>
                Three district-code references are currently confirmed. Other
                two-digit codes are left unclassified, not rejected.
              </p>
              <a href="/api/districts" target="_blank" rel="noreferrer">
                Inspect the reference data <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="scope-note">
              <span className="scope-mark" aria-hidden="true">i</span>
              <p>
                A format check can catch typing mistakes. It cannot establish
                whether an NRC exists in the national register.
              </p>
            </div>
          </aside>
        </section>

        <section className="api-section" id="api">
          <div className="api-heading">
            <div>
              <p className="section-index">03 / FOR DEVELOPERS</p>
              <h2>Use the API</h2>
            </div>
            <p>JSON endpoints for integrating format checks into your application.</p>
          </div>

          <div className="endpoint-list">
            <div className="endpoint-row">
              <span className="http-method method-post">POST</span>
              <code>/api/validate</code>
              <span className="endpoint-description">Check one number</span>
            </div>
            <div className="endpoint-row">
              <span className="http-method method-post">POST</span>
              <code>/api/validate/batch</code>
              <span className="endpoint-description">Check up to 50 numbers</span>
            </div>
            <a href="/api/generate" className="endpoint-row">
              <span className="http-method method-get">GET</span>
              <code>/api/generate</code>
              <span className="endpoint-description">Generate a test sample</span>
              <span className="endpoint-arrow" aria-hidden="true">↗</span>
            </a>
            <a href="/api/districts" className="endpoint-row">
              <span className="http-method method-get">GET</span>
              <code>/api/districts</code>
              <span className="endpoint-description">Read confirmed references</span>
              <span className="endpoint-arrow" aria-hidden="true">↗</span>
            </a>
          </div>

          <p className="api-footnote">
            Validation endpoints return Cache-Control: no-store. Invalid NRC
            formats are returned as validation results; malformed API requests
            return HTTP 400.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <span>ZED NRC VALIDATOR <span className="footer-divider">/</span> FORMAT CHECKING UTILITY</span>
        <a href="https://github.com/THFCMAZ01/zed-nrc-validator" target="_blank" rel="noreferrer">
          Open source on GitHub <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  )
}