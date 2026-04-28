'use client'

import { useState } from 'react'

type NRCSegments = {
  sequence: string
  districtCode: string
  nationalityDigit: string
}

type ValidationResult =
  | { valid: true; input: string; segments: NRCSegments }
  | {
      valid: false
      input: string
      segments?: NRCSegments
      error: { code: string; message: string; segment: string }
    }

type GenerateResult = {
  nrc: string
  districtCode: string
  nationalityDigit: number
}

const NATIONALITY: Record<string, string> = {
  '1': 'Zambian Citizen',
  '2': 'Commonwealth Citizen',
  '3': 'Other Foreign National',
}

export default function Home() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [generating, setGenerating] = useState(false)

  async function handleValidate() {
    if (!input.trim()) return
    setValidating(true)
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nrc: input.trim() }),
      })
      setResult(await res.json())
    } catch {
      setResult(null)
    } finally {
      setValidating(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate')
      const data: GenerateResult = await res.json()
      setInput(data.nrc)
      setResult(null)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4 py-12">

      {/* Header */}
      <div className="w-full max-w-lg text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700/40 rounded-full px-4 py-1 mb-5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-medium tracking-wide">
            Open source · Free to use
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
          ZED NRC Validator
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Validate Zambian National Registration Card numbers.<br />
          Built for developers building on Zambia.
        </p>
      </div>

      {/* Input card */}
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <p className="text-xs text-gray-500 font-mono mb-3">
          Format:{' '}
          <span className="text-gray-300">NNNNNN/NN/N</span>
          {'  '}
          Example:{' '}
          <span className="text-gray-300">613475/61/1</span>
        </p>

        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setResult(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            placeholder="613475/61/1"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={handleValidate}
            disabled={validating || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
          >
            {validating ? '...' : 'Validate'}
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full text-xs text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-600 rounded-xl py-2 transition-colors"
        >
          {generating ? 'Generating...' : '⟳  Generate a test NRC'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`w-full max-w-lg mt-4 rounded-2xl border p-6 shadow-xl ${
            result.valid
              ? 'bg-green-950/40 border-green-700/40'
              : 'bg-red-950/40 border-red-700/40'
          }`}
        >
          <p
            className={`text-xl font-bold mb-4 ${
              result.valid ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {result.valid ? '✓  Valid NRC' : '✗  Invalid NRC'}
          </p>

          {result.valid && result.segments && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Segment breakdown
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sequence', value: result.segments.sequence },
                  { label: 'District Code', value: result.segments.districtCode },
                  { label: 'Nationality', value: result.segments.nationalityDigit },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-900/70 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="font-mono text-white font-semibold text-sm">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 pt-1">
                {NATIONALITY[result.segments.nationalityDigit] ?? 'Unknown'}
              </p>
            </div>
          )}

          {!result.valid && (
            <div className="space-y-3">
              <div className="bg-gray-900/70 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
                  Error
                </p>
                <p className="text-red-300 text-sm leading-relaxed">
                  {result.error.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/70 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Code</p>
                  <p className="font-mono text-xs text-red-400">
                    {result.error.code}
                  </p>
                </div>
                <div className="bg-gray-900/70 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Segment</p>
                  <p className="font-mono text-xs text-red-400">
                    {result.error.segment}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* API reference */}
      <div className="w-full max-w-lg mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          API Endpoints
        </p>
        <div className="space-y-2 font-mono text-xs">
          {[
            { method: 'POST', path: '/api/validate', color: 'text-blue-400' },
            { method: 'POST', path: '/api/validate/batch', color: 'text-blue-400' },
            { method: 'GET', path: '/api/generate', color: 'text-green-400' },
            { method: 'GET', path: '/api/districts', color: 'text-green-400' },
          ].map(({ method, path, color }) => (
            <div key={path} className="flex gap-4 items-center">
              <span className={`${color} w-10 shrink-0`}>{method}</span>
              <span className="text-gray-400">{path}</span>
            </div>
          ))}
        </div>
        
          href="https://github.com/THFCMAZ01/zed-nrc-validator"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          View source on GitHub →
        </a>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-700 text-center">
        Built by Joshua Mazaza · ZUT Ndola · District code strict validation deferred to v2 ·{' '}
        
          href="https://github.com/THFCMAZ01/zed-nrc-validator/blob/main/docs/ADR-001-muchinga-province.md"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-500"
        >
          ADR-001
        </a>
      </p>
    </main>
  )
}s