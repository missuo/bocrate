import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
              ¥
            </div>
            <div>
              <h1 className="text-xl font-bold">BOC Exchange Rates</h1>
              <p className="text-xs text-gray-500">Bank of China</p>
            </div>
          </div>
          <nav className="flex gap-2 sm:gap-4">
            <Link
              href="/"
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Rates
            </Link>
            <Link
              href="/docs"
              className="px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              API Docs
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">API Documentation</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Access real-time Bank of China exchange rates programmatically with our REST API.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Base URL */}
          <section className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold mb-3">Base URL</h3>
            <div className="rounded bg-gray-50 p-3 sm:p-4 font-mono text-xs sm:text-sm break-all">
              https://currency.owo.nz/api
            </div>
          </section>

          {/* Authentication */}
          <section className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold mb-3">Authentication</h3>
            <p className="text-gray-600 text-sm">No authentication required. All endpoints are publicly accessible.</p>
          </section>

          {/* Endpoints */}
          <section className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Endpoints</h3>

            {/* GET /api/latest */}
            <div className="mb-8 pb-8 border-b last:border-b-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">GET</span>
                <code className="text-xs sm:text-sm font-mono">/api/latest</code>
              </div>
              <p className="text-sm text-gray-600 mb-4">Get latest exchange rates for all currencies.</p>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Request</div>
                  <div className="rounded bg-gray-900 p-3 sm:p-4">
                    <code className="text-xs text-green-400">curl https://currency.owo.nz/api/latest</code>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Response (200 OK)</div>
                  <pre className="rounded bg-gray-900 p-3 sm:p-4 text-xs text-gray-100 overflow-x-auto">
{`{
  "code": 200,
  "message": "success",
  "data": {
    "currencies": {
      "USD": {
        "currency_name": "USD",
        "foreign_exchange_buying_rate": "706.28",
        "cash_buying_rate": "706.28",
        "foreign_exchange_selling_rate": "709.25",
        "cash_selling_rate": "709.25",
        "boc_conversion_rate": "707.49",
        "release_time": "2025-12-06T10:30:00Z"
      },
      "EUR": { ... },
      ...
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* GET /api/latest/:currency */}
            <div className="mb-8 pb-8 border-b last:border-b-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">GET</span>
                <code className="text-xs sm:text-sm font-mono">/api/latest/:currency</code>
              </div>
              <p className="text-sm text-gray-600 mb-4">Get latest exchange rate for a specific currency.</p>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Path Parameters</div>
                  <div className="rounded bg-gray-50 p-3 text-xs">
                    <code className="text-blue-600">currency</code>
                    <span className="text-gray-600"> (string, required) - Currency code (e.g., USD, EUR, GBP)</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Request</div>
                  <div className="rounded bg-gray-900 p-3 sm:p-4">
                    <code className="text-xs text-green-400">curl https://currency.owo.nz/api/latest/USD</code>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Response (200 OK)</div>
                  <pre className="rounded bg-gray-900 p-3 sm:p-4 text-xs text-gray-100 overflow-x-auto">
{`{
  "code": 200,
  "message": "success",
  "data": {
    "currency_name": "USD",
    "foreign_exchange_buying_rate": "706.28",
    "cash_buying_rate": "706.28",
    "foreign_exchange_selling_rate": "709.25",
    "cash_selling_rate": "709.25",
    "boc_conversion_rate": "707.49",
    "release_time": "2025-12-06T10:30:00Z"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* GET /api/rates/:currency */}
            <div className="mb-8 pb-8 border-b last:border-b-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">GET</span>
                <code className="text-xs sm:text-sm font-mono">/api/rates/:currency</code>
              </div>
              <p className="text-sm text-gray-600 mb-4">Get daily historical rates for a currency.</p>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Path Parameters</div>
                  <div className="rounded bg-gray-50 p-3 text-xs">
                    <code className="text-blue-600">currency</code>
                    <span className="text-gray-600"> (string, required) - Currency code (e.g., USD, EUR, GBP)</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Query Parameters</div>
                  <div className="rounded bg-gray-50 p-3 text-xs space-y-1">
                    <div>
                      <code className="text-blue-600">days</code>
                      <span className="text-gray-600"> (integer, optional) - Number of days (default: 30, max: 365)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Request</div>
                  <div className="rounded bg-gray-900 p-3 sm:p-4">
                    <code className="text-xs text-green-400">curl "https://currency.owo.nz/api/rates/USD?days=7"</code>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Response (200 OK)</div>
                  <pre className="rounded bg-gray-900 p-3 sm:p-4 text-xs text-gray-100 overflow-x-auto">
{`{
  "code": 200,
  "message": "success",
  "data": {
    "currency": "USD",
    "rates": [
      {
        "currency_name": "USD",
        "foreign_exchange_buying_rate": "706.28",
        "cash_buying_rate": "706.28",
        "foreign_exchange_selling_rate": "709.25",
        "cash_selling_rate": "709.25",
        "boc_conversion_rate": "707.49",
        "release_time": "2025-12-06T10:30:00Z"
      },
      {
        "currency_name": "USD",
        "foreign_exchange_buying_rate": "705.84",
        "cash_buying_rate": "705.84",
        "foreign_exchange_selling_rate": "708.81",
        "cash_selling_rate": "708.81",
        "boc_conversion_rate": "707.49",
        "release_time": "2025-12-05T23:53:52Z"
      }
    ],
    "count": 2
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* GET /api/currencies */}
            <div className="mb-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">GET</span>
                <code className="text-xs sm:text-sm font-mono">/api/currencies</code>
              </div>
              <p className="text-sm text-gray-600 mb-4">Get list of all supported currencies with Chinese names.</p>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Request</div>
                  <div className="rounded bg-gray-900 p-3 sm:p-4">
                    <code className="text-xs text-green-400">curl https://currency.owo.nz/api/currencies</code>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">Response (200 OK)</div>
                  <pre className="rounded bg-gray-900 p-3 sm:p-4 text-xs text-gray-100 overflow-x-auto">
{`{
  "code": 200,
  "message": "success",
  "data": {
    "currencies": {
      "AED": "阿联酋迪拉姆",
      "AUD": "澳大利亚元",
      "BRL": "巴西里亚尔",
      "CAD": "加拿大元",
      ...
      "USD": "美元",
      "ZAR": "南非兰特"
    },
    "count": 26
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Response Schema */}
          <section className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold mb-3">Response Schema</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Standard Response Wrapper</h4>
                <div className="rounded bg-gray-50 p-3 text-xs space-y-1">
                  <div><code className="text-blue-600">code</code> <span className="text-gray-600">(integer) - HTTP status code</span></div>
                  <div><code className="text-blue-600">message</code> <span className="text-gray-600">(string) - Response message ("success" on success)</span></div>
                  <div><code className="text-blue-600">data</code> <span className="text-gray-600">(object) - Response payload</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Exchange Rate Object</h4>
                <div className="rounded bg-gray-50 p-3 text-xs space-y-1">
                  <div><code className="text-blue-600">currency_name</code> <span className="text-gray-600">(string) - Currency code</span></div>
                  <div><code className="text-blue-600">foreign_exchange_buying_rate</code> <span className="text-gray-600">(string) - Bank buying rate for foreign exchange</span></div>
                  <div><code className="text-blue-600">cash_buying_rate</code> <span className="text-gray-600">(string) - Bank buying rate for cash</span></div>
                  <div><code className="text-blue-600">foreign_exchange_selling_rate</code> <span className="text-gray-600">(string) - Bank selling rate for foreign exchange</span></div>
                  <div><code className="text-blue-600">cash_selling_rate</code> <span className="text-gray-600">(string) - Bank selling rate for cash</span></div>
                  <div><code className="text-blue-600">boc_conversion_rate</code> <span className="text-gray-600">(string) - Bank of China conversion rate</span></div>
                  <div><code className="text-blue-600">release_time</code> <span className="text-gray-600">(string, ISO 8601) - Rate release timestamp in UTC+8 timezone</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* Supported Currencies */}
          <section className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Supported Currencies</h3>
            <p className="text-sm text-gray-600 mb-4">27 major currencies are supported:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
              {['AED', 'AUD', 'BRL', 'CAD', 'CHF', 'DKK', 'EUR', 'GBP',
                'HKD', 'IDR', 'INR', 'JPY', 'KRW', 'MOP', 'MYR', 'NOK',
                'NZD', 'PHP', 'RUB', 'SAR', 'SEK', 'SGD', 'THB', 'TRY',
                'TWD', 'USD', 'ZAR'].map((code) => (
                <code key={code} className="rounded bg-blue-50 border border-blue-200 px-2 py-1.5 text-center font-mono text-blue-700 hover:bg-blue-100 transition-colors">
                  {code}
                </code>
              ))}
            </div>
          </section>

          {/* Usage Notes */}
          <section className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold mb-3">Usage Notes</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Data updates hourly from Bank of China</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>All timestamps are in UTC+8 / Asia/Hong_Kong timezone (ISO 8601 format)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Rates are returned as strings to preserve precision</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Empty string ("") indicates rate not available for that type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>No rate limits currently enforced - please use responsibly</span>
              </li>
            </ul>
          </section>

          {/* Error Responses */}
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-red-900">Error Responses</h3>
            <p className="text-sm text-red-700 mb-4">When an error occurs, the API returns an appropriate HTTP status code with error details:</p>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-red-900 mb-2">404 Not Found</div>
                <pre className="rounded bg-gray-900 p-3 text-xs text-gray-100 overflow-x-auto">
{`{
  "code": 404,
  "message": "Currency not found",
  "data": null
}`}
                </pre>
              </div>

              <div>
                <div className="text-xs font-semibold text-red-900 mb-2">500 Internal Server Error</div>
                <pre className="rounded bg-gray-900 p-3 text-xs text-gray-100 overflow-x-auto">
{`{
  "code": 500,
  "message": "Internal server error",
  "data": null
}`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t bg-gray-50 mt-12 sm:mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-600">
          <p>© 2025 OwO Network, LLC. All rights reserved.</p>
          <p className="mt-1">Made with ❤️ from SF</p>
        </div>
      </footer>
    </div>
  );
}
