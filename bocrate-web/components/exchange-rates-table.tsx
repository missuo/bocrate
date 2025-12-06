'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getLatestRates } from '@/lib/api';
import type { ExchangeRate } from '@/lib/types';
import { CURRENCY_NAMES } from '@/lib/types';
import { parseBOCTime } from '@/lib/utils';

export function ExchangeRatesTable() {
  const [rates, setRates] = useState<Record<string, ExchangeRate> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchRates() {
      try {
        const data = await getLatestRates();
        setRates(data.currencies);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  const filteredRates = rates
    ? Object.entries(rates).filter(([code]) =>
        code.toLowerCase().includes(search.toLowerCase()) ||
        CURRENCY_NAMES[code]?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-16">
        <div className="h-8 w-8 sm:h-10 sm:w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6 text-center text-red-800 shadow-sm">
        <div className="text-lg font-semibold mb-1">Error</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search currency..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-shadow"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Currency</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Buy (Cash)</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Sell (Cash)</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">BOC Rate</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Release Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRates.map(([code, rate]) => (
              <tr key={code} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/history/${code}`} className="group block">
                    <div className="font-semibold text-blue-600 group-hover:underline">{code}</div>
                    <div className="text-xs text-gray-500">{CURRENCY_NAMES[code]}</div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {rate.cash_buying_rate || '-'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {rate.cash_selling_rate || '-'}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-blue-600">
                  {rate.boc_conversion_rate || '-'}
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-500">
                  {parseBOCTime(rate.release_time).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filteredRates.map(([code, rate]) => (
          <Link
            key={code}
            href={`/history/${code}`}
            className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-lg text-blue-600">{code}</div>
                <div className="text-xs text-gray-500">{CURRENCY_NAMES[code]}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">BOC Rate</div>
                <div className="font-bold text-lg text-blue-600 tabular-nums">
                  {rate.boc_conversion_rate || '-'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">Cash Buy</div>
                <div className="font-semibold tabular-nums">{rate.cash_buying_rate || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Cash Sell</div>
                <div className="font-semibold tabular-nums">{rate.cash_selling_rate || '-'}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-400">
                Updated: {parseBOCTime(rate.release_time).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRates.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg font-medium mb-1">No currencies found</div>
          <div className="text-sm">Try searching for a different currency code or name</div>
        </div>
      )}
    </div>
  );
}
