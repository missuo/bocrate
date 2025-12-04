'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getLatestRates } from '@/lib/api';
import type { ExchangeRate } from '@/lib/types';
import { CURRENCY_NAMES } from '@/lib/types';

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
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search currency..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Currency</th>
              <th className="px-4 py-3 text-right font-medium">Buy (Cash)</th>
              <th className="px-4 py-3 text-right font-medium">Sell (Cash)</th>
              <th className="px-4 py-3 text-right font-medium">BOC Rate</th>
              <th className="px-4 py-3 text-right font-medium hidden md:table-cell">Release Time</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRates.map(([code, rate]) => (
              <tr key={code} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/history/${code}`} className="group block">
                    <div className="font-medium text-blue-600 group-hover:underline">{code}</div>
                    <div className="text-xs text-gray-500">{CURRENCY_NAMES[code]}</div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {rate.cash_buying_rate || '-'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {rate.cash_selling_rate || '-'}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {rate.boc_conversion_rate || '-'}
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-500 hidden md:table-cell">
                  {rate.release_time.replace('T', ' ').replace('Z', '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
