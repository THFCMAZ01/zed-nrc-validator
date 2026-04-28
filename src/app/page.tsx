'use client'

import { useState } from 'react'

// --- Types ---
type NRCSegments = {
  sequence: string
  districtCode: string
  nationalityDigit: string
}

type ValidationResult =
  | { valid: true; input: string; segments: NRCSegments; districtName: string; isStrict: boolean }
  | { valid: false; input: string; error: { code: string; message: string; segment: string }; isStrict: boolean }

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

  const handleValidate = async () => {
    const cleanInput = input.trim()
    if (!cleanInput) return
   
    setValidating(true)
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nrc: cleanInput }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult({
          valid: false,
          input: cleanInput,
          error: { code: 'API_ERROR', message: data.error || 'Validation failed', segment: 'system' },
          isStrict: true
        })
      } else {
        setResult(data)
      }
    } catch (err) {
      setResult({
        valid: false,
        input: cleanInput,
        error: { code: 'CONN_ERROR', message: 'Check your internet connection', segment: 'network' },
        isStrict: true
      })
    } finally {
      setValidating(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate')
      const data = await res.json()
      setInput(data.nrc)
      // Immediate validation of the generated NRC
      handleValidate()
    } catch (e) {
      console.error("Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center px-4 py-12">
     
      {/* Header Section */}
      <div className="w-full max-w-lg text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">
            Production Ready · Level 2 Strict
          </span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-2 italic">
          ZED NRC <span className="text-blue-500">V2</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium">Official Zambian Identity Verification</p>
      </div>

      {/* Input Card */}
      <div className="w-full max-w-lg bg-gray-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-md">
        <div className="space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
              placeholder="000000/00/0"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-800"
            />
            <button
              onClick={handleValidate}
              disabled={validating || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold px-8 rounded-2xl transition-all active:scale-95"
            >
              {validating ? '...' : 'Verify'}
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest py-3 border border-white/5 rounded-xl transition-colors"
          >
            {generating ? 'Rolling Dice...' : 'Generate Valid Test Identity'}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`w-full max-w-lg mt-6 rounded-[2rem] border p-8 transition-all duration-500 ${
          result.valid ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-black italic uppercase ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
              {result.valid ? 'Passed' : 'Invalid'}
            </h3>
            <span className="text-[10px] font-mono text-gray-500">{result.input}</span>
          </div>

          {result.valid ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">District</p>
                <p className="text-white font-bold">{result.districtName}</p>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Type</p>
                <p className="text-white font-bold">{NATIONALITY[result.segments.nationalityDigit]}</p>
              </div>
            </div>
          ) : (
            <div className="bg-black/30 rounded-2xl p-4 border border-red-500/10">
              <p className="text-sm text-red-300 font-medium">{result.error.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer & Source Link */}
      <div className="mt-12 text-center">
        <a
          href="https://github.com/THFCMAZ01/zed-nrc-validator"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-700 hover:text-blue-400 uppercase tracking-widest transition-all"
        >
          View Source Code on GitHub
        </a>
      </div>
    </main>
  )
}