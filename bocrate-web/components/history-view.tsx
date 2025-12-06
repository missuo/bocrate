'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDailyRates } from '@/lib/api';
import type { ExchangeRate } from '@/lib/types';
import { CURRENCY_NAMES } from '@/lib/types';

export function HistoryView({ currency }: { currency: string }) {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDailyRates(currency, 30);
        setRates(data.rates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currency]);

  // Format data for chart
  // We need to reverse the rates for the chart so time goes left to right
  const chartData = [...rates].reverse().map((rate) => ({
    date: rate.release_time.replace('T', ' ').replace('Z', ''),
    rate: parseFloat(rate.foreign_exchange_buying_rate) || parseFloat(rate.cash_buying_rate),
  }));

  const currencyName = CURRENCY_NAMES[currency] || currency;
  const latestRate = rates.length > 0 ? rates[0] : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-800 shadow-sm max-w-md">
          <div className="text-lg font-semibold mb-2">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              {currency} <span className="text-gray-400 font-normal text-base">/</span> CNY
            </h1>
            <p className="text-xs text-gray-500">{currencyName}</p>
          </div>
          {latestRate && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Current Rate</div>
              <div className="text-lg sm:text-xl font-bold text-blue-600 tabular-nums">
                {latestRate.boc_conversion_rate}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Chart Section */}
        <div className="bg-white rounded-xl border p-4 sm:p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-800">30-Day Exchange Rate Trend</h2>
          <div className="h-[250px] sm:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  minTickGap={30}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#6B7280', marginBottom: '4px', fontSize: '11px' }}
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, 'Rate']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Historical Rates</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Time</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Buy (Forex)</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Buy (Cash)</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Sell (Forex)</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Sell (Cash)</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">BOC Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rates.map((rate, i) => (
                  <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-3 text-gray-900">
                      {new Date(rate.release_time).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-gray-600 font-medium">
                      {rate.foreign_exchange_buying_rate || '-'}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-gray-600 font-medium">
                      {rate.cash_buying_rate || '-'}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-gray-600 font-medium">
                      {rate.foreign_exchange_selling_rate || '-'}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-gray-600 font-medium">
                      {rate.cash_selling_rate || '-'}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums font-semibold text-blue-600">
                      {rate.boc_conversion_rate || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">Historical Rates</h2>
            <span className="text-xs text-gray-500">{rates.length} records</span>
          </div>
          {rates.map((rate, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-gray-500">
                  {new Date(rate.release_time).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
                  <div className="text-xs text-gray-500 mb-1">Buy (Forex)</div>
                  <div className="font-semibold tabular-nums">{rate.foreign_exchange_buying_rate || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Sell (Forex)</div>
                  <div className="font-semibold tabular-nums">{rate.foreign_exchange_selling_rate || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Buy (Cash)</div>
                  <div className="font-semibold tabular-nums">{rate.cash_buying_rate || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Sell (Cash)</div>
                  <div className="font-semibold tabular-nums">{rate.cash_selling_rate || '-'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
