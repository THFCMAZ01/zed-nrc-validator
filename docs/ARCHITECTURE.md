# Architecture & Design — Zed NRC Validator

**Status:** v1.0.0 (April 2026)  
**Student:** Joshua Mazaza, ZUT Year 3 SE  
**Scope:** Zambian NRC Validation System

---

## 1. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER LAYER (Coming Soon)                     │
│  ┌──────────────────┐  ┌────────────────────┐  ┌──────────────┐ │
│  │  Web Interface   │  │   API Clients      │  │  CLI Tools   │ │
│  │  (React)         │  │   (Mobile, etc.)   │  │  (Future)    │ │
│  └────────┬─────────┘  └─────────┬──────────┘  └──────┬───────┘ │
└───────────┼──────────────────────┼──────────────────────┼─────────┘
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   │
            ┌──────────────────────▼──────────────────────┐
            │         NEXT.JS 14 APP ROUTER              │
            │  ┌─────────────────────────────────────┐   │
            │  │     API LAYER (Server-Side)         │   │
            │  │  ┌───────────────────────────────┐  │   │
            │  │  │ /api/validation               │  │   │
            │  │  │ /api/validation/batch         │  │   │
            │  │  │ /api/generation               │  │   │
            │  │  │ /api-docs                     │  │   │
            │  │  └───────────────────────────────┘  │   │
            │  │              ▼                       │   │
            │  │  ┌───────────────────────────────┐  │   │
            │  │  │ Error Handler (Middleware)    │  │   │
            │  │  │ Request Validation            │  │   │
            │  │  │ Response Wrapping             │  │   │
            │  │  └───────────────────────────────┘  │   │
            │  └─────────────────────────────────────┘   │
            │              ▼                             │
            │  ┌─────────────────────────────────────┐   │
            │  │     BUSINESS LOGIC LAYER            │   │
            │  │  (Pure Functions, No Dependencies)  │   │
            │  │                                     │   │
            │  │  ┌─────────────────────────────┐    │   │
            │  │  │  lib/nrc/                   │    │   │
            │  │  │  - validator.ts (6 steps)   │    │   │
            │  │  │  - generator.ts             │    │   │
            │  │  │  - districts.ts (10 prov.)  │    │   │
            │  │  │  - types.ts (TypeScript)    │    │   │
            │  │  │  - index.ts (public API)    │    │   │
            │  │  └─────────────────────────────┘    │   │
            │  └─────────────────────────────────────┘   │
            └──────────────────────────────────────────────┘
```

---

## 2. FOLDER STRUCTURE (FINAL)

```
src/
  lib/nrc/                          # Business logic (validated, tested)
    ├── validator.ts               # 6-step validation with diagnostics
    ├── generator.ts               # Random NRC generation
    ├── districts.ts               # Zambian district codes (10 provinces)
    ├── types.ts                   # TypeScript types (discriminated unions)
    └── index.ts                   # Public API exports

  types/                            # Shared types across application
    └── api.ts                     # API request/response types

  app/
    ├── api/
    │   ├── validation/
    │   │   ├── route.ts           # POST /api/validation (single NRC)
    │   │   └── batch/
    │   │       └── route.ts       # POST /api/validation/batch (50 max)
    │   │
    │   ├── generation/
    │   │   └── route.ts           # POST /api/generation (random NRC)
    │   │
    │   ├── docs/
    │   │   └── route.ts           # GET /api-docs (HTML + JSON)
    │   │
    │   └── _lib/                  # Shared API utilities
    │       └── error-handler.ts   # Error wrapping, status codes
    │
    ├── page.tsx                   # Home page (coming: UI forms)
    ├── layout.tsx                 # Root layout
    └── globals.css                # Tailwind styles

  components/nrc/                   # React UI components (coming)
    ├── ValidatorForm.tsx          # Form to validate NRC
    └── GeneratorForm.tsx          # Button to generate NRC

tests/
  ├── unit/
  │   └── nrc.test.ts             # 18 tests for validator + generator
  └── api/ (coming)
      ├── validation.test.ts
      ├── batch.test.ts
      └── generation.test.ts

docs/
  ├── ARCHITECTURE.md             # This file
  ├── ADR-001-districts.md        # Decision Record: District Codes
  └── API-CONTRACT.md             # API specification (TODO)
```

---

## 3. DATA FLOW

### Single Validation Flow

```
User Input
   │
   ▼
POST /api/validation { nrc: "613475/61/1", strict: false }
   │
   ├─ Request validation (error-handler.ts)
   │  ├─ Parse JSON
   │  ├─ Check required fields
   │  └─ Type validation
   │
   ├─ Call validateNRC (lib/nrc/validator.ts)
   │  ├─ STEP 1: Check non-empty
   │  ├─ STEP 2: Check format (3 parts)
   │  ├─ STEP 3: Validate sequence (6 digits)
   │  ├─ STEP 4: Validate district (2 digits)
   │  ├─ STEP 5: Validate nationality (1-3)
   │  └─ STEP 6: Strict mode - check district exists
   │
   ├─ Wrap in ApiResponse { success: true, data, timestamp }
   │
   ▼
