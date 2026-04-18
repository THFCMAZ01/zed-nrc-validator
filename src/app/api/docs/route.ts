/**
 * GET /api-docs or /api/docs
 * 
 * Returns interactive API documentation in HTML or JSON format
 * 
 * Query Parameters:
 * - Accept: application/json (returns JSON)
 * - Accept: text/html (returns interactive HTML - default)
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Helper to generate JSON documentation
 */
function getJsonDocumentation() {
  return {
    title: 'Zed NRC Validator API',
    version: '1.0.0',
    description: 'Public API for validating and generating Zambian National Registration Card (NRC) numbers.',
    baseUrl: '/api',
    endpoints: [
      {
        method: 'POST',
        path: '/api/validation',
        description: 'Validate a single NRC number',
        requestBody: {
          type: 'object',
          required: ['nrc'],
          properties: {
            nrc: {
              type: 'string',
              example: '613475/61/1',
              description: 'NRC in format SEQUENCE/DISTRICT/NATIONALITY',
            },
            strict: {
              type: 'boolean',
              example: false,
              description: 'Enable strict mode to validate district code against known Zambian districts',
            },
          },
        },
        responses: {
          200: {
            description: 'Successfully validated',
            example: {
              success: true,
              data: { valid: true },
              timestamp: '2026-04-18T20:45:00Z',
              requestId: 'req-123',
            },
          },
          400: {
            description: 'Invalid input',
            example: {
              success: false,
              error: {
                code: 'INVALID_SEQUENCE_LENGTH',
                message: 'Sequence must be exactly 6 digits, you provided 5.',
                details: { received: '61347', expected: 'exactly 6 digits' },
              },
              timestamp: '2026-04-18T20:45:00Z',
            },
          },
        },
      },
      {
        method: 'POST',
        path: '/api/validation/batch',
        description: 'Validate multiple NRC numbers (up to 50)',
        requestBody: {
          type: 'object',
          required: ['nrcs'],
          properties: {
            nrcs: {
              type: 'array',
              example: ['613475/61/1', '000123/11/2'],
              description: 'Array of NRC strings to validate (max 50)',
            },
            strict: {
              type: 'boolean',
              example: false,
              description: 'Enable strict mode for all validations',
            },
          },
        },
        responses: {
          200: {
            description: 'Batch validation complete',
            example: {
              success: true,
              data: [
                { nrc: '613475/61/1', result: { valid: true } },
                { nrc: 'invalid', result: { valid: false, error: { code: 'INVALID_FORMAT' } } },
              ],
              timestamp: '2026-04-18T20:45:00Z',
            },
          },
          400: {
            description: 'Invalid batch request',
          },
        },
      },
      {
        method: 'POST',
        path: '/api/generation',
        description: 'Generate valid random NRC number(s) for testing',
        requestBody: {
          type: 'object',
          properties: {
            count: {
              type: 'integer',
              example: 1,
              description: 'How many NRCs to generate (default: 1, max: 100)',
            },
          },
        },
        responses: {
          201: {
            description: 'NRC(s) generated successfully',
            example: {
              success: true,
              data: {
                nrc: '123456/61/1',
                sequence: 123456,
                district: 61,
                nationality: 1,
              },
              timestamp: '2026-04-18T20:45:00Z',
            },
          },
          400: {
            description: 'Invalid generation request',
          },
        },
      },
      {
        method: 'GET',
        path: '/api-docs',
        description: 'Get this API documentation (HTML or JSON)',
        responses: {
          200: {
            description: 'Documentation returned',
          },
        },
      },
    ],
    constants: {
      validNationalities: {
        1: 'Zambian',
        2: 'Commonwealth',
        3: 'Foreign',
      },
      validDistrictRange: '01-69',
      validDistrictCodes: [
        '01-05 (Lusaka)',
        '10-13, 61 (Copperbelt)',
        '20-23 (Eastern)',
        '30-32 (Southern)',
        '40-42 (Central)',
        '50-52 (Northern)',
        '60 (North-Western)',
        '62-63 (Western)',
        '64-66 (Muchinga)',
        '67-69 (Luapula)',
      ],
    },
  }
}

/**
 * Generate HTML documentation page
 */
function getHtmlDocumentation(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zed NRC Validator API Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background: #1a1a1a;
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 8px;
      margin-bottom: 40px;
    }
    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    header p {
      font-size: 1.1em;
      opacity: 0.9;
    }
    .endpoint {
      background: white;
      padding: 30px;
      margin-bottom: 20px;
      border-radius: 8px;
      border-left: 4px solid #0066cc;
    }
    .method {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
      margin-right: 10px;
      color: white;
    }
    .method.post { background: #0066cc; }
    .method.get { background: #00cc66; }
    .path {
      font-family: 'Courier New', monospace;
      font-size: 1.1em;
      color: #666;
    }
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 10px 0;
    }
    code {
      font-family: 'Courier New', monospace;
      font-size: 0.95em;
    }
    h2 {
      margin-top: 30px;
      margin-bottom: 10px;
    }
    h3 {
      margin-top: 15px;
      margin-bottom: 5px;
    }
    .request, .response {
      margin-top: 15px;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding: 20px;
      color: #666;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔍 Zed NRC Validator API</h1>
      <p>Validate and generate Zambian National Registration Card (NRC) numbers</p>
    </header>

    <div class="endpoint">
      <div>
        <span class="method post">POST</span>
        <span class="path">/api/validation</span>
      </div>
      <h3>Validate Single NRC</h3>
      <p>Validate a single NRC number against format rules</p>
      <div class="request">
        <strong>Request:</strong>
        <pre><code>{
  "nrc": "613475/61/1",
  "strict": false
}</code></pre>
      </div>
      <div class="response">
        <strong>Success (200):</strong>
        <pre><code>{
  "success": true,
  "data": { "valid": true },
  "timestamp": "2026-04-18T20:45:00Z"
}</code></pre>
      </div>
    </div>

    <div class="endpoint">
      <div>
        <span class="method post">POST</span>
        <span class="path">/api/validation/batch</span>
      </div>
      <h3>Validate Multiple NRCs</h3>
      <p>Validate up to 50 NRC numbers in one request</p>
      <div class="request">
        <strong>Request:</strong>
        <pre><code>{
  "nrcs": ["613475/61/1", "000123/11/2"],
  "strict": false
}</code></pre>
      </div>
    </div>

    <div class="endpoint">
      <div>
        <span class="method post">POST</span>
        <span class="path">/api/generation</span>
      </div>
      <h3>Generate Random NRC</h3>
      <p>Generate valid random NRC number(s) for testing</p>
      <div class="request">
        <strong>Request:</strong>
        <pre><code>{
  "count": 1
}</code></pre>
      </div>
    </div>

    <div class="footer">
      <p>📖 Get full API documentation in JSON format by requesting: <code>Accept: application/json</code></p>
      <p>Version 1.0.0 | Zambia | 2026</p>
    </div>
  </div>
</body>
</html>
  `
}

export async function GET(request: NextRequest) {
  // Check Accept header
  const accept = request.headers.get('accept') || 'text/html'
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  const json = getJsonDocumentation()

  if (accept.includes('application/json')) {
    // Return JSON documentation
    const response = {
      success: true,
      data: json,
      timestamp: new Date().toISOString(),
      requestId,
    }
    return NextResponse.json(response)
  } else {
    // Return HTML documentation
    return new NextResponse(getHtmlDocumentation(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
    },
  })
}
