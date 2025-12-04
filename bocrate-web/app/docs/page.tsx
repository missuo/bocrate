import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
              ¥
            </div>
            <div>
              <h1 className="text-xl font-bold">BOC Exchange Rates</h1>
              <p className="text-xs text-gray-500">Bank of China</p>
            </div>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Rates
            </Link>
            <Link
              href="/docs"
              className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              API Docs
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">API Documentation</h2>
          <p className="text-gray-600">
            Access real-time Bank of China exchange rates programmatically with our REST API.
          </p>
        </div>

        <div className="space-y-8">
          {/* Base URL */}
          <section className="rounded-lg border bg-white p-6">
            <h3 className="text-xl font-bold mb-3">Base URL</h3>
            <div className="rounded bg-gray-50 p-4 font-mono text-sm">
              https://currency.owo.nz/api
            </div>
          </section>

          {/* Authentication */}
          <section className="rounded-lg border bg-white p-6">
            <h3 className="text-xl font-bold mb-3">Authentication</h3>
            <p className="text-gray-600">No authentication required. All endpoints are publicly accessible.</p>
          </section>

          {/* Endpoints */}
          <section className="rounded-lg border bg-white p-6">
            <h3 className="text-xl font-bold mb-4">Endpoints</h3>

            {/* GET /api/latest */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">GET</span>
                <code className="text-sm">/api/latest</code>
              </div>
              <p className="text-sm text-gray-600 mb-3">Get latest exchange rates for all currencies.</p>
              <div className="rounded bg-gray-50 p-4">
                <div className="text-xs font-mono mb-2 text-gray-500">Example Request:</div>
                <code className="text-xs">curl https://currency.owo.nz/api/latest</code>
              </div>
            </div>

            {/* GET /api/latest/:currency */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">GET</span>
                <code className="text-sm">/api/latest/:currency</code>
              </div>
              <p className="text-sm text-gray-600 mb-3">Get latest exchange rate for a specific currency.</p>
              <div className="rounded bg-gray-50 p-4">
                <div className="text-xs font-mono mb-2 text-gray-500">Example Request:</div>
                <code className="text-xs">curl https://currency.owo.nz/api/latest/USD</code>
              </div>
            </div>

            {/* GET /api/rates/:currency */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">GET</span>
                <code className="text-sm">/api/rates/:currency</code>
              </div>
              <p className="text-sm text-gray-600 mb-3">Get daily historical rates for a currency.</p>
              <div className="rounded bg-gray-50 p-4 space-y-2">
                <div>
                  <div className="text-xs font-mono text-gray-500">Query Parameters:</div>
                  <div className="text-xs mt-1">
                    <code>days</code> - Number of days (default: 30, max: 365)
                  </div>
                </div>
                <div className="text-xs font-mono mb-2 text-gray-500">Example Request:</div>
                <code className="text-xs">curl https://currency.owo.nz/api/rates/EUR?days=7</code>
              </div>
            </div>

            {/* GET /api/currencies */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">GET</span>
                <code className="text-sm">/api/currencies</code>
              </div>
              <p className="text-sm text-gray-600 mb-3">Get list of all supported currencies.</p>
              <div className="rounded bg-gray-50 p-4">
                <div className="text-xs font-mono mb-2 text-gray-500">Example Request:</div>
                <code className="text-xs">curl https://currency.owo.nz/api/currencies</code>
              </div>
            </div>
          </section>

          {/* Response Format */}
          <section className="rounded-lg border bg-white p-6">
            <h3 className="text-xl font-bold mb-3">Response Format</h3>
            <p className="text-sm text-gray-600 mb-3">All responses follow this JSON structure:</p>
            <pre className="rounded bg-gray-50 p-4 text-xs overflow-x-auto">
{`{
  "code": 200,
  "message": "success",
  "data": { /* response data */ }
}`}
            </pre>
          </section>

          {/* Supported Currencies */}
          <section className="rounded-lg border bg-white p-6">
            <h3 className="text-xl font-bold mb-3">Supported Currencies</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {['AED', 'AUD', 'BRL', 'CAD', 'CHF', 'DKK', 'EUR', 'GBP',
                'HKD', 'IDR', 'INR', 'JPY', 'KRW', 'MOP', 'MYR', 'NOK',
                'NZD', 'PHP', 'RUB', 'SAR', 'SEK', 'SGD', 'THB', 'TRY',
                'TWD', 'USD', 'ZAR'].map((code) => (
                <code key={code} className="rounded bg-gray-100 px-2 py-1 text-center font-mono">
                  {code}
                </code>
              ))}
            </div>
          </section>

          {/* Rate Limits */}
          <section className="rounded-lg border bg-white p-6">
            <h3 className="text-xl font-bold mb-3">Rate Limits</h3>
            <p className="text-gray-600">
              No rate limits currently enforced. Please use responsibly.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t bg-gray-50 mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-gray-600">
          <p>Data source: Bank of China (BOC)</p>
          <p className="mt-1">Updates every hour • 27 currencies supported</p>
        </div>
      </footer>
    </div>
  );
}