HTTP 200 OK + JSON
```

### Error Response Flow

```
validateNRC returns: { valid: false, error: { code, message, received, expected, hint } }
   │
   ▼
Route handler catches validation failure
   │
   ├─ Extract error code + received value
   └─ Call handleApiError() from error-handler.ts
      │
      ├─ Determine HTTP status (400 for validation errors)
      └─ Wrap in ApiErrorResponse { success: false, error, timestamp }
   │
   ▼
HTTP 400 Bad Request + JSON
```

---

## 4. KEY DESIGN DECISIONS

### 4.1 Separation of Concerns

**Why we have 3 separate layers:**

| Layer | Responsibility | Why Separate |
|-------|-----------------|--------------|
| **Business Logic** (`lib/nrc/`) | Validate, generate, store rules | Can be used independently (CLI, tests, etc.) |
| **API Layer** (`app/api/`) | Handle HTTP, validate requests, wrap responses | HTTP is just transport; logic shouldn't know about it |
| **Types** (`types/api.ts` + `lib/nrc/types.ts`) | Define data shapes | Types are contracts; keep them separate from implementations |

This allows:
- Testing business logic **without** mocking HTTP
- Reusing validation in CLI or background jobs
- Changing API transport (HTTP → WebSocket) without touching business logic

### 4.2 Discriminated Unions for Type Safety

**ValidationResult** is NOT:
```typescript
{ valid: boolean, error?: Error }  // ❌ Unsafe: error might not exist when valid=true
```

**ValidationResult** IS:
```typescript
{ valid: true, error?: never }  // ✅ TypeScript knows error doesn't exist
| { valid: false, error: {...} }   // ✅ TypeScript FORCES you to check error
```

**Benefit:** Compiler catches mistakes at build-time, not runtime.

### 4.3 Diagnostic Error Fields

All validation errors include:
```typescript
{
  code: string        // Machine-readable: "INVALID_SEQUENCE_LENGTH"
  message: string     // Human-readable: "Sequence must be exactly 6 digits..."
  received?: string   // What the user provided: "61347"
  expected?: string   // What format is correct: "exactly 6 digits"
  hint?: string       // How to fix it: "Pad with leading zero: 061347"
}
```

**Why:** Helps API consumers debug without reading docs. Improves user experience.

### 4.4 Stateless API Design

Every endpoint is **stateless**: no sessions, no cookies, no database state required.

**Why:** 
- Easy to scale horizontally (deploy multiple instances)
- Works across CDN edges
- No need for session migration
- Follows REST principles

### 4.5 District Code Data & Strict Mode

**Problem:** District codes (01-69) are not officially verified.

**Solution:** 
- Default: `strict: false` (validates format only, not against district list)
- Optional: `strict: true` (also checks district is known)
- Gives users choice based on confidence in data

**When to use:**
- `strict: false` (default): When generating NRCs, loose validation
- `strict: true`: When validating real NRCs from official sources

---

## 5. API CONTRACT

### Base URL
```
http://localhost:3000 (development)
https://zed-nrc-validator.vercel.app (production - coming)
```

### Validation Endpoint

**POST /api/validation**

Request:
```json
{
  "nrc": "string (required)",
  "strict": "boolean (optional, default: false)"
}
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "valid": true | false,
    "error": {  // only if valid: false
      "code": "string",
      "message": "string",
      "received": "string?",
      "expected": "string?",
      "hint": "string?"
    }
  },
  "timestamp": "2026-04-18T20:45:00Z",
  "requestId": "uuid?"
}
```

### Batch Validation Endpoint

**POST /api/validation/batch**

Request:
```json
{
  "nrcs": ["string"] (required, max 50 items),
  "strict": "boolean (optional, default: false)"
}
```

Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "nrc": "613475/61/1",
      "result": { "valid": true | false, ... }
    }
  ],
  "timestamp": "2026-04-18T20:45:00Z"
}
```

### Generation Endpoint

**POST /api/generation**

Request:
```json
{
  "count": "number (optional, default: 1, max: 100)"
}
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "nrc": "613475/61/1",
    "sequence": 613475,
    "district": 61,
    "nationality": 1
  } or [{...}, {...}] if count > 1,
  "timestamp": "2026-04-18T20:45:00Z"
}
```

### Error Response

