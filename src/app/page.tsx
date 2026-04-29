'use client'

import { useState } from 'react'

// ─── Local types matching exactly what our API returns ────────────────────────
// These must match NRCValidationResult in src/types/nrc.types.ts exactly.
// Do not add fields that the API does not return.
type NRCSegments = {
  sequence: string
  districtCode: string
  nationalityDigit: string
}

type ValidationResult =
  | { valid: true; input: string; segments: NRCSegments }
  | { valid: false; input: string; segments?: NRCSegments; error: { code: string; message: string; segment: string } }

// ─── Nationality digit lookup ─────────────────────────────────────────────────
const NATIONALITY: Record<string, string> = {
  '1': 'Zambian Citizen',
  '2': 'Commonwealth Citizen',
  '3': 'Other Foreign National',
}

// ─── District code lookup (confirmed codes only) ──────────────────────────────
// Only 3 codes verified from primary sources.
// Unknown codes show the raw code — honest, not broken.
const KNOWN_DISTRICTS: Record<string, string> = {
  '11': 'Lusaka',
  '61': 'Ndola',
  '82': 'Mongu',
}

export default function Home() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [generating, setGenerating] = useState(false)

  // ─── Validate a specific NRC string ────────────────────────────────────────
  // Takes the NRC as a parameter instead of reading from state.
  // This avoids the React state race condition where setInput()
  // hasn't updated yet when handleValidate runs.
  const validateNRC = async (nrc: string) => {
    const cleanNRC = nrc.trim()
    if (!cleanNRC) return

    setValidating(true)
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nrc: cleanNRC }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult({
          valid: false,
          input: cleanNRC,
          error: {
            code: 'API_ERROR',
            message: data.error || 'Validation failed. Please try again.',
            segment: 'system',
          },
        })
      } else {
        setResult(data)
      }
    } catch {
      // Network error — no variable needed, ESLint won't complain
      setResult({
        valid: false,
        input: cleanNRC,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Could not reach the server. Check your connection.',
          segment: 'network',
        },
      })
    } finally {
      setValidating(false)
    }
  }

  const handleValidate = () => validateNRC(input)

  // ─── Generate a test NRC then validate it immediately ──────────────────────
  // Fix: pass the generated NRC directly to validateNRC instead of
  // calling handleValidate() which would read stale state.
  const handleGenerate = async () => {
    setGenerating(true)
    setResult(null)
    try {
      const res = await fetch('/api/generate')
      const data = await res.json()
      setInput(data.nrc)
      // Pass the NRC directly — don't read from state which hasn't updated yet
      await validateNRC(data.nrc)
    } catch {
      console.error('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center px-4 py-12">

      {/* Header */}
      <div className="w-full max-w-lg text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">
            v1 · Format Validation · Open Source
          </span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
          ZED NRC <span className="text-blue-500">Validator</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          Zambian National Registration Card Format Validator
        </p>
      </div>

      {/* Input card */}
      <div className="w-full max-w-lg bg-gray-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-md">
        <p className="text-[10px] text-gray-600 font-mono mb-4 uppercase tracking-wider">
          Format: NNNNNN/NN/N · Example: 613475/61/1
        </p>
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setResult(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
              placeholder="613475/61/1"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-800"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              onClick={handleValidate}
              disabled={validating || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold px-8 rounded-2xl transition-all active:scale-95"
            >
              {validating ? '...' : 'Verify'}
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest py-3 border border-white/5 rounded-xl transition-colors"
          >
            {generating ? 'Generating...' : '⟳  Generate a test NRC'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`w-full max-w-lg mt-6 rounded-[2rem] border p-8 transition-all duration-500 ${
          result.valid
            ? 'bg-green-500/5 border-green-500/20'
            : 'bg-red-500/5 border-red-500/20'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-black uppercase ${
              result.valid ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.valid ? '✓ Valid NRC' : '✗ Invalid NRC'}
            </h3>
            <span className="text-[10px] font-mono text-gray-500">
              {result.input}
            </span>
          </div>

          {result.valid && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Sequence
                </p>
                <p className="text-white font-mono font-bold text-sm">
                  {result.segments.sequence}
                </p>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                  District
                </p>
                <p className="text-white font-bold text-sm">
                  {/* Show name if known, raw code if not — honest, not broken */}
                  {KNOWN_DISTRICTS[result.segments.districtCode] ?? `Code ${result.segments.districtCode}`}
                </p>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Type
                </p>
                <p className="text-white font-bold text-sm">
                  {NATIONALITY[result.segments.nationalityDigit] ?? 'Unknown'}
                </p>
              </div>
            </div>
          )}

          {!result.valid && (
            <div className="space-y-3">
              <div className="bg-black/30 rounded-2xl p-4 border border-red-500/10">
                <p className="text-sm text-red-300 font-medium leading-relaxed">
                  {result.error.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Error Code
                  </p>
                  <p className="text-red-400 font-mono text-xs">
                    {result.error.code}
                  </p>
                </div>
                <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Segment
                  </p>
                  <p className="text-red-400 font-mono text-xs">
                    {result.error.segment}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* API reference */}
      <div className="w-full max-w-lg mt-6 bg-gray-900/40 border border-white/5 rounded-[2rem] p-6">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
          API Endpoints
        </p>
        <div className="space-y-2 font-mono text-xs">
          {[
            { method: 'POST', path: '/api/validate', color: 'text-blue-400' },
            { method: 'POST', path: '/api/validate/batch', color: 'text-blue-400' },
            { method: 'GET',  path: '/api/generate',       color: 'text-green-400' },
            { method: 'GET',  path: '/api/districts',      color: 'text-green-400' },
          ].map(({ method, path, color }) => (
            <div key={path} className="flex gap-4 items-center">
              <span className={`${color} w-10 shrink-0`}>{method}</span>
              <span className="text-gray-500">{path}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <a
          href="https://github.com/THFCMAZ01/zed-nrc-validator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-gray-700 hover:text-blue-400 uppercase tracking-widest transition-all"
        >
          View Source Code on GitHub →
        </a>
        <p className="text-[10px] text-gray-800 mt-2">
          Built by Joshua Mazaza · ZUT Ndola · District strict validation deferred to v2
        </p>
      </div>
    </main>
  )
}