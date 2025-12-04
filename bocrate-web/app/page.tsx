import Link from 'next/link';
import { ExchangeRatesTable } from '@/components/exchange-rates-table';

export default function Home() {
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
              className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              Rates
            </Link>
            <Link
              href="/docs"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              API Docs
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Real-time Exchange Rates</h2>
          <p className="text-gray-600">
            View current Bank of China exchange rates for 27 major currencies. Data updates hourly.
          </p>
        </div>

        <ExchangeRatesTable />

        <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <h3 className="font-medium text-blue-900 mb-2">Need programmatic access?</h3>
          <p className="text-sm text-blue-700 mb-3">
            Access our REST API to integrate exchange rates into your application.
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            View API Documentation →
          </Link>
        </div>
      </main>

      <footer className="border-t bg-gray-50 mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-gray-600">
          <p className="mt-1">© 2025 OwO Network, LLC. All rights reserved. Made with ❤️ from SF.</p>
        </div>
      </footer>
    </div>
  );
}