All errors use HTTP 4xx or 5xx:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { "received": "...", "expected": "..." },
    "requestId": "uuid?"
  },
  "timestamp": "2026-04-18T20:45:00Z"
}
```

---

## 6. RESPONSE CODES & ERROR TYPES

| Code | Status | Meaning |
|------|--------|---------|
| `VALIDATION_ERROR` | 400 | User input invalid |
| `MISSING_REQUIRED_FIELDS` | 400 | Missing NRC, nrcs, etc. |
| `INVALID_TYPE` | 400 | Field wrong type (sent number instead of string) |
| `ARRAY_SIZE_ERROR` | 400 | Too many items (> 50 for batch) |
| `INVALID_JSON` | 400 | Request body not valid JSON |
| `INVALID_COUNT` | 400 | Count not 1-100 |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## 7. PERFORMANCE TARGETS (NFR-01)

**Target:** 500ms response time per request

**Current baseline (measured on MacBook Pro M1):**
- Single validation: ~1ms
- Batch (50 NRCs): ~5ms
- Generation: <1ms

**Breakdown:**
- Network latency: ~50-100ms
- JSON parsing: <1ms
- Validation logic: ~1ms
- JSON serialization: <1ms
- **Total overhead:** <5ms ✅ (well within 500ms budget)

---

## 8. TESTING STRATEGY

### Unit Tests (`tests/unit/nrc.test.ts`)
- 18 tests covering validator + generator
- Run: `npm run test:run`
- Time: ~2s

### API Integration Tests (`tests/api/` - coming)
- Test full HTTP request → response cycle
- Mock invalid inputs, edge cases
- Verify error codes and status codes

### Example Test Pattern:
```typescript
test('POST /api/validation returns 400 when NRC invalid', async () => {
  const res = await fetch('/api/validation', {
    method: 'POST',
    body: JSON.stringify({ nrc: '61347/61/1' })  // Only 5 digits
  })
  
  expect(res.status).toBe(400)
  const json = await res.json()
  expect(json.error.code).toBe('INVALID_SEQUENCE_LENGTH')
  expect(json.error.received).toBe('61347')
})
```

---

## 9. SECURITY CONSIDERATIONS (NFR-03)

### Input Validation
✅ All inputs validated before processing  
✅ String length limits enforced (e.g., max 50 NRCs)  
✅ Type checking at route level  
✅ No code evaluation (no `eval()`, no dynamic imports)  

### Output Safety
✅ No sensitive data in error messages  
✅ Error details don't leak internal structure  
✅ Stack traces never sent to clients  

### Future (Not in v1)
- Rate limiting (prevent DOS)
- CORS headers (if serving third-party clients)
- HTTPS enforcement (on production)
- Request signing (if API becomes commercial)

---

## 10. DEPLOYMENT

### Current (Local Development)
```bash
npm run dev
# Server runs at http://localhost:3000
```

### Production (Coming)
- Deploy to Vercel (serverless)
- Auto-scales with demand
- ~50ms cold start time
- 99% uptime SLA (Vercel)

**Environment Variables (none required for now)**

---

## 11. TESTING ENDPOINTS WITH CURL

```bash
# Single validation
curl -X POST http://localhost:3000/api/validation \
  -H "Content-Type: application/json" \
  -d '{"nrc": "613475/61/1"}'

# Batch validation
curl -X POST http://localhost:3000/api/validation/batch \
  -H "Content-Type: application/json" \
  -d '{"nrcs": ["613475/61/1", "000123/11/2"]}'

# Generate NRC
curl -X POST http://localhost:3000/api/generation \
  -H "Content-Type: application/json" \
  -d '{"count": 1}'

# Get documentation (HTML)
curl http://localhost:3000/api-docs

# Get documentation (JSON)
curl -H "Accept: application/json" http://localhost:3000/api-docs
```

---

## 12. NEXT STEPS (Roadmap)

| Phase | Task | Status |
|-------|------|--------|
| v1 (Done) | Core business logic + API routes | ✅ |
| v1 (Next) | React UI components | ⏳ |
| v1 (Next) | Integration tests for API | ⏳ |
| v1 (Next) | Deployment to Vercel | ⏳ |
| v2 | Database (store validated NRCs for analytics) | 🎯 |
| v2 | Admin dashboard (view statistics) | 🎯 |
| v2 | Rate limiting + API keys | 🎯 |
| v3 | Mobile app (React Native) | 🎯 |

---

## 13. LESSONS LEARNED

**What went well:**
- Discriminated union types catch errors early
- Separating business logic from API enabled fast testing
- Diagnostic error fields improve debugging

**What to improve:**
- District codes should be verified against official sources before using strict mode
- Consider adding request body size limit (prevent huge arrays)
- Add request deduplication (same request = cached response)

---

**Document Version:** 1.0.0  
**Last Updated:** April 18, 2026  
**Author:** Joshua Mazaza (with senior engineer review)
